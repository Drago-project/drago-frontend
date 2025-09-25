import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import LanguageToggle from "./LanguageToggle";
import styles from "../styles/NavBar.module.css";

function NavBar() {
  const { i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isRTL = i18n.language === "ar";

  return (
    <nav
      className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className={styles.navContainer}>
        <NavLink to="/" onClick={closeMobileMenu}>
          <img src="web-logo.png" alt="Drago Logo" className={styles.logo} />
        </NavLink>

        {/* Desktop Navigation */}
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <LanguageToggle />
          </li>
          <li className={styles.navItem}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              {i18n.language === "ar" ? "الرئيسية" : "Home"}
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink to="#" className={styles.navLink}>
              {i18n.language === "ar" ? "حول" : "About"}
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink to="#" className={styles.navLink}>
              {i18n.language === "ar" ? "اتصل بنا" : "Contact"}
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              {i18n.language === "ar" ? "تسجيل دخول" : "Log In"}
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink
              to="/signup"
              className={({ isActive }) =>
                `${styles.navLink} ${styles.authButton} ${
                  isActive ? styles.active : ""
                }`
              }
            >
              {i18n.language === "ar" ? "اشتراك" : "Sign Up"}
            </NavLink>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuButton}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>

        {/* Mobile Navigation */}
        <div
          className={`${styles.mobileMenu} ${
            isMobileMenuOpen ? styles.open : ""
          }`}
        >
          <ul className={styles.mobileNavList}>
            <li className={styles.mobileNavItem}>
              <LanguageToggle />
            </li>
            <li className={styles.mobileNavItem}>
              <NavLink
                to="/"
                className={styles.mobileNavLink}
                onClick={closeMobileMenu}
              >
                {i18n.language === "ar" ? "الرئيسية" : "Home"}
              </NavLink>
            </li>
            <li className={styles.mobileNavItem}>
              <NavLink
                to="#"
                className={styles.mobileNavLink}
                onClick={closeMobileMenu}
              >
                {i18n.language === "ar" ? "حول" : "About"}
              </NavLink>
            </li>
            <li className={styles.mobileNavItem}>
              <NavLink
                to="#"
                className={styles.mobileNavLink}
                onClick={closeMobileMenu}
              >
                {i18n.language === "ar" ? "اتصل بنا" : "Contact"}
              </NavLink>
            </li>
            <li className={styles.mobileNavItem}>
              <NavLink
                to="/login"
                className={styles.mobileNavLink}
                onClick={closeMobileMenu}
              >
                {i18n.language === "ar" ? "تسجيل دخول" : "Log In"}
              </NavLink>
            </li>
            <li className={styles.mobileNavItem}>
              <NavLink
                to="/signup"
                className={`${styles.mobileNavLink} ${styles.authButton}`}
                onClick={closeMobileMenu}
              >
                {i18n.language === "ar" ? "اشتراك" : "Sign Up"}
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
