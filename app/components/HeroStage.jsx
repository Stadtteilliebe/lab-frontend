'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './HeroStage.module.css';

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

export default function HeroStage() {
  const wrapperRef = useRef(null);
  const [progress, setProgress] = useState(0);

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

  // Phase 1 (0→0.5): panel 50%→100%, images slide right
  const p1 = clamp(progress / 0.5, 0, 1);
  const panelWidthPct = 50 + p1 * 50;
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
              src="/images/hero-tablet.jpg"
              alt=""
              className={styles.photo}
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div className={styles.teaserSlot} />
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
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 2v10M3 8l4 4 4-4" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

        </div>

      </section>
    </div>
  );
}
