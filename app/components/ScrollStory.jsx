'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Arrow from './Arrow';
import LabScene from './LabScene';
import { hotspotsData } from './services';
import styles from './ScrollStory.module.css';

const STORY_STEPS = [
  {
    title: 'Der Kern unserer Leistungen',
    underline: 'Kern',
    text: 'Hinter jeder guten Website und jedem digitalen Produkt stecken Kompetenzen, die ineinandergreifen. Bei uns sitzen sie in einem Team. Alles, was wir tun, dreht sich um einen gemeinsamen Kern: dein Projekt. Daran richten sich alle vier Leistungen aus.',
  },
  {
    title: 'So greift alles ineinander',
    text: 'Meist bauen die Leistungen aufeinander auf: In der Strategie klären wir Richtung und Prioritäten, daraus entsteht deine Marke. Im UX/UI-Design bekommt sie Struktur und Oberfläche, die Webentwicklung bringt alles live. Jede Leistung ist auch einzeln buchbar.',
  },
  {
    title: 'Entdecke unsere Leistungen',
    text: 'Klicke auf einen der Planeten, um mehr über unsere Leistungen zu erfahren.',
    hint: true,
    underline: 'Leistungen',
  },
];

// Scrolling back up out of the last step jumps straight to the first one
// instead of making the reader scroll back through the whole story: after
// this many px of upward scrolling in the last step, the page jumps to
// JUMP_BACK_PROGRESS — inside step 1, with room above so trackpad/touch
// momentum doesn't carry on straight into the hero.
const JUMP_BACK_AFTER_PX = 60;
const JUMP_BACK_PROGRESS = 0.15;

// Lilac hand-drawn stroke under one word of the title (`underline` in
// STORY_STEPS). Draws itself left → right once when the step appears (CSS
// animation, see .titleUnderline) — the step content remounts on every
// step change, so it replays on arrival.
function TitleUnderline() {
  return (
    <svg className={styles.titleUnderline} viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden="true">
      <path d="M3 11 C 80 6.5, 190 5, 297 7.5" />
    </svg>
  );
}

// ← counter → — rendered twice: in the left column under the card (desktop)
// and pinned to the bottom of the screen (mobile), see .planetNavMobile.
function PlanetNav({ index, setIndex, className }) {
  return (
    <nav className={`${styles.planetNav} ${className}`}>
      <button
        className={styles.navButton}
        aria-label="Vorheriger Planet"
        onClick={() => setIndex(i => (i === 0 ? null : i - 1))}
      >
        <Arrow direction="left" width={13} />
      </button>
      <span className={styles.navCounter}>
        {index + 1} von {hotspotsData.length}
      </span>
      <button
        className={styles.navButton}
        aria-label="Nächster Planet"
        onClick={() => setIndex(i => (
          i === hotspotsData.length - 1 ? null : i + 1
        ))}
      >
        <Arrow width={13} />
      </button>
    </nav>
  );
}

export default function ScrollStory() {
  const [scrollStep, setScrollStep]       = useState(0);
  const [step1Progress, setStep1Progress] = useState(0);
  const [clickedIndex, setClickedIndex]   = useState(null);
  const storyRef  = useRef(null);
  const leftColumnRef = useRef(null);

  useEffect(() => {
    let lastY = window.scrollY;
    let scrolledUp = 0;

    const handleScroll = () => {
      if (!storyRef.current) return;
      const rect          = storyRef.current.getBoundingClientRect();
      const scrolled      = -rect.top;
      const scrollableRange = storyRef.current.offsetHeight - window.innerHeight;
      if (scrollableRange <= 0) return;
      const progress  = Math.max(0, Math.min(1, scrolled / scrollableRange));
      const stepSize  = 1 / STORY_STEPS.length;
      const step      = Math.min(STORY_STEPS.length - 1, Math.floor(progress * STORY_STEPS.length));

      // Upward scrolling while the last step is pinned on screen (from the
      // step itself or coming back up from the footer)
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      const lastStepOnScreen = step === STORY_STEPS.length - 1 && rect.bottom >= window.innerHeight;
      scrolledUp = lastStepOnScreen && dy < 0 ? scrolledUp - dy : 0;
      if (scrolledUp > JUMP_BACK_AFTER_PX) {
        scrolledUp = 0;
        window.scrollTo({ top: storyRef.current.offsetTop + scrollableRange * JUMP_BACK_PROGRESS, behavior: 'instant' });
        handleScroll(); // update the step right away for the new position
        return;
      }

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

  const leftTitle = hasPlanet ? hotspotsData[clickedIndex].heading : STORY_STEPS[scrollStep].title;
  // Planet teasers sit one level below the step headings
  const TitleTag  = hasPlanet ? 'h3' : 'h2';
  const leftText  = hasPlanet ? hotspotsData[clickedIndex].text  : STORY_STEPS[scrollStep].text;
  const showHint  = isInteractive && !hasPlanet;
  const underlineWord = hasPlanet ? null : STORY_STEPS[scrollStep].underline;
  const underlineAt   = underlineWord ? leftTitle.indexOf(underlineWord) : -1;

  const contentKey = `${scrollStep}-${clickedIndex ?? 'x'}`;

  return (
    <div ref={storyRef} id="leistungen" className={styles.storyWrapper}>
      <div className={styles.stickySection}>

        {/* ── Left: text panel ── */}
        <div ref={leftColumnRef} className={`${styles.leftColumn} ${hasPlanet ? styles.leftColumnClear : ''}`}>
          <div key={contentKey} className={`${styles.textContent} ${hasPlanet ? styles.textCard : ''}`}>
            <TitleTag className={styles.stepTitle}>
              {underlineAt >= 0 ? (
                <>
                  {leftTitle.slice(0, underlineAt)}
                  <span className={styles.underlined}>
                    {underlineWord}
                    <TitleUnderline />
                  </span>
                  {leftTitle.slice(underlineAt + underlineWord.length)}
                </>
              ) : leftTitle}
            </TitleTag>
            <p  className={styles.stepText}>{leftText}</p>
            {hasPlanet && (
              <p className={`${styles.stepText} ${styles.stepFit}`}>Sinnvoll, wenn: {hotspotsData[clickedIndex].fit}</p>
            )}
            {hasPlanet && (
              <a className={styles.moreButton} href={hotspotsData[clickedIndex].href ?? undefined}>
                Mehr zu {hotspotsData[clickedIndex].title}
              </a>
            )}
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
            <PlanetNav index={clickedIndex} setIndex={setClickedIndex} className={styles.planetNavDesktop} />
          )}
        </div>

        {hasPlanet && (
          <PlanetNav index={clickedIndex} setIndex={setClickedIndex} className={styles.planetNavMobile} />
        )}

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
