import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileAPI, messagesAPI } from "../server/endpoints";
import styles from "../styles/Profile.module.css";

const getLevelData = (xp) => {
  const levels = [
    { level: 1, name: "Beginner", minXP: 0, maxXP: 100 },
    { level: 2, name: "Beginner+", minXP: 100, maxXP: 250 },
    { level: 3, name: "Intermediate", minXP: 250, maxXP: 500 },
    { level: 4, name: "Advanced", minXP: 500, maxXP: 1000 },
  ];
  return levels.find((l) => xp >= l.minXP && xp < l.maxXP) || levels[0];
};

// Get userId from JWT token or userData
const getUserId = () => {
  try {
    const token = localStorage.getItem("authToken");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return (
        payload.userId ||
        payload.sub ||
        payload.nameid ||
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] ||
        null
      );
    }
  } catch (err) {
    console.error("Error parsing token:", err);
  }
  try {
    const userData = JSON.parse(localStorage.getItem("userData"));
    return userData?.userId || userData?.id || null;
  } catch (err) {
    console.error("Error parsing user data:", err);
  }
  return null;
};

function Profile() {
  const navigate = useNavigate();
  const dailyGoal = 50;

  const [userId] = useState(() => getUserId());
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [showEdit, setShowEdit] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [chatError, setChatError] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      setError("Not logged in");
      setLoading(false);
      return;
    }

    profileAPI
      .get(userId)
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setUserData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          username: data.username || "",
          xp: data.totalXp || 0,
          streak: data.streakDays || 0,
          followers: data.friendsCount || 0,
          following: 0,
          avatarUrl: data.avatarUrl || "",
        });
        // Load achievements if returned
        if (data.allAchievements) {
          setAchievements(
            data.allAchievements.map((a) => ({
              id: a.achievementId,
              name: a.name,
              icon: a.icon || "🏆",
              unlocked: a.isUnlocked,
            })),
          );
        }
      })
      .catch((err) => {
        console.error("Profile load error:", err);
        setError("Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const loadChatMessages = async () => {
    if (!userId) return;
    setChatError("");
    try {
      const res = await messagesAPI.getByStudent(userId);
      setChatMessages(res.data?.data ?? res.data ?? []);
    } catch (err) {
      console.error("Chat load error:", err);
      setChatError("Unable to load doctor chat.");
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    setChatLoading(true);
    let active = true;

    const runFetch = async () => {
      if (!active) return;
      await loadChatMessages();
    };

    runFetch();
    const interval = setInterval(runFetch, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendChat = async () => {
    const text = chatInput.trim();
    if (!text || !userId) return;

    const optimistic = {
      id: `opt-${Date.now()}`,
      senderId: userId,
      content: text,
      sentAt: new Date().toISOString(),
      optimistic: true,
    };

    setChatMessages((prev) => [...prev, optimistic]);
    setChatInput("");
    setChatSending(true);
    setChatError("");

    try {
      await messagesAPI.send(null, userId, text);
      await loadChatMessages();
    } catch (err) {
      console.error("Chat send error:", err);
      setChatMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setChatInput(text);
      setChatError("Failed to send message. Please try again.");
    } finally {
      setChatSending(false);
    }
  };

  const handleAddXp = () => {
    if (!userId) return;
    profileAPI
      .awardXP(userId, 50, true)
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setUserData((prev) => ({
          ...prev,
          xp: data.totalXp,
          streak: data.streakDays,
        }));
        if (data.allAchievements) {
          setAchievements(
            data.allAchievements.map((a) => ({
              id: a.achievementId,
              name: a.name,
              icon: a.icon || "🏆",
              unlocked: a.isUnlocked,
            })),
          );
        }
      })
      .catch((err) => console.error("XP error:", err));
  };

  const handleSaveChanges = () => {
    if (!userId) return;
    profileAPI
      .updateSettings(userId, formData.username, formData.avatarUrl, dailyGoal)
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setUserData((prev) => ({
          ...prev,
          username: data.username,
          avatarUrl: data.avatarUrl || prev.avatarUrl,
        }));
        setShowEdit(false);
      })
      .catch((err) => console.error("Update error:", err));
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.profilePage}>
        <div style={{ textAlign: "center", padding: "100px" }}>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!userId) {
    return (
      <div className={styles.profilePage}>
        <div style={{ textAlign: "center", padding: "100px" }}>
          <p>Please log in to view your profile.</p>
          <button onClick={() => navigate("/auth/login")}>Go to Login</button>
        </div>
      </div>
    );
  }

  // API error
  if (error || !userData) {
    return (
      <div className={styles.profilePage}>
        <div style={{ textAlign: "center", padding: "100px" }}>
          <p>{error || "Profile not found"} 😢</p>
          <button onClick={() => navigate("/home")}>Go Home</button>
        </div>
      </div>
    );
  }

  const levelData = getLevelData(userData.xp);
  const progress =
    ((userData.xp - levelData.minXP) / (levelData.maxXP - levelData.minXP)) *
    100;
  const dailyProgress = Math.min(
    ((userData.xp % dailyGoal) / dailyGoal) * 100,
    100,
  );

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileContainer}>
        {/* HEADER */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarContainer}>
            {userData.avatarUrl ? (
              <img
                src={userData.avatarUrl}
                className={styles.avatar}
                alt="avatar"
              />
            ) : (
              <div
                className={styles.avatar}
                style={{
                  background: "#44958e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "2rem",
                  fontWeight: "bold",
                }}
              >
                {userData.firstName?.[0]}
                {userData.lastName?.[0]}
              </div>
            )}
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
          {userData.username && (
            <p className={styles.userHandle}>@{userData.username}</p>
          )}
          <p className={styles.userEmail}>{userData.email}</p>

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
              + Gain 50 XP
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
            {dailyProgress >= 100
              ? "🎉 Goal Completed!"
              : `${Math.floor(dailyProgress)}% completed`}
          </p>
        </div>

        {/* ACHIEVEMENTS */}
        <div className={styles.achievementsSection}>
          <h3>🏆 Achievements</h3>
          {achievements.length === 0 ? (
            <p
              style={{
                color: "#9ca3af",
                textAlign: "center",
                marginTop: "1rem",
              }}
            >
              No achievements yet. Keep playing!
            </p>
          ) : (
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
          )}
        </div>

        {/* CHAT WITH DOCTOR */}
        <div className={styles.chatSection}>
          <div className={styles.chatHeader}>
            <div>
              <h3>💬 Chat with your doctor</h3>
              <p className={styles.chatSubtitle}>
                Send messages and get help from your doctor directly.
              </p>
            </div>
          </div>

          <div className={styles.chatBody}>
            {chatLoading ? (
              <p style={{ color: "#6b7280", textAlign: "center" }}>
                Loading chat...
              </p>
            ) : chatError ? (
              <p style={{ color: "#dc2626", textAlign: "center" }}>
                {chatError}
              </p>
            ) : chatMessages.length === 0 ? (
              <p style={{ color: "#6b7280", textAlign: "center" }}>
                No messages yet. Say hi to your doctor!
              </p>
            ) : (
              <div className={styles.chatMessages}>
                {chatMessages.map((msg, index) => {
                  const isMine = msg.senderId === userId;
                  return (
                    <div
                      key={msg.id || index}
                      className={`${styles.messageBubble} ${
                        isMine ? styles.mine : styles.their
                      }`}
                    >
                      <div>{msg.content || msg.message || msg.text}</div>
                      <div className={styles.messageMeta}>
                        {new Date(msg.sentAt || msg.createdAt || Date.now()).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          <div className={styles.chatInputRow}>
            <input
              type="text"
              placeholder="Write a message to your doctor..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChat();
                }
              }}
            />
            <button
              type="button"
              className={styles.chatSendBtn}
              onClick={handleSendChat}
              disabled={chatSending || !chatInput.trim()}
            >
              {chatSending ? "Sending..." : "Send"}
            </button>
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
              value={formData.username || ""}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Avatar URL"
              value={formData.avatarUrl || ""}
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
