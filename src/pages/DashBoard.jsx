// src/pages/DashBoard.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Bell,
  Search,
  Home,
  Eye,
  Clock,
  Video,
  Download,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Languages,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  MessageSquare,
  User,
  Mail,
  Phone,
  Save,
  Send,
  Plus,
  RefreshCw,
  Loader,
} from "lucide-react";
import {
  dashboardAPI,
  studentsAPI,
  sessionsAPI,
  assessmentsAPI,
  messagesAPI,
  // recommendationsAPI,
  // exercisesAPI,
} from "../server/endpoints";

// ─── CSS Styles ───────────────────────────────────────────────────────────────
const cssStyles = `
:root {
  --bg-light: #F8FAFC;
  --bg-white: #ffffff;
  --color-primary: #377C76;
  --color-primary-dark: #2A605B;
  --color-secondary: #EFA818;
  --color-text-main: #1e293b;
  --color-text-light: #64748b;
  --border-color: #e2e8f0;
  --radius: 0.75rem;
  --shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
}
* { box-sizing: border-box; }
body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: var(--bg-light); color: var(--color-text-main); }
.app-container { display: flex; min-height: 100vh; position: relative; }
.main-content { flex: 1; margin-left: 260px; padding: 2rem; transition: margin 0.3s; }
.rtl .main-content { margin-left: 0; margin-right: 260px; }
.sidebar { position: fixed; top: 0; bottom: 0; width: 260px; background-color: var(--color-primary); color: white; display: flex; flex-direction: column; z-index: 50; box-shadow: 4px 0 24px rgba(0,0,0,0.1); }
.rtl .sidebar { right: 0; }
.ltr .sidebar { left: 0; }
.logo-area { height: 80px; display: flex; align-items: center; padding: 0 1.5rem; font-size: 1.8rem; font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.1); gap: 0.5rem; letter-spacing: 1px; }
.nav-links { flex: 1; padding: 1.5rem 0; display: flex; flex-direction: column; gap: 0.25rem; }
.nav-item { display: flex; align-items: center; gap: 1rem; padding: 0.85rem 1.5rem; color: rgba(255,255,255,0.8); text-decoration: none; cursor: pointer; border: none; background: none; width: 100%; text-align: left; font-size: 1rem; transition: all 0.2s; position: relative; font-family: inherit; }
.nav-item:hover { background-color: rgba(255,255,255,0.1); color: white; }
.nav-item.active { background-color: rgba(0,0,0,0.2); color: white; font-weight: 600; border-left: 4px solid var(--color-secondary); }
.rtl .nav-item.active { border-left: none; border-right: 4px solid var(--color-secondary); }
.sidebar-footer { padding: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); }
.top-header { background: var(--bg-white); height: 80px; padding: 0 2rem; display: flex; justify-content: space-between; align-items: center; border-radius: var(--radius); box-shadow: var(--shadow); margin-bottom: 2rem; }
.header-left h2 { margin: 0; font-size: 1.5rem; color: var(--color-primary); font-weight: 700; }
.header-right { display: flex; align-items: center; gap: 1rem; }
.search-bar { display: flex; align-items: center; background: var(--bg-light); padding: 0.5rem 1rem; border-radius: 2rem; border: 1px solid var(--border-color); width: 250px; }
.search-bar input { border: none; background: transparent; outline: none; width: 100%; margin: 0 0.5rem; font-family: inherit; }
.icon-btn { background: var(--bg-light); border: none; padding: 0.6rem; border-radius: 50%; cursor: pointer; color: var(--color-text-light); transition: 0.2s; position: relative; display: flex; align-items: center; justify-content: center; }
.icon-btn:hover { background: #e2e8f0; color: var(--color-primary); }
.badge-dot { position: absolute; top: 0; right: 0; width: 10px; height: 10px; background: red; border-radius: 50%; border: 2px solid white; }
.profile-pic { width: 40px; height: 40px; border-radius: 50%; background: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
.grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; }
.card { background: var(--bg-white); padding: 1.5rem; border-radius: var(--radius); box-shadow: var(--shadow); position: relative; overflow: hidden; }
.stat-title { color: var(--color-text-light); font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem; }
.stat-value { color: var(--color-text-main); font-size: 2rem; font-weight: 800; line-height: 1; }
.stat-icon-bg { position: absolute; right: 1rem; top: 1rem; padding: 0.75rem; border-radius: 1rem; }
.rtl .stat-icon-bg { left: 1rem; right: auto; }
.table-card { background: var(--bg-white); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
.table-header { padding: 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
.table-title { font-size: 1.25rem; font-weight: 700; margin: 0; color: var(--color-primary); }
.data-table { width: 100%; border-collapse: collapse; min-width: 600px; }
.data-table th { text-align: left; padding: 1rem 1.5rem; color: var(--color-text-light); font-weight: 600; background: #f8fafc; font-size: 0.85rem; text-transform: uppercase; }
.rtl .data-table th { text-align: right; }
.data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); color: var(--color-text-main); font-size: 0.95rem; vertical-align: middle; }
.data-table tr:hover { background: #f1f5f9; }
.primary-btn { background: var(--color-secondary); color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 2rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.2s; font-family: inherit; font-size: 0.9rem; }
.primary-btn:hover { background: #d69515; transform: translateY(-1px); }
.action-btn { background: transparent; border: 1px solid var(--color-primary); color: var(--color-primary); padding: 0.4rem 1rem; border-radius: 2rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 0.5rem; font-family: inherit; }
.action-btn:hover { background: var(--color-primary); color: white; }
.progress-bar-bg { width: 100px; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
.progress-bar-fill { height: 100%; border-radius: 4px; }
.chat-window { background: #f8fafc; border-radius: var(--radius); padding: 1.5rem; height: 400px; display: flex; flex-direction: column; }
.chat-messages { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; padding-bottom: 1rem; }
.chat-bubble { max-width: 70%; padding: 0.8rem 1.2rem; border-radius: 1rem; font-size: 0.9rem; line-height: 1.4; }
.chat-bubble.received { background: white; align-self: flex-start; border-bottom-left-radius: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.chat-bubble.sent { background: var(--color-primary); color: white; align-self: flex-end; border-bottom-right-radius: 0; }
.chat-input-area { display: flex; gap: 1rem; margin-top: 1rem; }
.chat-input { flex: 1; padding: 0.8rem 1.5rem; border-radius: 2rem; border: 1px solid var(--border-color); outline: none; font-family: inherit; }
.form-group { margin-bottom: 1.5rem; }
.form-label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: var(--color-text-main); }
.form-input { width: 100%; padding: 0.8rem 1rem; border: 1px solid var(--border-color); border-radius: 0.5rem; font-size: 0.95rem; outline: none; transition: 0.2s; font-family: inherit; }
.form-input:focus { border-color: var(--color-primary); }
.loading-spinner { display: flex; align-items: center; justify-content: center; padding: 3rem; color: var(--color-text-light); gap: 0.75rem; }
.error-banner { background: #fff0f0; border: 1px solid #fcc; color: #c00; padding: 1rem 1.5rem; border-radius: var(--radius); margin-bottom: 1rem; }
.status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; display: inline-block; }
.status-completed { background: #e6fffa; color: var(--color-primary); }
.status-pending { background: #fff7ed; color: #c2410c; }
.message-item { display: flex; gap: 1rem; padding: 1rem 1.5rem; cursor: pointer; transition: 0.2s; border-bottom: 1px solid var(--border-color); align-items: flex-start; }
.message-item:hover { background: #f8fafc; }
.message-unread { background: #f0fdfa; }
.unread-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary); margin-top: 6px; flex-shrink: 0; }
.bar { transition: height 0.5s ease; }
.bar:hover { opacity: 0.8; }
@media (max-width: 1024px) {
  .sidebar { transform: translateX(-100%); }
  .rtl .sidebar { transform: translateX(100%); }
  .sidebar.open { transform: translateX(0); }
  .main-content { margin: 0; padding: 1rem; }
  .top-header { padding: 0 1rem; }
  .grid-2 { grid-template-columns: 1fr; }
}
`;

// ─── Translations ──────────────────────────────────────────────────────────────
const translations = {
  en: {
    home: "Home", students: "Students", sessions: "Sessions", reports: "Reports",
    assessments: "Assessments", messages: "Messages", settings: "Settings",
    logout: "Log Out", search: "Search...", totalStudents: "Total Students",
    upcoming: "Upcoming Sessions", pending: "Pending Reports", progress: "Avg Progress",
    addNew: "+ New Student", name: "Name", age: "Age", level: "Level",
    diagnosis: "Diagnosis", prog: "Progress", action: "Action", view: "View",
    start: "Start", download: "Download", drName: "Dr. Rania", role: "Specialist",
    week: "Week", score: "Score %", type: "Type", date: "Date", status: "Status",
    profile: "Profile Settings", fullName: "Full Name", email: "Email Address",
    phone: "Phone Number", save: "Save Changes", send: "Send", writeMsg: "Write a message...",
    unreviewed: "Unreviewed", loading: "Loading...", error: "Failed to load data",
    retry: "Retry", noData: "No data available", activeStudents: "Active Students",
    pendingAssessments: "Pending Assessments", weeklyProgress: "Weekly Progress",
    recentActivity: "Recent Activity", progressAnalytics: "Progress Analytics",
    noMessages: "No conversations yet", noStudents: "No students found",
    noSessions: "No sessions scheduled", noAssessments: "No assessments found",
  },
  ar: {
    home: "الرئيسية", students: "الطلاب", sessions: "الجلسات", reports: "التقارير",
    assessments: "التقييمات", messages: "الرسائل", settings: "الإعدادات",
    logout: "خروج", search: "بحث...", totalStudents: "إجمالي الطلاب",
    upcoming: "الجلسات القادمة", pending: "تقارير معلقة", progress: "معدل التقدم",
    addNew: "+ طالب جديد", name: "الاسم", age: "العمر", level: "المستوى",
    diagnosis: "التشخيص", prog: "التقدم", action: "إجراء", view: "عرض",
    start: "بدء", download: "تحميل", drName: "د. رانيا", role: "أخصائية نطق",
    week: "أسبوع", score: "النتيجة %", type: "النوع", date: "التاريخ", status: "الحالة",
    profile: "إعدادات الملف الشخصي", fullName: "الاسم الكامل", email: "البريد الإلكتروني",
    phone: "رقم الهاتف", save: "حفظ التغييرات", send: "إرسال", writeMsg: "اكتب رسالة...",
    unreviewed: "غير مراجع", loading: "جاري التحميل...", error: "فشل تحميل البيانات",
    retry: "إعادة المحاولة", noData: "لا توجد بيانات", activeStudents: "الطلاب النشطون",
    pendingAssessments: "التقييمات المعلقة", weeklyProgress: "التقدم الأسبوعي",
    recentActivity: "النشاط الأخير", progressAnalytics: "تحليلات التقدم",
    noMessages: "لا توجد محادثات", noStudents: "لا يوجد طلاب",
    noSessions: "لا توجد جلسات", noAssessments: "لا توجد تقييمات",
  },
};

// ─── Helper Hook ───────────────────────────────────────────────────────────────
function useApiData(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchFn();
      setData(res.data?.data ?? res.data ?? res);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}

// ─── Loading State ─────────────────────────────────────────────────────────────
function LoadingState({ t }) {
  return (
    <div className="loading-spinner">
      <Loader size={24} style={{ animation: "spin 1s linear infinite" }} />
      <span>{t("loading")}</span>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorState({ t, onRetry }) {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <div className="error-banner">{t("error")}</div>
      <button className="primary-btn" onClick={onRetry} style={{ margin: "0 auto" }}>
        <RefreshCw size={16} /> {t("retry")}
      </button>
    </div>
  );
}

// ─── Progress Chart ────────────────────────────────────────────────────────────
function ProgressChart({ lang, stats }) {
  const defaultData = [40, 65, 50, 80, 60, 90, 75];
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const values = stats?.weeklyData || defaultData;

  const width = 600, height = 220, paddingX = 40, paddingY = 30;
  const chartHeight = height - paddingY * 2;
  const chartWidth = width - paddingX * 2;
  const barWidth = 30;

  return (
    <div style={{ overflowX: "auto", padding: "1rem 0" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", minWidth: "500px" }}>
        {[0, 25, 50, 75, 100].map((val) => (
          <g key={val}>
            <line
              x1={paddingX} y1={height - paddingY - (val / 100) * chartHeight}
              x2={width - paddingX} y2={height - paddingY - (val / 100) * chartHeight}
              stroke="#eee"
            />
            <text
              x={lang === "ar" ? width - paddingX + 10 : paddingX - 10}
              y={height - paddingY - (val / 100) * chartHeight + 4}
              fontSize="10" fill="#94a3b8"
              textAnchor={lang === "ar" ? "start" : "end"}
            >{val}</text>
          </g>
        ))}
        {values.map((d, i) => {
          const spacing = chartWidth / values.length;
          const barX = paddingX + i * spacing + spacing / 2 - barWidth / 2;
          const barHeight = (d / 100) * chartHeight;
          const barY = height - paddingY - barHeight;
          return (
            <g key={i}>
              <rect x={barX} y={barY} width={barWidth} height={barHeight}
                fill="#44958E" rx="4" className="bar" />
              <text x={barX + barWidth / 2} y={height - 10} fontSize="12"
                fill="#64748b" textAnchor="middle">{labels[i]}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── VIEWS ─────────────────────────────────────────────────────────────────────
function HomeView({ t, lang }) {
  const { data: stats, loading, error, refetch } = useApiData(
    () => dashboardAPI.getStats(),
    []
  );

  const statCards = [
    {
      title: t("totalStudents"),
      value: stats?.totalStudents ?? stats?.studentsCount ?? "—",
      icon: Users, color: "#377C76",
    },
    {
      title: t("upcoming"),
      value: stats?.upcomingSessions ?? stats?.sessionsCount ?? "—",
      icon: Calendar, color: "#EFA818",
    },
    {
      title: t("pending"),
      value: stats?.pendingReports ?? stats?.pendingAssessments ?? "—",
      icon: FileText, color: "#ef4444",
    },
    {
      title: t("progress"),
      value: stats?.averageProgress != null ? `${stats.averageProgress}%` : "—",
      icon: TrendingUp, color: "#3b82f6",
    },
  ];

  return (
    <div>
      {error && <div className="error-banner">{error} <button className="action-btn" onClick={refetch}>{t("retry")}</button></div>}

      <div className="grid-4">
        {statCards.map((s, i) => (
          <div key={i} className="card">
            {loading
              ? <div style={{ height: 60, background: "#f1f5f9", borderRadius: 8, animation: "pulse 1.5s infinite" }} />
              : <>
                <div className="stat-title">{s.title}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-icon-bg" style={{ background: s.color, opacity: 0.15, borderRadius: 12, padding: "0.75rem" }}>
                  <s.icon size={24} color={s.color} />
                </div>
              </>
            }
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        <div className="table-card" style={{ padding: "1.5rem" }}>
          <h3 className="table-title" style={{ marginBottom: "1rem" }}>{t("progressAnalytics")}</h3>
          <ProgressChart t={t} lang={lang} stats={stats} />
        </div>
        <div className="table-card" style={{ padding: "1.5rem" }}>
          <h3 className="table-title" style={{ marginBottom: "1rem" }}>{t("recentActivity")}</h3>
          {loading
            ? <LoadingState t={t} />
            : (stats?.recentActivity || []).length > 0
              ? stats.recentActivity.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.5rem", background: "#f8fafc", borderRadius: "0.5rem", marginBottom: "0.75rem" }}>
                  <div style={{ padding: "0.5rem", background: "white", borderRadius: "50%", color: "#377C76", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}><Bell size={16} /></div>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "600" }}>{a.text || a.description}</div>
                    <div style={{ fontSize: "0.75rem", color: "#999" }}>{a.time || a.date}</div>
                  </div>
                </div>
              ))
              : <p style={{ color: "#94a3b8", textAlign: "center" }}>{t("noData")}</p>
          }
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}

function StudentsView({ t }) {
  const { data: students, loading, error, refetch } = useApiData(
    () => studentsAPI.getAll(),
    []
  );
  const [search, setSearch] = useState("");

  const filtered = (Array.isArray(students) ? students : [])
    .filter((s) =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      (s.diagnosis || "").toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">{t("students")}</h2>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div className="search-bar" style={{ width: 200 }}>
            <Search size={16} color="#94a3b8" />
            <input
              placeholder={t("search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="primary-btn"><Plus size={16} /> {t("addNew")}</button>
        </div>
      </div>

      {loading ? <LoadingState t={t} />
        : error ? <ErrorState t={t} onRetry={refetch} />
        : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("name")}</th>
                  <th>{t("level")}</th>
                  <th>{t("diagnosis")}</th>
                  <th>{t("prog")}</th>
                  <th>{t("action")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={5} style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>{t("noStudents")}</td></tr>
                  : filtered.map((s) => {
                    const initials = `${(s.firstName || "?")[0]}${(s.lastName || "?")[0]}`.toUpperCase();
                    const progress = s.progress ?? 0;
                    return (
                      <tr key={s.userId || s.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div className="profile-pic" style={{ width: 32, height: 32, fontSize: "0.8rem", background: "#E8F4F3", color: "#377C76" }}>{initials}</div>
                            {s.firstName} {s.lastName}
                          </div>
                        </td>
                        <td><span style={{ background: "#f1f5f9", padding: "4px 8px", borderRadius: 4, fontSize: "0.85rem" }}>{s.level || "—"}</span></td>
                        <td>{s.diagnosis || "—"}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div className="progress-bar-bg">
                              <div className="progress-bar-fill" style={{ width: `${progress}%`, background: progress > 75 ? "#377C76" : "#EFA818" }} />
                            </div>
                            <span style={{ fontSize: "0.8rem", fontWeight: "bold" }}>{progress}%</span>
                          </div>
                        </td>
                        <td><button className="action-btn"><Eye size={14} /> {t("view")}</button></td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
}

function SessionsView({ t }) {
  const { data: sessions, loading, error, refetch } = useApiData(
    () => sessionsAPI.getAll(),
    []
  );

  const handleStart = async (id) => {
    try {
      await sessionsAPI.start(id);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const list = Array.isArray(sessions) ? sessions : [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 className="table-title">{t("upcoming")}</h2>
        <button className="primary-btn"><Plus size={16} /> {t("addNew")}</button>
      </div>

      {loading ? <LoadingState t={t} />
        : error ? <ErrorState t={t} onRetry={refetch} />
        : list.length === 0
          ? <div className="card" style={{ textAlign: "center", color: "#94a3b8" }}>{t("noSessions")}</div>
          : list.map((s) => (
            <div key={s.sessionId || s.id} className="card" style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1rem", padding: "1rem" }}>
              <div style={{ background: "#FFF8E6", color: "#EFA818", padding: "0.5rem 1rem", borderRadius: "0.5rem", textAlign: "center", fontWeight: "bold", minWidth: 60 }}>
                <div style={{ fontSize: "1.2rem" }}>{s.dateTime ? new Date(s.dateTime).getDate() : "—"}</div>
                <div style={{ fontSize: "0.7rem" }}>{s.dateTime ? new Date(s.dateTime).toLocaleString("en", { month: "short" }) : ""}</div>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 0.25rem 0" }}>
                  {s.student?.firstName} {s.student?.lastName} {!s.student && `Student #${s.studentId}`}
                </h3>
                <div style={{ color: "#666", fontSize: "0.9rem", display: "flex", gap: "1rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Clock size={14} />
                    {s.dateTime ? new Date(s.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Video size={14} /> {s.type || "Online"}
                  </span>
                </div>
              </div>
              <button className="action-btn" onClick={() => handleStart(s.sessionId || s.id)}>
                {t("start")}
              </button>
            </div>
          ))
      }
    </div>
  );
}

function AssessmentsView({ t }) {
  const { data: assessments, loading, error, refetch } = useApiData(
    () => assessmentsAPI.getAll(),
    []
  );

  const list = Array.isArray(assessments) ? assessments : [];

  const handleComplete = async (id) => {
    const score = prompt("Enter score (0-100):");
    if (score === null) return;
    try {
      await assessmentsAPI.complete(id, Number(score));
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">{t("assessments")}</h2>
        <button className="primary-btn"><Plus size={16} /> {t("addNew")}</button>
      </div>

      {loading ? <LoadingState t={t} />
        : error ? <ErrorState t={t} onRetry={refetch} />
        : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("name")}</th>
                  <th>{t("type")}</th>
                  <th>{t("date")}</th>
                  <th>{t("status")}</th>
                  <th>{t("score")}</th>
                  <th>{t("action")}</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0
                  ? <tr><td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>{t("noAssessments")}</td></tr>
                  : list.map((a) => {
                    const isCompleted = a.score != null;
                    return (
                      <tr key={a.assessmentId || a.id}>
                        <td style={{ fontWeight: 600, color: "#377C76" }}>
                          {a.student?.firstName} {a.student?.lastName} {!a.student && `Student #${a.studentId}`}
                        </td>
                        <td>{a.type}</td>
                        <td>{a.date ? new Date(a.date).toLocaleDateString() : "—"}</td>
                        <td>
                          <span className={`status-badge ${isCompleted ? "status-completed" : "status-pending"}`}>
                            {isCompleted ? "Completed" : "Pending"}
                          </span>
                        </td>
                        <td style={{ fontWeight: "bold" }}>{a.score != null ? `${a.score}%` : "—"}</td>
                        <td>
                          {!isCompleted
                            ? <button className="action-btn" onClick={() => handleComplete(a.assessmentId || a.id)}><CheckCircle size={14} /> Complete</button>
                            : <button className="action-btn"><Eye size={14} /> {t("view")}</button>
                          }
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
}

function MessagesView({ t }) {
  const { data: conversations, loading, error, refetch } = useApiData(
    () => messagesAPI.getConversations(),
    []
  );
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);

  const list = Array.isArray(conversations) ? conversations : [];

  const loadMessages = async (studentId) => {
    setSelected(studentId);
    setMsgLoading(true);
    try {
      const res = await messagesAPI.getByStudent(studentId);
      setMessages(res.data?.data ?? res.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setMsgLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !selected) return;
    setSending(true);
    try {
      await messagesAPI.send(null, selected, newMsg.trim());
      setNewMsg("");
      await loadMessages(selected);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.5rem", height: "calc(100vh - 180px)" }}>
      {/* Conversations list */}
      <div className="card" style={{ padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid #e2e8f0", fontWeight: 700, fontSize: "1.1rem" }}>
          {t("messages")}
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading ? <LoadingState t={t} />
            : error ? <ErrorState t={t} onRetry={refetch} />
            : list.length === 0
              ? <p style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>{t("noMessages")}</p>
              : list.map((conv) => (
                <div
                  key={conv.studentId || conv.id}
                  className={`message-item ${!conv.isRead ? "message-unread" : ""}`}
                  style={{ background: selected === (conv.studentId || conv.id) ? "#e8f4f3" : undefined }}
                  onClick={() => loadMessages(conv.studentId || conv.id)}
                >
                  <div className="profile-pic" style={{ background: "#cbd5e1", fontSize: "0.9rem", flexShrink: 0 }}>
                    {(conv.studentName || conv.name || "?")[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{conv.studentName || conv.name || `Student #${conv.studentId}`}</span>
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</span>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {conv.lastMessage || conv.preview || "..."}
                    </div>
                  </div>
                  {!conv.isRead && <div className="unread-dot" />}
                </div>
              ))
          }
        </div>
      </div>

      {/* Chat window */}
      <div className="card" style={{ padding: 0, display: "flex", flexDirection: "column" }}>
        {!selected
          ? <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>Select a conversation</div>
          : (
            <div className="chat-window" style={{ height: "100%" }}>
              <div className="chat-messages">
                {msgLoading
                  ? <LoadingState t={t} />
                  : (Array.isArray(messages) ? messages : []).map((m, i) => (
                    <div key={i} className={`chat-bubble ${m.senderId === selected ? "received" : "sent"}`}>
                      {m.content || m.message || m.text}
                    </div>
                  ))
                }
              </div>
              <div style={{ padding: "1rem", borderTop: "1px solid #e2e8f0" }}>
                <div className="chat-input-area">
                  <input
                    className="chat-input"
                    placeholder={t("writeMsg")}
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  />
                  <button
                    className="primary-btn"
                    style={{ borderRadius: "50%", width: 45, height: 45, padding: 0, justifyContent: "center" }}
                    onClick={handleSend}
                    disabled={sending}
                  >
                    {sending ? <Loader size={18} /> : <Send size={20} />}
                  </button>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
}

function ReportsView({ t }) {
  return (
    <div>
      <h2 className="table-title" style={{ marginBottom: "1.5rem" }}>{t("reports")}</h2>
      <div className="grid-4">
        {[
          { title: "Progress Report", date: "Jan 15", type: "PDF" },
          { title: "Assessment Summary", date: "Jan 10", type: "DOCX" },
        ].map((r, i) => (
          <div key={i} className="card" style={{ border: "1px solid #e2e8f0" }}>
            <div style={{ position: "absolute", top: 10, right: 10, background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, fontSize: "0.7rem", fontWeight: "bold" }}>{r.type}</div>
            <div style={{ background: "#E8F4F3", width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#377C76", marginBottom: "1rem" }}>
              <FileText size={20} />
            </div>
            <h4 style={{ margin: "0 0 0.5rem 0" }}>{r.title}</h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#999" }}>{r.date}</p>
            <button className="action-btn" style={{ marginTop: "1rem", width: "100%", justifyContent: "center" }}>
              <Download size={14} /> {t("download")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsView({ t }) {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div className="card">
        <h3 style={{ marginBottom: "2rem", fontSize: "1.2rem", color: "#377C76" }}>{t("profile")}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: "2rem" }}>
          <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#377C76", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "2rem", fontWeight: "bold" }}>DR</div>
          <div>
            <button className="action-btn" style={{ marginBottom: "0.5rem" }}>Change Photo</button>
            <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>JPG, GIF or PNG. Max size of 800K</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {[
            { label: t("fullName"), icon: User, value: "Dr. Rania" },
            { label: "Role", icon: User, value: "Speech Specialist", disabled: true },
            { label: t("email"), icon: Mail, value: "rania@drago.com" },
            { label: t("phone"), icon: Phone, value: "+20 123 456 7890" },
          ].map((f, i) => (
            <div key={i} className="form-group">
              <label className="form-label">{f.label}</label>
              <div style={{ position: "relative" }}>
                <f.icon size={18} style={{ position: "absolute", left: 12, top: 12, color: "#94a3b8" }} />
                <input className="form-input" defaultValue={f.value} disabled={f.disabled} style={{ paddingLeft: "2.5rem", background: f.disabled ? "#f1f5f9" : undefined }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
          <button className="primary-btn"><Save size={18} /> {t("save")}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [lang, setLang] = useState("en");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const t = (k) => translations[lang][k] || k;
  const toggleLang = () => setLang((l) => (l === "en" ? "ar" : "en"));

  const menuItems = [
    { id: "home", icon: Home, label: "home" },
    { id: "students", icon: Users, label: "students" },
    { id: "sessions", icon: Calendar, label: "sessions" },
    { id: "assessments", icon: ClipboardList, label: "assessments" },
    { id: "messages", icon: MessageSquare, label: "messages" },
    { id: "reports", icon: FileText, label: "reports" },
    { id: "settings", icon: Settings, label: "settings" },
  ];

  return (
    <>
      <style>{cssStyles}</style>
      <div className={`app-container ${lang === "ar" ? "rtl" : "ltr"}`} dir={lang === "ar" ? "rtl" : "ltr"}>
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="logo-area">Drago</div>
          <nav className="nav-links">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              >
                <item.icon size={20} />
                <span>{t(item.label)}</span>
                {activeTab === item.id && (lang === "ar"
                  ? <ChevronLeft size={16} style={{ marginRight: "auto" }} />
                  : <ChevronRight size={16} style={{ marginLeft: "auto" }} />
                )}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button className="nav-item" style={{ color: "#fca5a5" }} onClick={() => { localStorage.removeItem("authToken"); localStorage.removeItem("userData"); window.location.href = "/"; }}>
              <LogOut size={20} /><span>{t("logout")}</span>
            </button>
          </div>
        </aside>

        <main className="main-content">
          <header className="top-header">
            <div className="header-left"><h2>{t(activeTab)}</h2></div>
            <div className="header-right">
              <div className="search-bar">
                <Search size={18} color="#94a3b8" />
                <input placeholder={t("search")} />
              </div>
              <button onClick={toggleLang} className="icon-btn"><Languages size={20} /></button>
              <button className="icon-btn"><Bell size={20} /><span className="badge-dot" /></button>
              <div className="profile-pic">DR</div>
            </div>
          </header>

          {activeTab === "home" && <HomeView t={t} lang={lang} />}
          {activeTab === "students" && <StudentsView t={t} lang={lang} />}
          {activeTab === "sessions" && <SessionsView t={t} />}
          {activeTab === "assessments" && <AssessmentsView t={t} />}
          {activeTab === "messages" && <MessagesView t={t} />}
          {activeTab === "reports" && <ReportsView t={t} />}
          {activeTab === "settings" && <SettingsView t={t} />}
        </main>

        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }} />
        )}
      </div>
    </>
  );
}