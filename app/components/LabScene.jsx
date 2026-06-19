'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import styles from './LabScene.module.css';

const hotspotsData = [
  {
    title: 'Workshop & Strategie',
    text: 'Wir starten keine Projekte ohne Workshop.\nNicht, weil es „State of the Art" ist – sondern weil es die einzige Art ist, fundierte Entscheidungen zu treffen.\n\nIm Workshop klären wir, für wen wir arbeiten, was erreicht werden soll und woran wir Erfolg messen. Wir hören zu, fragen nach und strukturieren. Am Ende steht ein gemeinsames Bild – und eine klare Richtung.',
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

const orbitsConfig = [
  { radius: 6.3, tiltX: 0.75, tiltZ:  0.08, speed: 0.055, startAngle: 4.0 },
  { radius: 4.9, tiltX: 0.20, tiltZ:  0.45, speed: 0.085, startAngle: 5.6 },
  { radius: 3.6, tiltX: 0.60, tiltZ: -0.22, speed: 0.13,  startAngle: 3.8 },
  { radius: 2.2, tiltX: 0.30, tiltZ:  0.18, speed: 0.22,  startAngle: 0.9 },
];

export default function LabScene({ sceneStep = 0, selectedPlanet, onPlanetClick }) {
  const containerRef      = useRef(null);
  const canvasRef         = useRef(null);
  const sceneApiRef       = useRef(null);
  const selectedPlanetRef = useRef(null);
  const labelRefsArr      = useRef([]);
  const onPlanetClickRef  = useRef(onPlanetClick);

  // Keep callback ref fresh without re-running the Three.js effect
  useEffect(() => { onPlanetClickRef.current = onPlanetClick; });

  // ── Three.js scene setup ──────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return undefined;

    const canvas    = canvasRef.current;
    const container = containerRef.current;
    const w = container.clientWidth  || window.innerWidth / 2;
    const h = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06060a);

    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 1000);
    camera.position.set(0, 2, 20);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(w, h, false);
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
    controls.mouseButtons    = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.DOLLY };
    controls.update();

    renderer.domElement.addEventListener('pointerdown', () => { controls.autoRotate = false; });

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(8, 10, 6);
    scene.add(keyLight);

    // Sun
    const sunGeo = new THREE.SphereGeometry(0.22, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.0, roughness: 1, metalness: 0 });
    scene.add(new THREE.Mesh(sunGeo, sunMat));

    // Orbit rings + planets
    const hotspotMeshes  = [];
    const ringMeshes     = [];
    const orbitAngles    = orbitsConfig.map(o => o.startAngle);
    const ringGeometries = [];
    const ringMaterials  = [];

    const getOrbitPos = (cfg, angle) => {
      const local = new THREE.Vector3(Math.cos(angle) * cfg.radius, Math.sin(angle) * cfg.radius, 0);
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
      const ringMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: i === 0 ? 0.55 : 0 });
      ringGeometries.push(ringGeo);
      ringMaterials.push(ringMat);
      const ring = new THREE.LineLoop(ringGeo, ringMat);
      ring.rotation.set(cfg.tiltX, 0, cfg.tiltZ, 'XZY');
      scene.add(ring);
      ringMeshes.push(ring);

      const planetGeo = new THREE.SphereGeometry(0.15, 32, 32);
      const planetMat = new THREE.MeshBasicMaterial({ color: 0xBAA2F9, transparent: true, depthWrite: true, opacity: 0 });
      const planet = new THREE.Mesh(planetGeo, planetMat);
      planet.renderOrder = 1;
      planet.userData = { title: hotspotsData[i].title, text: hotspotsData[i].text };
      planet.visible = false;
      planet.position.copy(getOrbitPos(cfg, orbitAngles[i]));
      scene.add(planet);
      hotspotMeshes.push(planet);
    });

    // ── Helpers ───────────────────────────────────────────────────────────────
    const fadeMat = (mat, from, to, duration, onDone) => {
      const start = performance.now();
      mat.opacity = from;
      const tick = () => {
        const t = Math.min((performance.now() - start) / duration, 1);
        const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        mat.opacity = from + (to - from) * e;
        if (t < 1) requestAnimationFrame(tick);
        else if (onDone) onDone();
      };
      tick();
    };

    const defaultCamPos = new THREE.Vector3(0, 2, 20);
    const defaultTarget = new THREE.Vector3(0, 0, 0);

    const animateCam = (fromPos, fromTarget, toPos, toTarget, duration, onDone) => {
      const startTime = performance.now();
      controls.enabled = false;
      const tick = () => {
        const t = Math.min((performance.now() - startTime) / duration, 1);
        const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        camera.position.lerpVectors(fromPos, toPos, e);
        controls.target.lerpVectors(fromTarget, toTarget, e);
        controls.update();
        if (t < 1) requestAnimationFrame(tick);
        else { controls.enabled = true; if (onDone) onDone(); }
      };
      tick();
    };

    const moveTo = (targetPos) => {
      const dir = camera.position.clone().sub(controls.target).normalize();
      animateCam(camera.position.clone(), controls.target.clone(), targetPos.clone().add(dir.multiplyScalar(3.5)), targetPos.clone(), 900);
    };

    const resetCamera = () => {
      animateCam(camera.position.clone(), controls.target.clone(), defaultCamPos.clone(), defaultTarget.clone(), 900);
    };

    // ── Scene step transitions ────────────────────────────────────────────────
    let currentStep = -1;

    const transitionToStep = (newStep) => {
      const prev = currentStep;
      currentStep = newStep;

      if (newStep === 0) {
        ringMeshes[0].material.opacity = 0.55;
        [1, 2, 3].forEach(ri => { ringMeshes[ri].material.opacity = 0; });
        hotspotMeshes.forEach(m => { m.visible = false; m.material.opacity = 0; });
        selectedPlanetRef.current = null;
        onPlanetClickRef.current?.(null);
        controls.autoRotate = true;
        resetCamera();

      } else if (newStep === 1) {
        controls.autoRotate = true;
        if (prev < 1) {
          // Forward: stagger rings 1–3 in
          [1, 2, 3].forEach((ri, idx) => {
            setTimeout(() => fadeMat(ringMeshes[ri].material, 0, 0.55, 700), idx * 450);
          });
        } else {
          // Backward: hide planets
          hotspotMeshes.forEach(m => { m.visible = false; m.material.opacity = 0; });
          selectedPlanetRef.current = null;
          onPlanetClickRef.current?.(null);
          resetCamera();
        }

      } else if (newStep === 2) {
        controls.autoRotate = false;
        ringMeshes.forEach(r => { r.material.opacity = 0.55; });
        if (prev < 2) {
          hotspotMeshes.forEach((m, i) => {
            m.visible = true;
            setTimeout(() => fadeMat(m.material, 0, 1, 500), i * 200);
          });
        }
        selectedPlanetRef.current = null;
        onPlanetClickRef.current?.(null);
        resetCamera();

      } else if (newStep === 3) {
        controls.autoRotate = false;
        ringMeshes.forEach(r => { r.material.opacity = 0.55; });
        hotspotMeshes.forEach(m => { m.visible = true; if (m.material.opacity < 1) m.material.opacity = 1; });
      }
    };

    // ── Planet selection (called by external prop change) ─────────────────────
    const selectPlanet = (index) => {
      if (index === null || index === undefined) {
        selectedPlanetRef.current = null;
        resetCamera();
      } else {
        const mesh = hotspotMeshes[index];
        if (mesh?.visible) {
          selectedPlanetRef.current = index;
          moveTo(mesh.position.clone());
        }
      }
    };

    sceneApiRef.current = { transitionToStep, selectPlanet };

    // ── Click handling ────────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();

    const handleClick = (event) => {
      if (currentStep < 2) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x =  ((event.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((event.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(hotspotMeshes.filter(m => m.visible));
      if (hits.length > 0) {
        const idx = hotspotMeshes.indexOf(hits[0].object);
        onPlanetClickRef.current?.(idx);
      } else {
        onPlanetClickRef.current?.(null);
      }
    };
    canvas.addEventListener('click', handleClick);

    // ── Render loop ───────────────────────────────────────────────────────────
    let frameId;
    let lastTime = performance.now();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const now   = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const anySelected = selectedPlanetRef.current !== null;

      if (!anySelected && currentStep >= 2) {
        orbitsConfig.forEach((cfg, i) => {
          orbitAngles[i] -= cfg.speed * delta;
          hotspotMeshes[i].position.copy(getOrbitPos(cfg, orbitAngles[i]));
        });
      }

      // Labels (visible only in step 2+ when nothing selected)
      const showLabels = currentStep >= 2 && !anySelected;
      const cW = container.clientWidth;
      const cH = container.clientHeight;
      hotspotMeshes.forEach((mesh, i) => {
        const el = labelRefsArr.current[i];
        if (!el) return;
        if (!mesh.visible || !showLabels) { el.style.opacity = '0'; return; }
        const ndc = mesh.position.clone().project(camera);
        const sx  = ( ndc.x * 0.5 + 0.5) * cW;
        const sy  = (-ndc.y * 0.5 + 0.5) * cH;
        el.style.opacity   = ndc.z < 1 ? '1' : '0';
        el.style.transform = `translate(calc(${sx}px - 50%), calc(${sy}px - 100% - 10px))`;
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ────────────────────────────────────────────────────────────────
    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      canvas.removeEventListener('click', handleClick);
      controls.dispose();
      renderer.dispose();
      environment.dispose();
      ringGeometries.forEach(g => g.dispose());
      ringMaterials.forEach(m => m.dispose());
      hotspotMeshes.forEach(m => { m.geometry.dispose(); m.material.dispose(); });
      sunMat.dispose(); sunGeo.dispose();
      sceneApiRef.current = null;
    };
  }, []);

  // React to sceneStep prop changes
  useEffect(() => {
    sceneApiRef.current?.transitionToStep(sceneStep);
  }, [sceneStep]);

  // React to selectedPlanet prop changes (nav arrows or external control)
  useEffect(() => {
    if (!sceneApiRef.current) return;
    sceneApiRef.current.selectPlanet(selectedPlanet ?? null);
  }, [selectedPlanet]);

  return (
    <div ref={containerRef} className={styles.stage}>
      <canvas ref={canvasRef} className={styles.canvas} />
      {hotspotsData.map((h, i) => (
        <span
          key={h.title}
          ref={el => { labelRefsArr.current[i] = el; }}
          className={styles.orbitLabel}
        >
          {h.title}
        </span>
      ))}
    </div>
  );
}
