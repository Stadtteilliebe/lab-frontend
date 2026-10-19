import Arrow from './Arrow';
import { hotspotsData } from './services';
import styles from './Projects.module.css';

// Projects that combine several services (Notion: "Projekte, in denen alles
// zusammenkommt"). services: the involved services, by title in services.js.
// TODO: real project images — the hero photo stands in.
const PROJECTS = [
  {
    client: 'Gasthaus Vetternwirtschaft',
    title: 'Tradition neu serviert',
    services: ['Identity', 'Experience', 'Engineering'],
    href: 'https://stadtteilliebe.de/projekte/gasthaus-vetternwirtschaft',
  },
  {
    client: 'HUB:DISRUPT',
    title: 'Let’s get disruptive',
    services: ['Strategy', 'Identity', 'Experience', 'Engineering'],
    href: 'https://stadtteilliebe.de/projekte/hub-disrupt',
  },
  {
    client: 'NERDFIELD by DevBoost',
    title: 'Talk nerdy to me',
    services: ['Strategy', 'Identity', 'Experience'],
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
              <ul className={styles.tags}>
                {project.services.map(title => (
                  <li
                    key={title}
                    className={styles.tag}
                    style={{ background: hotspotsData.find(h => h.title === title).color }}
                  >
                    {title}
                  </li>
                ))}
              </ul>
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
