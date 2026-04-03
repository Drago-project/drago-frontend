import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  const navigate = useNavigate();
  const userId =2; // خليها ديناميكي حسب login
  const dailyGoal = 50;

  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [showEdit, setShowEdit] = useState(false);
  const [achievements, setAchievements] = useState([]);

  // 🟢 Fetch profile data
  useEffect(() => {
    axios
      .get(`https://drago-back.runasp.net/api/Profile/${userId}`)
      .then((res) => {
        const data = res.data.data;
        setUserData({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          username: data.username,
          xp: data.totalXp,
          streak: data.streakDays,
          followers: data.friendsCount,
          following: 0,
          avatarUrl: data.avatarUrl,
        });
      })
      .catch((err) => {
        console.log(err);
        setUserData({ error: true }); // 👈 مهم
      });
  }, []);
  if (!userData) return <p>Loading...</p>;

  if (userData.error)
    return <p style={{ textAlign: "center" }}>User not found 😢</p>;

  const levelData = getLevelData(userData.xp);
  const progress =
    ((userData.xp - levelData.minXP) / (levelData.maxXP - levelData.minXP)) *
    100;

  const dailyProgress = Math.min(
    ((userData.xp % dailyGoal) / dailyGoal) * 100,
    100
  );

  // 🟡 Award XP
  const handleAddXp = () => {
    axios
      .put(`https://drago-back.runasp.net/api/Profile/${userId}/award-xp`, {
        xp: 50,
        sessionCompleted: true,
      })
      .then((res) => {
        const data = res.data.data;
        setUserData((prev) => ({
          ...prev,
          xp: data.totalXp,
          streak: data.streakDays,
        }));

        setAchievements(
          data.allAchievements.map((a) => ({
            id: a.achievementId,
            name: a.name,
            icon: a.icon || "🏆",
            unlocked: a.isUnlocked,
          }))
        );
      })
      .catch((err) => console.log(err));
  };

  // 🔵 Update Settings
  const handleSaveChanges = () => {
    axios
      .put(`https://drago-back.runasp.net/api/Profile/${userId}/settings`, {
        username: formData.username,
        avatarUrl: formData.avatarUrl,
        dailyGoalXp: dailyGoal,
      })
      .then((res) => {
        const data = res.data.data;
        setUserData((prev) => ({
          ...prev,
          username: data.username,
          avatarUrl: data.avatarUrl || prev.avatarUrl,
        }));
        setShowEdit(false);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileContainer}>
        {/* HEADER */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarContainer}>
            <img
              src={userData.avatarUrl}
              className={styles.avatar}
              alt="avatar"
            />
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
            <div className={styles.statCard}>
              <span className={styles.statIcon}>👥</span>
              <strong className={styles.statNumber}>
                {userData.followers + userData.following}
              </strong>
              <span className={styles.statLabel}>Friends</span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statIcon}>🔥</span>
              <strong className={styles.statNumber}>{userData.streak}</strong>
              <span className={styles.statLabel}>Day Streak</span>
            </div>
          </div>

          {/* LEVEL */}
          <div className={styles.levelSection}>
            <div className={styles.levelHeader}>
              <span className={styles.levelBadge}>Level {levelData.level}</span>
              <span>{levelData.name}</span>
            </div>

            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>

            <p>
              XP {userData.xp} / {levelData.maxXP}
            </p>

            <button className={styles.addXpBtn} onClick={handleAddXp}>
              Gain 50 XP
            </button>
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
            {achievements.map((a) => (
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
      </div>

      {/* EDIT MODAL */}
      {showEdit && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Edit Profile</h3>

            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Avatar URL"
              value={formData.avatarUrl}
              onChange={(e) =>
                setFormData({ ...formData, avatarUrl: e.target.value })
              }
            />

            <div className={styles.modalActions}>
              <button onClick={handleSaveChanges}>Save Changes</button>
              <button onClick={() => setShowEdit(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;