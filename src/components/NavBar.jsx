import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { FaEnvelope } from "react-icons/fa"; // السطر ده كان متكرر، خليته مرة واحدة بس
import LanguageToggle from "./LanguageToggle";
import styles from "../styles/NavBar.module.css";
import logo from "../assets/backgrunds/web-logo.png";

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
          <img src={logo} alt="Drago Logo" className={styles.logo} />
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
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              {i18n.language === "ar" ? "عن عسر القراءة" : "About dyslexia"}
            </NavLink>
          </li>

          {/* --- لينك Contact --- */}
          <li className={styles.navItem}>
            <NavLink
              to="/contact-us"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              {/* الأيقونة فوق */}
              <FaEnvelope style={{ fontSize: "1.2rem", marginBottom: "2px" }} />

              {/* الكلمة تحت */}
              <span>{i18n.language === "ar" ? "اتصل بنا" : "Contact"}</span>
            </NavLink>
          </li>
          {/* ------------------- */}

          <li className={styles.navItem}>
            <NavLink
              to="/auth/login"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              {i18n.language === "ar" ? "تسجيل دخول" : "Log In"}
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink
              to="/auth/signup"
              className={({ isActive }) =>
                `${styles.navLink} ${styles.authButton} ${isActive ? styles.active : ""}`
              }
            >
              {i18n.language === "ar" ? "اشتراك" : "SignUp"}
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
          className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ""}`}
        >
          <ul className={styles.mobileNavList}>
            <li className={styles.mobileNavItem}>
              <LanguageToggle onLanguageChange={closeMobileMenu} />
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
                to="/about"
                className={styles.mobileNavLink}
                onClick={closeMobileMenu}
              >
                {i18n.language === "ar" ? "عن عسر القراءة" : "About dyslexia"}
              </NavLink>
            </li>
            <li className={styles.mobileNavItem}>
              <NavLink
                to="/contact-us"
                className={styles.mobileNavLink}
                onClick={closeMobileMenu}
              >
                {i18n.language === "ar" ? "اتصل بنا" : "Contact"}
              </NavLink>
            </li>
            <li className={styles.mobileNavItem}>
              <NavLink
                to="/auth/login"
                className={styles.mobileNavLink}
                onClick={closeMobileMenu}
              >
                {i18n.language === "ar" ? "تسجيل دخول" : "Log In"}
              </NavLink>
            </li>
            <li className={styles.mobileNavItem}>
              <NavLink
                to="/auth/signup"
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
