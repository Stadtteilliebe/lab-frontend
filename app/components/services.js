// Teaser per service (Notion „Leistungsübersicht – Inhalte & Positionierung“,
// Content-Entwurf v1).
// slug/href: the service's own subpage (app/[service]) — used by the jump
// list, the "Mehr zu …" button and the service finder.
// color: the service's brand colour — its symbol (ServiceIcon) and planet.
// darkColor: the darker tone of the big symbol on the subpage stage.
export const hotspotsData = [
  {
    title: 'Strategy',
    color: '#FFE79E',
    darkColor: '#FFD140',
    heading: 'Strategy – Basis schaffen',
    text: 'Viele Ideen, aber keine gemeinsame Linie? Im Workshop sortieren wir mit deinem Team Ziele, Zielgruppen und Prioritäten. Du gehst mit einer Roadmap raus, vor Ort in Dresden oder bei dir.',
    fit: 'dein Team noch nicht weiß, wo es anfangen soll',
    slug: 'strategy',
    href: '/strategy',
  },
  {
    title: 'Identity',
    color: '#BAA2F9',
    darkColor: '#9B5DE5',
    heading: 'Identity – Marke entwickeln',
    text: 'Wir entwickeln Marken, die Orientierung geben und langfristig funktionieren: von Positionierung, Name und Botschaften bis zum Corporate Design. Im Identity Sprint stellen wir die Bausteine passend zu deiner Ausgangslage zusammen.',
    fit: 'du gründest, ein neues Produkt startest oder dein Auftritt nicht mehr passt',
    slug: 'identity',
    href: '/identity',
  },
  {
    title: 'Experience',
    color: '#B9FFDA',
    darkColor: '#2FC9B6',
    heading: 'Experience – Nutzung gestalten',
    text: 'Wir gestalten Oberflächen, die Entscheidungen erleichtern und komplexe Inhalte verständlich machen. Mit klaren Strukturen, nachvollziehbaren Flows und Systemen, die mitwachsen.',
    fit: 'ein Relaunch ansteht oder sich Nutzer:innen nicht zurechtfinden',
    slug: 'experience',
    href: '/experience',
  },
  {
    title: 'Engineering',
    color: '#74E7FF',
    darkColor: '#00BBEB',
    heading: 'Engineering – Ideen live bringen',
    text: 'Wir setzen Websites und digitale Anwendungen technisch sauber um, mit Blick auf Performance, Wartbarkeit und Weiterentwicklung. So werden aus Konzepten funktionierende Produkte.',
    fit: 'das Design steht oder deine Website technisch an Grenzen stößt',
    slug: 'engineering',
    href: '/engineering',
  },
];
