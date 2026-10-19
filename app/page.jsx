import Nav from './components/Nav';
import HeroStage from './components/HeroStage';
import ScrollStory from './components/ScrollStory';
import ServiceFinder from './components/ServiceFinder';
import Projects from './components/Projects';
import ContactCta from './components/ContactCta';
import Footer from './components/Footer';
import styles from './page.module.css';

export default function Home() {
  return (
    <>
      <Nav />
      <HeroStage />
      <ScrollStory />
      <div className={styles.light}>
        <ServiceFinder />
        <Projects />
        <ContactCta />
      </div>
      <Footer />
    </>
  );
}
