import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { profileAPI, messagesAPI } from "../server/endpoints";
import styles from "../styles/Profile.module.css";
import dragoAvatar from "../assets/poses/drago(front).svg";
import { useSignalR } from "../hooks/useSignalR";

// Import Recharts components for beautiful analytics
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const getLevelData = (xp) => {
  const levels = [
    { level: 1, name: "Beginner", minXP: 0, maxXP: 100 },
    { level: 2, name: "Beginner+", minXP: 100, maxXP: 250 },
    { level: 3, name: "Intermediate", minXP: 250, maxXP: 500 },
    { level: 4, name: "Advanced", minXP: 500, maxXP: 1000 },
  ];
  return levels.find((l) => xp >= l.minXP && xp < l.maxXP) || levels[0];
};

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
      color: "#44958E",
    },
    {
      id: "reading_quest",
      name: "Reading Quest",
      arabicName: "مغامرة القراءة",
      storageKey: "reading_quest_progress",
      totalLevels: 4,
      stagesPerLevel: 5,
      icon: "📖",
      color: "#EFA818",
    },
    {
      id: "volcano_words",
      name: "Volcano Words",
      arabicName: "بركان الكلمات",
      storageKey: "volcano_words_progress",
      totalLevels: 6,
      stagesPerLevel: 5,
      icon: "🌋",
      color: "#ef4444",
    },
    {
      id: "tomb_puzzle",
      name: "Tomb Puzzle",
      arabicName: "مقبرة الأسرار",
      storageKey: "tomb_puzzle_progress",
      totalLevels: 6,
      stagesPerLevel: 5,
      icon: "🏺",
      color: "#8b5cf6",
    },
  ];

  return games.map((game) => {
    let completedStagesCount = 0;
    let totalStars = 0;
    let unlockedLevel = 1;
    try {
      const stored = localStorage.getItem(game.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        unlockedLevel = parsed.unlockedLevel || 1;
        if (parsed.completedStages) {
          Object.keys(parsed.completedStages).forEach((level) => {
            const stages = parsed.completedStages[level];
            if (Array.isArray(stages))
              completedStagesCount += stages.filter(Boolean).length;
          });
        }
        if (parsed.stars) {
          Object.keys(parsed.stars).forEach((level) => {
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
    const progressPercent = Math.min(
      100,
      Math.round((completedStagesCount / maxStages) * 100),
    );

    return {
      ...game,
      unlockedLevel,
      completedStagesCount,
      maxStages,
      totalStars,
      maxStars,
      progressPercent,
    };
  });
};

function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dailyGoal = 50;

  const [userId] = useState(() => getUserId());
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [showEdit, setShowEdit] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [gamesProgress] = useState(() => loadGameProgress());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Original Chat states
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const chatEndRef = useRef(null);

  const [conversationId, setConversationId] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { status: wsStatus } = useSignalR({
    doctorId: doctorId || 0,
    studentId: userId,
    onMessage: (message) => {
      setChatMessages((prev) => {
        const id = message?.id || message?.messageId;
        if (id && prev.some((m) => (m.id || m.messageId) === id)) return prev;
        return [...prev, message];
      });
    },
  });

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

        if (data.doctorId) setDoctorId(data.doctorId);

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

  const loadChatData = useCallback(async () => {
    if (!userId || !doctorId) return;
    setChatError("");
    setChatLoading(true);
    try {
      const convRes = await messagesAPI.getOrCreateConversation({
        doctorId: Number(doctorId),
        studentId: Number(userId),
      });
      const activeConvId =
        convRes.data?.data?.conversationId ||
        convRes.data?.conversationId ||
        convRes.data?.id;
      if (activeConvId) {
        setConversationId(activeConvId);
        const msgRes = await messagesAPI.getMessages(activeConvId);
        setChatMessages(msgRes.data?.data ?? msgRes.data ?? []);
      }
    } catch (err) {
      console.error("Chat load error:", err);
      setChatError(t("profile.chatLoadError"));
    } finally {
      setChatLoading(false);
    }
  }, [userId, doctorId, t]);

  useEffect(() => {
    if (isChatOpen && doctorId) {
      loadChatData();
    }
  }, [loadChatData, isChatOpen, doctorId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatOpen]);

  const handleSendChat = async () => {
    const text = chatInput.trim();
    if (!text || !userId || chatSending) return;
    if (!doctorId) {
      setChatError(t("profile.noDoctorAssignedYet"));
      return;
    }

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
      if (!activeConvId) {
        const convRes = await messagesAPI.getOrCreateConversation({
          doctorId: Number(doctorId),
          studentId: Number(userId),
        });
        activeConvId =
          convRes.data?.data?.conversationId ||
          convRes.data?.conversationId ||
          convRes.data?.id ||
          0;
        setConversationId(activeConvId);
      }

      const payload = {
        content: text,
        receiverId: Number(doctorId),
        doctorId: Number(doctorId),
        studentId: Number(userId),
        conversationId: Number(activeConvId) || 0,
      };

      await messagesAPI.send(payload);
      setChatMessages((prev) => prev.filter((m) => m.messageId !== tempId));
    } catch (err) {
      console.error("Chat send error:", err);
      setChatMessages((prev) => prev.filter((m) => m.messageId !== tempId));
      setChatInput(text);
      setChatError(t("profile.chatSendError"));
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

  if (loading)
    return (
      <div className={styles.loadingContainer}>
        <p>{t("profile.loadingProfile")}</p>
      </div>
    );
  if (!userId)
    return (
      <div className={styles.errorContainer}>
        <button onClick={() => navigate("/auth/login")}>
          {t("profile.goToLogin")}
        </button>
      </div>
    );
  if (error || !userData)
    return (
      <div className={styles.errorContainer}>
        <p>{error || t("profile.profileNotFound")}</p>
      </div>
    );

  const levelData = getLevelData(userData.xp);
  const progress =
    ((userData.xp - levelData.minXP) / (levelData.maxXP - levelData.minXP)) *
    100;
  const dailyProgress = Math.min(
    ((userData.xp % dailyGoal) / dailyGoal) * 100,
    100,
  );

  const barChartData = gamesProgress.map((g) => ({
    name: g.name,
    Completed: g.completedStagesCount,
    Total: g.maxStages,
  }));

  return (
    <div className={styles.profilePage}>
      <div className={styles.dashboardLayout}>
        {/* LEFT COLUMN */}
        <div className={styles.mainColumn}>
          <div className={styles.heroCard}>
            <div className={styles.heroInfo}>
              <h2>{t("profile.welcome", { name: userData.firstName })}</h2>
              <p className={styles.subtitle}>{t("profile.subtitle")}</p>
              <div className={styles.badgeRow}>
                <span className={styles.premiumBadge}>
                  ⚡{" "}
                  {t("profile.level", {
                    level: levelData.level,
                    name: levelData.name,
                  })}
                </span>
                <span className={styles.streakBadge}>
                  🔥 {t("profile.streak", { days: userData.streak })}
                </span>
              </div>
            </div>
            <div className={styles.mascotContainer}>
              <img
                src={dragoAvatar}
                alt="Drago"
                className={styles.dragoMascot}
              />
            </div>
          </div>

          {/* Activity Section with Chart */}
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3>{t("profile.activityTitle")}</h3>
              <p>{t("profile.activitySubtitle")}</p>
            </div>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={barChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip cursor={{ fill: "rgba(68, 149, 142, 0.05)" }} />
                  <Bar
                    dataKey="Completed"
                    fill="#44958E"
                    radius={[8, 8, 0, 0]}
                    barSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Individual Games Stats Grid */}
          <div className={styles.gridContainer}>
            {gamesProgress.map((game) => (
              <div
                key={game.id}
                className={styles.metricRowCard}
                style={{ borderRight: `6px solid ${game.color}` }}
              >
                <div
                  className={styles.metricIconBox}
                  style={{
                    backgroundColor: `${game.color}15`,
                    color: game.color,
                  }}
                >
                  {game.icon}
                </div>
                <div className={styles.metricDetails}>
                  <h4>
                    {game.name}{" "}
                    <span className={styles.arabicLabel}>
                      {game.arabicName}
                    </span>
                  </h4>
                  <p>
                    Level {game.unlockedLevel} • ⭐ {game.totalStars}/
                    {game.maxStars} Stars
                  </p>
                  <div className={styles.compactProgressTrack}>
                    <div
                      className={styles.compactProgressFill}
                      style={{
                        width: `${game.progressPercent}%`,
                        backgroundColor: game.color,
                      }}
                    />
                  </div>
                </div>
                <div className={styles.metricValue}>
                  {game.progressPercent}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.sideColumn}>
          <div className={styles.userCard}>
            <div className={styles.avatarWrapper}>
              <img
                src={userData.avatarUrl || dragoAvatar}
                className={styles.userAvatar}
                alt={t("profile.avatarAlt")}
              />
              <button
                className={styles.editButton}
                onClick={() => setShowEdit(true)}
              >
                ✏️
              </button>
            </div>
            <h3>
              {userData.firstName} {userData.lastName}
            </h3>
            <p>@{userData.username || t("profile.defaultUsername")}</p>
            <div className={styles.trackBar}>
              <div
                className={styles.fillBar}
                style={{ width: `${progress}%` }}
              />
            </div>
            <button className={styles.actionXpBtn} onClick={handleAddXp}>
              ⭐ {t("profile.claimDailyXp")}
            </button>
          </div>

          <div className={styles.sectionCard}>
            <h3>{t("profile.dailyGoalTitle")}</h3>
            <div className={styles.radialChartContainer}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={[
                      { value: dailyProgress },
                      { value: 100 - dailyProgress },
                    ]}
                    innerRadius={55}
                    outerRadius={70}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    <Cell fill="#EFA818" radius={10} />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.radialLabel}>
                <h2>{Math.floor(dailyProgress)}%</h2>
                <p>{t("profile.goalFinished")}</p>
              </div>
            </div>
            <p className={styles.centerText}>
              {dailyProgress >= 100
                ? t("profile.dailyTargetReached")
                : t("profile.dailyTargetProgress")}
            </p>
          </div>

          <div className={styles.sectionCard}>
            <h3>{t("profile.unlockedBadges")}</h3>
            {achievements.length === 0 ? (
              <p className={styles.emptyText}>{t("profile.noBadgesMessage")}</p>
            ) : (
              <div className={styles.badgeGrid}>
                {achievements.slice(0, 4).map((a) => (
                  <div
                    key={a.id}
                    className={`${styles.badgeNode} ${a.unlocked ? styles.activeBadge : styles.lockedBadge}`}
                    title={a.name}
                  >
                    <span className={styles.badgeIcon}>{a.icon}</span>
                    <span className={styles.badgeNodeName}>{a.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ORIGINAL FLOATING CHAT TRIGGER BUTTON */}
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

      {/* ORIGINAL POPUP CHAT WINDOW CODE */}
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
              {t("profile.chatWithDoctor")}
              {wsStatus === "Connected" && (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#4ade80",
                  }}
                  title={t("profile.online")}
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
                {t("profile.loadingChat")}
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
                  {t("profile.retry")}
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
                  ? t("profile.noDoctorAssignedYet")
                  : t("profile.noMessagesYet")}
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
                        {msg.optimistic && (
                          <span> ({t("profile.sending")})</span>
                        )}
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
                placeholder={t("profile.writeMessage")}
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

      {/* RE-CONNECTED MODAL WINDOW */}
      {showEdit && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>{t("profile.editProfile")}</h3>
            <input
              type="text"
              placeholder={t("profile.usernameLabel")}
              value={formData.username ?? userData.username ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
            <input
              type="text"
              placeholder={t("profile.avatarUrlLabel")}
              value={formData.avatarUrl ?? userData.avatarUrl ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, avatarUrl: e.target.value })
              }
            />
            <div className={styles.modalActions}>
              <button onClick={handleSaveChanges}>
                {t("profile.saveChanges")}
              </button>
              <button onClick={() => setShowEdit(false)}>
                {t("profile.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
