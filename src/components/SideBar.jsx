import { useState } from "react";
import styles from "../styles/SideBar.module.css";
import { NavLink } from "react-router-dom";
import logo from "../assets/backgrunds/web-logo.png";

function SideBar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Hamburger Button for Mobile/Tablet */}
      <button 
        className={styles.hamburgerBtn} 
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
      </button>

      {/* Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className={styles.overlay} 
          onClick={closeMobileMenu}
        ></div>
      )}

      <div 
        className={`${styles.sidebarContainer} ${!isOpen ? styles.collapsed : ''} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}
      >
        <aside className={styles.sidebar}>
          {/* Toggle Button for Desktop */}
          <button 
            className={styles.toggleBtn} 
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {isOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
              </svg>
            )}
          </button>

          {/* Close Button for Mobile */}
          <button 
            className={styles.closeMobileBtn} 
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          <div className={styles.logoSection}>
            <img src={logo} alt="DracoLearn Logo" className={styles.logo} />
            {isOpen && <span className={styles.logoText}>DracoLearn</span>}
          </div>

          <nav className={styles.sidebarNav}>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
              onClick={closeMobileMenu}
              end
            >
              <span className={styles.navIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </span>
              {isOpen && <span className={styles.navLabel}>Home</span>}
            </NavLink>

            <NavLink
              to="/dashboard/students"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
              onClick={closeMobileMenu}
            >
              <span className={styles.navIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </span>
              {isOpen && <span className={styles.navLabel}>Students</span>}
            </NavLink>

            <NavLink
              to="/dashboard/sessions"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
              onClick={closeMobileMenu}
            >
              <span className={styles.navIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </span>
              {isOpen && <span className={styles.navLabel}>Sessions</span>}
            </NavLink>

            <NavLink
              to="/dashboard/assessments"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
              onClick={closeMobileMenu}
            >
              <span className={styles.navIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </span>
              {isOpen && <span className={styles.navLabel}>Assessments</span>}
            </NavLink>

            <NavLink
              to="/dashboard/messages"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
              onClick={closeMobileMenu}
            >
              <span className={styles.navIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </span>
              {isOpen && <span className={styles.navLabel}>Messages</span>}
            </NavLink>

            <NavLink
              to="/dashboard/reports"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
              onClick={closeMobileMenu}
            >
              <span className={styles.navIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </span>
              {isOpen && <span className={styles.navLabel}>Reports</span>}
            </NavLink>

            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
              onClick={closeMobileMenu}
            >
              <span className={styles.navIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m-9-9h6m6 0h6"/>
                  <path d="M19.07 4.93l-4.24 4.24M9.17 14.83l-4.24 4.24M19.07 19.07l-4.24-4.24M9.17 9.17L4.93 4.93"/>
                </svg>
              </span>
              {isOpen && <span className={styles.navLabel}>Settings</span>}
            </NavLink>
          </nav>
        </aside>
      </div>
    </>
  );
}

export default SideBar;
