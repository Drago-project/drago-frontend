import styles from "../styles/SideBar.module.css";
function SideBar() {
    return (
        <div>
            <header className={styles.dashboardHeader}>
                    <div className={styles.headerLeft}>
                      <div className={styles.logoContainer}>
                        <span className={styles.logoText}>DracoLearn</span>
                      </div>
                      <h1 className={styles.dashboardTitle}>Specialist Dashboard</h1>
                    </div>
                    <div className={styles.headerRight}>
                      <button className={styles.notificationBtn}>
                        <span className={styles.notificationIcon}>🔔</span>
                        <span className={styles.badge}>1</span>
                      </button>
                      <div className={styles.userAvatar}>D</div>
                    </div>
                  </header>
        </div>
    )
}

export default SideBar
