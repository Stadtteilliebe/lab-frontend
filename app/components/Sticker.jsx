'use client';

import { useEffect, useRef } from 'react';

// Tilt at the top/bottom edge of the viewport — upright in the middle, so
// it rocks a little while passing through instead of turning on its head
const MAX_TILT = 20;

export default function Sticker({ className }) {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        // -1 at the bottom edge … 1 at the top edge of the viewport
        const rect = el.getBoundingClientRect();
        const pos = 1 - (2 * (rect.top + rect.height / 2)) / window.innerHeight;
        const tilt = Math.max(-1, Math.min(1, pos)) * MAX_TILT;
        el.style.setProperty('--turn', `${tilt}deg`);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <img
      ref={ref}
      className={className}
      src="/images/sticker.svg"
      alt="stl – doing great stuff since 2018"
    />
  );
}
