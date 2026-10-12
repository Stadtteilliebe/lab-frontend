'use client';

import { useEffect, useState } from 'react';
import styles from './Nav.module.css';

const LINKS = [
  { label: 'Projekte', href: 'https://stadtteilliebe.de/projekte' },
  { label: 'Leistungen', href: '#leistungen' },
  { label: 'Merch', href: 'https://stadtteilliebe.de/merch' },
];
const CONTACT = { label: 'Kontakt', href: 'https://stadtteilliebe.de/kontakt' };

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Slides away as soon as the page starts scrolling (before the hero's
  // white panel starts to grow), back in only once at the top again.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLinkClick = (e, href) => {
    setMenuOpen(false);
    if (href.startsWith('#')) {
      e.preventDefault();
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={styles.header}>
      <div className={`${styles.bar} ${scrolled && !menuOpen ? styles.barHidden : ''}`}>
        <a href="https://stadtteilliebe.de" className={styles.brand} aria-label="Zur Startseite">
          stadtteilliebe
        </a>

        <div className={styles.right}>
          {LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              className={styles.link}
              onClick={e => handleLinkClick(e, link.href)}
            >
              {link.label}
            </a>
          ))}
          <a href={CONTACT.href} className={styles.contactButton}>
            {CONTACT.label}
          </a>
          <button
            className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
            aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Sibling of the bar, not inside it: the bar's backdrop-filter would
          otherwise turn this fixed overlay into one clipped to the bar. */}
      <nav className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        {LINKS.map(link => (
          <a
            key={link.label}
            href={link.href}
            className={styles.mobileLink}
            onClick={e => handleLinkClick(e, link.href)}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
