'use client';

import { useState } from 'react';
import StageSymbol from './StageSymbol';
import { hotspotsData } from './services';
import styles from './ServiceFinder.module.css';

// "Welche Leistung passt zu dir?" — typical starting situations; picking one
// shows the service to begin with in the card next to them. `service`
// points into hotspotsData (0 Strategy … 3 Engineering).
const SITUATIONS = [
  { situation: 'Du gründest oder bringst ein neues Produkt raus.', service: 0 },
  { situation: 'Du erkennst dich in deinem Auftritt nicht mehr wieder.', service: 1 },
  { situation: 'Dein digitales Produkt soll besser werden.', service: 2 },
  { situation: 'Das Design steht, es fehlt die Umsetzung.', service: 3 },
  { situation: 'Deine Marke passt, deine Website nicht mehr.', service: 2 },
  { situation: 'Im Team will jede:r etwas anderes.', service: 0 },
];

// Card per service, same order as hotspotsData. The button leads to the
// service's subpage (hotspotsData href).
// TODO: placeholder texts — Strategy from the design, the others are the
// service teasers until the real copy is in Notion.
const RECOMMENDATIONS = [
  {
    button: 'Zur Strategy',
    text: [
      'Wir starten keine Projekte ohne Workshop.',
      'Nicht, weil es „State of the Art“ ist – sondern weil es die einzige Art ist, fundierte Entscheidungen zu treffen.',
      'Im Workshop klären wir, für wen wir arbeiten, was erreicht werden soll und woran wir Erfolg messen. Wir hören zu, fragen nach und strukturieren. Keine Show, keine Methoden um der Methode willen. Am Ende steht ein gemeinsames Bild – und eine klare Richtung.',
    ],
  },
  { button: 'Zur Identity', text: [hotspotsData[1].text] },
  { button: 'Zur Experience', text: [hotspotsData[2].text] },
  { button: 'Zum Engineering', text: [hotspotsData[3].text] },
];

export default function ServiceFinder() {
  const [active, setActive] = useState(0);
  const service = hotspotsData[SITUATIONS[active].service];
  const recommendation = RECOMMENDATIONS[SITUATIONS[active].service];

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Welche Leistung passt zu dir?</h2>

      <div className={styles.finder}>
        <ul className={styles.situations}>
          {SITUATIONS.map(({ situation, service: index }, i) => (
            <li key={situation}>
              <button
                type="button"
                className={styles.situation}
                aria-pressed={i === active}
                // Active pill in the colour of the recommended service
                style={i === active ? { background: hotspotsData[index].color } : undefined}
                onClick={() => setActive(i)}
              >
                {situation}
              </button>
            </li>
          ))}
        </ul>

        {/* Keyed by the service, so the card fades in and its symbol animates
            anew on a change */}
        <div key={service.title} className={styles.card} aria-live="polite">
          <span role="img" aria-label={service.title}>
            <StageSymbol name={service.title} color={service.color} className={styles.icon} />
          </span>
          <div className={styles.cardText}>
            {recommendation.text.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <a className={styles.button} href={service.href}>
            {recommendation.button}
          </a>
        </div>
      </div>

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
