import styles from './Footer.module.css';

const LINKS = [
  { label: 'Home', href: 'https://stadtteilliebe.de' },
  { label: 'Projekte', href: 'https://stadtteilliebe.de/projekte' },
  { label: 'Leistungen', href: '#leistungen' },
  { label: 'Merch', href: 'https://stadtteilliebe.de/merch' },
];

const CONNECT = [
  { label: 'Instagram', href: 'https://www.instagram.com/stadtteilliebe/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/stadtteilliebe/posts/' },
  { label: 'Tiktok', href: 'https://www.tiktok.com/@stadtteilliebe' },
];

// Two identical halves: the marquee animation shifts the track by -50%,
// so the second half lands exactly where the first started and it loops
// seamlessly (same component as the marquee on stadtteilliebe.de/projekte).
const MARQUEE_REPEAT = 12;

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.columns}>
        <div className={styles.column}>
          {LINKS.map(link => (
            <a key={link.label} href={link.href} className={styles.link}>{link.label}</a>
          ))}
        </div>

        <div className={styles.column}>
          {CONNECT.map(link => (
            <a key={link.label} href={link.href} className={styles.link} target="_blank" rel="noopener noreferrer">{link.label}</a>
          ))}
        </div>

        <div className={styles.column}>
          <a href="https://stadtteilliebe.de/kontakt" className={styles.link}>Kontakt</a>
          <a href="mailto:hallo@stadtteilliebe.de" className={styles.link}>hallo@stadtteilliebe.de</a>
        </div>
      </div>

      <div className={styles.marquee} aria-hidden="true">
        <span className={styles.marqueeTrack}>
          {Array.from({ length: MARQUEE_REPEAT }, (_, i) => (
            <span key={i} className={styles.marqueeItem}>stadtteilliebe</span>
          ))}
        </span>
      </div>

      <p className={styles.tagline}>doing great stuff<br />since 2018</p>

      <div className={styles.bottom}>
        <span>stadtteilliebe</span>
        <div className={styles.legal}>
          <a href="https://stadtteilliebe.de/impressum">Impressum</a>
          {/* TODO: stadtteilliebe.de/datenschutz doesn't exist yet */}
          <a href="#">Datenschutz</a>
        </div>
      </div>
    </footer>
  );
}
