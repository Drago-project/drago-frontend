import styles from "../styles/Footer.module.css";

function Footer({ children }) {
  return (
    <section className={styles.footerSection}>
      <div className={styles.footerContainer}>
        {children}
        <p>© 2026 Drago</p>
      </div>
    </section>
  );
}

export default Footer;
