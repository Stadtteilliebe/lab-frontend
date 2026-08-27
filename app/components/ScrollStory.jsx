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
  },
];

export default function ScrollStory() {
  const [scrollStep, setScrollStep]       = useState(0);
  const [step1Progress, setStep1Progress] = useState(0);
  const [clickedIndex, setClickedIndex]   = useState(null);
  const [footerInView, setFooterInView] = useState(false);
  const [footerRevealed, setFooterRevealed] = useState(false);
  const [brandScale, setBrandScale] = useState(0.55);
  const storyRef  = useRef(null);
  const footerRef = useRef(null);
  const brandRef  = useRef(null);

  // Keep growing/shrinking "stadtteilliebe" as the footer scrolls through
  // view, rather than a one-off reveal animation — same idea as the
  // "Unsere Leistungen" title, but scrubbed continuously with scroll.
  useEffect(() => {
    const handleBrandScroll = () => {
      if (!footerRef.current) return;
      const rect = footerRef.current.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / window.innerHeight));
      setBrandScale(0.55 + p * 0.45);
    };
    window.addEventListener('scroll', handleBrandScroll, { passive: true });
    handleBrandScroll();
    return () => window.removeEventListener('scroll', handleBrandScroll);
  }, []);

  // Reveal the footer content shortly after it scrolls into view.
  useEffect(() => {
    if (!footerRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFooterInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(footerRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!footerInView) return;
    const t = setTimeout(() => setFooterRevealed(true), 400);
    return () => clearTimeout(t);
  }, [footerInView]);

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
      <div ref={storyRef} id="leistungen" className={styles.storyWrapper}>
        <div className={styles.stickySection}>

          {/* ── Left: text panel ── */}
          <div className={`${styles.leftColumn} ${hasPlanet ? styles.leftColumnClear : ''}`}>
            <div key={contentKey} className={`${styles.textContent} ${hasPlanet ? styles.textCard : ''}`}>
              <h2 className={styles.stepTitle}>{leftTitle}</h2>
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
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 7H2M7 2L2 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
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
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
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
            />
          </div>

        </div>
      </div>

      <footer
        ref={footerRef}
        className={styles.footer}
      >
        <div className={`${styles.footerContent} ${footerRevealed ? styles.revealed : ''}`}>
          <p
            ref={brandRef}
            className={styles.footerBrand}
            data-text="stadtteilliebe"
            style={{ transform: `scale(${brandScale})` }}
            onMouseMove={e => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
            }}
            onMouseEnter={e => e.currentTarget.style.setProperty('--glow', '1')}
            onMouseLeave={e => e.currentTarget.style.setProperty('--glow', '0')}
          >stadtteilliebe</p>
          <p className={styles.footerTagline}>Lass uns gemeinsam durchstarten</p>

          <a
            href="https://stadtteilliebe.de/kontakt"
            className={styles.ctaButton}
          >
            Kontakt aufnehmen
          </a>

          <div className={styles.siteFooter}>
            <p className={styles.siteFooterBrand}>stadtteilliebe</p>
            <p className={styles.siteFooterText}>
              Nutzerzentrierte Marken und digitale Lösungen, modular, funktional
              und technologiegetrieben. Strategisch, agil und mit Sinn für
              Gestaltung.
            </p>
            <div className={styles.siteFooterLinks}>
              <a href="https://stadtteilliebe.de/kontakt" className={styles.siteFooterLink}>
                Kontakt
              </a>
              <a href="https://stadtteilliebe.de/impressum" className={styles.siteFooterLink}>
                Impressum
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
