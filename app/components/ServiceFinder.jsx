import Arrow from './Arrow';
import { hotspotsData } from './services';
import styles from './ServiceFinder.module.css';

// "Welche Leistung passt zu dir?" — typical starting situations, each with
// the service to begin with. `service` points into hotspotsData
// (0 Strategy … 3 Engineering); the card links to its subpage (no link yet,
// see hotspotsData).
const SITUATIONS = [
  { situation: 'Du gründest oder bringst ein neues Produkt raus.', service: 0 },
  { situation: 'Du kennst deine Zielgruppe, erkennst dich aber in deinem Auftritt nicht mehr wieder.', service: 1 },
  { situation: 'Dein digitales Produkt soll besser werden.', service: 2 },
  { situation: 'Das Design steht, es fehlt die Umsetzung.', service: 3 },
  { situation: 'Deine Marke passt, deine Website nicht mehr.', service: 2 },
  { situation: 'Im Team will jede:r etwas anderes.', service: 0 },
];

export default function ServiceFinder() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Welche Leistung passt zu dir?</h2>

      <ul className={styles.grid}>
        {SITUATIONS.map(({ situation, service }) => (
          <li key={situation}>
            <a className={styles.card} href={hotspotsData[service].href ?? undefined}>
              <span className={styles.tag} style={{ background: hotspotsData[service].color }}>
                {hotspotsData[service].title}
              </span>
              <p className={styles.situation}>{situation}</p>
              <Arrow className={styles.arrow} width={18} />
            </a>
          </li>
        ))}
      </ul>

      {/* Speech bubble: the tail is drawn by .answer::after */}
      <div className={styles.answer}>
        <h3 className={styles.question}>Erst die Marke oder gleich die Website?</h3>
        <p className={styles.answerText}>
          Meistens zuerst die Marke. Positionierung, Logo, Farben und Botschaften sind das Fundament,
          auf dem deine Website aufbaut. Wer andersherum startet, muss die Website später oft
          nachbessern und das kostet Zeit und Geld. Steht deine Marke schon und passt noch zu dir,
          startest du direkt mit der Website. Drängt der Launch, arbeiten wir parallel: Während das
          Corporate Design entsteht, planen wir schon Struktur und Inhalte der Website.
          <br />
          Du bist unsicher? <a href="https://stadtteilliebe.de/kontakt">Frag uns</a>, wir sagen dir,
          womit du anfangen könntest.
        </p>
      </div>
    </section>
  );
}
