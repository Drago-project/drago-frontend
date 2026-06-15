import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileAPI, messagesAPI } from "../server/endpoints";
import styles from "../styles/Profile.module.css";

// SignalR hook integration
import { useSignalR } from "../hooks/useSignalR";

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

const loadGameProgress = () => {
  const games = [
    {
      id: "word_hunt",
      name: "Word Hunt",
      arabicName: "كوخ الكلمات",
      storageKey: "word_hunt_progress",
      totalLevels: 6,
      stagesPerLevel: 5,
      icon: "🏠",
      color: "#f59e0b"
    },
    {
      id: "reading_quest",
      name: "Reading Quest",
      arabicName: "مغامرة القراءة",
      storageKey: "reading_quest_progress",
      totalLevels: 4,
      stagesPerLevel: 5,
      icon: "📖",
      color: "#3b82f6"
    },
    {
      id: "volcano_words",
      name: "Volcano Words",
      arabicName: "بركان الكلمات",
      storageKey: "volcano_words_progress",
      totalLevels: 6,
      stagesPerLevel: 5,
      icon: "🌋",
      color: "#ef4444"
    },
    {
      id: "tomb_puzzle",
      name: "Tomb Puzzle",
      arabicName: "مقبرة الأسرار",
      storageKey: "tomb_puzzle_progress",
      totalLevels: 6,
      stagesPerLevel: 5,
      icon: "🏺",
      color: "#8b5cf6"
    }
  ];

  return games.map(game => {
    let completedStagesCount = 0;
    let totalStars = 0;
    let unlockedLevel = 1;
    try {
      const stored = localStorage.getItem(game.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        unlockedLevel = parsed.unlockedLevel || 1;

        if (parsed.completedStages) {
          Object.keys(parsed.completedStages).forEach(level => {
            const stages = parsed.completedStages[level];
            if (Array.isArray(stages)) {
              completedStagesCount += stages.filter(Boolean).length;
            }
          });
        }

        if (parsed.stars) {
          Object.keys(parsed.stars).forEach(level => {
            const stars = parsed.stars[level];
            if (Array.isArray(stars)) {
              totalStars += stars.reduce((sum, s) => sum + (Number(s) || 0), 0);
            }
          });
        }
      }
    } catch (e) {
      console.error(`Error loading progress for ${game.name}:`, e);
    }

    const maxStages = game.totalLevels * game.stagesPerLevel;
    const maxStars = maxStages * 3;
    const progressPercent = Math.min(100, Math.round((completedStagesCount / maxStages) * 100));

    return {
      ...game,
      unlockedLevel,
      completedStagesCount,
      maxStages,
      totalStars,
      maxStars,
      progressPercent
    };
  });
};

function Profile() {
  const navigate = useNavigate();
  const dailyGoal = 50;

  const [userId] = useState(() => getUserId());
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [showEdit, setShowEdit] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [gamesProgress, setGamesProgress] = useState(() => loadGameProgress());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chat states
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const chatEndRef = useRef(null);

  // Dynamic conversation and doctor states
  const [conversationId, setConversationId] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // SignalR hook initialization
  const { status: wsStatus } = useSignalR({
    doctorId: doctorId || 0, // Dynamic doctorId resolved from profile/conversations
    studentId: userId,
    onMessage: (message) => {
      setChatMessages((prev) => {
        const id = message?.id || message?.messageId;
        if (id && prev.some((m) => (m.id || m.messageId) === id)) return prev;
        return [...prev, message];
      });
    },
  });

  // 1. Load Profile & Resolve Doctor ID on Mount
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

        // Resolve Doctor ID directly from Profile Response
        if (data.doctorId) {
          setDoctorId(data.doctorId);
        }

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

  // 2. Load Conversation Details dynamically
  const loadChatData = useCallback(async () => {
    // لازم ننتظر لحد ما الـ doctorId ييجي من البروفايل
    if (!userId || !doctorId) return;

    setChatError("");
    setChatLoading(true);

    try {
      // 1. نطلب المحادثة المحددة بين الطالب والدكتور ده مباشرة
      const convRes = await messagesAPI.getOrCreateConversation({
        doctorId: Number(doctorId),
        studentId: Number(userId),
      });

      // استخراج الـ ID بتاع المحادثة
      const activeConvId =
        convRes.data?.data?.conversationId ||
        convRes.data?.conversationId ||
        convRes.data?.id;

      if (activeConvId) {
        setConversationId(activeConvId);

        // 2. نجيب الهيستوري بتاع المحادثة دي
        const msgRes = await messagesAPI.getMessages(activeConvId);
        setChatMessages(msgRes.data?.data ?? msgRes.data ?? []);
      }
    } catch (err) {
      console.error("Chat load error:", err);
      setChatError("فشل في تحميل الرسائل السابقة.");
    } finally {
      setChatLoading(false);
    }
  }, [userId, doctorId]); // ضفنا doctorId هنا

  // 3. Load chat data when the chat window is opened and doctorId is available
  useEffect(() => {
    if (isChatOpen && doctorId) {
      loadChatData();
    }
  }, [loadChatData, isChatOpen, doctorId]);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatOpen]);

  // 3. Handle Send Chat Message
  const handleSendChat = async () => {
    const text = chatInput.trim();
    if (!text || !userId || chatSending) return;

    if (!doctorId) {
      setChatError("No doctor assigned to your profile yet.");
      return;
    }

    // Optimistic message UI update
    const tempId = `opt-${Date.now()}`;
    const optimistic = {
      messageId: tempId,
      senderRole: "Student",
      content: text,
      sentAt: new Date().toISOString(),
      optimistic: true,
    };

    setChatMessages((prev) => [...prev, optimistic]);
    setChatInput("");
    setChatError("");
    setChatSending(true);

    try {
      let activeConvId = conversationId;

      // 1. لو دي أول رسالة ومفيش ID للمحادثة، ننشئها الأول
      if (!activeConvId) {
        const convRes = await messagesAPI.getOrCreateConversation({
          doctorId: Number(doctorId),
          studentId: Number(userId),
        });

        // استخراج الـ ID بناءً على شكل الرد من الباك إند
        activeConvId =
          convRes.data?.data?.conversationId ||
          convRes.data?.conversationId ||
          convRes.data?.id ||
          0;

        setConversationId(activeConvId);
      }

      // 2. إرسال الرسالة باستخدام الـ ID الصحيح
      const payload = {
        content: text,
        receiverId: Number(doctorId),
        doctorId: Number(doctorId),
        studentId: Number(userId),
        conversationId: Number(activeConvId) || 0,
      };

      await messagesAPI.send(payload);

      // Success: Remove optimistic item
      setChatMessages((prev) => prev.filter((m) => m.messageId !== tempId));
    } catch (err) {
      console.error("Chat send error:", err);
      // Rollback UI state on failure
      setChatMessages((prev) => prev.filter((m) => m.messageId !== tempId));
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

  // Not logged in state
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

  // API error state
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

        {/* GAMES PROGRESS */}
        <div className={styles.gamesSection}>
          <h3>🎮 Games Progress</h3>
          <div className={styles.gamesGrid}>
            {gamesProgress.map((game) => (
<div
  key={game.id}
  className={styles.gameCard}
  style={{
    borderTop: `5px solid ${game.color}`,
  }}
>                <div className={styles.gameCardHeader}>
                  <span className={styles.gameIcon}>{game.icon}</span>
                  <div className={styles.gameNameContainer}>
                    <h4 className={styles.gameName}>{game.name}</h4>
                    <span className={styles.gameArabicName}>{game.arabicName}</span>
                  </div>
                </div>

                <div className={styles.gameStats}>
                  <div className={styles.gameStatRow}>
                    <span>Unlocked Level:</span>
                    <strong>Level {game.unlockedLevel} / {game.totalLevels}</strong>
                  </div>
                  <div className={styles.gameStatRow}>
                    <span>Completed Stages:</span>
                    <strong>{game.completedStagesCount} / {game.maxStages}</strong>
                  </div>
                  <div className={styles.gameStatRow}>
                    <span>Stars Earned:</span>
                    <strong>⭐ {game.totalStars} / {game.maxStars}</strong>
                  </div>
                </div>

                <div className={styles.gameProgressContainer}>
                  <div className={styles.gameProgressBarBg}>
                    <div
                      className={styles.gameProgressBarFill}
                      style={{
                        width: `${game.progressPercent}%`,
                        backgroundColor: game.color,
                      }}
                    />
                  </div>
                  <div className={styles.gameProgressPercent}>
                    {game.progressPercent}% Completed
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* FLOATING CHAT BUTTON */}
        <button
          onClick={() => setIsChatOpen(true)}
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            width: "65px",
            height: "65px",
            borderRadius: "50%",
            background: "#EFA818",
            color: "white",
            border: "none",
            boxShadow: "0 10px 20px rgba(239, 168, 24, 0.4)",
            cursor: "pointer",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          💬
        </button>

        {/* POPUP CHAT WINDOW */}
        {isChatOpen && (
          <div
            style={{
              position: "fixed",
              bottom: "105px",
              right: "30px",
              width: "360px",
              height: "500px",
              background: "white",
              borderRadius: "1rem",
              boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              zIndex: 1000,
              overflow: "hidden",
            }}
          >
            {/* Chat Header */}
            <div
              style={{
                background: "#377C76",
                padding: "1rem",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                💬 Chat with Doctor
                {wsStatus === "Connected" && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#4ade80",
                    }}
                    title="Online"
                  />
                )}
              </h3>
              <button
                onClick={() => setIsChatOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                }}
              >
                ✕
              </button>
            </div>

            {/* Chat Body */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                background: "#f8fafc",
              }}
            >
              {chatLoading ? (
                <p
                  style={{
                    color: "#6b7280",
                    textAlign: "center",
                    margin: "auto",
                  }}
                >
                  Loading chat...
                </p>
              ) : chatError ? (
                <p
                  style={{
                    color: "#dc2626",
                    textAlign: "center",
                    margin: "auto",
                  }}
                >
                  {chatError}
                  <button
                    onClick={loadChatData}
                    style={{
                      display: "block",
                      margin: "10px auto",
                      padding: "5px 10px",
                      background: "#377C76",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Retry
                  </button>
                </p>
              ) : chatMessages.length === 0 ? (
                <p
                  style={{
                    color: "#6b7280",
                    textAlign: "center",
                    margin: "auto",
                  }}
                >
                  {!doctorId
                    ? "No doctor assigned yet."
                    : "No messages yet. Say hi to your doctor!"}
                </p>
              ) : (
                <>
                  {chatMessages.map((msg, index) => {
                    const isMine =
                      msg.senderRole === "Student" || msg.senderId === userId;
                    return (
                      <div
                        key={msg.id || msg.messageId || index}
                        style={{
                          alignSelf: isMine ? "flex-end" : "flex-start",
                          maxWidth: "75%",
                          padding: "0.6rem 1rem",
                          borderRadius: isMine
                            ? "1rem 1rem 0.25rem 1rem"
                            : "1rem 1rem 1rem 0.25rem",
                          background: isMine ? "#377C76" : "white",
                          color: isMine ? "white" : "#1e293b",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                          fontSize: "0.9rem",
                          opacity: msg.optimistic ? 0.7 : 1,
                        }}
                      >
                        <div>{msg.content || msg.message || msg.text}</div>
                        <div
                          style={{
                            fontSize: "0.7rem",
                            marginTop: "4px",
                            textAlign: isMine ? "right" : "left",
                            opacity: 0.7,
                          }}
                        >
                          {new Date(
                            msg.sentAt || msg.createdAt || Date.now(),
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {msg.optimistic && <span> (Sending...)</span>}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </>
              )}
            </div>

            {/* Chat Input Area */}
            <div
              style={{
                padding: "0.75rem",
                background: "white",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  placeholder="Write a message..."
                  value={chatInput}
                  disabled={!doctorId || chatLoading}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "0.6rem 1rem",
                    borderRadius: "2rem",
                    border: "1px solid #e2e8f0",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={handleSendChat}
                  disabled={chatSending || !chatInput.trim() || !doctorId}
                  style={{
                    background:
                      !chatInput.trim() || !doctorId ? "#ccc" : "#EFA818",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    cursor:
                      chatSending || !chatInput.trim() || !doctorId
                        ? "not-allowed"
                        : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        )}
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
