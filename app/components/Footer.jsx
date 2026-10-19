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
      // To the top of the page — the stage introduces the services
      { label: 'Leistungen', href: '#top' },
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
      { label: 'Tiktok', href: 'https://www.tiktok.com/@stadtteilliebe' },
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
      {/* Sticker band across the white → dark edge: one drawing, scaled to
          the full width — never tiled or stretched */}
      <div className={styles.divider} aria-hidden="true">
        <img className={styles.dividerImage} src="/images/footer-divider.svg" alt="" />
      </div>

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
