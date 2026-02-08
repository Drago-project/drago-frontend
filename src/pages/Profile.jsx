import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Profile.module.css";
import dragoAvatar from "../assets/emotions/drago(wave).svg";

const getLevelData = (xp) => {
  const levels = [
    { level: 1, name: "Beginner", minXP: 0, maxXP: 100 },
    { level: 2, name: "Beginner+", minXP: 100, maxXP: 250 },
    { level: 3, name: "Intermediate", minXP: 250, maxXP: 500 },
    { level: 4, name: "Advanced", minXP: 500, maxXP: 1000 },
  ];
  return levels.find(l => xp >= l.minXP && xp < l.maxXP) || levels[0];
};

function Profile() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    firstName: "Sara",
    lastName: "Student",
    email: "sara@email.com",
    username: "@sara",
    xp: 263,
    streak: 5,
    followers: 0,
    following: 0,
  });

  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState(userData);

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

  /* Daily Goal */
  const dailyGoal = 50;
  const dailyProgress = Math.min(
    ((userData.xp % dailyGoal) / dailyGoal) * 100,
    100
  );

  useEffect(() => {
    localStorage.setItem("userData", JSON.stringify(userData));

    setAchievements(prev =>
      prev.map(a =>
        a.id === 4 && userData.xp >= 250
          ? { ...a, unlocked: true }
          : a
      )
    );
  }, [userData]);

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileContainer}>

        {/* HEADER */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarContainer}>
            <img src={dragoAvatar} className={styles.avatar} alt="avatar" />
            <button
              className={styles.editBtn}
              onClick={() => {
                setFormData(userData);
                setShowEdit(true);
              }}
            >
              ✏️
            </button>
          </div>

          <h1 className={styles.userName}>
            {userData.firstName} {userData.lastName}
          </h1>
          <p className={styles.userHandle}>{userData.username}</p>
          <p className={styles.userEmail}>{userData.email}</p>

          {/* STATS */}
          <div className={styles.statsRow}>
            <div>
              <strong>{userData.followers}</strong>
              <span>Followers</span>
            </div>
            <div>
              <strong>{userData.following}</strong>
              <span>Following</span>
            </div>
            <div>
              <strong>🔥</strong>
              <span>{userData.streak} Days</span>
            </div>
          </div>

          {/* LEVEL */}
          <div className={styles.levelSection}>
            <div className={styles.levelHeader}>
              <span className={styles.levelBadge}>
                Level {levelData.level}
              </span>
              <span>{levelData.name}</span>
            </div>

            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>

            <p>XP {userData.xp} / {levelData.maxXP}</p>
          </div>
        </div>

        {/* DAILY GOAL */}
        <div className={styles.dailyGoal}>
          <h3>🎯 Daily Goal</h3>

          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${dailyProgress}%` }}
            />
          </div>

          <p>
            {dailyProgress === 100
              ? "🎉 Goal Completed!"
              : `${Math.floor(dailyProgress)}% completed`}
          </p>
        </div>

        {/* ACHIEVEMENTS */}
        <div className={styles.achievementsSection}>
          <h3>🏆 Achievements</h3>

          <div className={styles.achievementsGrid}>
            {achievements.map(a => (
              <div
                key={a.id}
                className={`${styles.achievementCard} ${
                  a.unlocked ? styles.unlocked : styles.locked
                }`}
              >
                <span>{a.icon}</span>
                <p>{a.name}</p>
                {!a.unlocked && <span className={styles.lock}>🔒</span>}
              </div>
            ))}
          </div>
        </div>

        {/* LEADERBOARD BUTTON */}
        <button
          className={styles.leaderboardBtn}
          onClick={() => navigate("/Dashboard")}
        >
          🏆 View Leaderboard
        </button>
      </div>

      {/* EDIT MODAL */}
      {showEdit && (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <h3>Edit Profile</h3>

      <input
        type="text"
        placeholder="First Name"
        value={formData.firstName}
        onChange={(e) =>
          setFormData({ ...formData, firstName: e.target.value })
        }
      />

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) =>
          setFormData({ ...formData, email: e.target.value })
        }
      />

      {/* CHANGE PASSWORD */}
      <hr />

      <h4 className={styles.passwordTitle}>Change Password</h4>

      <input
        type="password"
        placeholder="Current Password"
      />

      <input
        type="password"
        placeholder="New Password"
      />

      <input
        type="password"
        placeholder="Confirm New Password"
      />

      <div className={styles.modalActions}>
        <button
          onClick={() => {
            setUserData(formData);
            localStorage.setItem("userData", JSON.stringify(formData));
            setShowEdit(false);
          }}
        >
          Save Changes
        </button>

        <button onClick={() => setShowEdit(false)}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default Profile;