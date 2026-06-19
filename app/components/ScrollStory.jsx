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

const STORY_STEPS = [
  {
    title: 'Entdecke unsere\nLeistungen.',
    text: 'Hinter jedem großen Produkt stecken Kompetenzen, die ineinandergreifen. Was wir tun – und wie wir es tun – dreht sich um einen gemeinsamen Kern.',
  },
  {
    title: 'Aus einem Kern\nbilden sich Kreise.',
    text: 'Gute digitale Produkte entstehen nicht zufällig. Sie kreisen um eine gemeinsame Mitte – und entwickeln von dort aus Struktur, Richtung und Form.\n\nSo arbeiten wir auch.',
  },
  {
    title: 'Unsere Leistungen.',
    text: 'Klicke auf einen der Planeten, um mehr über unsere Leistungen zu erfahren.',
    hint: true,
  },
];

export default function ScrollStory() {
  const [scrollStep, setScrollStep]   = useState(0);
  const [clickedIndex, setClickedIndex] = useState(null);
  const storyRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!storyRef.current) return;
      const rect          = storyRef.current.getBoundingClientRect();
      const scrolled      = -rect.top;
      const scrollableRange = storyRef.current.offsetHeight - window.innerHeight;
      if (scrollableRange <= 0) return;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableRange));
      const step = Math.min(STORY_STEPS.length - 1, Math.floor(progress * STORY_STEPS.length));
      setScrollStep(step);
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
      <div ref={storyRef} className={styles.storyWrapper}>
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
              selectedPlanet={clickedIndex}
              onPlanetClick={handlePlanetClick}
            />
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <p className={styles.footerBrand}>stadtteilliebe</p>
        <p className={styles.footerTagline}>Lass uns gemeinsam durchstarten</p>
      </footer>
    </>
  );
}
