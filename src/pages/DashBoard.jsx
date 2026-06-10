// src/pages/DashBoard.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSignalR } from "../hooks/useSignalR";
import { toImageSrc } from "../utils/imageUtils";
import {
  Menu,
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
  Languages,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  MessageSquare,
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
  doctorSettingsAPI,
} from "../server/endpoints";

// ─── Utility ──────────────────────────────────────────────────────────────────
const getUserId = () => {
  try {
    const userDataStr = localStorage.getItem("userData");
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      return userData?.userId || userData?.id || userData?.doctorId || null;
    }
  } catch (err) {
    console.error("Error parsing userData:", err);
  }

  try {
    const token = localStorage.getItem("authToken");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.DoctorId || payload.userId || payload.sub || null;
    }
  } catch (err) {
    console.error("Error parsing token:", err);
  }

  return null;
};

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
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: var(--bg-white); border-radius: var(--radius); padding: 2rem; max-width: 500px; width: 90%; box-shadow: 0 20px 25px rgba(0,0,0,0.15); }
.modal-header { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--color-primary); }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--color-text-main); font-size: 0.95rem; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; font-family: inherit; font-size: 0.95rem; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(55,124,118,0.1); }
.modal-footer { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem; }
.modal-footer button { padding: 0.6rem 1.5rem; border-radius: 0.5rem; border: none; font-weight: 600; cursor: pointer; font-family: inherit; }
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
.menu-toggle { display: none; background: transparent; border: none; color: var(--color-primary); cursor: pointer; padding: 0.5rem; }
.mobile-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 40; }
@media (max-width: 1024px) {
  .menu-toggle { display: inline-flex; align-items: center; justify-content: center; }
  .mobile-overlay.open { display: block; }
  .sidebar { transform: translateX(-100%); }
  .rtl .sidebar { transform: translateX(100%); }
  .sidebar.open { transform: translateX(0); }
  .main-content { margin: 0; padding: 1rem; }
  .top-header { padding: 0 1rem; }
  .grid-2 { grid-template-columns: 1fr; }
}

.chat-grid-container {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1.5rem;
  height: calc(100vh - 190px);
}
.chat-sidebar-wrap { display: flex; flex-direction: column; height: 100%; }
.chat-main-wrap { display: flex; flex-direction: column; height: 100%; }

@media (max-width: 1024px) {
  .menu-toggle { display: inline-flex; align-items: center; justify-content: center; }
  .sidebar { transform: translateX(-100%); }
  .rtl .sidebar { transform: translateX(100%); }
  .sidebar.open { transform: translateX(0); }
  .main-content { margin-left: 0; padding: 1rem; }
  .rtl .main-content { margin-right: 0; }
  .top-header { padding: 0 1rem; margin-bottom: 1rem; height: 70px; }
}

/* تظبيط الشات للموبايل (شاشات أقل من 768px) */
@media (max-width: 768px) {
  .chat-grid-container {
    grid-template-columns: 1fr !important;
    height: calc(100vh - 140px) !important; /* تكبير الارتفاع عشان يملى الشاشة في الموبايل */
    gap: 0;
  }
  
  /* لو الدكتور فتح شات طالب: إخفي القائمة الجانبية فوراً */
  .chat-grid-container.chat-active .chat-sidebar-wrap {
    display: none !important;
  }
  
  /* لو الدكتور برة ومش فاتح شات: إخفي صندوق المحادثة الفاضي */
  .chat-grid-container:not(.chat-active) .chat-main-wrap {
    display: none !important;
  }
  
  .chat-bubble {
    max-width: 85% !important; /* تكبير عرض فقاعة الرسالة في الموبايل عشان القراءة */
  }
}
`;

// ─── Translations ──────────────────────────────────────────────────────────────
const translations = {
  en: {
    home: "Home",
    students: "Students",
    sessions: "Sessions",
    reports: "Reports",
    assessments: "Assessments",
    messages: "Messages",
    settings: "Settings",
    logout: "Log Out",
    search: "Search...",
    totalStudents: "Total Students",
    upcoming: "Upcoming Sessions",
    pending: "Pending Reports",
    progress: "Avg Progress",
    addNew: "+ New Student",
    name: "Name",
    age: "Age",
    level: "Level",
    diagnosis: "Diagnosis",
    prog: "Progress",
    action: "Action",
    view: "View",
    start: "Start",
    download: "Download",
    drName: "Dr. Rania",
    role: "Specialist",
    week: "Week",
    score: "Score %",
    type: "Type",
    date: "Date",
    status: "Status",
    profile: "Profile Settings",
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    save: "Save Changes",
    send: "Send",
    writeMsg: "Write a message...",
    unreviewed: "Unreviewed",
    loading: "Loading...",
    error: "Failed to load data",
    retry: "Retry",
    noData: "No data available",
    activeStudents: "Active Students",
    pendingAssessments: "Pending Assessments",
    weeklyProgress: "Weekly Progress",
    recentActivity: "Recent Activity",
    progressAnalytics: "Progress Analytics",
    noMessages: "No conversations yet",
    noStudents: "No students found",
    noSessions: "No sessions scheduled",
    noAssessments: "No assessments found",
  },
  ar: {
    home: "الرئيسية",
    students: "الطلاب",
    sessions: "الجلسات",
    reports: "التقارير",
    assessments: "التقييمات",
    messages: "الرسائل",
    settings: "الإعدادات",
    logout: "خروج",
    search: "بحث...",
    totalStudents: "إجمالي الطلاب",
    upcoming: "الجلسات القادمة",
    pending: "تقارير معلقة",
    progress: "معدل التقدم",
    addNew: "+ طالب جديد",
    name: "الاسم",
    age: "العمر",
    level: "المستوى",
    diagnosis: "التشخيص",
    prog: "التقدم",
    action: "إجراء",
    view: "عرض",
    start: "بدء",
    download: "تحميل",
    drName: "د. رانيا",
    role: "أخصائية نطق",
    week: "أسبوع",
    score: "النتيجة %",
    type: "النوع",
    date: "التاريخ",
    status: "الحالة",
    profile: "إعدادات الملف الشخصي",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    save: "حفظ التغييرات",
    send: "إرسال",
    writeMsg: "اكتب رسالة...",
    unreviewed: "غير مراجع",
    loading: "جاري التحميل...",
    error: "فشل تحميل البيانات",
    retry: "إعادة المحاولة",
    noData: "لا توجد بيانات",
    activeStudents: "الطلاب النشطون",
    pendingAssessments: "التقييمات المعلقة",
    weeklyProgress: "التقدم الأسبوعي",
    recentActivity: "النشاط الأخير",
    progressAnalytics: "تحليلات التقدم",
    noMessages: "لا توجد محادثات",
    noStudents: "لا يوجد طلاب",
    noSessions: "لا توجد جلسات",
    noAssessments: "لا توجد تقييمات",
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
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

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

function ErrorState({ t, onRetry, message }) {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <div className="error-banner">{message || t("error")}</div>
      {onRetry && (
        <button
          className="primary-btn"
          onClick={onRetry}
          style={{ margin: "0 auto" }}
        >
          <RefreshCw size={16} /> {t("retry")}
        </button>
      )}
    </div>
  );
}

// ─── Progress Chart ────────────────────────────────────────────────────────────
function ProgressChart({ lang, stats }) {
  const defaultData = [40, 65, 50, 80, 60, 90, 75];
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const values = stats?.weeklyData || defaultData;

  const width = 600,
    height = 220,
    paddingX = 40,
    paddingY = 30;
  const chartHeight = height - paddingY * 2;
  const chartWidth = width - paddingX * 2;
  const barWidth = 30;

  return (
    <div style={{ overflowX: "auto", padding: "1rem 0" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", minWidth: "500px" }}
      >
        {[0, 25, 50, 75, 100].map((val) => (
          <g key={val}>
            <line
              x1={paddingX}
              y1={height - paddingY - (val / 100) * chartHeight}
              x2={width - paddingX}
              y2={height - paddingY - (val / 100) * chartHeight}
              stroke="#eee"
            />
            <text
              x={lang === "ar" ? width - paddingX + 10 : paddingX - 10}
              y={height - paddingY - (val / 100) * chartHeight + 4}
              fontSize="10"
              fill="#94a3b8"
              textAnchor={lang === "ar" ? "start" : "end"}
            >
              {val}
            </text>
          </g>
        ))}
        {values.map((d, i) => {
          const spacing = chartWidth / values.length;
          const barX = paddingX + i * spacing + spacing / 2 - barWidth / 2;
          const barHeight = (d / 100) * chartHeight;
          const barY = height - paddingY - barHeight;
          return (
            <g key={i}>
              <rect
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill="#44958E"
                rx="4"
                className="bar"
              />
              <text
                x={barX + barWidth / 2}
                y={height - 10}
                fontSize="12"
                fill="#64748b"
                textAnchor="middle"
              >
                {labels[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────────────

function AssignStudentModal({ isOpen, onClose, onStudentAdded }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("أدخل الإيميل");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await studentsAPI.assignByEmail(email);
      setEmail("");
      onStudentAdded();
      onClose();
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data;

      if (status === 404) {
        setError("الطالب غير موجود — تأكدي إن الإيميل مسجل في التطبيق");
      } else if (status === 409) {
        setError("هذا الطالب مرتبط بدكتور آخر بالفعل");
      } else {
        setError(
          typeof msg === "string" ? msg : msg?.message || "فشل ربط الطالب",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 400, textAlign: "center" }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            fontSize: "1.2rem",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>👤</div>
        <h2 className="modal-header">ربط طالب موجود</h2>
        <p
          style={{
            color: "#64748b",
            fontSize: "0.9rem",
            marginBottom: "1.5rem",
          }}
        >
          أدخل إيميل الطالب المسجل مسبقاً
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="إيميل الطالب"
            value={email}
            autoFocus
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              border: "1px solid #e2e8f0",
              borderRadius: "0.5rem",
              fontFamily: "inherit",
              fontSize: "0.95rem",
              marginBottom: "1rem",
            }}
            required
          />
          {error && (
            <div
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}
          <div className="modal-footer">
            <button
              type="button"
              style={{
                background: "#e2e8f0",
                color: "#374151",
                borderRadius: "0.5rem",
                padding: "0.6rem 1.5rem",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onClick={onClose}
            >
              إلغاء
            </button>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "جاري الربط..." : "ربط الطالب"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddSessionModal({ isOpen, onClose, onSessionAdded, students }) {
  const [form, setForm] = useState({
    studentId: "",
    dateTime: "",
    type: "Online",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.dateTime) {
      setError("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await sessionsAPI.create(form.studentId, form.dateTime, form.type);
      setForm({ studentId: "", dateTime: "", type: "Online" });
      onSessionAdded();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "فشل إضافة الجلسة");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-header">إضافة جلسة جديدة</h2>
        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#dc2626",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>اختر الطالب *</label>
            <select
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              required
            >
              <option value="">-- اختر طالب --</option>
              {Array.isArray(students) &&
                students.map((s) => (
                  <option key={s.userId || s.id} value={s.userId || s.id}>
                    {s.fullName || "طالب بدون اسم"}
                  </option>
                ))}
            </select>
          </div>
          <div className="form-group">
            <label>التاريخ والوقت *</label>
            <input
              type="datetime-local"
              name="dateTime"
              value={form.dateTime}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>نوع الجلسة</label>
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="Online">أونلاين</option>
              <option value="InPerson">حضوري</option>
              <option value="Hybrid">هجين</option>
            </select>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              style={{ background: "#e2e8f0", color: "var(--color-text-main)" }}
              onClick={onClose}
            >
              إلغاء
            </button>
            <button
              type="submit"
              style={{ background: "var(--color-secondary)", color: "white" }}
              disabled={loading}
            >
              {loading ? "جاري الإضافة..." : "إضافة الجلسة"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddAssessmentModal({ isOpen, onClose, onAssessmentAdded, students }) {
  const [form, setForm] = useState({
    studentId: "",
    type: "ReadingComprehension",
    date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.date) {
      setError("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await assessmentsAPI.create(form.studentId, form.type, form.date);
      setForm({ studentId: "", type: "ReadingComprehension", date: "" });
      onAssessmentAdded();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "فشل إضافة التقييم");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-header">إضافة تقييم جديد</h2>
        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#dc2626",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>اختر الطالب *</label>
            <select
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              required
            >
              <option value="">-- اختر طالب --</option>
              {Array.isArray(students) &&
                students.map((s) => (
                  <option key={s.userId || s.id} value={s.userId || s.id}>
                    {s.fullName || "طالب بدون اسم"}
                  </option>
                ))}
            </select>
          </div>
          <div className="form-group">
            <label>نوع التقييم</label>
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="ReadingComprehension">فهم القراءة</option>
              <option value="Phonics">تحليل الصوتيات</option>
              <option value="Fluency">الطلاقة</option>
              <option value="Vocabulary">المفردات</option>
            </select>
          </div>
          <div className="form-group">
            <label>التاريخ *</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              style={{ background: "#e2e8f0", color: "var(--color-text-main)" }}
              onClick={onClose}
            >
              إلغاء
            </button>
            <button
              type="submit"
              style={{ background: "var(--color-secondary)", color: "white" }}
              disabled={loading}
            >
              {loading ? "جاري الإضافة..." : "إضافة التقييم"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── VIEWS ─────────────────────────────────────────────────────────────────────
function HomeView({ t, lang }) {
  const {
    data: stats,
    loading,
    error,
    refetch,
  } = useApiData(() => dashboardAPI.getDashboardData(), []);

  const statCards = [
    {
      title: t("totalStudents"),
      value: stats?.totalStudents ?? stats?.studentsCount ?? "—",
      icon: Users,
      color: "#377C76",
    },
    {
      title: t("upcoming"),
      value: stats?.upcomingSessions ?? stats?.sessionsCount ?? "—",
      icon: Calendar,
      color: "#EFA818",
    },
    {
      title: t("pending"),
      value: stats?.pendingReports ?? stats?.pendingAssessments ?? "—",
      icon: FileText,
      color: "#ef4444",
    },
    {
      title: t("progress"),
      value: stats?.averageProgress != null ? `${stats.averageProgress}%` : "—",
      icon: TrendingUp,
      color: "#3b82f6",
    },
  ];

  return (
    <div>
      {error && (
        <div className="error-banner">
          {error}{" "}
          <button className="action-btn" onClick={refetch}>
            {t("retry")}
          </button>
        </div>
      )}

      <div className="grid-4">
        {statCards.map((s, i) => (
          <div key={i} className="card">
            {loading ? (
              <div
                style={{
                  height: 60,
                  background: "#f1f5f9",
                  borderRadius: 8,
                  animation: "pulse 1.5s infinite",
                }}
              />
            ) : (
              <>
                <div className="stat-title">{s.title}</div>
                <div className="stat-value">{s.value}</div>
                <div
                  className="stat-icon-bg"
                  style={{
                    background: s.color,
                    opacity: 0.15,
                    borderRadius: 12,
                    padding: "0.75rem",
                  }}
                >
                  <s.icon size={24} color={s.color} />
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        <div className="table-card" style={{ padding: "1.5rem" }}>
          <h3 className="table-title" style={{ marginBottom: "1rem" }}>
            {t("progressAnalytics")}
          </h3>
          <ProgressChart t={t} lang={lang} stats={stats} />
        </div>
        <div className="table-card" style={{ padding: "1.5rem" }}>
          <h3 className="table-title" style={{ marginBottom: "1rem" }}>
            {t("recentActivity")}
          </h3>
          {loading ? (
            <LoadingState t={t} />
          ) : (stats?.recentActivity || []).length > 0 ? (
            stats.recentActivity.map((a, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "0.5rem",
                  background: "#f8fafc",
                  borderRadius: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div
                  style={{
                    padding: "0.5rem",
                    background: "white",
                    borderRadius: "50%",
                    color: "#377C76",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  <Bell size={16} />
                </div>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: "600" }}>
                    {a.text || a.description}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#999" }}>
                    {a.time || a.date}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "#94a3b8", textAlign: "center" }}>
              {t("noData")}
            </p>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}

function StudentsView({ t }) {
  const {
    data: students,
    loading,
    error,
    refetch,
  } = useApiData(() => studentsAPI.getAll(), []);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = (Array.isArray(students) ? students : []).filter(
    (s) =>
      (s.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.diagnosis || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <AssignStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onStudentAdded={refetch}
      />
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
            <button
              className="primary-btn"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} /> {t("addNew")}
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingState t={t} />
        ) : error ? (
          <ErrorState t={t} onRetry={refetch} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("name")}</th>
                  <th>{t("age")}</th>
                  <th>{t("level")}</th>
                  <th>{t("diagnosis")}</th>
                  <th>{t("prog")}</th>
                  <th>{t("action")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        color: "#94a3b8",
                        padding: "2rem",
                      }}
                    >
                      {t("noStudents")}
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => {
                    const nameParts = (s.fullName || "?").split(" ");
                    const firstInitial = nameParts[0]?.[0] || "";
                    const secondInitial =
                      nameParts.length > 1 ? nameParts[1]?.[0] || "" : "";
                    const initials =
                      `${firstInitial}${secondInitial}`.toUpperCase();

                    const progress = s.progress ?? 0;

                    return (
                      <tr key={s.userId || s.id}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                            }}
                          >
                            <div
                              className="profile-pic"
                              style={{
                                width: 32,
                                height: 32,
                                fontSize: "0.8rem",
                                background: "#E8F4F3",
                                color: "#377C76",
                              }}
                            >
                              {initials}
                            </div>
                            {s.fullName || "—"}
                          </div>
                        </td>
                        <td>{s.age || "—"}</td>
                        <td>
                          <span
                            style={{
                              background: "#f1f5f9",
                              padding: "4px 8px",
                              borderRadius: 4,
                              fontSize: "0.85rem",
                            }}
                          >
                            {s.level || "—"}
                          </span>
                        </td>
                        <td>{s.diagnosis || "—"}</td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <div className="progress-bar-bg">
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${progress}%`,
                                  background:
                                    progress > 75 ? "#377C76" : "#EFA818",
                                }}
                              />
                            </div>
                            <span
                              style={{ fontSize: "0.8rem", fontWeight: "bold" }}
                            >
                              {progress}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <button className="action-btn">
                            <Eye size={14} /> {t("view")}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function SessionsView({ t }) {
  const {
    data: sessions,
    loading,
    error,
    refetch,
  } = useApiData(() => sessionsAPI.getAll(), []);
  const { data: students } = useApiData(() => studentsAPI.getAll(), []);
  const [showAddModal, setShowAddModal] = useState(false);

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
    <>
      <AddSessionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSessionAdded={refetch}
        t={t}
        students={students}
      />
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2 className="table-title">{t("upcoming")}</h2>
          <button className="primary-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> {t("addNew")}
          </button>
        </div>

        {loading ? (
          <LoadingState t={t} />
        ) : error ? (
          <ErrorState t={t} onRetry={refetch} />
        ) : list.length === 0 ? (
          <div
            className="card"
            style={{ textAlign: "center", color: "#94a3b8" }}
          >
            {t("noSessions")}
          </div>
        ) : (
          list.map((s) => (
            <div
              key={s.sessionId || s.id}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                marginBottom: "1rem",
                padding: "1rem",
              }}
            >
              <div
                style={{
                  background: "#FFF8E6",
                  color: "#EFA818",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  textAlign: "center",
                  fontWeight: "bold",
                  minWidth: 60,
                }}
              >
                <div style={{ fontSize: "1.2rem" }}>
                  {s.dateTime ? new Date(s.dateTime).getDate() : "—"}
                </div>
                <div style={{ fontSize: "0.7rem" }}>
                  {s.dateTime
                    ? new Date(s.dateTime).toLocaleString("en", {
                        month: "short",
                      })
                    : ""}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 0.25rem 0" }}>
                  {s.student?.fullName ||
                    (s.student?.firstName
                      ? `${s.student.firstName} ${s.student.lastName}`
                      : `Student #${s.studentId}`)}
                </h3>
                <div
                  style={{
                    color: "#666",
                    fontSize: "0.9rem",
                    display: "flex",
                    gap: "1rem",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <Clock size={14} />
                    {s.dateTime
                      ? new Date(s.dateTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <Video size={14} /> {s.type || "Online"}
                  </span>
                </div>
              </div>
              <button
                className="action-btn"
                onClick={() => handleStart(s.sessionId || s.id)}
              >
                {t("start")}
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function AssessmentsView({ t }) {
  const {
    data: assessments,
    loading,
    error,
    refetch,
  } = useApiData(() => assessmentsAPI.getAll(), []);
  const { data: students } = useApiData(() => studentsAPI.getAll(), []);
  const [showAddModal, setShowAddModal] = useState(false);

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
    <>
      <AddAssessmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAssessmentAdded={refetch}
        t={t}
        students={students}
      />
      <div className="table-card">
        <div className="table-header">
          <h2 className="table-title">{t("assessments")}</h2>
          <button className="primary-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> {t("addNew")}
          </button>
        </div>

        {loading ? (
          <LoadingState t={t} />
        ) : error ? (
          <ErrorState t={t} onRetry={refetch} />
        ) : (
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
                {list.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        color: "#94a3b8",
                        padding: "2rem",
                      }}
                    >
                      {t("noAssessments")}
                    </td>
                  </tr>
                ) : (
                  list.map((a) => {
                    const isCompleted = a.score != null;
                    return (
                      <tr key={a.assessmentId || a.id}>
                        <td style={{ fontWeight: 600, color: "#377C76" }}>
                          {a.student?.fullName ||
                            (a.student?.firstName
                              ? `${a.student.firstName} ${a.student.lastName}`
                              : `Student #${a.studentId}`)}
                        </td>
                        <td>{a.type}</td>
                        <td>
                          {a.date ? new Date(a.date).toLocaleDateString() : "—"}
                        </td>
                        <td>
                          <span
                            className={`status-badge ${isCompleted ? "status-completed" : "status-pending"}`}
                          >
                            {isCompleted ? "Completed" : "Pending"}
                          </span>
                        </td>
                        <td style={{ fontWeight: "bold" }}>
                          {a.score != null ? `${a.score}%` : "—"}
                        </td>
                        <td>
                          {!isCompleted ? (
                            <button
                              className="action-btn"
                              onClick={() =>
                                handleComplete(a.assessmentId || a.id)
                              }
                            >
                              <CheckCircle size={14} /> Complete
                            </button>
                          ) : (
                            <button className="action-btn">
                              <Eye size={14} /> {t("view")}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function MessagesView({ t, lang }) {
  const doctorId = getUserId();

  const {
    data: conversations,
    loading: convsLoading,
    error: convsError,
    refetch: refetchConvs,
  } = useApiData(() => messagesAPI.getConversations(), []);

  const { data: allStudents } = useApiData(() => studentsAPI.getAll(), []);

  const [localConvs, setLocalConvs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversations) {
      setLocalConvs(conversations);
    }
  }, [conversations]);

  const selectedStudentRef = useRef(null);
  useEffect(() => {
    selectedStudentRef.current = selectedStudentId;
  }, [selectedStudentId]);

  useSignalR({
    doctorId: doctorId || 0,
    studentId: selectedStudentId,
    onMessage: (message) => {
      const role = message.senderRole || message.SenderRole || "";
      const sId = message.senderId || message.SenderId;
      const rId = message.receiverId || message.ReceiverId;

      const msgStudentId = role.toLowerCase() === "student" ? sId : rId;
      if (!msgStudentId) return;

      if (selectedStudentRef.current === msgStudentId) {
        setMessages((prev) => {
          const msgId = message.messageId || message.id || message.MessageId;
          if (
            msgId &&
            prev.some((m) => (m.messageId || m.id || m.MessageId) === msgId)
          )
            return prev;
          return [...prev, message];
        });
      }
      setLocalConvs((prevConvs) => {
        const updatedList = [...prevConvs];
        const convIndex = updatedList.findIndex(
          (c) =>
            Number(c.studentId || c.participantId || c.userId) === msgStudentId,
        );

        if (convIndex > -1) {
          const [movedConv] = updatedList.splice(convIndex, 1);
          movedConv.lastMessage =
            message.content || message.text || message.Message;

          if (Number(selectedStudentRef.current) !== msgStudentId) {
            movedConv.isRead = false;
          }
          updatedList.unshift(movedConv);
        } else {
          refetchConvs();
        }
        return updatedList;
      });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChatData = async (studentId) => {
    if (!studentId || !doctorId) return;

    setSelectedStudentId(studentId);
    setMessages([]);
    setChatLoading(true);
    setChatError("");

    setLocalConvs((prev) =>
      prev.map((c) =>
        Number(c.studentId || c.participantId || c.userId) === Number(studentId)
          ? { ...c, isRead: true }
          : c,
      ),
    );

    try {
      const convRes = await messagesAPI.getOrCreateConversation({
        doctorId: Number(doctorId),
        studentId: Number(studentId),
      });

      const activeConvId =
        convRes.data?.data?.conversationId ||
        convRes.data?.conversationId ||
        convRes.data?.id ||
        0;
      setConversationId(activeConvId);

      if (activeConvId) {
        const msgRes = await messagesAPI.getMessages(activeConvId);
        setMessages(msgRes.data?.data ?? msgRes.data ?? []);
      }
    } catch (err) {
      console.error("Chat load error:", err);
      setChatError("فشل في تحميل الرسائل.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendChat = async () => {
    const text = chatInput.trim();
    if (!text || !selectedStudentId || !doctorId || chatSending) return;

    const tempId = `opt-${Date.now()}`;
    const optimisticMsg = {
      messageId: tempId,
      senderRole: "Doctor",
      content: text,
      sentAt: new Date().toISOString(),
      optimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setChatInput("");
    setChatError("");
    setChatSending(true);

    try {
      let activeConvId = conversationId;

      if (!activeConvId) {
        const convRes = await messagesAPI.getOrCreateConversation({
          doctorId: Number(doctorId),
          studentId: Number(selectedStudentId),
        });
        activeConvId =
          convRes.data?.data?.conversationId ||
          convRes.data?.conversationId ||
          convRes.data?.id ||
          0;
        setConversationId(activeConvId);
        refetchConvs();
      }

      await messagesAPI.send({
        content: text,
        receiverId: Number(selectedStudentId),
        doctorId: Number(doctorId),
        studentId: Number(selectedStudentId),
        conversationId: Number(activeConvId) || 0,
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.messageId === tempId ? { ...m, optimistic: false } : m,
        ),
      );

      setLocalConvs((prevConvs) => {
        const updatedList = [...prevConvs];
        const convIndex = updatedList.findIndex(
          (c) =>
            Number(c.studentId || c.participantId || c.userId) ===
            Number(selectedStudentId),
        );

        if (convIndex > -1) {
          const [movedConv] = updatedList.splice(convIndex, 1);
          movedConv.lastMessage = text;
          updatedList.unshift(movedConv);
        }
        return updatedList;
      });
    } catch (err) {
      console.error("Chat send error:", err);
      setMessages((prev) => prev.filter((m) => m.messageId !== tempId));
      setChatInput(text);
      setChatError("فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.");
    } finally {
      setChatSending(false);
    }
  };

  const studentsList = Array.isArray(allStudents) ? allStudents : [];
  const displayList = searchQuery
    ? studentsList.filter((s) =>
        (s.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : localConvs;

  return (
    <div
      className={`chat-grid-container ${selectedStudentId ? "chat-active" : ""}`}
    >
      {/* ── القائمة الجانبية (قائمة المحادثات) ── */}
      <div className="card chat-sidebar-wrap" style={{ padding: 0 }}>
        <div style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>
          <h3>{t("messages")}</h3>
        </div>

        <div style={{ padding: "0.5rem 1rem" }}>
          <input
            className="search-bar"
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ overflowY: "auto", flex: 1 }}>
          {convsError ? (
            <ErrorState t={t} onRetry={refetchConvs} />
          ) : convsLoading && !searchQuery ? (
            <LoadingState t={t} />
          ) : displayList.length === 0 ? (
            <div
              style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}
            >
              {t("noMessages")}
            </div>
          ) : (
            displayList.map((item) => {
              const studentIdUI =
                item.studentId || item.participantId || item.userId || item.id;
              const name =
                item.studentName || item.fullName || `Student #${studentIdUI}`;
              const isUnread = !searchQuery && item.isRead === false;

              return (
                <div
                  key={`sidebar-item-${studentIdUI}`}
                  className={`message-item ${isUnread ? "message-unread" : ""}`}
                  onClick={() => loadChatData(studentIdUI)}
                  style={{
                    backgroundColor:
                      selectedStudentId === studentIdUI
                        ? "#f1f5f9"
                        : "transparent",
                  }}
                >
                  <div className="profile-pic">{(name || "?")[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{name}</div>
                    <div style={{ fontSize: "0.8rem", color: "#666" }}>
                      {item.lastMessage || "..."}
                    </div>
                  </div>
                  {isUnread && <div className="unread-dot" />}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── صندوق المحادثة النشط ── */}
      <div
        className="card chat-main-wrap"
        style={{ display: "flex", padding: 0 }}
      >
        {!selectedStudentId ? (
          <div style={{ margin: "auto", color: "#888" }}>
            Select a conversation
          </div>
        ) : chatLoading ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LoadingState t={t} />
          </div>
        ) : (
          <>
            {/* هيدر صندوق الشات المخصص للموبايل والتابلت للرجوع للخلف */}
            <div
              style={{
                padding: "0.75rem 1rem",
                borderBottom: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                background: "#f8fafc",
              }}
            >
              <button
                onClick={() => setSelectedStudentId(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-primary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                }}
              >
                {lang === "ar" ? (
                  <ChevronRight size={20} />
                ) : (
                  <ChevronLeft size={20} />
                )}
                {lang === "ar" ? "رجوع للرسائل" : "Back to messages"}
              </button>
            </div>

            <div
              style={{
                flex: 1,
                padding: "1rem",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {messages.length === 0 && !chatError && (
                <p
                  style={{
                    color: "#6b7280",
                    textAlign: "center",
                    margin: "auto",
                  }}
                >
                  Say hi to the student!
                </p>
              )}
              {messages.map((m, index) => {
                const role = m.senderRole || m.SenderRole || "";
                const sId = m.senderId || m.SenderId;
                const isMine =
                  role.toLowerCase() === "doctor" ||
                  Number(sId) === Number(doctorId);
                const uniqueKey =
                  m.messageId || m.MessageId || m.id || `msg-${index}`;

                return (
                  <div
                    key={uniqueKey}
                    className="chat-bubble"
                    style={{
                      alignSelf: isMine ? "flex-end" : "flex-start",
                      background: isMine ? "#377C76" : "#eee",
                      color: isMine ? "white" : "black",
                      padding: "0.75rem 1rem",
                      borderRadius: isMine
                        ? "1rem 1rem 0 1rem"
                        : "1rem 1rem 1rem 0",
                      opacity: m.optimistic ? 0.6 : 1,
                    }}
                  >
                    <div>{m.content || m.text || m.Message || m.message}</div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        marginTop: "4px",
                        textAlign: isMine ? "right" : "left",
                        opacity: 0.7,
                      }}
                    >
                      {m.sentAt || m.timestamp || m.createdAt
                        ? new Date(
                            m.sentAt || m.timestamp || m.createdAt,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                      {m.optimistic && <span> (جاري الإرسال...)</span>}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {chatError && (
              <div
                style={{
                  margin: "0 1rem",
                  padding: "0.5rem",
                  background: "#fee2e2",
                  color: "#dc2626",
                  borderRadius: "4px",
                  fontSize: "0.85rem",
                  textAlign: "center",
                }}
              >
                {chatError}
              </div>
            )}

            <div
              style={{
                display: "flex",
                padding: "1rem",
                gap: "0.5rem",
                borderTop: "1px solid #eee",
              }}
            >
              <input
                className="chat-input"
                value={chatInput}
                onChange={(e) => {
                  setChatInput(e.target.value);
                  setChatError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                placeholder={t("writeMsg")}
                disabled={chatSending}
              />
              <button
                className="primary-btn"
                onClick={handleSendChat}
                disabled={chatSending || !chatInput.trim()}
              >
                {chatSending ? (
                  <Loader
                    size={18}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  t("send")
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
function ReportsView({ t }) {
  return (
    <div>
      <h2 className="table-title" style={{ marginBottom: "1.5rem" }}>
        {t("reports")}
      </h2>
      <div className="grid-4">
        {[
          { title: "Progress Report", date: "Jan 15", type: "PDF" },
          { title: "Assessment Summary", date: "Jan 10", type: "DOCX" },
        ].map((r, i) => (
          <div key={i} className="card" style={{ border: "1px solid #e2e8f0" }}>
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "#f1f5f9",
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: "0.7rem",
                fontWeight: "bold",
              }}
            >
              {r.type}
            </div>
            <div
              style={{
                background: "#E8F4F3",
                width: 40,
                height: 40,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#377C76",
                marginBottom: "1rem",
              }}
            >
              <FileText size={20} />
            </div>
            <h4 style={{ margin: "0 0 0.5rem 0" }}>{r.title}</h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#999" }}>
              {r.date}
            </p>
            <button
              className="action-btn"
              style={{
                marginTop: "1rem",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <Download size={14} /> {t("download")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsView({ t }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    specialist: "",
  });
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  const [showEmailInput, setShowEmailInput] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [showEmailVerify, setShowEmailVerify] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    doctorSettingsAPI
      .get()
      .then((res) => {
        const d = res.data?.data ?? res.data;
        setForm({
          fullName: d.fullName || "",
          email: d.email || "",
          phoneNumber: d.phoneNumber || "",
          specialist: d.specialist || "",
        });
        setImageSrc(toImageSrc(d.profileImage ?? d.photoUrl ?? null));
      })
      .catch(() => setError("فشل تحميل البيانات"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      await doctorSettingsAPI.update({ ...form, password: "" });
      setSuccessMsg("تم حفظ التغييرات بنجاح ✓");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      const d = err?.response?.data;
      setError(
        typeof d === "string" ? d : d?.message || d?.title || "فشل الحفظ",
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const localSrc = URL.createObjectURL(file);
    setImageSrc(localSrc);
    try {
      const res = await doctorSettingsAPI.uploadPhoto(file);
      const d = res.data?.data ?? res.data;
      const serverSrc = toImageSrc(d?.profileImage ?? d?.photoUrl ?? null);
      if (serverSrc) setImageSrc(serverSrc);
    } catch {
      setError("فشل رفع الصورة");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailError("أدخل إيميل صحيح");
      return;
    }
    setEmailLoading(true);
    setEmailError("");
    try {
      await doctorSettingsAPI.update({
        ...form,
        email: newEmail,
        password: "",
      });
      setShowEmailInput(false);
      setShowEmailVerify(true);
    } catch (err) {
      const d = err?.response?.data;
      setEmailError(
        typeof d === "string" ? d : d?.message || "فشل إرسال الكود",
      );
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("الباسورد أقل من 8 أحرف");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("كلمتا المرور غير متطابقتين");
      return;
    }
    setPasswordLoading(true);
    setPasswordError("");
    try {
      await doctorSettingsAPI.changePassword(
        passwordForm.oldPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword,
      );
      setShowPasswordModal(false);
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccessMsg("تم تغيير كلمة المرور بنجاح ✓");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setPasswordError(err?.response?.data?.message || "فشل تغيير الباسورد");
    } finally {
      setPasswordLoading(false);
    }
  };

  const initials = form.fullName
    ? form.fullName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "DR";

  if (loading) return <LoadingState t={t} />;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div className="card">
        <h3
          style={{ marginBottom: "2rem", fontSize: "1.2rem", color: "#377C76" }}
        >
          {t("profile")}
        </h3>

        {/* ── Avatar ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <div style={{ position: "relative" }}>
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="profile"
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #377C76",
                }}
              />
            ) : (
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  background: "#377C76",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1.8rem",
                  fontWeight: "bold",
                }}
              >
                {initials}
              </div>
            )}
            {uploadingPhoto && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Loader
                  size={20}
                  color="white"
                  style={{ animation: "spin 1s linear infinite" }}
                />
              </div>
            )}
          </div>
          <div>
            <label style={{ cursor: "pointer" }}>
              <span
                className="action-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                تغيير الصورة
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
            </label>
            <p
              style={{
                fontSize: "0.8rem",
                color: "#94a3b8",
                marginTop: "0.4rem",
              }}
            >
              PNG, JPG, أو SVG — أقل من 2MB
            </p>
          </div>
        </div>

        {/* ── Form fields ── */}
        <form onSubmit={handleSave}>
          {[
            { label: t("fullName"), name: "fullName", type: "text" },
            { label: t("phone"), name: "phoneNumber", type: "tel" },
            { label: "التخصص", name: "specialist", type: "text" },
          ].map((f) => (
            <div
              key={f.name}
              className="form-group"
              style={{ marginBottom: "1.2rem" }}
            >
              <label className="form-label">{f.label}</label>
              <input
                className="form-input"
                type={f.type}
                value={form[f.name]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [f.name]: e.target.value }))
                }
              />
            </div>
          ))}

          {/* Email row with change button */}
          <div className="form-group" style={{ marginBottom: "1.2rem" }}>
            <label className="form-label">{t("email")}</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="form-input"
                type="email"
                value={form.email}
                readOnly
                style={{ background: "#f8fafc", color: "#64748b" }}
              />
              <button
                type="button"
                className="action-btn"
                onClick={() => {
                  setShowEmailInput(true);
                  setEmailError("");
                  setNewEmail("");
                }}
              >
                تغيير
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}
          {successMsg && (
            <div
              style={{
                background: "#dcfce7",
                color: "#16a34a",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
                fontSize: "0.9rem",
              }}
            >
              {successMsg}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <button
              type="button"
              className="action-btn"
              style={{ color: "#ef4444", borderColor: "#ef4444" }}
              onClick={() => {
                setShowPasswordModal(true);
                setPasswordError("");
                setPasswordForm({
                  oldPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
              }}
            >
              🔒 تغيير كلمة المرور
            </button>
            <button type="submit" className="primary-btn" disabled={saving}>
              <CheckCircle size={16} /> {saving ? "جاري الحفظ..." : t("save")}
            </button>
          </div>
        </form>
      </div>

      {/* ── Change email modal ── */}
      {showEmailInput && (
        <div className="modal-overlay" onClick={() => setShowEmailInput(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 420, textAlign: "center" }}
          >
            <button
              onClick={() => setShowEmailInput(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>✉️</div>
            <h3 style={{ color: "#377C76", marginBottom: "0.5rem" }}>
              تغيير الإيميل
            </h3>
            <p
              style={{
                color: "#64748b",
                fontSize: "0.9rem",
                marginBottom: "1.5rem",
              }}
            >
              أدخل الإيميل الجديد وهنبعتلك كود تأكيد
            </p>
            <input
              style={{
                width: "100%",
                padding: "0.7rem 1rem",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
                fontFamily: "inherit",
                fontSize: "0.95rem",
                marginBottom: "1rem",
              }}
              type="email"
              placeholder="الإيميل الجديد"
              value={newEmail}
              autoFocus
              onChange={(e) => {
                setNewEmail(e.target.value);
                setEmailError("");
              }}
            />
            {emailError && (
              <p
                style={{
                  color: "#dc2626",
                  fontSize: "0.85rem",
                  marginBottom: "0.5rem",
                }}
              >
                {emailError}
              </p>
            )}
            <button
              className="primary-btn"
              style={{ width: "100%" }}
              onClick={handleEmailChange}
              disabled={emailLoading}
            >
              {emailLoading ? "جاري الإرسال..." : "إرسال كود التأكيد"}
            </button>
          </div>
        </div>
      )}

      {/* ── Email verification modal ── */}
      {/* Assuming EmailVerification component exists */}
      {showEmailVerify && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: "center" }}>
            <p>Email verification component goes here...</p>
            <button onClick={() => setShowEmailVerify(false)}>Close</button>
          </div>
        </div>
      )}

      {/* ── Change password modal ── */}
      {showPasswordModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 420 }}
          >
            <button
              onClick={() => setShowPasswordModal(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "2.5rem" }}>🔒</div>
              <h3 style={{ color: "#377C76", margin: "0.5rem 0" }}>
                تغيير كلمة المرور
              </h3>
            </div>
            <form onSubmit={handleChangePassword}>
              {[
                { label: "كلمة المرور الحالية", name: "oldPassword" },
                { label: "كلمة المرور الجديدة", name: "newPassword" },
                { label: "تأكيد كلمة المرور الجديدة", name: "confirmPassword" },
              ].map((f) => (
                <div
                  key={f.name}
                  className="form-group"
                  style={{ marginBottom: "1rem" }}
                >
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.4rem",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                    }}
                  >
                    {f.label}
                  </label>
                  <input
                    type="password"
                    style={{
                      width: "100%",
                      padding: "0.7rem 1rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      fontFamily: "inherit",
                    }}
                    value={passwordForm[f.name]}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        [f.name]: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              ))}
              {passwordError && (
                <div
                  style={{
                    background: "#fee2e2",
                    color: "#dc2626",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    marginBottom: "1rem",
                    fontSize: "0.9rem",
                  }}
                >
                  {passwordError}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  style={{
                    padding: "0.6rem 1.5rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #e2e8f0",
                    background: "white",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                  onClick={() => setShowPasswordModal(false)}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "جاري التغيير..." : "تغيير الباسورد"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
      <div
        className={`app-container ${lang === "ar" ? "rtl" : "ltr"}`}
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <div
          className={`mobile-overlay ${sidebarOpen ? "open" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="logo-area">Drago</div>
          <nav className="nav-links">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              >
                <item.icon size={20} />
                <span>{t(item.label)}</span>
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button
              className="nav-item"
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
            >
              <LogOut size={20} />
              <span>{t("logout")}</span>
            </button>
          </div>
        </aside>

        <main className="main-content">
          <header className="top-header">
            <div
              className="header-left"
              style={{ display: "flex", alignItems: "center", gap: "1rem" }}
            >
              <button
                className="menu-toggle"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
              <h2>{t(activeTab)}</h2>
            </div>
            <div className="header-right">
              <button onClick={toggleLang} className="icon-btn">
                <Languages size={20} />
              </button>
              <button
                className="icon-btn"
                onClick={() => {
                  setActiveTab("messages");
                }}
              >
                <Bell size={20} />
              </button>
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
      </div>
    </>
  );
}
