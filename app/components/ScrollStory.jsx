'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Arrow from './Arrow';
import LabScene from './LabScene';
import { hotspotsData } from './services';
import ServiceIcon from './ServiceIcon';
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

// Step texts move with the scroll instead of fading (like the feature list
// on terminal-industries.com): stacked STEP_GAP × viewport height apart, the
// current one slides up and out while the next comes in from below. The
// move is eased over STEP_MOVE × viewport height of scrolling around each
// step change; in between, the text holds still while the solar system
// animates. STEP_SMOOTH_MS: the texts glide after the scroll position
// instead of sticking to it, which smooths out wheel steps.
// The texts travel less than the page scrolls (GAP < MOVE), so they feel
// held back rather than rushing past. Desktop only — on mobile the text
// stays in place and just cross-fades (see .stepBlock).
const STEP_GAP = 0.6;
const STEP_MOVE = 1.1;
const STEP_SMOOTH_MS = 200;
// Opacity of the outgoing text once it's fully gone and of the incoming one
// when it starts — a slight dissolve, fully opaque only in its resting place
const STEP_OUT_OPACITY = 0.25;
const STEP_IN_OPACITY = 0.2;

const clamp01 = v => Math.max(0, Math.min(1, v));
const easeInOutSine = t => -(Math.cos(Math.PI * t) - 1) / 2;

// Lilac hand-drawn stroke under one word of the title (`underline` in
// STORY_STEPS). Draws itself left → right once (CSS animation, see
// .titleUnderline) when its step is the current one and it's on screen —
// all step titles are mounted from page load on, long before the reader
// scrolls down to them. Watches the word, not the svg: the svg is clipped
// away until drawn, so it never counts as visible.
function TitleUnderline({ active = true }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    }, { threshold: 1 });
    observer.observe(ref.current.parentElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (active && visible) setDrawn(true);
  }, [active, visible]);

  return (
    <svg
      ref={ref}
      className={`${styles.titleUnderline} ${drawn ? styles.titleUnderlineDrawn : ''}`}
      viewBox="0 0 300 16"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M3 11 C 80 6.5, 190 5, 297 7.5" />
    </svg>
  );
}

// Title with the `underline` word marked (see TitleUnderline)
function StepTitle({ as: Tag = 'h2', title, underline, active }) {
  const at = underline ? title.indexOf(underline) : -1;
  return (
    <Tag className={styles.stepTitle}>
      {at >= 0 ? (
        <>
          {title.slice(0, at)}
          <span className={styles.underlined}>
            {underline}
            <TitleUnderline active={active} />
          </span>
          {title.slice(at + underline.length)}
        </>
      ) : title}
    </Tag>
  );
}

// ← → inside the planet card, to step through the planets; greyed out at
// the first / last one (the view closes with CloseView)
function PlanetNav({ index, setIndex }) {
  return (
    <nav className={styles.planetNav}>
      <button
        className={styles.navButton}
        aria-label="Vorheriger Planet"
        disabled={index === 0}
        onClick={() => setIndex(i => Math.max(0, i - 1))}
      >
        <Arrow direction="left" width={18} />
      </button>
      <button
        className={styles.navButton}
        aria-label="Nächster Planet"
        disabled={index === hotspotsData.length - 1}
        onClick={() => setIndex(i => Math.min(hotspotsData.length - 1, i + 1))}
      >
        <Arrow width={18} />
      </button>
    </nav>
  );
}

// Height (px) at the top of the screen that "Ansicht schließen" needs
const CLOSE_VIEW_SPACE = 60;

// "✕ Ansicht schließen" at the top left of the screen, back to the overview.
// Fixed to the screen, so it stays put while the page scrolls on. Mobile:
// just the ✕ in a round button, top right (the label stays for screen
// readers).
// The ✕ is the hand-drawn stadtteilliebe cross (viewBox cropped to the
// drawing, like Arrow), drawn at the same scale as the 18px arrows (0.75)
// so the strokes match.
function CloseView({ onClick, hidden }) {
  return (
    <button className={`${styles.closeView} ${hidden ? styles.closeViewHidden : ''}`} onClick={onClick}>
      <svg className={styles.closeIcon} width="12.4" height="13.1" viewBox="14.5 14 16.5 17.5" fill="currentColor" aria-hidden="true">
        <path d="M15.5169 18.927C19.6127 22.5309 23.4945 26.3657 27.1572 30.4369C28.5294 31.9622 30.7417 29.6796 29.3695 28.1596C25.7015 24.0938 21.8249 20.259 17.7292 16.6497C16.2057 15.307 13.983 17.5735 15.5169 18.927Z" />
        <path d="M27.3708 14.5762C23.5621 18.9589 19.748 23.3415 15.9393 27.7296C14.5984 29.271 16.8054 31.559 18.1515 30.0068C21.9603 25.6242 25.7743 21.2415 29.5831 16.8535C30.924 15.312 28.717 13.024 27.3708 14.5762Z" />
      </svg>
      <span className={styles.closeLabel}>Ansicht schließen</span>
    </button>
  );
}

export default function ScrollStory() {
  const [scrollStep, setScrollStep]       = useState(0);
  const [step1Progress, setStep1Progress] = useState(0);
  const [clickedIndex, setClickedIndex]   = useState(null);
  // Story still covers the top of the screen — the fixed "Ansicht
  // schließen" (white on dark) only shows while it does
  const [storyAtTop, setStoryAtTop]       = useState(true);
  const storyRef  = useRef(null);
  const leftColumnRef = useRef(null);
  const stepRefs  = useRef([]);
  // How far the step texts have moved (0 … steps − 1): shown and where the
  // scroll position wants them; gap: their spacing (px)
  const stepShiftRef = useRef({ offset: 0, target: 0, gap: 0, step: 0 });

  const layoutSteps = useCallback(() => {
    const { offset, gap, step } = stepShiftRef.current;
    const mobile = window.matchMedia('(max-width: 768px)').matches;
    stepRefs.current.forEach((el, i) => {
      if (!el) return;
      if (mobile) {
        el.style.transform = '';
        el.style.opacity = i === step ? '' : '0';
        el.style.visibility = i === step ? '' : 'hidden';
        return;
      }
      const d = i - offset;
      el.style.transform = `translate3d(0, ${d * gap}px, 0)`;
      el.style.opacity = d < 0
        ? Math.max(0, 1 + d * (1 - STEP_OUT_OPACITY))
        : Math.max(0, 1 - d * (1 - STEP_IN_OPACITY));
      // Only the current text and, while moving, its neighbour are shown
      el.style.visibility = Math.abs(d) < 1 ? '' : 'hidden';
    });
  }, []);

  useEffect(() => {
    let frameId = null;
    let lastTime = 0;

    // Eases the shown offset towards the target, frame-rate independent
    const glide = time => {
      const shift = stepShiftRef.current;
      const dt = lastTime ? time - lastTime : 16;
      lastTime = time;
      shift.offset += (shift.target - shift.offset) * (1 - Math.exp(-dt / STEP_SMOOTH_MS));
      if (Math.abs(shift.target - shift.offset) < 0.0005) {
        shift.offset = shift.target;
        frameId = null;
      } else {
        frameId = requestAnimationFrame(glide);
      }
      layoutSteps();
    };

    const handleScroll = () => {
      if (!storyRef.current) return;
      const rect          = storyRef.current.getBoundingClientRect();
      const scrolled      = -rect.top;
      const scrollableRange = storyRef.current.offsetHeight - window.innerHeight;
      if (scrollableRange <= 0) return;
      const progress  = Math.max(0, Math.min(1, scrolled / scrollableRange));
      const stepSize  = 1 / STORY_STEPS.length;
      const step      = Math.min(STORY_STEPS.length - 1, Math.floor(progress * STORY_STEPS.length));

      // Step texts: one eased move of STEP_MOVE centered on each step change
      const shift   = stepShiftRef.current;
      const move    = window.innerHeight * STEP_MOVE;
      const stepPx  = scrollableRange / STORY_STEPS.length;
      let target    = 0;
      for (let k = 1; k < STORY_STEPS.length; k++) {
        target += easeInOutSine(clamp01((scrolled - (k * stepPx - move / 2)) / move));
      }
      shift.target = target;
      shift.gap    = window.innerHeight * STEP_GAP;
      if (shift.step !== step) {
        shift.step = step;
        layoutSteps();
      }
      if (frameId === null) {
        lastTime = 0;
        frameId = requestAnimationFrame(glide);
      }

      const s1p       = Math.max(0, Math.min(1, (progress - stepSize) / stepSize));
      setScrollStep(step);
      setStep1Progress(s1p);
      setStoryAtTop(rect.bottom > CLOSE_VIEW_SPACE);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [layoutSteps]);

  // The step texts remount after a planet card closes
  useLayoutEffect(layoutSteps);

  // Clear selection when leaving the interactive zone
  useEffect(() => {
    if (scrollStep < 2) setClickedIndex(null);
  }, [scrollStep]);

  const handlePlanetClick = useCallback((index) => {
    setClickedIndex(index);
  }, []);

  const isInteractive = scrollStep >= 2;
  const hasPlanet     = isInteractive && clickedIndex !== null;

  const planet     = hasPlanet ? hotspotsData[clickedIndex] : null;

  // After a planet card closes, the column stays see-through while the
  // camera flies back (LabScene, 900ms) — its backdrop would otherwise cut
  // into the zooming-out system on the left.
  const [settling, setSettling] = useState(false);
  const hadPlanetRef = useRef(false);
  useEffect(() => {
    const closed = hadPlanetRef.current && !hasPlanet;
    hadPlanetRef.current = hasPlanet;
    if (!closed) return;
    setSettling(true);
    const timer = setTimeout(() => setSettling(false), 900);
    return () => clearTimeout(timer);
  }, [hasPlanet]);

  return (
    <div ref={storyRef} id="leistungen" className={styles.storyWrapper}>
      <div className={styles.stickySection}>

        {/* ── Left: text panel ── */}
        <div
          ref={leftColumnRef}
          className={`${styles.leftColumn} ${hasPlanet || settling ? styles.leftColumnClear : ''} ${hasPlanet ? styles.leftColumnSheet : ''}`}
        >
          {hasPlanet && <CloseView onClick={() => setClickedIndex(null)} hidden={!storyAtTop} />}
          {hasPlanet ? (
            <div key={clickedIndex} className={`${styles.textContent} ${styles.textCard}`}>
              {/* Mobile: symbol and title side by side */}
              <div className={styles.cardHead}>
                <ServiceIcon name={planet.title} className={styles.cardIcon} />
                {/* Planet teasers sit one level below the step headings */}
                <StepTitle as="h3" title={planet.heading} />
              </div>
              <p className={styles.stepText}>{planet.text}</p>
              <p className={`${styles.stepText} ${styles.stepFit}`}>Sinnvoll, wenn: {planet.fit}.</p>
              <div className={styles.cardFooter}>
                <a className={styles.moreButton} href={planet.href ?? undefined}>
                  Mehr zu {planet.title}
                </a>
                <PlanetNav index={clickedIndex} setIndex={setClickedIndex} />
              </div>
            </div>
          ) : (
            <div className={`${styles.textContent} ${styles.stepTrack}`}>
              {STORY_STEPS.map((step, i) => (
                <div
                  key={step.title}
                  ref={el => { stepRefs.current[i] = el; }}
                  className={styles.stepBlock}
                  aria-hidden={i !== scrollStep}
                >
                  <StepTitle title={step.title} underline={step.underline} active={i === scrollStep} />
                  <p className={styles.stepText}>{step.text}</p>
                  {step.hint && (
                    <button
                      className={styles.firstPlanetBtn}
                      onClick={() => handlePlanetClick(0)}
                    >
                      Planeten ansehen
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: solar system ── */}
        <div className={styles.rightColumn}>
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
