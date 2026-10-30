import { notFound } from 'next/navigation';
import Nav from '../components/Nav';
import ServiceStage from '../components/ServiceStage';
import Footer from '../components/Footer';
import { hotspotsData } from '../components/services';
import styles from './page.module.css';

const CONTACT_HREF = 'https://stadtteilliebe.de/kontakt';

// Stage copy per subpage, keyed by the service slug (from the designs)
const STAGES = {
  strategy: {
    title: 'Strategie & Workshops für deine Marke',
    text: 'Bevor du in eine neue Website oder Marke investierst, klären wir mit deinem Team im Workshop, wohin es gehen soll. Die großen Entscheidungen fallen dann einmal und gemeinsam, nicht erst mitten im Projekt. Das spart dir Schleifen, Diskussionen und Budget.',
    secondary: 'Formate ansehen',
  },
  identity: {
    title: 'Branding für Marken, die nicht wie alle anderen klingen',
    text: 'Mit Branding bekommt dein Produkt oder deine Marke eine eigene Identität. Dazu gehören eine klare Positionierung, ein Name, der trägt, Botschaften, die dein ganzes Team erklären kann, und ein Corporate Design mit Logo, Farben und Typografie. Im Identity Sprint stellen wir genau die Bausteine zusammen, die dir noch fehlen: für eine neue Marke, ein neues Produkt oder ein Rebranding.',
    secondary: 'Formate ansehen',
  },
  experience: {
    title: 'UX/UI-Design für Produkte, die Menschen verstehen',
    text: 'Mit UX/UI-Design gestalten wir digitale Produkte und Websites so, dass Menschen sie intuitiv verstehen und gern nutzen. Erst klären wir die Struktur, dann das Design. Am Ende steht ein klickbarer Prototyp mit Design System, den dein Entwicklerteam oder unser Engineering direkt umsetzen kann.',
    secondary: 'So arbeiten wir',
  },
  engineering: {
    title: 'Webentwicklung für digitale Produkte',
    text: 'Webentwicklung heißt bei uns: Wir setzen deine Website oder Web-App so um, dass sie schnell lädt, sicher läuft und dein Team die Inhalte selbst pflegt. Wir bauen headless mit Next.js und Prismic, verbinden deine Systeme und denken technisches SEO von Anfang an mit. Nach dem Livegang bleiben wir auf Wunsch dran.',
    secondary: 'Formate ansehen',
  },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return hotspotsData.map(h => ({ service: h.slug }));
}

export async function generateMetadata({ params }) {
  const { service } = await params;
  const stage = STAGES[service];
  return stage ? { title: stage.title, description: stage.text } : {};
}

export default async function ServicePage({ params }) {
  const { service: slug } = await params;
  const service = hotspotsData.find(h => h.slug === slug);
  const stage = STAGES[slug];
  if (!service || !stage) notFound();

  return (
    <>
      <Nav variant="service" />
      <ServiceStage
        service={service}
        title={stage.title}
        text={stage.text}
        primary={{ label: 'Workshop anfragen', href: CONTACT_HREF }}
        secondary={{ label: stage.secondary, href: null }}
      />
      <div className={styles.gap} />
      <Footer />
    </>
  );
}
