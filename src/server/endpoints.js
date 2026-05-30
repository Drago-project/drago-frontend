// Centralized API service - all backend endpoints

import api from "./api";

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────
export const authAPI = {
  login: (email, password) => api.post("/api/Auth/login", { email, password }),

  forgotPassword: (email) => api.post("/api/Auth/forgot-password", { email }),

  resetPassword: (email, token, newPassword, confirmPassword) =>
    api.post("/api/Auth/reset-password", {
      email,
      token,
      code: token,
      resetCode: token,
      newPassword,
      password: newPassword,
      confirmPassword,
      passwordConfirmation: confirmPassword,
    }),

  validateResetToken: (email, token) =>
    api.post("/api/Auth/validate-reset-token", {
      email,
      token,
      code: token,
      resetCode: token,
    }),
};

// ─────────────────────────────────────────
// USERS
// ─────────────────────────────────────────
export const usersAPI = {
  register: (data) => api.post("/api/Users/register", data),
  verifyEmail: (email, code) =>
    api.post("/api/Users/verify-email", { email, code }),
  resendVerification: (email) =>
    api.post("/api/Users/resend-verification", { email }),
  getById: (id) => api.get(`/api/Users/${id}`),
};

// ─────────────────────────────────────────
// DOCTORS
// ─────────────────────────────────────────
export const doctorsAPI = {
  register: (data) => api.post("/api/Doctors/register", data),
  verifyEmail: (email, code) =>
    api.post("/api/Doctors/verify-email", { email, code }),
  resendVerification: (email) =>
    api.post("/api/Doctors/resend-verification", { email }),
  getById: (id) => api.get(`/api/Doctors/${id}`),
};

// ─────────────────────────────────────────
// DOCTOR SETTINGS
// ─────────────────────────────────────────
export const doctorSettingsAPI = {
  get: () => api.get("/api/DoctorSettings/settings"),
  update: (data) => api.put("/api/DoctorSettings/settings", data),
  changePassword: (oldPassword, newPassword, confirmPassword) =>
    api.post("/api/DoctorSettings/change-password", {
      oldPassword,
      newPassword,
      confirmPassword,
    }),
  uploadPhoto: (file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/api/DoctorSettings/upload-photo", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ─────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get("/api/Dashboard/stats"),
};

// ─────────────────────────────────────────
// STUDENTS
// ─────────────────────────────────────────
export const studentsAPI = {
  getAll: () => api.get("/api/Students"),
  getById: (id) => api.get(`/api/Students/${id}`),
  search: (query) => api.get(`/api/Students/search?q=${query}`),
  create: (data) => api.post("/api/Students", data),
  update: (id, data) => api.put(`/api/Students/${id}`, data),
  assignByEmail: (email) =>
    api.post("/api/Students/assign-by-email", { email }),
};
// ─────────────────────────────────────────
// SESSIONS
// ─────────────────────────────────────────
export const sessionsAPI = {
  getAll: () => api.get("/api/Sessions"),
  create: (studentId, dateTime, type) =>
    api.post("/api/Sessions", { studentId, dateTime, type }),
  start: (id) => api.put(`/api/Sessions/${id}/start`),
};

// ─────────────────────────────────────────
// ASSESSMENTS
// ─────────────────────────────────────────
export const assessmentsAPI = {
  getAll: () => api.get("/api/Assessments"),
  getById: (id) => api.get(`/api/Assessments/${id}`),
  create: (studentId, type, date) =>
    api.post("/api/Assessments", { studentId, type, date }),
  complete: (id, score) =>
    api.put(`/api/Assessments/${id}/complete`, { score }),
};

// ─────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────
export const messagesAPI = {
  getByStudent: (studentId) => api.get(`/api/Messages/${studentId}`),
  getConversations: () => api.get("/api/Messages/conversations"),
  send: (receiverId, studentId, content) =>
    api.post("/api/Messages", { receiverId, studentId, content }),
};

// ─────────────────────────────────────────
// PROGRESS
// ─────────────────────────────────────────
export const progressAPI = {
  create: (data) => api.post("/api/Progress", data),
  getByUser: (userId) => api.get(`/api/Progress/user/${userId}`),
  getSummary: (userId) => api.get(`/api/Progress/user/${userId}/summary`),
};

// ─────────────────────────────────────────
// RECOMMENDATIONS
// ─────────────────────────────────────────
export const recommendationsAPI = {
  getAll: () => api.get("/api/Recommendations"),
  getByUser: (userId) => api.get(`/api/Recommendations/${userId}`),
};

// ─────────────────────────────────────────
// EXERCISES
// ─────────────────────────────────────────
export const exercisesAPI = {
  getAll: () => api.get("/api/Exercises"),
  getById: (id) => api.get(`/api/Exercises/${id}`),
  create: (data) => api.post("/api/Exercises", data),
  update: (id, data) => api.put(`/api/Exercises/${id}`, data),
  delete: (id) => api.delete(`/api/Exercises/${id}`),
};

// ─────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────
export const profileAPI = {
  get: (userId) => api.get(`/api/Profile/${userId}`),
  awardXP: (userId, xp, sessionCompleted = false) =>
    api.put(`/api/Profile/${userId}/award-xp`, { xp, sessionCompleted }),
  updateSettings: (userId, username, avatarUrl, dailyGoalXp) =>
    api.put(`/api/Profile/${userId}/settings`, {
      username,
      avatarUrl,
      dailyGoalXp,
    }),
};

// ─────────────────────────────────────────
// HUT GAME
// ─────────────────────────────────────────
export const hutGameAPI = {
  getLevels: () => api.get("/api/hutgame/levels"),
  getRandomWord: (levelNumber) =>
    api.get(`/api/hutgame/levels/${levelNumber}/random-word`),

  // Sessions
  startSession: (userId, levelNumber) =>
    api.post("/api/hutgame/sessions/start", { userId, levelNumber }),
  submitAnswer: (sessionId, isCorrect) =>
    api.put(`/api/hutgame/sessions/${sessionId}/answer`, { isCorrect }),
  finishSession: (sessionId, timeSeconds) =>
    api.put(`/api/hutgame/sessions/${sessionId}/finish`, { timeSeconds }),
  getSession: (sessionId) => api.get(`/api/hutgame/sessions/${sessionId}`),
  getUserSessions: (userId) => api.get(`/api/hutgame/sessions/user/${userId}`),
};

// ─────────────────────────────────────────
// SHALAL GAME (Reading Quest)
// ─────────────────────────────────────────
export const shalalAPI = {
  getLevels: () => api.get("/api/shalal/levels"),
  getRandomQuestion: (levelNumber) =>
    api.get(`/api/shalal/levels/${levelNumber}/random-question`),

  // Sessions
  startSession: (userId, levelNumber) =>
    api.post("/api/shalal/sessions/start", { userId, levelNumber }),
  submitAnswer: (sessionId, isCorrect) =>
    api.put(`/api/shalal/sessions/${sessionId}/answer`, { isCorrect }),
  finishSession: (sessionId, timeSeconds) =>
    api.put(`/api/shalal/sessions/${sessionId}/finish`, { timeSeconds }),
  getSession: (sessionId) => api.get(`/api/shalal/sessions/${sessionId}`),
  getUserSessions: (userId) => api.get(`/api/shalal/sessions/user/${userId}`),
};

// ─────────────────────────────────────────
// AUDIT
// ─────────────────────────────────────────
export const auditAPI = {
  getLatest: () => api.get("/api/Audit/latest"),
};
