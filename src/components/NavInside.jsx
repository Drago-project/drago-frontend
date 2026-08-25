import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import LanguageToggle from "./LanguageToggle";
import styles from "../styles/NavBar.module.css";
import logo from "../assets/backgrunds/web-logo.png";
import { isGuestMode } from "../server/auth";

function NavInside() {
  const { i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isGuest, setIsGuest] = useState(isGuestMode);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsGuest(isGuestMode());
  }, [location.pathname]);

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
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("drago_guest_mode");

    closeMobileMenu();
    navigate("/");
  };

  const isRTL = i18n.language === "ar";

  return (
    <nav
      className={`${styles.navbar} ${styles.navbarInside} ${
        isScrolled ? styles.scrolled : ""
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className={styles.navContainer}>
        <NavLink to="/home" onClick={closeMobileMenu}>
          <img
            src={logo}
            alt="Drago Logo"
            className={styles.logo}
            width="184"
            height="50"
            loading="eager"
          />
        </NavLink>

        {/* Desktop Navigation */}
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <LanguageToggle />
          </li>
          <li className={styles.navItem}>
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              {i18n.language === "ar" ? "الرئيسية" : "Home"}
            </NavLink>
          </li>
          {/* <li className={styles.navItem}>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              {i18n.language === "ar" ? "لوحة التحكم" : "Dashboard"}
            </NavLink>
          </li> */}

          {isGuest ? (
            <li className={styles.navItem}>
              <NavLink
                to="/auth/signup"
                className={`${styles.navLink} ${styles.authButton}`}
              >
                {i18n.language === "ar" ? "اشتراك" : "Sign Up"}
              </NavLink>
            </li>
          ) : (
            <>
              <li className={styles.navItem}>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ""}`
                  }
                >
                  {i18n.language === "ar" ? "حسابي" : "My Account"}
                </NavLink>
              </li>
              <li className={styles.navItem}>
                <button
                  onClick={handleLogout}
                  className={`${styles.navLink} ${styles.authButton}`}
                >
                  {i18n.language === "ar" ? "تسجيل الخروج" : "Logout"}
                </button>
              </li>
            </>
          )}
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
              <LanguageToggle onLanguageChange={closeMobileMenu} />
            </li>
            <li className={styles.mobileNavItem}>
              <NavLink
                to="/home"
                className={styles.mobileNavLink}
                onClick={closeMobileMenu}
              >
                {i18n.language === "ar" ? "الرئيسية" : "Home"}
              </NavLink>
            </li>
            <li className={styles.mobileNavItem}>
              <NavLink
                to="/dashboard"
                className={styles.mobileNavLink}
                onClick={closeMobileMenu}
              >
                {i18n.language === "ar" ? "لوحة التحكم" : "Dashboard"}
              </NavLink>
            </li>

            {isGuest ? (
              <li className={styles.mobileNavItem}>
                <NavLink
                  to="/auth/signup"
                  className={`${styles.mobileNavLink} ${styles.authButton}`}
                  onClick={closeMobileMenu}
                >
                  {i18n.language === "ar" ? "اشتراك" : "Sign Up"}
                </NavLink>
              </li>
            ) : (
              <>
                <li className={styles.mobileNavItem}>
                  <NavLink
                    to="/profile"
                    className={styles.mobileNavLink}
                    onClick={closeMobileMenu}
                  >
                    {i18n.language === "ar" ? "حسابي" : "My Account"}
                  </NavLink>
                </li>
                <li className={styles.mobileNavItem}>
                  <button
                    onClick={handleLogout}
                    className={`${styles.mobileNavLink} ${styles.authButton}`}
                  >
                    {i18n.language === "ar" ? "تسجيل الخروج" : "Logout"}
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavInside;
