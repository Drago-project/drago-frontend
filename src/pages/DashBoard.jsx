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
import EmailVerification from "../components/Emailverification";
import ResetPasswordCode from "../components/ResetPasswordCode";
import ForgotPassword from "../components/ForgotPassword";
import {
  dashboardAPI,
  studentsAPI,
  sessionsAPI,
  assessmentsAPI,
  messagesAPI,
  // recommendationsAPI,
  // exercisesAPI,
  // doctorsAPI,
  doctorSettingsAPI,
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
  }, deps); // eslint-disable-line

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

function ErrorState({ t, onRetry }) {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <div className="error-banner">{t("error")}</div>
      <button
        className="primary-btn"
        onClick={onRetry}
        style={{ margin: "0 auto" }}
      >
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
                    {s.firstName} {s.lastName}
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
                    {s.firstName} {s.lastName}
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
      `${s.firstName} ${s.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
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
                      colSpan={5}
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
                    const initials =
                      `${(s.firstName || "?")[0]}${(s.lastName || "?")[0]}`.toUpperCase();
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
                            {s.firstName} {s.lastName}
                          </div>
                        </td>
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
                  {s.student?.firstName} {s.student?.lastName}{" "}
                  {!s.student && `Student #${s.studentId}`}
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
                          {a.student?.firstName} {a.student?.lastName}{" "}
                          {!a.student && `Student #${a.studentId}`}
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

function MessagesView({ t }) {
  const {
    data: conversations,
    loading,
    error,
    refetch,
  } = useApiData(() => messagesAPI.getConversations(), []);
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        gap: "1.5rem",
        height: "calc(100vh - 180px)",
      }}
    >
      {/* Conversations list */}
      <div
        className="card"
        style={{
          padding: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid #e2e8f0",
            fontWeight: 700,
            fontSize: "1.1rem",
          }}
        >
          {t("messages")}
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading ? (
            <LoadingState t={t} />
          ) : error ? (
            <ErrorState t={t} onRetry={refetch} />
          ) : list.length === 0 ? (
            <p
              style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}
            >
              {t("noMessages")}
            </p>
          ) : (
            list.map((conv) => (
              <div
                key={conv.studentId || conv.id}
                className={`message-item ${!conv.isRead ? "message-unread" : ""}`}
                style={{
                  background:
                    selected === (conv.studentId || conv.id)
                      ? "#e8f4f3"
                      : undefined,
                }}
                onClick={() => loadMessages(conv.studentId || conv.id)}
              >
                <div
                  className="profile-pic"
                  style={{
                    background: "#cbd5e1",
                    fontSize: "0.9rem",
                    flexShrink: 0,
                  }}
                >
                  {(conv.studentName || conv.name || "?")[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.2rem",
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      {conv.studentName ||
                        conv.name ||
                        `Student #${conv.studentId}`}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      {conv.lastMessageTime
                        ? new Date(conv.lastMessageTime).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" },
                          )
                        : ""}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#64748b",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {conv.lastMessage || conv.preview || "..."}
                  </div>
                </div>
                {!conv.isRead && <div className="unread-dot" />}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat window */}
      <div
        className="card"
        style={{ padding: 0, display: "flex", flexDirection: "column" }}
      >
        {!selected ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
            }}
          >
            Select a conversation
          </div>
        ) : (
          <div className="chat-window" style={{ height: "100%" }}>
            <div className="chat-messages">
              {msgLoading ? (
                <LoadingState t={t} />
              ) : (
                (Array.isArray(messages) ? messages : []).map((m, i) => (
                  <div
                    key={i}
                    className={`chat-bubble ${m.senderId === selected ? "received" : "sent"}`}
                  >
                    {m.content || m.message || m.text}
                  </div>
                ))
              )}
            </div>
            <div style={{ padding: "1rem", borderTop: "1px solid #e2e8f0" }}>
              <div className="chat-input-area">
                <input
                  className="chat-input"
                  placeholder={t("writeMsg")}
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSend()
                  }
                />
                <button
                  className="primary-btn"
                  style={{
                    borderRadius: "50%",
                    width: 45,
                    height: 45,
                    padding: 0,
                    justifyContent: "center",
                  }}
                  onClick={handleSend}
                  disabled={sending}
                >
                  {sending ? <Loader size={18} /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </div>
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
  const [photoUrl, setPhotoUrl] = useState(null);
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
        if (d.photoUrl) setPhotoUrl(d.photoUrl);
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
      await doctorSettingsAPI.update({
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        specialist: form.specialist,
        email: form.email,
        password: "", // بعتي string فاضي مش null
      });
      setSuccessMsg("تم حفظ التغييرات بنجاح ✓");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      // حولي الـ error لـ string صح
      const errData = err?.response?.data;
      const msg =
        typeof errData === "string"
          ? errData
          : errData?.message ||
            errData?.title ||
            (errData?.errors
              ? Object.values(errData.errors).flat().join(" | ")
              : null) ||
            "فشل الحفظ";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const res = await doctorSettingsAPI.uploadPhoto(file);
      const d = res.data?.data ?? res.data;
      if (d?.photoUrl) setPhotoUrl(d.photoUrl);
      setPhotoUrl(URL.createObjectURL(file));
    } catch (error) {
      console.error(error);
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
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        specialist: form.specialist,
        email: newEmail,
        password: "", // ← زي ما عملنا في handleSave
      });
      setShowEmailInput(false);
      setShowEmailVerify(true);
    } catch (err) {
      const errData = err?.response?.data;
      const msg =
        typeof errData === "string"
          ? errData
          : errData?.message ||
            errData?.title ||
            (errData?.errors
              ? Object.values(errData.errors).flat().join(" | ")
              : null) ||
            "فشل إرسال الكود";
      setEmailError(msg);
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <div style={{ position: "relative" }}>
            {photoUrl ? (
              <img
                src={photoUrl}
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
              JPG أو PNG — أقل من 2MB
            </p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group" style={{ marginBottom: "1.2rem" }}>
            <label className="form-label">{t("fullName")}</label>
            <input
              className="form-input"
              type="text"
              value={form.fullName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, fullName: e.target.value }))
              }
            />
          </div>

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

          <div className="form-group" style={{ marginBottom: "1.2rem" }}>
            <label className="form-label">{t("phone")}</label>
            <input
              className="form-input"
              type="tel"
              value={form.phoneNumber}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))
              }
            />
          </div>

          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label">التخصص</label>
            <input
              className="form-input"
              type="text"
              value={form.specialist}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, specialist: e.target.value }))
              }
            />
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
              <Save size={16} />
              {saving ? "جاري الحفظ..." : t("save")}
            </button>
          </div>
        </form>
      </div>

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

      {showEmailVerify && (
        <EmailVerification
          email={newEmail}
          userType="doctor"
          onClose={() => setShowEmailVerify(false)}
          onVerified={() => {
            setForm((prev) => ({ ...prev, email: newEmail }));
            setShowEmailVerify(false);
            setNewEmail("");
            setSuccessMsg("تم تغيير الإيميل بنجاح ✓");
            setTimeout(() => setSuccessMsg(""), 3000);
          }}
        />
      )}

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
                {activeTab === item.id &&
                  (lang === "ar" ? (
                    <ChevronLeft size={16} style={{ marginRight: "auto" }} />
                  ) : (
                    <ChevronRight size={16} style={{ marginLeft: "auto" }} />
                  ))}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button
              className="nav-item"
              style={{ color: "#fca5a5" }}
              onClick={() => {
                localStorage.removeItem("authToken");
                localStorage.removeItem("userData");
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
            <div className="header-left">
              <h2>{t(activeTab)}</h2>
            </div>
            <div className="header-right">
              <div className="search-bar">
                <Search size={18} color="#94a3b8" />
                <input placeholder={t("search")} />
              </div>
              <button onClick={toggleLang} className="icon-btn">
                <Languages size={20} />
              </button>
              <button className="icon-btn">
                <Bell size={20} />
                <span className="badge-dot" />
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

        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 40,
            }}
          />
        )}
      </div>
    </>
  );
}
