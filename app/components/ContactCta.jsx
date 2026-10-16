import styles from './ContactCta.module.css';

// Closing CTA (Notion: "Wo fängt dein Projekt an?") and the sticker divider
// that leads into the footer.
// TODO: booking link for the 15-min call — not on stadtteilliebe.de yet.
const BOOKING_HREF = null;

export default function ContactCta() {
  return (
    <>
      <section className={styles.section}>
        <h2 className={styles.title}>Wo fängt dein Projekt an?</h2>
        <p className={styles.text}>
          Erzähl uns kurz, wo du gerade stehst. Wir besprechen den Einstieg, der zu deinem Projekt
          und deinem Budget passt.
        </p>
        <div className={styles.buttons}>
          <a className={styles.primary} href="https://stadtteilliebe.de/kontakt">Nachricht schreiben</a>
          <a className={styles.secondary} href={BOOKING_HREF ?? undefined}>15-Min-Gespräch buchen</a>
        </div>
      </section>

      {/* Half on the white CTA, half on the dark footer */}
      <div className={styles.divider} aria-hidden="true" />
    </>
  );
}
