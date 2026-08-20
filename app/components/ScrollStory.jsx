'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import LabScene from './LabScene';
import styles from './ScrollStory.module.css';

const hotspotsData = [
  {
    title: 'Workshop & Strategie',
    text: 'Wir starten keine Projekte ohne Workshop.\nNicht, weil es „State of the Art" ist – sondern weil es die einzige Art ist, fundierte Entscheidungen zu treffen.\n\nIm Workshop klären wir, für wen wir arbeiten, was erreicht werden soll und woran wir Erfolg messen. Am Ende steht ein gemeinsames Bild – und eine klare Richtung.',
  },
  {
    title: 'Konzept & Branding',
    text: 'Wir entwickeln Marken, die nicht nur gut aussehen, sondern auch Orientierung geben und langfristig funktionieren. Nach innen wie nach außen.\n\nBranding beginnt für uns bei Haltung, Kontext und Ziel. Erst wenn klar ist, wofür ein Produkt steht, übersetzen wir das in Struktur, Sprache und Gestaltung.',
  },
  {
    title: 'UX / UI Design',
    text: 'Wir gestalten Oberflächen, die Entscheidungen für Nutzer*innen erleichtern und komplexe Inhalte verständlich machen.\n\nKlare Strukturen, nachvollziehbare Flows und Systeme, die auch in der Weiterentwicklung Bestand haben, sind bei uns Standard.',
  },
  {
    title: 'Development',
    text: 'Wir setzen digitale Lösungen technisch sauber und nachhaltig um.\nVon Websites bis zu komplexeren digitalen Anwendungen – immer mit Blick auf Performance, Wartbarkeit und Weiterentwicklung.\n\nDamit aus Konzepten funktionierende Produkte werden.',
  },
];

// Deterministic pseudo-random helper (no Math.random) so server- and
// client-rendered markup match exactly on hydration.
function seeded(i, salt) {
  let t = (i * 374761393 + salt * 668265263) >>> 0;
  t = Math.imul(t ^ (t >>> 13), 1274126177);
  t ^= t >>> 16;
  return (t >>> 0) / 4294967296;
}

const STAR_CONFIGS = [
  { left: '3%',  top: '5%',  length: 42 },
  { left: '8%',  top: '22%', length: 58 },
  { left: '13%', top: '10%', length: 30 },
  { left: '18%', top: '3%',  length: 55 },
  { left: '23%', top: '28%', length: 50 },
  { left: '28%', top: '14%', length: 35 },
  { left: '33%', top: '7%',  length: 48 },
  { left: '38%', top: '20%', length: 38 },
  { left: '43%', top: '5%',  length: 52 },
  { left: '49%', top: '24%', length: 40 },
  { left: '54%', top: '11%', length: 62 },
  { left: '60%', top: '18%', length: 28 },
  { left: '65%', top: '6%',  length: 56 },
  { left: '70%', top: '28%', length: 44 },
  { left: '75%', top: '2%',  length: 34 },
  { left: '80%', top: '15%', length: 50 },
  { left: '85%', top: '8%',  length: 46 },
  { left: '90%', top: '22%', length: 36 },
  { left: '94%', top: '5%',  length: 60 },
  { left: '98%', top: '18%', length: 55 },
].map((s, i) => ({
  ...s,
  // Long, widely-staggered cycles with a short active window (see the
  // keyframe below) so only a couple of stars are ever moving at once.
  duration: (7 + seeded(i, 5) * 9).toFixed(2),
  delay: (seeded(i, 6) * 14).toFixed(2),
}));

const STORY_STEPS = [
  {
    title: 'So arbeiten wir',
    text: 'Hinter jedem großen Produkt stecken Kompetenzen, die ineinandergreifen. Was wir tun – und wie wir es tun – dreht sich um einen gemeinsamen Kern.',
  },
  {
    title: 'Wir starten\ngemeinsam',
    text: 'Aus einem gemeinsamen Kern entsteht alles, was trägt. Strategie, Gestaltung und Entwicklung entfalten ihre Wirkung erst dann vollständig, wenn sie von Anfang an auf dieselbe Mitte ausgerichtet sind.',
  },
  {
    title: 'Unsere Leistungen',
    text: 'Klicke auf einen der Planeten, um mehr über unsere Leistungen zu erfahren.',
    hint: true,
  },
];

export default function ScrollStory() {
  const [scrollStep, setScrollStep]       = useState(0);
  const [step1Progress, setStep1Progress] = useState(0);
  const [clickedIndex, setClickedIndex]   = useState(null);
  const [skyHeight, setSkyHeight] = useState(220);
  const storyRef  = useRef(null);
  const footerRef = useRef(null);
  const brandRef  = useRef(null);

  // Measure the space above the "stadtteilliebe" wordmark so the star
  // field can never grow into it, however tall the footer becomes.
  useEffect(() => {
    const measureSky = () => {
      if (!footerRef.current || !brandRef.current) return;
      const footerTop = footerRef.current.getBoundingClientRect().top;
      const brandTop  = brandRef.current.getBoundingClientRect().top;
      setSkyHeight(Math.max(80, brandTop - footerTop - 40));
    };
    measureSky();
    const ro = new ResizeObserver(measureSky);
    if (footerRef.current) ro.observe(footerRef.current);
    window.addEventListener('resize', measureSky);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measureSky);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!storyRef.current) return;
      const rect          = storyRef.current.getBoundingClientRect();
      const scrolled      = -rect.top;
      const scrollableRange = storyRef.current.offsetHeight - window.innerHeight;
      if (scrollableRange <= 0) return;
      const progress  = Math.max(0, Math.min(1, scrolled / scrollableRange));
      const stepSize  = 1 / STORY_STEPS.length;
      const step      = Math.min(STORY_STEPS.length - 1, Math.floor(progress * STORY_STEPS.length));
      const s1p       = Math.max(0, Math.min(1, (progress - stepSize) / stepSize));
      setScrollStep(step);
      setStep1Progress(s1p);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Clear selection when leaving the interactive zone
  useEffect(() => {
    if (scrollStep < 2) setClickedIndex(null);
  }, [scrollStep]);

  const handlePlanetClick = useCallback((index) => {
    setClickedIndex(index);
  }, []);

  const isInteractive = scrollStep >= 2;
  const hasPlanet     = isInteractive && clickedIndex !== null;

  const leftTitle = hasPlanet ? hotspotsData[clickedIndex].title : STORY_STEPS[scrollStep].title;
  const leftText  = hasPlanet ? hotspotsData[clickedIndex].text  : STORY_STEPS[scrollStep].text;
  const showHint  = isInteractive && !hasPlanet;

  const contentKey = `${scrollStep}-${clickedIndex ?? 'x'}`;

  return (
    <>
      <div ref={storyRef} id="leistungen" className={styles.storyWrapper}>
        <div className={styles.stickySection}>

          {/* ── Left: text panel ── */}
          <div className={styles.leftColumn}>
            <div key={contentKey} className={styles.textContent}>
              <h2 className={styles.stepTitle}>{leftTitle}</h2>
              <p  className={styles.stepText}>{leftText}</p>
              {showHint && (
                <button
                  className={styles.firstPlanetBtn}
                  onClick={() => handlePlanetClick(0)}
                >
                  Ersten Planeten anschauen
                </button>
              )}
            </div>

            {hasPlanet && (
              <nav className={styles.planetNav}>
                <button
                  className={styles.navButton}
                  onClick={() => setClickedIndex(i => (i - 1 + hotspotsData.length) % hotspotsData.length)}
                >←</button>
                <span className={styles.navCounter}>
                  {clickedIndex + 1} von {hotspotsData.length}
                </span>
                <button
                  className={styles.navButton}
                  onClick={() => setClickedIndex(i => (i + 1) % hotspotsData.length)}
                >→</button>
              </nav>
            )}
          </div>

          {/* ── Right: solar system ── */}
          <div className={styles.rightColumn}>
            <LabScene
              sceneStep={scrollStep}
              step1Progress={step1Progress}
              selectedPlanet={clickedIndex}
              onPlanetClick={handlePlanetClick}
            />
          </div>

        </div>
      </div>

      <footer
        ref={footerRef}
        className={styles.footer}
        onMouseMove={e => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty('--fmx', `${e.clientX - r.left}px`);
          e.currentTarget.style.setProperty('--fmy', `${e.clientY - r.top}px`);
          e.currentTarget.style.setProperty('--fglow', '1');
        }}
        onMouseLeave={e => e.currentTarget.style.setProperty('--fglow', '0')}
      >
        <div className={styles.starsContainer} style={{ height: `${skyHeight}px` }} aria-hidden="true">
          {STAR_CONFIGS.map((s, i) => {
            const topPx = (parseFloat(s.top) / 100) * skyHeight;
            const h     = Math.min(s.length, skyHeight - topPx - 6);
            return (
              <span
                key={i}
                className={styles.shootingStar}
                style={{
                  left: s.left,
                  top: `${topPx}px`,
                  height: `${h}px`,
                  '--dur': `${s.duration}s`,
                  animationDelay: `${s.delay}s`,
                }}
              />
            );
          })}
        </div>
        <div className={styles.starsContainerGlow} style={{ height: `${skyHeight}px` }} aria-hidden="true">
          {STAR_CONFIGS.map((s, i) => {
            const topPx = (parseFloat(s.top) / 100) * skyHeight;
            const h     = Math.min(s.length, skyHeight - topPx - 6);
            return (
              <span
                key={i}
                className={styles.shootingStarGlow}
                style={{
                  left: s.left,
                  top: `${topPx}px`,
                  height: `${h}px`,
                  '--dur': `${s.duration}s`,
                  animationDelay: `${s.delay}s`,
                }}
              />
            );
          })}
        </div>
        <p
          ref={brandRef}
          className={styles.footerBrand}
          data-text="stadtteilliebe"
          onMouseMove={e => {
            const r = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
            e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
          }}
          onMouseEnter={e => e.currentTarget.style.setProperty('--glow', '1')}
          onMouseLeave={e => e.currentTarget.style.setProperty('--glow', '0')}
        >stadtteilliebe</p>
        <p className={styles.footerTagline}>Lass uns gemeinsam durchstarten</p>

        <a
          href="https://stadtteilliebe.de/kontakt"
          className={styles.ctaButton}
        >
          Kontakt aufnehmen
        </a>

        <div className={styles.siteFooter}>
          <p className={styles.siteFooterBrand}>stadtteilliebe</p>
          <p className={styles.siteFooterText}>
            Nutzerzentrierte Marken und digitale Lösungen, modular, funktional
            und technologiegetrieben. Strategisch, agil und mit Sinn für
            Gestaltung.
          </p>
          <div className={styles.siteFooterLinks}>
            <a href="https://stadtteilliebe.de/kontakt" className={styles.siteFooterLink}>
              Kontakt
            </a>
            <a href="https://stadtteilliebe.de/impressum" className={styles.siteFooterLink}>
              Impressum
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
