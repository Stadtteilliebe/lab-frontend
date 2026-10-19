'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { hotspotsData as serviceTeasers } from './services';
import styles from './LabScene.module.css';

const hotspotsData = [
  {
    title: 'Strategy',
    text: 'Wir starten keine Projekte ohne Workshop.\nNicht, weil es „State of the Art" ist – sondern weil es die einzige Art ist, fundierte Entscheidungen zu treffen.\n\nIm Workshop klären wir, für wen wir arbeiten, was erreicht werden soll und woran wir Erfolg messen. Wir hören zu, fragen nach und strukturieren. Am Ende steht ein gemeinsames Bild – und eine klare Richtung.',
    services: ['Strategie-Workshop', 'Branding-Workshop', 'Personas', 'Customer Journey', 'Roadmap'],
  },
  {
    title: 'Identity',
    text: 'Wir entwickeln Marken, die nicht nur gut aussehen, sondern auch Orientierung geben und langfristig funktionieren. Nach innen wie nach außen.\n\nBranding beginnt für uns bei Haltung, Kontext und Ziel. Erst wenn klar ist, wofür ein Produkt oder Unternehmen steht, übersetzen wir das in Struktur, Sprache und Gestaltung.',
    services: ['Positionierung', 'Markenkern', 'Naming', 'Messaging', 'Corporate Design'],
  },
  {
    title: 'Experience',
    text: 'Wir gestalten Oberflächen, die Entscheidungen für Nutzer*innen und für Teams erleichtern und komplexe Inhalte verständlich machen.\nDabei denken wir Design immer im Zusammenspiel von Inhalt, Funktion und technischer Realität.\n\nKlare Strukturen, nachvollziehbare Flows und Systeme, die auch in der Weiterentwicklung Bestand haben, sind bei uns Standard.',
    services: ['Informationsarchitektur', 'UX/UI-Design', 'Prototypen', 'Design System', 'Barrierefreiheit'],
  },
  {
    title: 'Engineering',
    text: 'Wir setzen digitale Lösungen technisch sauber und nachhaltig um.\nVon Websites bis zu komplexeren digitalen Anwendungen – immer mit Blick auf Performance, Wartbarkeit und Weiterentwicklung.\nDamit aus Konzepten funktionierende Produkte werden.',
    services: ['Websites', 'Web-Apps', 'Headless CMS', 'Relaunch'],
  },
];

const orbitsConfig = [
  { radius: 6.3, tiltX: 0.75, tiltZ:  0.08, speed: 0.055, startAngle: 4.0 },
  { radius: 4.9, tiltX: 0.20, tiltZ:  0.45, speed: 0.085, startAngle: 5.6 },
  { radius: 3.6, tiltX: 0.60, tiltZ: -0.22, speed: 0.13,  startAngle: 3.8 },
  { radius: 2.2, tiltX: 0.30, tiltZ:  0.18, speed: 0.22,  startAngle: 0.9 },
];

// Manual screen-space nudges (px) for service pills that still crowd a
// neighbour in the desktop scatter.
const PILL_NUDGE_Y = {};

const BASE_CAM_DISTANCE = 20;

// Desktop: the canvas spans the whole width (under the text column, so it
// never resizes when a planet opens); the overview is shifted to the middle
// of the right column (ScrollStory's 55/45 grid) — as a fraction of the width.
const DESKTOP_SYSTEM_X = 0.775;
const TAN_HALF_FOV      = Math.tan((55 / 2) * Math.PI / 180);

// Mobile: the canvas fills the whole (portrait) sticky section, so the camera
// backs off until this many world units fit on either side of the sun (outer
// orbit is 6.3, plus room for its label), and the image is shifted down so
// the system sits below the text instead of behind it.
const MOBILE_HALF_WIDTH  = 7.6;
const MOBILE_VIEW_SHIFT  = 0.1;    // min. shift, fraction of canvas height (see updateViewShift)
const MOBILE_TOP_SPACE   = 64;     // px kept free at the top for the round close button
const MOBILE_PLANET_AT   = 0.4;    // where a selected planet sits in the space above the card (0 top … 1 bottom)

// Mobile: fits a selected planet's service pills into the free space around
// it. Starts from the same scattered, tilted 3D anchors as desktop, seen
// from the zoomed-in camera (offsets: px relative to the planet), stretches
// that shape to the width and to the space between close button and the
// card sheet at the bottom (top/bottom: px limits relative to the planet), then moves each pill to the
// nearest spot where it overlaps neither another pill nor the planet.
// Returns the stretch factors plus a per-pill correction, so the render loop can keep projecting the anchors
// every frame — the pills swing in with the camera like on desktop and
// land exactly on this layout once the zoom has finished.
const layoutMobilePills = (els, offsets, containerWidth, top, bottom) => {
  const margin = 12;
  const planetHalf = 40;
  const pts = els.map((el, j) => ({ x: offsets[j].x, y: offsets[j].y, w: el.offsetWidth, h: el.offsetHeight }));
  const maxX = p => containerWidth / 2 - p.w / 2 - margin;
  const fit = (lim, v) => (Math.abs(v) > 1 ? lim / Math.abs(v) : Infinity);
  const sx = Math.min(...pts.map(p => fit(maxX(p), p.x)));
  const sy = Math.min(...pts.map(p => fit(p.y < 0 ? -top - p.h / 2 : bottom - p.h / 2, p.y)));

  // Place pills one by one: each takes the free spot nearest to its target
  // (searching outwards in rings) that keeps a gap to the planet and to the
  // pills already placed, inside the free space.
  const gapX = 14, gapY = 12;
  const planet = { x: 0, y: 0, w: planetHalf * 2, h: planetHalf * 2 };
  const placedSoFar = [planet];
  const inBounds = (p, x, y) => Math.abs(x) <= maxX(p) && y >= top + p.h / 2 && y <= bottom - p.h / 2;
  const isFree = (p, x, y) => placedSoFar.every(q => (
    Math.abs(x - q.x) >= (p.w + q.w) / 2 + gapX || Math.abs(y - q.y) >= (p.h + q.h) / 2 + gapY
  ));
  const placed = pts.map(p => {
    const tx = Math.max(-maxX(p), Math.min(maxX(p), p.x * sx));
    const ty = Math.max(top + p.h / 2, Math.min(bottom - p.h / 2, p.y * sy));
    let spot = { x: tx, y: ty };
    search:
    for (let r = 0; r <= 240; r += 6) {
      const steps = r === 0 ? 1 : 24;
      for (let k = 0; k < steps; k++) {
        const a = (k / steps) * Math.PI * 2;
        const x = tx + Math.cos(a) * r, y = ty + Math.sin(a) * r;
        if (inBounds(p, x, y) && isFree(p, x, y)) { spot = { x, y }; break search; }
      }
    }
    const result = { ...p, ...spot };
    placedSoFar.push(result);
    return result;
  });
  return {
    sx,
    sy,
    deltas: placed.map((p, j) => ({ x: p.x - pts[j].x * sx, y: p.y - pts[j].y * sy })),
  };
};

// topInsetRef (mobile): the text column — step text at the top (the overview
// sits below it), or with a planet open the card sheet at the bottom (the
// planet and its pills are centered in the space above it).
export default function LabScene({ sceneStep = 0, step1Progress = 0, selectedPlanet, onPlanetClick, topInsetRef }) {
  const containerRef      = useRef(null);
  const canvasRef         = useRef(null);
  const sceneApiRef       = useRef(null);
  const selectedPlanetRef = useRef(null);
  const labelRefsArr      = useRef([]);
  const subLabelRefsArr   = useRef([]);
  const subLabelAnchorsRef = useRef(null);
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
    scene.background = new THREE.Color(0x121212);

    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 1000);
    camera.position.set(0, 2, BASE_CAM_DISTANCE);
    const mq = window.matchMedia('(max-width: 768px)');

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
    controls.enableZoom      = false;   // never — the wheel scrolls the page
    controls.enableRotate    = false;   // enabled only in step 2
    controls.enablePan       = false;
    controls.autoRotate      = true;
    controls.autoRotateSpeed = 1.8;
    controls.maxDistance     = 32;
    controls.mouseButtons    = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.DOLLY };
    controls.update();

    // Where the pointer went down — a drag (rotating the system) ends in a
    // click too, which must not count as one (see handleClick)
    let pointerDownAt = null;
    renderer.domElement.addEventListener('pointerdown', (e) => {
      pointerDownAt = { x: e.clientX, y: e.clientY };
      if (currentStep >= 2) controls.autoRotate = false;
    });
    let mobilePillLayout = null;
    let pillCamPose = null;   // mobile: where moveTo's zoom ends (see layoutMobilePills)

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
      // toneMapped: false — ACES would wash the pastel service colours out to white
      const planetMat = new THREE.MeshBasicMaterial({ color: serviceTeasers[i].color, toneMapped: false, transparent: true, depthWrite: true, opacity: 0 });
      const planet = new THREE.Mesh(planetGeo, planetMat);
      planet.renderOrder = 1;
      planet.userData = { title: hotspotsData[i].title, text: hotspotsData[i].text };
      planet.visible = false;
      planet.position.copy(getOrbitPos(cfg, orbitAngles[i]));
      scene.add(planet);
      hotspotMeshes.push(planet);
    });

    // ── Helpers ───────────────────────────────────────────────────────────────
    // Deterministic pseudo-random in [0, 1) — stable across frames/renders,
    // just varies by seed, so the scattered layout below doesn't reshuffle
    // every time it's recomputed.
    const pseudoRandom = (seed) => {
      const x = Math.sin(seed * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    // Small, loosely scattered cluster of service labels right around the
    // selected planet (not spread across the whole system) — the camera
    // zooms in tight on just that planet, so the cluster has to stay small
    // enough to all remain in frame together. Radius/angle/depth are jittered
    // per label so it reads as an organic scatter rather than a neat ring.
    // Sits roughly in the planet's own orbital plane. Computed once per
    // selection, re-projected to 2D every frame as the camera moves.
    const computeSubLabelAnchors = (planetIndex, count) => {
      const cfg    = orbitsConfig[planetIndex];
      const center = getOrbitPos(cfg, orbitAngles[planetIndex]);
      const euler  = new THREE.Euler(cfg.tiltX, 0, cfg.tiltZ, 'XZY');
      const basisA = new THREE.Vector3(1, 0, 0).applyEuler(euler);
      const basisB = new THREE.Vector3(0, 1, 0).applyEuler(euler);
      const basisC = new THREE.Vector3(0, 0, 1).applyEuler(euler);

      // Jittered points in the local 2D (basisA/basisB) plane first...
      const pts = [];
      for (let j = 0; j < count; j++) {
        const seed   = planetIndex * 101 + j * 17;
        const angle  = (j / count) * Math.PI * 2 + (pseudoRandom(seed) - 0.5) * 1.3;
        const radius = 0.5 + pseudoRandom(seed + 1) * 0.65;
        pts.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
      }

      // ...then relaxed apart so labels (some much longer than others, e.g.
      // "Proof of Concept" vs "Testing") don't end up sitting on top of
      // each other — a few cheap pairwise-repulsion passes is enough.
      const minDist = 0.75;
      for (let iter = 0; iter < 8; iter++) {
        for (let a = 0; a < pts.length; a++) {
          for (let b = a + 1; b < pts.length; b++) {
            const dx   = pts[b].x - pts[a].x;
            const dy   = pts[b].y - pts[a].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
            if (dist < minDist) {
              const push = (minDist - dist) / 2;
              const nx = dx / dist, ny = dy / dist;
              pts[a].x -= nx * push; pts[a].y -= ny * push;
              pts[b].x += nx * push; pts[b].y += ny * push;
            }
          }
        }
      }

      return pts.map((p, j) => {
        const seed = planetIndex * 101 + j * 17;
        const depthJitter = (pseudoRandom(seed + 2) - 0.5) * 0.5;
        return center.clone()
          .add(basisA.clone().multiplyScalar(p.x))
          .add(basisB.clone().multiplyScalar(p.y))
          .add(basisC.clone().multiplyScalar(depthJitter));
      });
    };

    // Returns a function that stops the fade where it is.
    const fadeMat = (mat, from, to, duration, onDone) => {
      const start = performance.now();
      let raf = 0;
      mat.opacity = from;
      const tick = () => {
        const t = Math.min((performance.now() - start) / duration, 1);
        const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        mat.opacity = from + (to - from) * e;
        if (t < 1) raf = requestAnimationFrame(tick);
        else if (onDone) onDone();
      };
      tick();
      return () => cancelAnimationFrame(raf);
    };

    const defaultCamPos = new THREE.Vector3(0, 2, BASE_CAM_DISTANCE);
    const defaultTarget = new THREE.Vector3(0, 0, 0);
    let animating = false;

    // Fits the overview to the canvas: desktop keeps the fixed camera; mobile
    // backs off to fit the width, shifts the image down, and leaves touch
    // gestures to the page (OrbitControls sets touch-action: none, which
    // otherwise blocks scrolling over the whole canvas).
    // Rotate only from step 2 on, so scrolling through the first two steps
    // can never grab the scene. No zoom at all (the wheel scrolls the page).
    // Mobile can't be dragged at all — taps still open planets, swipes only
    // scroll the page.
    const applyInteraction = () => {
      const interactive = currentStep >= 2 && !mq.matches;
      controls.enableRotate = interactive;
    };

    const fitView = () => {
      const cw = container.clientWidth, ch = container.clientHeight;
      if (!cw || !ch) return;
      const mobile = mq.matches;
      const dist = mobile
        ? Math.max(BASE_CAM_DISTANCE, MOBILE_HALF_WIDTH / (TAN_HALF_FOV * (cw / ch)))
        : BASE_CAM_DISTANCE;
      defaultCamPos.set(0, 2, BASE_CAM_DISTANCE).multiplyScalar(dist / BASE_CAM_DISTANCE);
      controls.maxDistance = Math.max(32, dist * 1.2);
      updateViewShift();
      if (selectedPlanetRef.current === null) Object.assign(lens, overviewLens());
      applyLens();
      renderer.domElement.style.touchAction = mobile ? 'pan-y' : 'none';
      applyInteraction();
      mobilePillLayout = null;
      // Keep the current overview angle, just at the new distance
      if (selectedPlanetRef.current === null && !animating) {
        camera.position.sub(controls.target).setLength(defaultCamPos.length()).add(controls.target);
        controls.update();
      }
    };

    // Lens shift (px, + = right / down): moves the image on the canvas
    // without turning the camera (off-axis frustum, see setViewOffset), so
    // the overview isn't distorted where it sits — beside the text column on
    // desktop, below the step text on mobile.
    const lens = { x: 0, y: 0 };
    const applyLens = () => {
      const cw = container.clientWidth, ch = container.clientHeight;
      if (!lens.x && !lens.y) camera.clearViewOffset();
      else camera.setViewOffset(cw, ch, -lens.x, -lens.y, cw, ch);
    };
    const overviewLens = () => (mq.matches
      ? { x: 0, y: viewShiftTarget }
      : { x: container.clientWidth * (DESKTOP_SYSTEM_X - 0.5), y: 0 });

    // Where `point` lands on screen (NDC, lens included) for the camera as is
    const ndcOf = (point) => {
      camera.updateMatrixWorld();
      const p = point.clone().project(camera);
      return new THREE.Vector2(p.x, p.y);
    };

    // Turns the camera (where it stands) so that `point` lands at `ndc`:
    // a few correction passes on the look-at point, written to `target`.
    const aimAt = (point, ndc, target) => {
      target.copy(point);
      const right = new THREE.Vector3();
      const up    = new THREE.Vector3();
      for (let k = 0; k < 4; k++) {
        camera.lookAt(target);
        const p = ndcOf(point);
        const dist = camera.position.distanceTo(target);
        right.setFromMatrixColumn(camera.matrixWorld, 0);
        up.setFromMatrixColumn(camera.matrixWorld, 1);
        target
          .addScaledVector(right, (p.x - ndc.x) * TAN_HALF_FOV * camera.aspect * dist)
          .addScaledVector(up,    (p.y - ndc.y) * TAN_HALF_FOV * dist);
      }
    };

    // Where `point` lands (NDC) once the camera stands at `pos`, looks at
    // `target` and has the lens shift `toLens`
    const ndcAtPose = (point, pos, target, toLens) => {
      const cw = container.clientWidth, ch = container.clientHeight;
      const endCam = camera.clone();
      endCam.position.copy(pos);
      endCam.lookAt(target);
      endCam.setViewOffset(cw, ch, -toLens.x, -toLens.y, cw, ch);
      endCam.updateMatrixWorld();
      const p = point.clone().project(endCam);
      return new THREE.Vector2(p.x, p.y);
    };

    // focus (optional): { point, ndc } — instead of blending the look-at
    // point, the camera is turned every frame so `point` glides in a straight
    // line from where it is now to `ndc` (where toPos/toTarget put it).
    // Blending look-at point and lens separately made the picture swing out
    // and back. At the end the look-at point snaps to toTarget — same view,
    // but the right pivot for dragging (the corrected point lies on the
    // same line of sight, just at another depth).
    let camAnimId = 0;
    const animateCam = (fromPos, fromTarget, toPos, toTarget, duration, onDone, toLens = overviewLens(), focus = null) => {
      const id = ++camAnimId;   // a newer animation takes over
      const startTime = performance.now();
      const fromLens = { ...lens };
      const fromNdc  = focus && ndcOf(focus.point);
      // Only for a point on screen — far off it the correction can't settle
      if (fromNdc && (Math.abs(fromNdc.x) > 1.2 || Math.abs(fromNdc.y) > 1.2)) focus = null;
      const ndc      = new THREE.Vector2();
      controls.enabled = false;
      animating = true;
      const tick = () => {
        if (id !== camAnimId) return;
        const t = Math.min((performance.now() - startTime) / duration, 1);
        const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        camera.position.lerpVectors(fromPos, toPos, e);
        lens.x = fromLens.x + (toLens.x - fromLens.x) * e;
        lens.y = fromLens.y + (toLens.y - fromLens.y) * e;
        applyLens();
        if (focus) aimAt(focus.point, ndc.lerpVectors(fromNdc, focus.ndc, e), controls.target);
        else controls.target.lerpVectors(fromTarget, toTarget, e);
        controls.update();
        if (t < 1) requestAnimationFrame(tick);
        else {
          controls.target.copy(toTarget);
          controls.update();
          controls.enabled = true;
          animating = false;
          if (onDone) onDone();
        }
      };
      tick();
    };

    const moveTo = (targetPos) => {
      // Always approach from the same flat, default angle (not whatever
      // angle the camera happens to be rotated to) so the zoomed-in view
      // never looks more oblique than the default overview.
      const dir = defaultCamPos.clone().sub(defaultTarget).normalize();
      const newCamPos = targetPos.clone().add(dir.clone().multiplyScalar(3.5));
      // Aim slightly left of the planet so it renders right-of-center once
      // zoomed in — the text card covers the left side of the frame there.
      const forward  = targetPos.clone().sub(newCamPos).normalize();
      const rightVec = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
      const distance = newCamPos.distanceTo(targetPos);
      // Mobile: the card covers the top instead — keep the planet centered
      // horizontally and aim slightly above it so it sits underneath.
      let newTarget, toLens, focus = null;
      if (mq.matches) {
        // Lift (in units of distance) that lands the planet at planetScreenY(),
        // on top of the lens shift that already moves everything down.
        const cH   = container.clientHeight;
        const lift = (planetScreenY() - cH / 2 - viewShiftTarget) * 2 * TAN_HALF_FOV / cH;
        const upVec = new THREE.Vector3().crossVectors(rightVec, forward).normalize();
        newTarget = targetPos.clone().add(upVec.multiplyScalar(distance * lift));
        toLens = overviewLens();
      } else {
        newTarget = targetPos.clone().sub(rightVec.multiplyScalar(distance * 0.42));
        toLens = { x: 0, y: 0 };
        // Coming from the overview (lens shifted). Planet to planet, the lens
        // stays put and the plain blend is smooth.
        if (lens.x) focus = { point: targetPos, ndc: ndcAtPose(targetPos, newCamPos, newTarget, toLens) };
      }
      focusedPlanetPos = targetPos;
      pillCamPose = { pos: newCamPos, target: newTarget };
      animateCam(camera.position.clone(), controls.target.clone(), newCamPos, newTarget, 900, undefined, toLens, focus);
    };

    // Mobile: height of the text column — the step text at the top in the
    // overview, the card sheet at the bottom with a planet open (read at call
    // time — the card has just re-rendered for the newly selected planet).
    const topInset      = () => topInsetRef?.current?.offsetHeight ?? 0;

    // Mobile overview: shifts the image down (px) so the system sits in the
    // middle of the free space below the step text — whose height changes
    // per step — but never less than MOBILE_VIEW_SHIFT. Eased towards the
    // target in the render loop. Frozen while a planet is open, since
    // moveTo's framing is computed against it.
    let viewShiftTarget = 0;
    const updateViewShift = () => {
      if (!mq.matches || selectedPlanetRef.current !== null) return;
      const ch = container.clientHeight;
      viewShiftTarget = Math.max(ch * MOBILE_VIEW_SHIFT, topInset() / 2);
    };
    // Mobile, planet open: topInsetRef is the card sheet along the bottom —
    // the planet sits in the space above it, a bit above the middle so its
    // pills keep clear of the card
    const planetScreenY = () => (
      MOBILE_TOP_SPACE + (container.clientHeight - sheetSpace() - MOBILE_TOP_SPACE) * MOBILE_PLANET_AT
    );
    // Room the sheet takes at the bottom: its height plus its offset from
    // the screen edge (10px + home indicator)
    const sheetSpace = () => {
      const el = topInsetRef?.current;
      return el ? container.getBoundingClientRect().bottom - el.getBoundingClientRect().top : 0;
    };

    // Desktop, back from a planet: that planet (it's on screen, unlike the
    // sun) glides straight to its place in the overview
    let focusedPlanetPos = null;
    const resetCamera = () => {
      const toLens = overviewLens();
      let focus = null;
      if (!mq.matches && focusedPlanetPos && toLens.x !== lens.x) {
        focus = { point: focusedPlanetPos, ndc: ndcAtPose(focusedPlanetPos, defaultCamPos, defaultTarget, toLens) };
      }
      focusedPlanetPos = null;
      animateCam(camera.position.clone(), controls.target.clone(), defaultCamPos.clone(), defaultTarget.clone(), 900, undefined, toLens, focus);
    };

    // Mobile, planet open: the screen or the card changed size (browser
    // bars, a longer text) — frame the planet above the card again
    const reframeMobile = () => {
      const index = selectedPlanetRef.current;
      if (!mq.matches || index === null) return;
      mobilePillLayout = null;
      moveTo(hotspotMeshes[index].position.clone());
    };

    // ── Scene step transitions ────────────────────────────────────────────────
    let currentStep = -1;

    // Planets appear once: one after another the first time step 2 is
    // reached. They then stay through step 1 (so scrolling back and forth
    // around the step boundary doesn't make them vanish and fade in again)
    // and only hide at step 0; coming back from there, they fade in together.
    let planetsRevealed = false;
    // Back from step 2 into step 1: each planet fades out (and back in)
    // together with its ring, see setStep1Progress
    let planetsFollowRings = false;
    let planetFades = [];   // pending timers / running fades, cancelled on any change

    const stopPlanetFades = () => {
      planetFades.forEach(stop => stop());
      planetFades = [];
    };

    const hidePlanets = () => {
      stopPlanetFades();
      hotspotMeshes.forEach(m => { m.visible = false; m.material.opacity = 0; });
    };

    const showPlanets = () => {
      stopPlanetFades();
      const stagger = planetsRevealed ? 0 : 200;
      planetsRevealed = true;
      hotspotMeshes.forEach((m, i) => {
        if (m.visible && m.material.opacity >= 1) return;
        m.visible = true;
        const from = m.material.opacity;
        const timer = setTimeout(() => {
          planetFades.push(fadeMat(m.material, from, 1, 500));
        }, i * stagger);
        planetFades.push(() => clearTimeout(timer));
      });
    };

    const transitionToStep = (newStep) => {
      const prev = currentStep;
      currentStep = newStep;

      if (newStep === 0) {
        ringMeshes[0].material.opacity = 0.55;
        [1, 2, 3].forEach(ri => { ringMeshes[ri].material.opacity = 0; });
        planetsFollowRings = false;
        hidePlanets();
        selectedPlanetRef.current = null;
        onPlanetClickRef.current?.(null);
        controls.autoRotate   = true;
        controls.enableZoom   = false;
        controls.enableRotate = false;
        resetCamera();

      } else if (newStep === 1) {
        controls.autoRotate   = true;
        controls.enableZoom   = false;
        controls.enableRotate = false;
        if (prev >= 2) {
          // Backward from step 2: rings and their planets driven by
          // step1Progress (the inner planet stays, like its ring)
          stopPlanetFades();
          planetsFollowRings = true;
          selectedPlanetRef.current = null;
          onPlanetClickRef.current?.(null);
          resetCamera();
        }
        // Forward from step 0: rings appear via scroll (setStep1Progress handles opacity)

      } else if (newStep === 2) {
        controls.autoRotate   = false;
        ringMeshes.forEach(r => { r.material.opacity = 0.55; });
        planetsFollowRings = false;
        if (prev < 2) showPlanets();
        selectedPlanetRef.current = null;
        applyInteraction();
        onPlanetClickRef.current?.(null);
        // Snap camera to front-facing default instantly — no animation to avoid spin
        camAnimId++;
        animating = false;
        controls.enabled = true;
        camera.position.copy(defaultCamPos);
        controls.target.copy(defaultTarget);
        Object.assign(lens, overviewLens());
        applyLens();
        controls.update();

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
        subLabelAnchorsRef.current = null;
        updateViewShift();
        applyInteraction();
        resetCamera();
      } else {
        const mesh = hotspotMeshes[index];
        if (mesh?.visible) {
          selectedPlanetRef.current = index;
          subLabelAnchorsRef.current = computeSubLabelAnchors(index, hotspotsData[index].services.length);
          mobilePillLayout = null;
          applyInteraction();
          moveTo(mesh.position.clone());
        }
      }
    };

    const setStep1Progress = (p) => {
      if (currentStep !== 1) return;
      [1, 2, 3].forEach((ri, idx) => {
        const shown = Math.max(0, Math.min(1, (p - idx / 3) * 3));
        ringMeshes[ri].material.opacity = shown * 0.55;
        if (planetsFollowRings) {
          const planet = hotspotMeshes[ri];
          planet.material.opacity = shown;
          planet.visible = shown > 0;
        }
      });
    };

    sceneApiRef.current = { transitionToStep, selectPlanet, setStep1Progress };

    // ── Click handling ────────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();

    const handleClick = (event) => {
      if (currentStep < 2) return;
      if (pointerDownAt && Math.hypot(event.clientX - pointerDownAt.x, event.clientY - pointerDownAt.y) > 5) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x =  ((event.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((event.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(hotspotMeshes.filter(m => m.visible));
      // A click into empty space keeps the current view — the detail is
      // closed with the planet nav (or by scrolling away)
      if (hits.length > 0) {
        onPlanetClickRef.current?.(hotspotMeshes.indexOf(hits[0].object));
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

      if (mq.matches && !animating && !anySelected && Math.abs(viewShiftTarget - lens.y) > 0.5) {
        lens.y += (viewShiftTarget - lens.y) * Math.min(1, delta * 6);
        applyLens();
      }

      // Planets stay frozen at startAngle positions — no continuous orbit animation

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

      // Service sub-labels (visible only while a planet is selected)
      const anchors = subLabelAnchorsRef.current;
      if (mq.matches && anchors && selectedPlanetRef.current !== null) {
        // Mobile: the raw 3D scatter is too wide for the screen — the same
        // scatter, fitted into the free space (see layoutMobilePills).
        const els = subLabelRefsArr.current.slice(0, anchors.length);
        const planetPos = hotspotMeshes[selectedPlanetRef.current].position;
        // Anchor offsets from the planet in px, as seen from camera `cam`
        const offsetsFrom = (cam) => {
          const c = planetPos.clone().project(cam);
          return anchors.map(a => {
            const n = a.clone().project(cam);
            return { x: (n.x - c.x) * 0.5 * cW, y: -(n.y - c.y) * 0.5 * cH };
          });
        };
        if (!mobilePillLayout && pillCamPose && els.length === anchors.length && els.every(el => el?.offsetWidth)) {
          const endCam = camera.clone();
          endCam.position.copy(pillCamPose.pos);
          endCam.lookAt(pillCamPose.target);
          endCam.updateMatrixWorld();
          const planetY = planetScreenY();
          mobilePillLayout = layoutMobilePills(
            els, offsetsFrom(endCam), cW, MOBILE_TOP_SPACE - planetY, cH - sheetSpace() - 8 - planetY,
          );
        }
        const ndc = planetPos.clone().project(camera);
        const px  = ( ndc.x * 0.5 + 0.5) * cW;
        const py  = (-ndc.y * 0.5 + 0.5) * cH;
        const offsets = mobilePillLayout && offsetsFrom(camera);
        els.forEach((el, j) => {
          if (!el) return;
          el.style.opacity = mobilePillLayout ? '1' : '0';
          if (!mobilePillLayout) return;
          const { sx, sy, deltas } = mobilePillLayout;
          const x = px + offsets[j].x * sx + deltas[j].x;
          const y = py + offsets[j].y * sy + deltas[j].y;
          el.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
        });
      } else subLabelRefsArr.current.forEach((el, j) => {
        if (!el) return;
        if (!anchors || j >= anchors.length) { el.style.opacity = '0'; return; }
        const ndc = anchors[j].clone().project(camera);
        const sx  = ( ndc.x * 0.5 + 0.5) * cW;
        const sy  = (-ndc.y * 0.5 + 0.5) * cH + (PILL_NUDGE_Y[el.textContent] ?? 0);
        el.style.opacity   = ndc.z < 1 ? '1' : '0';
        el.style.transform = `translate(calc(${sx}px - 50%), calc(${sy}px - 50%))`;
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
      fitView();
      reframeMobile();
    });
    resizeObserver.observe(container);
    // Step text / card height changes → re-center the mobile overview, or
    // re-frame the open planet above the card
    const insetObserver = new ResizeObserver(() => {
      updateViewShift();
      reframeMobile();
    });
    if (topInsetRef?.current) insetObserver.observe(topInsetRef.current);
    mq.addEventListener('change', fitView);
    fitView();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      insetObserver.disconnect();
      mq.removeEventListener('change', fitView);
      canvas.removeEventListener('click', handleClick);
      controls.dispose();
      renderer.dispose();
      environment.dispose();
      ringGeometries.forEach(g => g.dispose());
      ringMaterials.forEach(m => m.dispose());
      stopPlanetFades();
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

  // Drive ring formation in step 1 via scroll position
  useEffect(() => {
    sceneApiRef.current?.setStep1Progress(step1Progress);
  }, [step1Progress]);

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
      {selectedPlanet !== null && selectedPlanet !== undefined && hotspotsData[selectedPlanet]?.services.map((service, j) => (
        <span
          key={service}
          ref={el => { subLabelRefsArr.current[j] = el; }}
          className={styles.subLabel}
        >
          {service}
        </span>
      ))}
    </div>
  );
}
