import React, { useState } from "react";
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
  Send
} from 'lucide-react';

// --- CSS Styles (Embedded for Immediate Functionality) ---
const cssStyles = `
/* Global Variables */
:root {
  --bg-light: #F8FAFC;
  --bg-white: #ffffff;
  --color-primary: #377C76;       /* Teal Main */
  --color-primary-dark: #2A605B;
  --color-secondary: #EFA818;     /* Yellow/Orange Accent */
  --color-text-main: #1e293b;
  --color-text-light: #64748b;
  --border-color: #e2e8f0;
  --radius: 0.75rem;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

* { box-sizing: border-box; }
body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: var(--bg-light); color: var(--color-text-main); }

/* Layout */
.app-container { display: flex; min-height: 100vh; position: relative; }
.main-content { flex: 1; margin-left: 260px; padding: 2rem; transition: margin 0.3s; }
.rtl .main-content { margin-left: 0; margin-right: 260px; }

/* Sidebar */
.sidebar {
  position: fixed; top: 0; bottom: 0; width: 260px;
  background-color: var(--color-primary); color: white;
  display: flex; flex-direction: column; z-index: 50;
  box-shadow: 4px 0 24px rgba(0,0,0,0.1);
}
.rtl .sidebar { right: 0; }
.ltr .sidebar { left: 0; }

.logo-area {
  height: 80px; display: flex; align-items: center; padding: 0 1.5rem;
  font-size: 1.8rem; font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.1);
  gap: 0.5rem; letter-spacing: 1px;
}

.nav-links { flex: 1; padding: 1.5rem 0; display: flex; flex-direction: column; gap: 0.25rem; }

.nav-item {
  display: flex; align-items: center; gap: 1rem;
  padding: 0.85rem 1.5rem;
  color: rgba(255,255,255,0.8);
  text-decoration: none; cursor: pointer; border: none; background: none;
  width: 100%; text-align: left; font-size: 1rem; transition: all 0.2s;
  position: relative;
}
.nav-item:hover { background-color: rgba(255,255,255,0.1); color: white; }
.nav-item.active { background-color: rgba(0,0,0,0.2); color: white; font-weight: 600; border-left: 4px solid var(--color-secondary); }
.rtl .nav-item.active { border-left: none; border-right: 4px solid var(--color-secondary); }

.sidebar-footer { padding: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); }

/* Header */
.top-header {
  background: var(--bg-white); height: 80px; padding: 0 2rem;
  display: flex; justify-content: space-between; align-items: center;
  border-radius: var(--radius); box-shadow: var(--shadow); margin-bottom: 2rem;
}
.header-left h2 { margin: 0; font-size: 1.5rem; color: var(--color-primary); font-weight: 700; }
.header-right { display: flex; align-items: center; gap: 1rem; }

.search-bar {
  display: flex; align-items: center; background: var(--bg-light);
  padding: 0.5rem 1rem; border-radius: 2rem; border: 1px solid var(--border-color);
  width: 250px;
}
.search-bar input { border: none; background: transparent; outline: none; width: 100%; margin: 0 0.5rem; }

.icon-btn {
  background: var(--bg-light); border: none; padding: 0.6rem; border-radius: 50%;
  cursor: pointer; color: var(--color-text-light); transition: 0.2s; position: relative;
  display: flex; align-items: center; justify-content: center;
}
.icon-btn:hover { background: #e2e8f0; color: var(--color-primary); }
.badge-dot { position: absolute; top: 0; right: 0; width: 10px; height: 10px; background: red; border-radius: 50%; border: 2px solid white; }

.profile-pic {
  width: 40px; height: 40px; border-radius: 50%; background: var(--color-primary);
  color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;
}

/* Cards & Grid */
.grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; }
.card { background: var(--bg-white); padding: 1.5rem; border-radius: var(--radius); box-shadow: var(--shadow); position: relative; overflow: hidden; }

.stat-title { color: var(--color-text-light); font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem; }
.stat-value { color: var(--color-text-main); font-size: 2rem; font-weight: 800; line-height: 1; }
.stat-icon-bg { position: absolute; right: 1rem; top: 1rem; padding: 0.75rem; border-radius: 1rem; opacity: 0.15; }
.rtl .stat-icon-bg { left: 1rem; right: auto; }

/* Tables */
.table-card { background: var(--bg-white); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
.table-header { padding: 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
.table-title { font-size: 1.25rem; font-weight: 700; margin: 0; color: var(--color-primary); }

.data-table { width: 100%; border-collapse: collapse; min-width: 700px; }
.data-table th { text-align: left; padding: 1rem 1.5rem; color: var(--color-text-light); font-weight: 600; background: #f8fafc; font-size: 0.85rem; text-transform: uppercase; }
.rtl .data-table th { text-align: right; }
.data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); color: var(--color-text-main); font-size: 0.95rem; vertical-align: middle; }
.data-table tr:hover { background: #f1f5f9; }

/* Unified Buttons Style */
.btn {
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 2rem;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.primary-btn {
  background: var(--color-secondary);
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 2rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s;
}
.primary-btn:hover { background: #d69515; transform: translateY(-1px); }

.action-btn {
  background: transparent; 
  border: 1px solid var(--color-primary); 
  color: var(--color-primary);
  padding: 0.4rem 1rem; 
  border-radius: 2rem; 
  font-weight: 600; 
  font-size: 0.85rem;
  cursor: pointer; 
  transition: 0.2s; 
  display: inline-flex; 
  align-items: center; 
  gap: 0.5rem;
}
.action-btn:hover { background: var(--color-primary); color: white; }

/* Progress */
.progress-bar-bg { width: 100px; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
.progress-bar-fill { height: 100%; border-radius: 4px; }

/* Messages */
.message-list { display: flex; flexDirection: column; gap: 1rem; }
.message-item { display: flex; gap: 1rem; padding: 1rem; border-radius: 0.5rem; cursor: pointer; transition: 0.2s; border-bottom: 1px solid var(--border-color); }
.message-item:hover { background: #f8fafc; }
.chat-window { background: #f8fafc; border-radius: var(--radius); padding: 1.5rem; height: 400px; display: flex; flex-direction: column; }
.chat-messages { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; padding-bottom: 1rem; }
.chat-bubble { max-width: 70%; padding: 0.8rem 1.2rem; border-radius: 1rem; font-size: 0.9rem; line-height: 1.4; }
.chat-bubble.received { background: white; align-self: flex-start; border-bottom-left-radius: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.chat-bubble.sent { background: var(--color-primary); color: white; align-self: flex-end; border-bottom-right-radius: 0; }
.chat-input-area { display: flex; gap: 1rem; margin-top: 1rem; }
.chat-input { flex: 1; padding: 0.8rem 1.5rem; border-radius: 2rem; border: 1px solid var(--border-color); outline: none; }

/* Settings */
.form-group { margin-bottom: 1.5rem; }
.form-label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: var(--color-text-main); }
.form-input { width: 100%; padding: 0.8rem 1rem; border: 1px solid var(--border-color); border-radius: 0.5rem; font-size: 0.95rem; outline: none; transition: 0.2s; }
.form-input:focus { border-color: var(--color-primary); }

/* Chart Animation */
.bar { transition: height 0.5s ease; }
.bar:hover { fill: var(--color-primary-dark); opacity: 0.8; }

/* Mobile & Responsive */
@media (max-width: 1024px) {
  .sidebar { transform: translateX(-100%); }
  .rtl .sidebar { transform: translateX(100%); }
  .sidebar.open { transform: translateX(0); }
  .main-content { margin: 0; padding: 1rem; }
  .top-header { padding: 0 1rem; }
  .grid-2 { grid-template-columns: 1fr; }
}
`;

// --- Mock Data ---
const initialStudents = [
  { id: 1, name: "Habiba Mohamed", age: 9, level: "Level 3", diagnosis: "Dyslexia, ADHD", progress: 70, avatar: "HM" },
  { id: 2, name: "Sara Medhat", age: 10, level: "Level 2", diagnosis: "Dyslexia", progress: 65, avatar: "SM" },
  { id: 3, name: "Mazen Ali", age: 8, level: "Level 4", diagnosis: "Dyslexia, Dysgraphia", progress: 85, avatar: "MA" },
  { id: 4, name: "Youssef Hussein", age: 11, level: "Level 3", diagnosis: "Dyslexia", progress: 75, avatar: "YH" },
  { id: 5, name: "Nourhan Salah", age: 9, level: "Level 2", diagnosis: "Dyslexia", progress: 60, avatar: "NS" },
];

const mockAssessments = [
  { id: 1, student: "Habiba Mohamed", type: "Reading Fluency", date: "Jan 18, 2026", status: "Completed", score: "85%" },
  { id: 2, student: "Mazen Ali", type: "Phonological Awareness", date: "Jan 20, 2026", status: "Pending", score: "-" },
  { id: 3, student: "Sara Medhat", type: "Spelling Test", date: "Jan 15, 2026", status: "Completed", score: "92%" },
];

const mockMessages = [
  { id: 1, sender: "Mrs. Amal (Habiba's Mom)", preview: "Hello Dr., when is the next session?", time: "10:30 AM", unread: true },
  { id: 2, sender: "Dr. Ahmed (Colleague)", preview: "I shared the new resources file.", time: "Yesterday", unread: false },
  { id: 3, sender: "Mr. Khaled (Youssef's Dad)", preview: "Thanks for the update!", time: "Jan 18", unread: false },
];

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
    unreviewed: "Unreviewed"
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
    unreviewed: "غير مراجع"
  }
};

// --- Sub Components ---

// Updated to Bar Chart
const ProgressChart = ({ lang }) => {
  const data = [
    { label: 'Mon', value: 40 },
    { label: 'Tue', value: 65 },
    { label: 'Wed', value: 50 },
    { label: 'Thu', value: 80 },
    { label: 'Fri', value: 60 },
    { label: 'Sat', value: 90 },
    { label: 'Sun', value: 75 },
  ];
  
  const width = 600; 
  const height = 220; 
  const paddingX = 40;
  const paddingY = 30;
  const chartHeight = height - paddingY * 2;
  const chartWidth = width - paddingX * 2;
  const barWidth = 30; // Width of each bar
  
  return (
    <div style={{overflowX: 'auto', padding: '1rem 0'}}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{width: '100%', minWidth: '500px', overflow: 'visible'}}>
        {/* Grid Lines (0, 25, 50, 75, 100) */}
        {[0, 25, 50, 75, 100].map(val => (
          <g key={val}>
            <line 
              x1={paddingX} 
              y1={height - paddingY - (val/100) * chartHeight} 
              x2={width - paddingX} 
              y2={height - paddingY - (val/100) * chartHeight} 
              stroke="#eee" 
              strokeDasharray="0" 
            />
            <text 
              x={lang === 'ar' ? width - paddingX + 10 : paddingX - 10} 
              y={height - paddingY - (val/100) * chartHeight + 4} 
              fontSize="10" 
              fill="#94a3b8" 
              textAnchor={lang === 'ar' ? "start" : "end"}
            >
              {val}
            </text>
          </g>
        ))}
        
        {/* Bars */}
        {data.map((d, i) => {
          // Correct calculation to center bars:
          const spacing = chartWidth / data.length;
          const barX = paddingX + (i * spacing) + (spacing / 2) - (barWidth / 2);
          
          const barHeight = (d.value / 100) * chartHeight;
          const barY = height - paddingY - barHeight;
          
          return (
            <g key={i} className="group">
              <rect 
                x={barX} 
                y={barY} 
                width={barWidth} 
                height={barHeight} 
                fill="#44958E" // Teal color from image
                rx="4" // Rounded corners
                className="bar"
              />
              <text 
                x={barX + barWidth / 2} 
                y={height - 10} 
                fontSize="12" 
                fill="#64748b" 
                textAnchor="middle"
              >
                {d.label}
              </text>
              
              {/* Tooltip on hover */}
              <foreignObject x={barX - 35} y={barY - 45} width="100" height="40" style={{opacity: 0, transition: '0.2s', pointerEvents: 'none'}} className="group-hover:opacity-100">
                 <div style={{
                   background: '#1e293b', 
                   color: 'white',
                   padding: '4px 8px', 
                   borderRadius: '6px', 
                   textAlign: 'center', 
                   fontSize: '11px',
                   fontWeight: 'bold'
                 }}>
                   {d.value}%
                 </div>
              </foreignObject>
            </g>
          )
        })}
      </svg>
    </div>
  );
};

// --- Pages ---

const HomeView = ({ t, lang }) => (
  <div className="animate-fade-in">
    <div className="grid-4">
      {[
        { title: t('totalStudents'), value: "24", icon: Users, color: "#377C76" },
        { title: t('upcoming'), value: "8", icon: Calendar, color: "#EFA818" },
        { title: t('pending'), value: "3", icon: FileText, color: "#ef4444" },
        { title: t('progress'), value: "78%", icon: TrendingUp, color: "#3b82f6" },
      ].map((stat, i) => (
        <div key={i} className="card">
          <div className="stat-title">{stat.title}</div>
          <div className="stat-value">{stat.value}</div>
          <div className="stat-icon-bg" style={{background: stat.color, color: stat.color}}>
            <stat.icon size={24} />
          </div>
        </div>
      ))}
    </div>
    
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
      <div className="table-card" style={{padding: '1.5rem'}}>
        <h3 className="table-title" style={{marginBottom: '1rem'}}>{t('progressAnalytics')}</h3>
        <ProgressChart t={t} lang={lang} />
      </div>
      <div className="table-card" style={{padding: '1.5rem'}}>
        <h3 className="table-title" style={{marginBottom: '1rem'}}>{t('recentActivity')}</h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          {[{text: "Ahmed finished Lvl 3", time: "2h ago"}, {text: "Report for Sara", time: "5h ago"}, {text: "Omar missed session", time: "1d ago"}].map((a, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '0.5rem'}}>
              <div style={{padding: '0.5rem', background: 'white', borderRadius: '50%', color: '#377C76', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'}}><Bell size={16}/></div>
              <div><div style={{fontSize: '0.9rem', fontWeight: '600'}}>{a.text}</div><div style={{fontSize: '0.75rem', color: '#999'}}>{a.time}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const StudentsView = ({ t, students }) => (
  <div className="table-card">
    <div className="table-header">
      <h2 className="table-title">{t('students')}</h2>
      <button className="primary-btn">{t('addNew')}</button>
    </div>
    <div style={{overflowX: 'auto'}}>
      <table className="data-table">
        <thead><tr><th>{t('name')}</th><th>{t('age')}</th><th>{t('level')}</th><th>{t('diagnosis')}</th><th>{t('prog')}</th><th>{t('action')}</th></tr></thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id}>
              <td><div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}><div className="profile-pic" style={{background: '#E8F4F3', color: '#377C76', width: 32, height: 32, fontSize: '0.8rem'}}>{s.avatar}</div>{s.name}</div></td>
              <td>{s.age}</td>
              <td><span style={{background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem'}}>{s.level}</span></td>
              <td>{s.diagnosis}</td>
              <td><div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><div className="progress-bar-bg"><div className="progress-bar-fill" style={{width: `${s.progress}%`, background: s.progress > 75 ? '#377C76' : '#EFA818'}}></div></div><span style={{fontSize: '0.8rem', fontWeight: 'bold'}}>{s.progress}%</span></div></td>
              <td><button className="action-btn">{t('view')}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SessionsView = ({ t }) => (
  <div>
    <h2 className="table-title" style={{marginBottom: '1.5rem'}}>{t('upcoming')}</h2>
    {[{ name: "Habiba Mohamed", time: "10:00 AM", type: "online" }, { name: "Sara Medhat", time: "11:30 AM", type: "inPerson" }, { name: "Mazen Ali", time: "02:00 PM", type: "online" }].map((s, i) => (
      <div key={i} className="card" style={{display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem', padding: '1rem'}}>
        <div style={{background: '#FFF8E6', color: '#EFA818', padding: '0.5rem 1rem', borderRadius: '0.5rem', textAlign: 'center', fontWeight: 'bold'}}><div style={{fontSize: '1.2rem'}}>20</div><div style={{fontSize: '0.7rem'}}>JAN</div></div>
        <div style={{flex: 1}}><h3 style={{margin: '0 0 0.25rem 0'}}>{s.name}</h3><div style={{color: '#666', fontSize: '0.9rem', display: 'flex', gap: '1rem'}}><span style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}><Clock size={14}/> {s.time}</span><span style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}><Video size={14}/> {s.type}</span></div></div>
        <button className="action-btn">{t('start')}</button>
      </div>
    ))}
  </div>
);

const ReportsView = ({ t }) => (
  <div>
    <h2 className="table-title" style={{marginBottom: '1.5rem'}}>{t('reports')}</h2>
    <div className="grid-4">
      {[{ title: "Progress - Habiba", date: "Jan 15", type: "PDF" }, { title: "Assessment - Youssef", date: "Jan 10", type: "DOCX" }].map((r, i) => (
        <div key={i} className="card" style={{border: '1px solid #e2e8f0'}}>
          <div style={{position: 'absolute', top: 10, right: 10, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 'bold'}}>{r.type}</div>
          <div style={{background: '#E8F4F3', width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#377C76', marginBottom: '1rem'}}><FileText size={20}/></div>
          <h4 style={{margin: '0 0 0.5rem 0'}}>{r.title}</h4>
          <p style={{margin: 0, fontSize: '0.85rem', color: '#999'}}>{r.date}</p>
          <button className="action-btn" style={{marginTop: '1rem', width: '100%', justifyContent: 'center'}}>{t('download')}</button>
        </div>
      ))}
    </div>
  </div>
);

const AssessmentsView = ({ t }) => (
  <div className="table-card">
    <div className="table-header">
      <h2 className="table-title">{t('assessments')}</h2>
      <button className="primary-btn">{t('addNew')}</button>
    </div>
    <div style={{overflowX: 'auto'}}>
      <table className="data-table">
        <thead><tr><th>{t('name')}</th><th>{t('type')}</th><th>{t('date')}</th><th>{t('status')}</th><th>{t('score')}</th><th>{t('action')}</th></tr></thead>
        <tbody>
          {mockAssessments.map(a => (
            <tr key={a.id}>
              <td><div style={{fontWeight: '600', color: '#377C76'}}>{a.student}</div></td>
              <td>{a.type}</td>
              <td>{a.date}</td>
              <td><span style={{padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', background: a.status === 'Completed' ? '#e6fffa' : '#fff7ed', color: a.status === 'Completed' ? '#377C76' : '#c2410c'}}>{a.status}</span></td>
              <td style={{fontWeight: 'bold'}}>{a.score}</td>
              <td><button className="action-btn">{t('view')}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const MessagesView = ({ t }) => (
  <div className="grid-2" style={{gridTemplateColumns: '350px 1fr', height: 'calc(100vh - 180px)', gap: '1.5rem'}}>
    <div className="card" style={{padding: '0', display: 'flex', flexDirection: 'column'}}>
      <div style={{padding: '1.5rem', borderBottom: '1px solid #e2e8f0', fontWeight: '700', fontSize: '1.1rem'}}>{t('messages')}</div>
      <div style={{overflowY: 'auto', flex: 1}}>
        {mockMessages.map(m => (
          <div key={m.id} className="message-item" style={{background: m.unread ? '#f0fdfa' : 'transparent'}}>
            <div className="profile-pic" style={{background: '#cbd5e1', fontSize: '0.9rem'}}>{m.sender.charAt(0)}</div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem'}}>
                <span style={{fontWeight: '600', fontSize: '0.9rem', color: '#1e293b'}}>{m.sender.split(' ')[0]}</span>
                <span style={{fontSize: '0.75rem', color: '#94a3b8'}}>{m.time}</span>
              </div>
              <div style={{fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{m.preview}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    <div className="card" style={{padding: 0, display: 'flex', flexDirection: 'column'}}>
      <div className="chat-window" style={{height: '100%', background: 'white'}}>
        <div className="chat-messages">
          <div className="chat-bubble received">Hello Dr. Rania, I wanted to check on Habiba's progress this week.</div>
          <div className="chat-bubble sent">Hi Mrs. Amal! Habiba is doing great. She showed 15% improvement in reading fluency.</div>
          <div className="chat-bubble received">That is wonderful news! Thank you so much.</div>
        </div>
        <div style={{padding: '1rem', borderTop: '1px solid #e2e8f0'}}>
          <div className="chat-input-area">
            <input className="chat-input" placeholder={t('writeMsg')} />
            <button className="primary-btn" style={{borderRadius: '50%', width: 45, height: 45, padding: 0, justifyContent: 'center'}}><Send size={20}/></button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SettingsView = ({ t }) => (
  <div style={{maxWidth: '800px', margin: '0 auto'}}>
    <div className="card">
      <h3 className="stat-title" style={{marginBottom: '2rem', fontSize: '1.2rem', color: '#377C76'}}>{t('profile')}</h3>
      
      <div style={{display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem'}}>
        <div style={{width: 100, height: 100, borderRadius: '50%', background: '#377C76', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 'bold'}}>DR</div>
        <div>
          <button className="action-btn" style={{marginBottom: '0.5rem'}}>Change Photo</button>
          <div style={{fontSize: '0.9rem', color: '#94a3b8'}}>JPG, GIF or PNG. Max size of 800K</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">{t('fullName')}</label>
          <div style={{position: 'relative'}}>
            <User size={18} style={{position: 'absolute', left: 12, top: 12, color: '#94a3b8'}} />
            <input className="form-input" defaultValue="Dr. Rania" style={{paddingLeft: '2.5rem'}} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">{t('role')}</label>
          <input className="form-input" defaultValue="Speech Specialist" disabled style={{background: '#f1f5f9'}} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('email')}</label>
          <div style={{position: 'relative'}}>
            <Mail size={18} style={{position: 'absolute', left: 12, top: 12, color: '#94a3b8'}} />
            <input className="form-input" defaultValue="rania@drago.com" style={{paddingLeft: '2.5rem'}} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">{t('phone')}</label>
          <div style={{position: 'relative'}}>
            <Phone size={18} style={{position: 'absolute', left: 12, top: 12, color: '#94a3b8'}} />
            <input className="form-input" defaultValue="+20 123 456 7890" style={{paddingLeft: '2.5rem'}} />
          </div>
        </div>
      </div>

      <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem'}}>
        <button className="primary-btn"><Save size={18} /> {t('save')}</button>
      </div>
    </div>
  </div>
);

// --- Main App ---

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [lang, setLang] = useState('en');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students] = useState(initialStudents);

  const t = (k) => translations[lang][k] || k;
  const toggleLang = () => setLang(l => l === 'en' ? 'ar' : 'en');

  const menuItems = [
    { id: 'home', icon: Home, label: 'home' },
    { id: 'students', icon: Users, label: 'students' },
    { id: 'sessions', icon: Calendar, label: 'sessions' },
    { id: 'assessments', icon: ClipboardList, label: 'assessments' },
    { id: 'messages', icon: MessageSquare, label: 'messages' },
    { id: 'reports', icon: FileText, label: 'reports' },
    { id: 'settings', icon: Settings, label: 'settings' },
  ];

  return (
    <>
      <style>{cssStyles}</style>
      <div className={`app-container ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="logo-area">Drago</div>
          <nav className="nav-links">
            {menuItems.map(item => (
              <button key={item.id} onClick={() => {setActiveTab(item.id); setSidebarOpen(false);}} className={`nav-item ${activeTab === item.id ? 'active' : ''}`}>
                <item.icon size={20} />
                <span>{t(item.label)}</span>
                {activeTab === item.id && (lang === 'ar' ? <ChevronLeft size={16} style={{marginRight: 'auto'}}/> : <ChevronRight size={16} style={{marginLeft: 'auto'}}/>)}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button className="nav-item" style={{color: '#fca5a5'}}><LogOut size={20} /><span>{t('logout')}</span></button>
          </div>
        </aside>

        {/* Content */}
        <main className="main-content">
          <header className="top-header">
            <div className="header-left">
              <h2>{t(activeTab)}</h2>
            </div>
            <div className="header-right">
              <div className="search-bar"><Search size={18} color="#94a3b8"/><input placeholder={t('search')} /></div>
              <button onClick={toggleLang} className="icon-btn"><Languages size={20} /></button>
              <button className="icon-btn"><Bell size={20} /><span className="badge-dot"></span></button>
              <div className="profile-pic">DR</div>
            </div>
          </header>

          {activeTab === 'home' && <HomeView t={t} lang={lang} />}
          {activeTab === 'students' && <StudentsView t={t} lang={lang} students={students} />}
          {activeTab === 'sessions' && <SessionsView t={t} />}
          {activeTab === 'reports' && <ReportsView t={t} />}
          {activeTab === 'assessments' && <AssessmentsView t={t} />}
          {activeTab === 'messages' && <MessagesView t={t} />}
          {activeTab === 'settings' && <SettingsView t={t} />}
        </main>

        {/* Mobile Overlay */}
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40}} />}
      </div>
    </>
  );
}