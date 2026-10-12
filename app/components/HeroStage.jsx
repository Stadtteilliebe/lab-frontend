'use client';

import { useEffect, useRef, useState } from 'react';
import Arrow from './Arrow';
import { hotspotsData } from './ScrollStory';
import styles from './HeroStage.module.css';

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

// Share of the stage's scroll range before the white panel starts to grow.
const NAV_LEAD = 0.06;

// "direkt zu" jump points — ScrollStory listens for this event, scrolls to
// the end of the solar system and opens the chosen planet.
function JumpList({ className = '' }) {
  return (
    <div className={`${styles.jump} ${className}`}>
      <p className={styles.jumpLabel}>Direkt zu</p>
      <div className={styles.jumpList}>
        {hotspotsData.map((h, i) => (
          <button
            key={h.title}
            className={styles.jumpItem}
            onClick={() => window.dispatchEvent(new CustomEvent('open-planet', { detail: i }))}
          >
            <span className={styles.jumpDot} />
            <span className={styles.jumpTitle}>{h.title}</span>
            <Arrow className={styles.jumpArrow} width={18} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function HeroStage() {
  const wrapperRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const scrollable = wrapperRef.current.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      setProgress(clamp(-rect.top / scrollable, 0, 1));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Below this width the panel starts fully open instead of as a 50%-wide
  // sliver — there isn't room to slide it open next to the background art.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Phase 1 (NAV_LEAD→0.5): panel 50%→100%, images slide right. Starts a
  // little late so the nav has already slid away (see Nav.jsx) first.
  const p1 = clamp((progress - NAV_LEAD) / (0.5 - NAV_LEAD), 0, 1);
  const panelWidthPct = isMobile ? 100 : 50 + p1 * 50;
  const bgTX = p1 * 15;

  // Phase 2 (0.5→1): "Unsere Leistungen" grows slightly
  const p2 = clamp((progress - 0.5) / 0.5, 0, 1);
  const titleGrowP = p2;

  // stays visible until "Unsere Leistungen" hits max size, then fades
  const textOpacity = clamp(1 - (p2 - 0.8) / 0.2, 0, 1);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <section className={styles.sticky}>

        {/* Background: slides right during phase 1 */}
        <div className={styles.bgGrid} style={{ transform: `translateX(${bgTX}%)` }}>
          <div className={styles.photoSlot}>
            <img
              src="/images/hero-workshop.jpg"
              alt=""
              className={styles.photo}
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div className={styles.teaserSlot}>
            <JumpList className={styles.jumpDesktop} />
          </div>
        </div>

        {/* White panel: starts at 50%, grows to 100% */}
        <div className={styles.whitePanel} style={{ width: `${panelWidthPct}%` }}>

          {/* Layer 1 – centered text, fades during phase 1 */}
          <div className={styles.layer1} style={{ opacity: textOpacity }}>
            <div className={styles.layer1Content}>
              <h2 className={styles.panelHeading}>Von Anfang an nutzerzentriert</h2>
              <p className={styles.panelDesc}>
                Wir verankern nutzerzentriertes Denken in Projekten und Organisationen.
                Strukturiert, kollaborativ und ohne Umwege. Das Ergebnis sind digitale Produkte,
                die intuitiv funktionieren – für Nutzer*innen, Teams und Unternehmen.
              </p>
              {/* Mobile: the lilac box isn't visible next to the full-width
                  panel, so the jump points sit inside it as a card. */}
              <JumpList className={styles.jumpMobile} />
            </div>
          </div>

          {/* Layer 2 – "Unsere Leistungen" always visible at bottom, grows in phase 2 */}
          <div className={styles.layer2}>
            <h2 className={styles.panelTitle} style={{ '--title-p': titleGrowP }}>
              Unsere Leistungen
            </h2>
            <button
              className={styles.indicator}
              onClick={() => document.getElementById('leistungen')?.scrollIntoView({ behavior: 'smooth' })}
              aria-label="Zu unseren Leistungen"
            >
              <Arrow direction="down" width={13} />
            </button>
          </div>

        </div>

      </section>
    </div>
  );
}
