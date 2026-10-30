import StageSymbol from './StageSymbol';
import styles from './ServiceStage.module.css';

// Subpage stage: text on black on the left, the service's big symbol on
// its colour on the right.
// TODO: the secondary button leads to a section of the subpage that
// doesn't exist yet.
export default function ServiceStage({ service, title, text, primary, secondary }) {
  return (
    <section className={styles.stage}>
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>{text}</p>
        <div className={styles.buttons}>
          <a className={styles.primary} href={primary.href}>{primary.label}</a>
          <a className={styles.secondary} href={secondary.href ?? undefined}>{secondary.label}</a>
        </div>
      </div>
      <div className={styles.visual} style={{ background: service.color }}>
        <StageSymbol name={service.title} color={service.darkColor} className={styles.symbol} />
      </div>
    </section>
  );
}
