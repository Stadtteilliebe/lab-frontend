'use client';

import { useEffect, useRef } from 'react';

// Degrees per scrolled pixel — a slow turn, about a quarter turn per screen
const DEG_PER_PX = 0.1;

export default function Sticker({ className }) {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        ref.current?.style.setProperty('--turn', `${window.scrollY * DEG_PER_PX}deg`);
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
