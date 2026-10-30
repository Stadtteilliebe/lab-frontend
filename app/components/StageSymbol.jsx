'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './StageSymbol.module.css';

// The service symbols (same 40×40 drawings as ServiceIcon), split into the
// parts their stage animation moves — see StageSymbol.module.css.
const SHAPES = {
  // Drawn as one thick line along the middle of the curve (8.25 = the
  // symbol's stroke width), so it can draw itself
  Strategy: (
    <path
      className={styles.line}
      d="M4.13 0V27.92A7.935 7.935 0 0 0 20 27.92V12.06A7.935 7.935 0 0 1 35.87 12.06V40"
      fill="none"
      stroke="currentColor"
      strokeWidth="8.25"
      pathLength="1"
    />
  ),
  Identity: (
    <path
      className={styles.star}
      d="M40 15.87H29.96L37.06 8.78L31.22 2.94L24.13 10.04V0H15.87V10.04L8.78 2.94L2.94 8.78L10.04 15.87H0V24.13H10.04L2.94 31.22L8.78 37.06L15.87 29.96V40H24.13V29.96L31.22 37.06L37.06 31.22L29.96 24.13H40V15.87Z"
    />
  ),
  // Two half circles, bottom one first
  Experience: (
    <>
      <path className={styles.half} d="M0 40H40C40 28.97 31.07 20.03 20.04 20H19.96C8.93 20.03 0 28.97 0 40Z" />
      <path className={styles.half} d="M0 20H40C40 8.95 31.05 0 20 0C8.95 0 0 8.95 0 20Z" />
    </>
  ),
  // Four triangles, in reading order
  Engineering: (
    <>
      <path className={styles.triangle} d="M0 0L20 20V0H0Z" />
      <path className={styles.triangle} d="M20 0L40 20V0H20Z" />
      <path className={styles.triangle} d="M20 40V20H0L20 40Z" />
      <path className={styles.triangle} d="M40 40V20H20L40 40Z" />
    </>
  ),
};

export default function StageSymbol({ name, color, className = '' }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  // Play the entrance once the symbol is on screen — on mobile it sits
  // below the text
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setInView(true);
      observer.disconnect();
    }, { threshold: 0.3 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      className={`${styles.symbol} ${inView ? styles.inView : ''} ${className}`}
      viewBox="0 0 40 40"
      fill="currentColor"
      style={{ color }}
      aria-hidden="true"
    >
      {SHAPES[name]}
    </svg>
  );
}
