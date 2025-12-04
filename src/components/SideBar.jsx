import styles from "../styles/SideBar.module.css";
import { NavLink } from "react-router-dom";
import logo from "../assets/backgrunds/web-logo.png";

function SideBar() {
  return (
    <div className={styles.sidebarContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logoSection}>
          <img src={logo} alt="DracoLearn Logo" className={styles.logo} />
        </div>

        <nav className={styles.sidebarNav}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
            end
          >
            <span className={styles.navIcon}>🏠</span>
            <span className={styles.navLabel}>Home</span>
          </NavLink>

          <NavLink
            to="/dashboard/students"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
          >
            <span className={styles.navIcon}>👥</span>
            <span className={styles.navLabel}>Students</span>
          </NavLink>

          <NavLink
            to="/dashboard/sessions"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
          >
            <span className={styles.navIcon}>📅</span>
            <span className={styles.navLabel}>Sessions</span>
          </NavLink>

          <NavLink
            to="/dashboard/assessments"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
          >
            <span className={styles.navIcon}>📝</span>
            <span className={styles.navLabel}>Assessments</span>
          </NavLink>

          <NavLink
            to="/dashboard/messages"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
          >
            <span className={styles.navIcon}>💬</span>
            <span className={styles.navLabel}>Messages</span>
          </NavLink>

          <NavLink
            to="/dashboard/reports"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
          >
            <span className={styles.navIcon}>📈</span>
            <span className={styles.navLabel}>Reports</span>
          </NavLink>

          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
          >
            <span className={styles.navIcon}>⚙️</span>
            <span className={styles.navLabel}>Settings</span>
          </NavLink>
        </nav>
      </aside>
    </div>
  );
}

export default SideBar;
