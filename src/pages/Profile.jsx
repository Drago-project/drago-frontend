import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/Profile.module.css";
import dragoAvatar from "../assets/emotions/drago(wave).svg";

const getLevelData = (xp) => {
  const levels = [
    { level: 1, name: "Beginner", minXP: 0, maxXP: 100 },
    { level: 2, name: "Beginner+", minXP: 100, maxXP: 250 },
    { level: 3, name: "Intermediate", minXP: 250, maxXP: 500 },
    { level: 4, name: "Advanced", minXP: 500, maxXP: 1000 },
  ];
  return levels.find((l) => xp >= l.minXP && xp < l.maxXP) || levels[0];
};

function Profile() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [userData, setUserData] = useState({
    firstName: "Sara",
    lastName: "Student",
    email: "sara@email.com",
    username: "@sara",
    streak: 5,
    xp: 263,
    followers: 0,
    following: 0,
  });

  const [achievements, setAchievements] = useState([
    { id: 1, name: "First Win", icon: "🏆", unlocked: true },
    { id: 2, name: "3 Day Streak", icon: "🔥", unlocked: true },
    { id: 3, name: "100 XP", icon: "⭐", unlocked: true },
    { id: 4, name: "250 XP", icon: "💎", unlocked: false },
  ]);

  const levelData = getLevelData(userData.xp);
  const progress =
    ((userData.xp - levelData.minXP) /
      (levelData.maxXP - levelData.minXP)) *
    100;

  useEffect(() => {
    setAchievements((prev) =>
      prev.map((a) =>
        a.id === 4 && userData.xp >= 250
          ? { ...a, unlocked: true }
          : a
      )
    );
  }, [userData.xp]);

  return (
    <div className={styles.profilePage} dir={isRTL ? "rtl" : "ltr"}>
      <div className={styles.profileContainer}>
        {/* HEADER */}
        <div className={styles.profileHeader}>
          <img src={dragoAvatar} className={styles.avatar} alt="avatar" />

          <h1 className={styles.userName}>
            {userData.firstName} {userData.lastName}
          </h1>
          <p className={styles.userHandle}>{userData.username}</p>
          <p className={styles.userEmail}>{userData.email}</p>

          {/* STATS */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{userData.followers}</span>
              <span className={styles.statLabel}>Followers</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{userData.following}</span>
              <span className={styles.statLabel}>Following</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>🔥</span>
              <span className={styles.statLabel}>
                {userData.streak} Days
              </span>
            </div>
          </div>

          {/* LEVEL */}
          <div className={styles.levelSection}>
            <div className={styles.levelHeader}>
              <span className={styles.levelBadge}>
                Level {levelData.level}
              </span>
              <span className={styles.levelName}>
                {levelData.name}
              </span>
            </div>

            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className={styles.progressText}>
              XP {userData.xp} / {levelData.maxXP}
            </p>
          </div>
        </div>

        {/* OVERVIEW */}
        <div className={styles.overviewSection}>
          <h3 className={styles.sectionTitle}>Overview</h3>

          <div className={styles.overviewGrid}>
            <div className={styles.overviewCard}>
              <span className={styles.cardIcon}>🔥</span>
              <div>
                <p className={styles.cardValue}>{userData.streak}</p>
                <p className={styles.cardLabel}>Day Streak</p>
              </div>
            </div>

            <div className={styles.overviewCard}>
              <span className={styles.cardIcon}>⚡</span>
              <div>
                <p className={styles.cardValue}>{userData.xp}</p>
                <p className={styles.cardLabel}>XP Points</p>
              </div>
            </div>
          </div>
        </div>

        {/* ACHIEVEMENTS */}
        <div className={styles.achievementsSection}>
          <h3 className={styles.sectionTitle}>Achievements</h3>

          <div className={styles.achievementsGrid}>
            {achievements.map((a) => (
              <div
                key={a.id}
                className={`${styles.achievementCard} ${
                  a.unlocked ? styles.unlocked : styles.locked
                }`}
              >
                <span className={styles.achievementIcon}>{a.icon}</span>
                <p className={styles.achievementName}>{a.name}</p>
                {!a.unlocked && <span className={styles.lock}>🔒</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
