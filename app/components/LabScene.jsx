'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import styles from './LabScene.module.css';

const hotspotsData = [
  {
    title: 'Workshop & Strategie',
    text: 'Wir starten keine Projekte ohne Workshop.\nNicht, weil es „State of the Art" ist – sondern weil es die einzige Art ist, fundierte Entscheidungen zu treffen.\n\nIm Workshop klären wir, für wen wir arbeiten, was erreicht werden soll und woran wir Erfolg messen. Wir hören zu, fragen nach und strukturieren. Keine Show, keine Methoden um der Methode willen. Am Ende steht ein gemeinsames Bild – und eine klare Richtung.',
  },
  {
    title: 'Konzept & Branding',
    text: 'Wir entwickeln Marken, die nicht nur gut aussehen, sondern auch Orientierung geben und langfristig funktionieren. Nach innen wie nach außen.\n\nBranding beginnt für uns bei Haltung, Kontext und Ziel. Erst wenn klar ist, wofür ein Produkt oder Unternehmen steht, übersetzen wir das in Struktur, Sprache und Gestaltung.',
  },
  {
    title: 'UX / UI Design',
    text: 'Wir gestalten Oberflächen, die Entscheidungen für Nutzer*innen und für Teams erleichtern und komplexe Inhalte verständlich machen.\nDabei denken wir Design immer im Zusammenspiel von Inhalt, Funktion und technischer Realität.\n\nKlare Strukturen, nachvollziehbare Flows und Systeme, die auch in der Weiterentwicklung Bestand haben, sind bei uns Standard.',
  },
  {
    title: 'Development',
    text: 'Wir setzen digitale Lösungen technisch sauber und nachhaltig um.\nVon Websites bis zu komplexeren digitalen Anwendungen – immer mit Blick auf Performance, Wartbarkeit und Weiterentwicklung.\nDamit aus Konzepten funktionierende Produkte werden.',
  },
];

// Sorted outer → inner so index 0 = outermost ring ("Nothing", 1 von 4)
const orbitsConfig = [
  { radius: 6.3, tiltX:  0.75, tiltZ:  0.08, speed: 0.055, startAngle: 4.0 },
  { radius: 4.9, tiltX:  0.20, tiltZ:  0.45, speed: 0.085, startAngle: 5.6 },
  { radius: 3.6, tiltX:  0.60, tiltZ: -0.22, speed: 0.13,  startAngle: 3.8 },
  { radius: 2.2, tiltX:  0.30, tiltZ:  0.18, speed: 0.22,  startAngle: 0.9 },
];

export default function LabScene() {
  const canvasRef         = useRef(null);
  const panelRef          = useRef(null);
  const sceneApiRef       = useRef(null);
  const moveToRef         = useRef(null);
  const hotspotMeshesRef  = useRef([]);
  const labelRefsArr      = useRef([]);
  const selectedPlanetRef = useRef(null);
  const frozenAllRef      = useRef(false);
  const triggerIntroRef   = useRef(null);
  const [panel, setPanel] = useState(null);
  const [panelIndex, setPanelIndex] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) return undefined;

    const canvas = canvasRef.current;
    const scene  = new THREE.Scene();
    scene.background = new THREE.Color(0x06060a);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 20);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;
    pmremGenerator.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping   = true;
    controls.dampingFactor   = 0.04;
    controls.enableZoom      = true;
    controls.enablePan       = false;
    controls.autoRotate      = true;
    controls.autoRotateSpeed = 0.3;
    controls.minDistance     = 4;
    controls.maxDistance     = 32;
    controls.mouseButtons    = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.DOLLY,
    };
    controls.update();

    const stopAutoRotate = () => { controls.autoRotate = false; };
    renderer.domElement.addEventListener('pointerdown', stopAutoRotate);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(8, 10, 6);
    scene.add(keyLight);

    // ── Central sun ──────────────────────────────────────────────────────────
    const sunGeo = new THREE.SphereGeometry(0.22, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 2.0,
      roughness: 1,
      metalness: 0,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);

    // ── Orbit rings + planets ────────────────────────────────────────────────
    const hotspotMeshes = [];
    const ringMeshes    = [];
    const orbitAngles   = orbitsConfig.map((o) => o.startAngle);
    const ringGeometries = [];
    const ringMaterials  = [];

    const getOrbitPos = (cfg, angle) => {
      const local = new THREE.Vector3(
        Math.cos(angle) * cfg.radius,
        Math.sin(angle) * cfg.radius,
        0,
      );
      local.applyEuler(new THREE.Euler(cfg.tiltX, 0, cfg.tiltZ, 'XZY'));
      return local;
    };

    orbitsConfig.forEach((cfg, i) => {
      const pts = [];
      for (let j = 0; j <= 128; j++) {
        const a = (j / 128) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * cfg.radius, Math.sin(a) * cfg.radius, 0));
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const ringMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.55,
        linewidth: 2,
      });
      ringGeometries.push(ringGeo);
      ringMaterials.push(ringMat);

      const ring = new THREE.LineLoop(ringGeo, ringMat);
      ring.rotation.set(cfg.tiltX, 0, cfg.tiltZ, 'XZY');
      scene.add(ring);
      ringMeshes.push(ring);

      // Planet — depthWrite: true so it fully occludes the orbit lines behind it
      const planetGeo = new THREE.SphereGeometry(0.15, 32, 32);
      const planetMat = new THREE.MeshBasicMaterial({
        color: 0xBAA2F9,
        transparent: false,
        depthWrite: true,
        opacity: 1,
      });
      const planet = new THREE.Mesh(planetGeo, planetMat);
      planet.renderOrder = 1;
      planet.userData = { title: hotspotsData[i].title, text: hotspotsData[i].text };
      planet.raycast   = () => {};
      planet.position.copy(getOrbitPos(cfg, orbitAngles[i]));
      scene.add(planet);
      hotspotMeshes.push(planet);
    });

    hotspotMeshesRef.current = hotspotMeshes;

    // ── Fade helpers ─────────────────────────────────────────────────────────
    const fadeMaterial = (mat, from, to, duration, onDone) => {
      const start = performance.now();
      const tick = () => {
        const t = Math.min((performance.now() - start) / duration, 1);
        const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        mat.opacity = from + (to - from) * e;
        if (t < 1) requestAnimationFrame(tick);
        else if (onDone) onDone();
      };
      tick();
    };

    // ── Initial fade-in ───────────────────────────────────────────────────────
    const revealHotspots = () => {
      hotspotMeshes.forEach((m) => { m.raycast = THREE.Mesh.prototype.raycast.bind(m); });
      hotspotMeshes.forEach((m) => { m.material.opacity = 1; });
    };
    setTimeout(revealHotspots, 600);

    // ── Camera animation ─────────────────────────────────────────────────────
    let savedCamPos = null;
    let savedTarget = null;

    const animateCamera = (fromPos, fromTarget, toPos, toTarget, duration, onDone) => {
      const startTime = performance.now();
      controls.enabled = false;
      const step = () => {
        const elapsed = performance.now() - startTime;
        const t    = Math.min(elapsed / duration, 1);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        camera.position.lerpVectors(fromPos, toPos, ease);
        controls.target.lerpVectors(fromTarget, toTarget, ease);
        controls.update();
        if (t < 1) requestAnimationFrame(step);
        else { controls.enabled = true; if (onDone) onDone(); }
      };
      step();
    };

    const moveTo = (targetPos) => {
      const dir       = camera.position.clone().sub(controls.target).normalize();
      const newCamPos = targetPos.clone().add(dir.multiplyScalar(3.5));
      animateCamera(
        camera.position.clone(), controls.target.clone(),
        newCamPos, targetPos.clone(),
        900,
      );
    };

    const zoomToPoint = (targetPos) => {
      savedCamPos = camera.position.clone();
      savedTarget = controls.target.clone();
      moveTo(targetPos);
    };

    const zoomBack = () => {
      if (!savedCamPos || !savedTarget) return;
      animateCamera(camera.position.clone(), controls.target.clone(), savedCamPos, savedTarget, 900);
      savedCamPos = null;
      savedTarget = null;
    };

    const defaultCamPos = new THREE.Vector3(0, 2, 20);
    const defaultTarget = new THREE.Vector3(0, 0, 0);

    const resetCamera = () => {
      animateCamera(
        camera.position.clone(), controls.target.clone(),
        defaultCamPos.clone(), defaultTarget.clone(),
        900,
      );
      savedCamPos = null;
      savedTarget = null;
    };

    // ── Intro sequence (triggered by clicking the center sun) ─────────────────
    const triggerIntro = () => {
      // Reset state
      selectedPlanetRef.current = null;
      frozenAllRef.current      = true;
      savedCamPos = null;
      savedTarget = null;
      controls.autoRotate = false;

      // Close panel via React
      setPanel(null);

      // Animate camera to top-down view
      const topPos    = new THREE.Vector3(0, 18, 1);
      const topTarget = new THREE.Vector3(0, 0, 0);
      animateCamera(
        camera.position.clone(), controls.target.clone(),
        topPos, topTarget,
        1200,
      );

      // Immediately hide all planets, rings and sun
      hotspotMeshes.forEach((m) => {
        m.material.opacity = 0;
        m.raycast = () => {};
      });
      ringMeshes.forEach((r) => { r.material.opacity = 0; });
      sunMat.opacity = 0;
      sunMat.transparent = true;

      // Staggered reveal outer → inner, sun last
      const baseDelay = 1300;
      const stepDelay = 600;
      const n = hotspotMeshes.length;

      for (let step = 0; step < n; step++) {
        const i = step; // index 0 = outermost (Nothing) → index 3 = innermost (alone)
        setTimeout(() => {
          fadeMaterial(ringMeshes[i].material, 0, 0.55, 350);
          const mesh = hotspotMeshes[i];
          fadeMaterial(mesh.material, 0, 1, 350, () => {
            mesh.raycast = THREE.Mesh.prototype.raycast.bind(mesh);
          });
        }, baseDelay + step * stepDelay);
      }

      // Sun appears last
      setTimeout(() => {
        fadeMaterial(sunMat, 0, 1, 400, () => {
          sunMat.transparent = false;
        });
      }, baseDelay + n * stepDelay);

      // Unfreeze + animate back to normal view so clockwise direction is visually correct
      const unfreezeDelay = baseDelay + n * stepDelay + 1500;
      setTimeout(() => {
        frozenAllRef.current = false;
        animateCamera(
          camera.position.clone(), controls.target.clone(),
          defaultCamPos.clone(), defaultTarget.clone(),
          1200,
        );
      }, unfreezeDelay);
    };

    moveToRef.current      = moveTo;
    sceneApiRef.current    = { zoomBack, resetCamera, zoomToPoint };
    triggerIntroRef.current = triggerIntro;

    // ── Click handling ───────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();

    const handleClick = (event) => {
      if (panelRef.current?.contains(event.target)) return;
      mouse.x = (event.clientX / window.innerWidth)  *  2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) *  2 + 1;
      raycaster.setFromCamera(mouse, camera);

      // Check sun first
      const sunHit = raycaster.intersectObject(sunMesh);
      if (sunHit.length > 0) {
        triggerIntro();
        return;
      }

      const intersects = raycaster.intersectObjects(hotspotMeshes);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const idx = hotspotMeshes.indexOf(hit);
        selectedPlanetRef.current = idx;
        setPanel({ title: hit.userData.title, text: hit.userData.text });
        setPanelIndex(idx);
        zoomToPoint(hit.position.clone());
      } else {
        selectedPlanetRef.current = null;
        setPanel(null);
        zoomBack();
      }
    };
    window.addEventListener('click', handleClick);

    // ── Render loop ──────────────────────────────────────────────────────────
    let frameId;
    let lastTime = performance.now();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const now   = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime    = now;

      orbitsConfig.forEach((cfg, i) => {
        const anySelected = selectedPlanetRef.current !== null;
        if (!frozenAllRef.current && !anySelected) {
          orbitAngles[i] -= cfg.speed * delta;
          hotspotMeshes[i].position.copy(getOrbitPos(cfg, orbitAngles[i]));
        }

        const el = labelRefsArr.current[i];
        if (el) {
          const worldPos = hotspotMeshes[i].position.clone();
          const ndc = worldPos.project(camera);
          const sx  = ( ndc.x * 0.5 + 0.5) * window.innerWidth;
          const sy  = (-ndc.y * 0.5 + 0.5) * window.innerHeight;

          const visible = ndc.z < 1 && hotspotMeshes[i].material.opacity > 0.05 && !anySelected;

          el.style.opacity   = visible ? '1' : '0';
          el.style.transform = `translate(calc(${sx}px - 50%), calc(${sy}px - 100% - 10px))`;
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('pointerdown', stopAutoRotate);
      controls.dispose();
      renderer.dispose();
      environment.dispose();
      ringGeometries.forEach((g) => g.dispose());
      ringMaterials.forEach((m) => m.dispose());
      hotspotMeshes.forEach((m) => { m.geometry.dispose(); m.material.dispose(); });
      sunMat.dispose();
      sunGeo.dispose();
      moveToRef.current         = null;
      sceneApiRef.current       = null;
      hotspotMeshesRef.current  = [];
    };
  }, []);

  const handleNav = (dir) => {
    // After the last hint, trigger the intro animation instead of looping
    if (dir === 1 && panelIndex === hotspotsData.length - 1) {
      triggerIntroRef.current?.();
      return;
    }
    const nextIdx = (panelIndex + dir + hotspotsData.length) % hotspotsData.length;
    const mesh    = hotspotMeshesRef.current[nextIdx];
    selectedPlanetRef.current = nextIdx;
    setPanelIndex(nextIdx);
    setPanel({ title: hotspotsData[nextIdx].title, text: hotspotsData[nextIdx].text });
    if (mesh) moveToRef.current?.(mesh.position.clone());
  };

  const handleReset = () => {
    selectedPlanetRef.current = null;
    frozenAllRef.current      = false;
    setPanel(null);
    sceneApiRef.current?.resetCamera();
  };

  return (
    <main className={styles.stage}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.heroBlock}>
        <h1 className={styles.heroTitle}>Von Anfang an in der richtigen Umlaufbahn</h1>
        <p className={styles.heroText}>Gute digitale Produkte entstehen nicht zufällig, sie kreisen um einen gemeinsamen Kern. Wir bringen diese Ausrichtung in Projekte und Organisationen. Strukturiert, kollaborativ und ohne Umwege. Das Ergebnis: Produkte, die intuitiv funktionieren – für Menschen, Teams und Unternehmen.</p>
      </div>

      {hotspotsData.map((h, i) => (
        <span
          key={h.title}
          ref={(el) => { labelRefsArr.current[i] = el; }}
          className={styles.orbitLabel}
        >
          {h.title}
        </span>
      ))}
      {panel && (
        <aside ref={panelRef} className={styles.panel}>
          <div className={styles.panelTitle}>{panel.title}</div>
          <p className={styles.panelText}>{panel.text}</p>
          <div className={styles.panelNav}>
            <button className={styles.navButton} type="button" onClick={() => handleNav(-1)}>←</button>
            <span className={styles.navCounter}>{panelIndex + 1} von {hotspotsData.length}</span>
            <button className={styles.navButton} type="button" onClick={() => handleNav(1)}>→</button>
          </div>
        </aside>
      )}
    </main>
  );
}
