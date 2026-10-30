import ContactCta from './ContactCta';
import styles from './Footer.module.css';

const COLUMNS = [
  {
    label: 'Contact',
    links: [{ label: 'hallo@stadtteilliebe.de', href: 'mailto:hallo@stadtteilliebe.de' }],
  },
  {
    label: 'Links',
    links: [
      { label: 'Home', href: 'https://stadtteilliebe.de' },
      // The overview — also from the subpages
      { label: 'Leistungen', href: '/' },
      { label: 'Projekte', href: 'https://stadtteilliebe.de/projekte' },
      { label: 'Merch', href: 'https://stadtteilliebe.de/merch' },
    ],
  },
  {
    label: 'Connect',
    external: true,
    links: [
      { label: 'Instagram', href: 'https://www.instagram.com/stadtteilliebe/' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/stadtteilliebe/posts/' },
      { label: 'TikTok', href: 'https://www.tiktok.com/@stadtteilliebe' },
    ],
  },
  {
    label: 'Legal',
    links: [
      { label: 'Impressum', href: 'https://stadtteilliebe.de/impressum' },
      // TODO: stadtteilliebe.de/datenschutz doesn't exist yet
      { label: 'Datenschutz', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <ContactCta />

      <div className={styles.columns}>
        {COLUMNS.map(column => (
          <div key={column.label} className={styles.column}>
            <p className={styles.label}>{column.label}</p>
            {column.links.map(link => (
              <a
                key={link.label}
                href={link.href}
                className={styles.link}
                {...(column.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div className={styles.wordmarkWrap}>
        <p className={styles.wordmark}>
          {/* Mobile: two lines, so it can be set bigger */}
          gemacht mit <span className={styles.wordmarkLine2}>stadtteilliebe</span>
          {/* Hand-written, drawn at its 8° slant, laid across the wordmark */}
          <img
            className={styles.greatStuff}
            src="/images/great-stuff.svg"
            alt="doing great stuff since 2018"
          />
        </p>
      </div>

      <p className={styles.copyright}>© {new Date().getFullYear()}</p>
    </footer>
  );
}
