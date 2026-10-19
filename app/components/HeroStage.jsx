'use client';

import { useEffect, useRef, useState } from 'react';
import Arrow from './Arrow';
import ServiceIcon from './ServiceIcon';
import { hotspotsData } from './services';
import styles from './HeroStage.module.css';

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

// Share of the stage's scroll range before the white panel starts to grow.
const NAV_LEAD = 0.06;

// Jump points — each leads to the service's subpage (see href
// in hotspotsData; no link yet until the subpages exist).
function JumpList({ className = '' }) {
  return (
    <div className={`${styles.jump} ${className}`}>
      <div className={styles.jumpList}>
        {hotspotsData.map(h => (
          <a key={h.title} className={styles.jumpItem} href={h.href ?? undefined}>
            <ServiceIcon name={h.title} className={styles.jumpIcon} />
            <span className={styles.jumpTitle}>{h.title}</span>
            <Arrow className={styles.jumpArrow} width={18} />
          </a>
        ))}
      </div>
    </div>
  );
}

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

  // Phase 1 (NAV_LEAD→0.5): panel 50%→100%, images slide right. Starts a
  // little late so the nav has already slid away (see Nav.jsx) first.
  // Passed as CSS variables, not plain styles: on mobile the stage has no
  // scroll effect and the CSS ignores them — so the very first (server)
  // render is already the mobile layout, without a jump after hydration.
  const p1 = clamp((progress - NAV_LEAD) / (0.5 - NAV_LEAD), 0, 1);
  const panelWidthPct = 50 + p1 * 50;
  const bgTX = p1 * 15;

  // Phase 2 (0.5→1): text stays a while longer, then fades
  const p2 = clamp((progress - 0.5) / 0.5, 0, 1);
  const textOpacity = clamp(1 - (p2 - 0.8) / 0.2, 0, 1);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <section className={styles.sticky}>

        {/* Background: slides right during phase 1 */}
        <div className={styles.bgGrid} style={{ '--bg-tx': `${bgTX}%` }}>
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
        <div className={styles.whitePanel} style={{ '--panel-w': `${panelWidthPct}%`, '--p1': p1 }}>

          {/* Layer 1 – centered text, fades during phase 1 */}
          <div className={styles.layer1} style={{ '--text-opacity': textOpacity }}>
            <div className={styles.layer1Content}>
              <h1 className={styles.panelHeading}>Alle Leistungen, die<br />dein Projekt braucht</h1>
              <p className={styles.panelDesc}>
                Bei Stadtteilliebe bekommst du vier Leistungen aus einem Team: Strategie,
                Branding, UX/UI-Design und Webentwicklung. Du steigst dort ein, wo du gerade
                stehst. Zusammen ergeben sie eine Marke mit klarer Richtung und eine Website,
                die Menschen gern benutzen.
              </p>
              {/* Mobile: the lilac box isn't visible next to the full-width
                  panel, so the jump points sit inside it as a card. */}
              <JumpList className={styles.jumpMobile} />
            </div>
          </div>

          {/* Layer 2 – scroll hint always visible at bottom (no heading tag,
              so it doesn't double the "Entdecke unsere Leistungen" H2) */}
          <div className={styles.layer2}>
            <p className={styles.panelTitle}>
              Mehr erfahren
            </p>
            <button
              className={styles.indicator}
              onClick={() => document.getElementById('leistungen')?.scrollIntoView({ behavior: 'smooth' })}
              aria-label="Zu unseren Leistungen"
            >
              <Arrow direction="down" width={18} />
            </button>
          </div>

        </div>

      </section>
    </div>
  );
}
