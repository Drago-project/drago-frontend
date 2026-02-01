import React, { useState } from "react";
import styles from "../styles/Dashboard.module.css";

// Mock data for students
const initialStudents = [
  {
    id: 1,
    name: "Habiba Mohamed",
    age: 9,
    level: "Level 3",
    diagnosis: "Dyslexia, ADHD",
    progress: 70,
    avatar: "HM",
  },
  {
    id: 2,
    name: "Sara Medhat",
    age: 10,
    level: "Level 2",
    diagnosis: "Dyslexia",
    progress: 65,
    avatar: "SM",
  },
  {
    id: 3,
    name: "Mazen Ali",
    age: 8,
    level: "Level 4",
    diagnosis: "Dyslexia, Dysgraphia",
    progress: 85,
    avatar: "MA",
  },
  {
    id: 4,
    name: "Youssef Gamal",
    age: 11,
    level: "Level 3",
    diagnosis: "Dyslexia",
    progress: 75,
    avatar: "YG",
  },
  {
    id: 5,
    name: "Nourhan Salah",
    age: 9,
    level: "Level 2",
    diagnosis: "Dyslexia",
    progress: 60,
    avatar: "NS",
  },
];

// Mock data for upcoming sessions
const upcomingSessions = [
  { time: "10:00 AM", student: "Habiba Mohamed", duration: "45 min" },
  { time: "11:00 AM", student: "Sara Medhat", duration: "60 min" },
  { time: "2:00 PM", student: "Mazen Ali", duration: "30 min" },
];

// Mock data for recent activity
const recentActivity = [
  {
    type: "assignment",
    text: "New assignment submitted by Chloe Patel",
    time: "Today, 9:15 AM",
  },
  {
    type: "completed",
    text: "Session completed with Leo Johnson",
    time: "Yesterday, 3:30 PM",
  },
  {
    type: "report",
    text: "Report generated for Noah Davis",
    time: "Yesterday, 11:00 AM",
  },
];

function Dashboard() {
  const [students] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toString().includes(searchTerm)
  );

  const getProgressColor = (progress) => {
    if (progress >= 80) return "var(--color-primary)";
    if (progress >= 60) return "var(--color-secondary)";
    return "#FF9800";
  };

  return (
    <div className={styles.dashboardContainer}>
      <Header />
      <div className={styles.dashboardContent}>
        {/* Overview Cards */}
        <section className={styles.overviewSection}>
          <h2 className={styles.sectionTitle}>
            <svg 
              className={styles.titleIcon} 
              width="28" 
              height="28" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Dashboard Overview
          </h2>
          <div className={styles.statsGrid}>
            <div
              className={styles.statCard}
              style={{ borderTopColor: "var(--color-primary)" }}
            >
              <div
                className={styles.statIcon}
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                <svg 
                  width="32" 
                  height="32" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>24</h3>
                <p className={styles.statLabel}>Students</p>
              </div>
            </div>

            <div
              className={styles.statCard}
              style={{ borderTopColor: "var(--color-secondary)" }}
            >
              <div
                className={styles.statIcon}
                style={{ backgroundColor: "var(--color-secondary)" }}
              >
                <svg 
                  width="32" 
                  height="32" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>8</h3>
                <p className={styles.statLabel}>Upcoming Sessions</p>
              </div>
            </div>

            <div
              className={styles.statCard}
              style={{ borderTopColor: "var(--color-avatar)" }}
            >
              <div
                className={styles.statIcon}
                style={{ backgroundColor: "var(--color-avatar)" }}
              >
                <span className={styles.warningBadge}>
                  <svg 
                    width="32" 
                    height="32" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span className={styles.badgeCount}>3</span>
                </span>
              </div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>3</h3>
                <p className={styles.statLabel}>Unreviewed Assignments</p>
              </div>
            </div>

            <div
              className={styles.statCard}
              style={{ borderTopColor: "var(--color-accent)" }}
            >
              <div
                className={styles.statIcon}
                style={{ backgroundColor: "var(--color-accent)" }}
              >
                <svg 
                  width="32" 
                  height="32" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>78%</h3>
                <p className={styles.statLabel}>Overall Progress</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className={styles.dashboardMain}>
          <div className={styles.mainContent}>
            {/* Students Management Section */}
            <section className={styles.studentsSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <svg 
                    className={styles.titleIcon} 
                    width="28" 
                    height="28" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Students List
                </h2>
                <button className={styles.addButton}>
                  <svg 
                    className={styles.addIcon} 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add Student
                </button>
              </div>

              {/* Search Bar */}
              <div className={styles.searchContainer}>
                <svg 
                  className={styles.searchIcon} 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search by name or ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Students Table */}
              <div className={styles.tableContainer}>
                <table className={styles.studentsTable}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Level</th>
                      <th>Diagnosis</th>
                      <th>Progress</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <div className={styles.studentName}>
                            <div className={styles.avatar}>{student.avatar}</div>
                            <span>{student.name}</span>
                          </div>
                        </td>
                        <td>{student.age}</td>
                        <td>
                          <span className={styles.levelBadge}>{student.level}</span>
                        </td>
                        <td>{student.diagnosis}</td>
                        <td>
                          <div className={styles.progressContainer}>
                            <div className={styles.progressBar}>
                              <div
                                className={styles.progressFill}
                                style={{
                                  width: `${student.progress}%`,
                                  backgroundColor: getProgressColor(
                                    student.progress
                                  ),
                                }}
                              ></div>
                            </div>
                            <span className={styles.progressText}>
                              {student.progress}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <button className={styles.viewButton}>
                            <svg 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Sidebar Content */}
          <aside className={styles.sidebarContent}>
            {/* Upcoming Sessions */}
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Upcoming Sessions
              </h3>
              <div className={styles.sessionsList}>
                {upcomingSessions.map((session, index) => (
                  <div key={index} className={styles.sessionItem}>
                    <div className={styles.sessionIcon}>
                      <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </div>
                    <div className={styles.sessionDetails}>
                      <p className={styles.sessionTime}>
                        {session.time} - {session.student}
                      </p>
                      <p className={styles.sessionDuration}>
                        ({session.duration})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                Recent Activity
              </h3>
              <div className={styles.activityList}>
                {recentActivity.map((activity, index) => (
                  <div key={index} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      {activity.type === "assignment" && (
                        <svg 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                      )}
                      {activity.type === "completed" && (
                        <svg 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                      {activity.type === "report" && (
                        <svg 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="20" x2="18" y2="10"/>
                          <line x1="12" y1="20" x2="12" y2="4"/>
                          <line x1="6" y1="20" x2="6" y2="14"/>
                        </svg>
                      )}
                    </div>
                    <div className={styles.activityDetails}>
                      <p className={styles.activityText}>{activity.text}</p>
                      <p className={styles.activityTime}>{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className={styles.dashboardHeader}>
      <div className={styles.headerLeft}>
        <div className={styles.logoContainer}></div>
        <h1 className={styles.dashboardTitle}>Specialist Dashboard</h1>
      </div>
      <div className={styles.headerRight}>
        <button className={styles.notificationBtn}>
          <svg 
            className={styles.notificationIcon} 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className={styles.badge}>1</span>
        </button>
        <div className={styles.userAvatar}>D</div>
      </div>
    </header>
  );
}

export default Dashboard;
