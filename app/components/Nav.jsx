'use client';

import { useState } from 'react';
import styles from './Nav.module.css';

const LINKS = [
  { label: 'Projekte', href: 'https://stadtteilliebe.de/projekte' },
  { label: 'Merch', href: 'https://stadtteilliebe.de/merch' },
  { label: 'Leistungen', href: '#leistungen' },
  { label: 'Kontakt', href: 'https://stadtteilliebe.de/kontakt' },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLinkClick = (e, href) => {
    setMenuOpen(false);
    if (href.startsWith('#')) {
      e.preventDefault();
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {LINKS.slice(0, 3).map(link => (
          <a
            key={link.label}
            href={link.href}
            className={styles.link}
            onClick={e => handleLinkClick(e, link.href)}
          >
            {link.label}
          </a>
        ))}
      </div>

      <div className={styles.center}>
        <a href="https://stadtteilliebe.de" className={styles.brand} aria-label="Zur Startseite">
          stadtteilliebe
        </a>
      </div>

      <div className={styles.right}>
        <a href="https://stadtteilliebe.de/kontakt" className={styles.link}>
          Kontakt
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
