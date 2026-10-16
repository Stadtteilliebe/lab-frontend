import { Fragment } from 'react';
import { hotspotsData } from './services';
import styles from './ServiceFinder.module.css';

// "Welche Leistung passt zu dir?" — Notion „Leistungsübersicht – Inhalte &
// Positionierung“, Content-Entwurf v1. A real <table>, so the situations →
// service mapping stays readable for search engines and AI answers.
// Numbers in `services` point into hotspotsData (0 Strategy … 3 Engineering).
const SITUATIONS = [
  { situation: 'Du gründest oder bringst ein neues Produkt raus.', services: [0, 1] },
  { situation: 'Deine Marke passt, deine Website nicht mehr.', services: [2] },
  { situation: 'Du erkennst dich in deinem Auftritt nicht mehr wieder.', services: [0, 1] },
  { situation: 'Dein digitales Produkt soll besser werden.', services: [2] },
  { situation: 'Das Design steht, es fehlt die Umsetzung.', services: [3] },
];

export default function ServiceFinder() {
  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.title}>Welche Leistung passt zu dir?</h2>
        <p className={styles.intro}>
          Jedes Projekt startet woanders. Hier siehst du, womit unsere Kund*innen typischerweise anfangen.
        </p>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.colHead} scope="col">Deine Ausgangslage</th>
            <th className={styles.colHead} scope="col">Dein Einstieg</th>
          </tr>
        </thead>
        <tbody>
          {SITUATIONS.map(row => (
            <tr key={row.situation}>
              <td className={styles.situation}>{row.situation}</td>
              <td className={styles.start}>
                {/* Quicklinks to the service subpages (no link yet, see hotspotsData) */}
                {row.services.map((s, i) => (
                  <Fragment key={s}>
                    {i > 0 && <span className={styles.or}> oder </span>}
                    <a className={styles.quicklink} href={hotspotsData[s].href ?? undefined}>
                      {hotspotsData[s].title}
                    </a>
                  </Fragment>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.answer}>
        <h3 className={styles.question}>Erst die Marke oder gleich die Website?</h3>
        <div className={styles.answerText}>
          <p>
            Meistens zuerst die Marke. Positionierung, Logo, Farben und Botschaften sind das Fundament,
            auf dem deine Website aufbaut. Wer andersherum startet, muss die Website später oft
            nachbessern und das kostet Zeit und Geld. Steht deine Marke schon und passt noch zu dir,
            startest du direkt mit der Website. Drängt der Launch, arbeiten wir parallel: Während das
            Corporate Design entsteht, planen wir schon Struktur und Inhalte der Website.
          </p>
          <p>
            Du bist unsicher? <a href="https://stadtteilliebe.de/kontakt">Frag uns</a>, wir sagen dir,
            womit du anfangen könntest.
          </p>
        </div>
      </div>
    </section>
  );
}
