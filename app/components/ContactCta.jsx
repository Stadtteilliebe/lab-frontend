import Sticker from './Sticker';
import styles from './ContactCta.module.css';

// Closing CTA, the top of the dark footer block (rendered by Footer). The
// sticker sits on its top edge, half over the white page above.
// TODO: booking link for the 15-min call — not on stadtteilliebe.de yet.
const BOOKING_HREF = null;

export default function ContactCta() {
  return (
    <section className={styles.section}>
      <Sticker className={styles.sticker} />
      <h2 className={styles.title}>Bereit, mit deinem Projekt zu starten?</h2>
      <p className={styles.text}>
        Ob konkrete Anfrage oder erste Idee: Lass uns unverbindlich über den passenden Weg für
        dein Projekt sprechen.
      </p>
      <div className={styles.buttons}>
        <a className={styles.primary} href="https://stadtteilliebe.de/kontakt">Nachricht schreiben</a>
        <a className={styles.secondary} href={BOOKING_HREF ?? undefined}>15-Min-Gespräch buchen</a>
      </div>
    </section>
  );
}
