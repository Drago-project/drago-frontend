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
    icon: "📄",
    text: "New assignment submitted by Chloe Patel",
    time: "Today, 9:15 AM",
  },
  {
    icon: "✓",
    text: "Session completed with Leo Johnson",
    time: "Yesterday, 3:30 PM",
  },
  {
    icon: "📊",
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
          <span className={styles.titleIcon}>📊</span>
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
              🎒
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
              📅
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
                ⚠️<span className={styles.badgeCount}>3</span>
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
              📈
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
                <span className={styles.titleIcon}>👥</span>
                Students List
              </h2>
              <button className={styles.addButton}>
                <span className={styles.addIcon}>+</span>
                Add Student
              </button>
            </div>

            {/* Search Bar */}
            <div className={styles.searchContainer}>
              <span className={styles.searchIcon}>🔍</span>
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
                      <td>{student.level}</td>
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
            <h3 className={styles.sidebarTitle}>Upcoming Sessions Preview</h3>
            <div className={styles.sessionsList}>
              {upcomingSessions.map((session, index) => (
                <div key={index} className={styles.sessionItem}>
                  <div className={styles.sessionIcon}>🕐</div>
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
            <h3 className={styles.sidebarTitle}>Recent Activity</h3>
            <div className={styles.activityList}>
              {recentActivity.map((activity, index) => (
                <div key={index} className={styles.activityItem}>
                  <div className={styles.activityIcon}>{activity.icon}</div>
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
    <>
      {/* Header */}
      <header className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.logoContainer}></div>
          <h1 className={styles.dashboardTitle}>Specialist Dashboard</h1>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.notificationBtn}>
            <span className={styles.notificationIcon}>🔔</span>
            <span className={styles.badge}>1</span>
          </button>
          <div className={styles.userAvatar}>D</div>
        </div>
      </header>
    </>
  );
}
export default Dashboard;
