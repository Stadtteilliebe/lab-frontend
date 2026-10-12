'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Arrow from './Arrow';
import LabScene from './LabScene';
import styles from './ScrollStory.module.css';

export const hotspotsData = [
  {
    title: 'Strategy',
    text: 'Wir starten keine Projekte ohne Workshop.\nNicht, weil es „State of the Art" ist – sondern weil es die einzige Art ist, fundierte Entscheidungen zu treffen.\n\nIm Workshop klären wir, für wen wir arbeiten, was erreicht werden soll und woran wir Erfolg messen. Am Ende steht ein gemeinsames Bild – und eine klare Richtung.',
  },
  {
    title: 'Identity',
    text: 'Wir entwickeln Marken, die nicht nur gut aussehen, sondern auch Orientierung geben und langfristig funktionieren. Nach innen wie nach außen.\n\nBranding beginnt für uns bei Haltung, Kontext und Ziel. Erst wenn klar ist, wofür ein Produkt steht, übersetzen wir das in Struktur, Sprache und Gestaltung.',
  },
  {
    title: 'Experience',
    text: 'Wir gestalten Oberflächen, die Entscheidungen für Nutzer*innen erleichtern und komplexe Inhalte verständlich machen.\n\nKlare Strukturen, nachvollziehbare Flows und Systeme, die auch in der Weiterentwicklung Bestand haben, sind bei uns Standard.',
  },
  {
    title: 'Engineering',
    text: 'Wir setzen digitale Lösungen technisch sauber und nachhaltig um.\nVon Websites bis zu komplexeren digitalen Anwendungen – immer mit Blick auf Performance, Wartbarkeit und Weiterentwicklung.\n\nDamit aus Konzepten funktionierende Produkte werden.',
  },
];

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
    underline: true,
  },
];

// Lilac hand-drawn stroke under the whole title. Draws itself left → right
// once when the step appears (CSS animation, see .titleUnderline) — the
// step content remounts on every step change, so it replays on arrival.
function TitleUnderline() {
  return (
    <svg className={styles.titleUnderline} viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden="true">
      <path d="M3 11 C 80 6.5, 190 5, 297 7.5" />
    </svg>
  );
}

export default function ScrollStory() {
  const [scrollStep, setScrollStep]       = useState(0);
  const [step1Progress, setStep1Progress] = useState(0);
  const [clickedIndex, setClickedIndex]   = useState(null);
  const storyRef  = useRef(null);
  const pendingPlanetRef = useRef(null);
  const leftColumnRef = useRef(null);

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

  // Clear selection when leaving the interactive zone — unless a jump point
  // from HeroStage is waiting to open its planet once step 2 is reached.
  // Runs after LabScene's own step-2 transition (child effects run first),
  // so its reset to "nothing selected" doesn't override the pending planet.
  useEffect(() => {
    if (scrollStep < 2) {
      if (pendingPlanetRef.current === null) setClickedIndex(null);
    } else if (pendingPlanetRef.current !== null) {
      setClickedIndex(pendingPlanetRef.current);
      pendingPlanetRef.current = null;
    }
  }, [scrollStep]);

  // "direkt zu" jump points in HeroStage: scroll to the end of the story
  // (where planets are clickable), then open the chosen one.
  useEffect(() => {
    const onOpenPlanet = (e) => {
      const el = storyRef.current;
      if (!el) return;
      pendingPlanetRef.current = e.detail;
      window.scrollTo({ top: el.offsetTop + el.offsetHeight - window.innerHeight, behavior: 'smooth' });
    };
    window.addEventListener('open-planet', onOpenPlanet);
    return () => window.removeEventListener('open-planet', onOpenPlanet);
  }, []);

  const handlePlanetClick = useCallback((index) => {
    setClickedIndex(index);
  }, []);

  const isInteractive = scrollStep >= 2;
  const hasPlanet     = isInteractive && clickedIndex !== null;

  const leftTitle = hasPlanet ? hotspotsData[clickedIndex].title : STORY_STEPS[scrollStep].title;
  const leftText  = hasPlanet ? hotspotsData[clickedIndex].text  : STORY_STEPS[scrollStep].text;
  const showHint  = isInteractive && !hasPlanet;
  const showUnderline = !hasPlanet && STORY_STEPS[scrollStep].underline;

  const contentKey = `${scrollStep}-${clickedIndex ?? 'x'}`;

  return (
    <div ref={storyRef} id="leistungen" className={styles.storyWrapper}>
      <div className={styles.stickySection}>

        {/* ── Left: text panel ── */}
        <div ref={leftColumnRef} className={`${styles.leftColumn} ${hasPlanet ? styles.leftColumnClear : ''}`}>
          <div key={contentKey} className={`${styles.textContent} ${hasPlanet ? styles.textCard : ''}`}>
            <h2 className={styles.stepTitle}>
              {showUnderline ? (
                <span className={styles.underlined}>
                  {leftTitle}
                  <TitleUnderline />
                </span>
              ) : leftTitle}
            </h2>
            <p  className={styles.stepText}>{leftText}</p>
            {showHint && (
              <button
                className={styles.firstPlanetBtn}
                onClick={() => handlePlanetClick(0)}
              >
                Planeten ansehen
              </button>
            )}
          </div>

          {hasPlanet && (
            <nav className={styles.planetNav}>
              <button
                className={styles.navButton}
                aria-label="Vorheriger Planet"
                onClick={() => setClickedIndex(i => (i - 1 + hotspotsData.length) % hotspotsData.length)}
              >
                <Arrow direction="left" width={13} />
              </button>
              <span className={styles.navCounter}>
                {clickedIndex + 1} von {hotspotsData.length}
              </span>
              <button
                className={styles.navButton}
                aria-label="Nächster Planet"
                onClick={() => setClickedIndex(i => (
                  i === hotspotsData.length - 1 ? null : i + 1
                ))}
              >
                <Arrow width={13} />
              </button>
            </nav>
          )}
        </div>

        {/* ── Right: solar system ── */}
        <div className={`${styles.rightColumn} ${hasPlanet ? styles.rightColumnExpanded : ''}`}>
          <LabScene
            sceneStep={scrollStep}
            step1Progress={step1Progress}
            selectedPlanet={clickedIndex}
            onPlanetClick={handlePlanetClick}
            topInsetRef={leftColumnRef}
          />
        </div>

      </div>
    </div>
  );
}
