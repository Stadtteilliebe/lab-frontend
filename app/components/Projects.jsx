import Arrow from './Arrow';
import styles from './Projects.module.css';

// Projects that combine several services (Notion: "Projekte, in denen alles
// zusammenkommt"). TODO: real project images — the hero photo stands in.
const PROJECTS = [
  {
    client: 'Gasthaus Vetternwirtschaft',
    title: 'Tradition neu serviert',
    href: 'https://stadtteilliebe.de/projekte/gasthaus-vetternwirtschaft',
  },
  {
    client: 'HUB:DISRUPT',
    title: 'Let’s get disruptive',
    href: 'https://stadtteilliebe.de/projekte/hub-disrupt',
  },
  {
    client: 'NERDFIELD by DevBoost',
    title: 'Talk nerdy to me',
    href: 'https://stadtteilliebe.de/projekte/nerdfield',
  },
];

export default function Projects() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Projekte, in denen alles zusammenkommt</h2>
      <div className={styles.grid}>
        {PROJECTS.map(project => (
          <a key={project.href} className={styles.card} href={project.href}>
            <div className={styles.imageWrap}>
              <img className={styles.image} src="/images/hero-workshop.jpg" alt="" />
            </div>
            <div className={styles.body}>
              <p className={styles.client}>{project.client}</p>
              <h3 className={styles.cardTitle}>{project.title}</h3>
              <Arrow className={styles.arrow} width={18} />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
