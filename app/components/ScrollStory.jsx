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

const STAR_CONFIGS = [
  { left: '3%',  top: '5%',  initH: 2, maxH: 42 },
  { left: '8%',  top: '22%', initH: 3, maxH: 58 },
  { left: '13%', top: '10%', initH: 1, maxH: 30 },
  { left: '18%', top: '3%',  initH: 2, maxH: 55 },
  { left: '23%', top: '28%', initH: 4, maxH: 50 },
  { left: '28%', top: '14%', initH: 1, maxH: 35 },
  { left: '33%', top: '7%',  initH: 3, maxH: 48 },
  { left: '38%', top: '20%', initH: 2, maxH: 38 },
  { left: '43%', top: '5%',  initH: 1, maxH: 52 },
  { left: '49%', top: '24%', initH: 3, maxH: 40 },
  { left: '54%', top: '11%', initH: 2, maxH: 62 },
  { left: '60%', top: '18%', initH: 1, maxH: 28 },
  { left: '65%', top: '6%',  initH: 2, maxH: 56 },
  { left: '70%', top: '28%', initH: 4, maxH: 44 },
  { left: '75%', top: '2%',  initH: 1, maxH: 34 },
  { left: '80%', top: '15%', initH: 3, maxH: 50 },
  { left: '85%', top: '8%',  initH: 2, maxH: 46 },
  { left: '90%', top: '22%', initH: 1, maxH: 36 },
  { left: '94%', top: '5%',  initH: 2, maxH: 60 },
  { left: '98%', top: '18%', initH: 3, maxH: 55 },
];

const STORY_STEPS = [
  {
    title: 'Entdecke unsere\nLeistungen',
    text: 'Hinter jedem großen Produkt stecken Kompetenzen, die ineinandergreifen. Was wir tun – und wie wir es tun – dreht sich um einen gemeinsamen Kern.',
  },
  {
    title: 'Aus einem Kern\nbilden sich Kreise',
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
  const [footerScrollProgress, setFooterScrollProgress] = useState(0);
  const storyRef  = useRef(null);
  const footerRef = useRef(null);

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

      if (footerRef.current) {
        const fRect = footerRef.current.getBoundingClientRect();
        const fp = Math.max(0, Math.min(1, (window.innerHeight - fRect.top) / (window.innerHeight * 1.5)));
        setFooterScrollProgress(fp);
      }
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
                <p className={styles.stepHint}>↗ Planeten anklicken</p>
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

      <footer ref={footerRef} className={styles.footer}>
        <div className={styles.starsContainer} aria-hidden="true">
          {STAR_CONFIGS.map((s, i) => (
            <span
              key={i}
              className={styles.shootingStar}
              style={{
                left: s.left,
                top: s.top,
                height: `${s.initH + footerScrollProgress * (s.maxH - s.initH)}px`,
              }}
            />
          ))}
        </div>
        <p
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
      </footer>
    </>
  );
}
