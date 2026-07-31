// src/server/auth.js
export const getAuthUser = () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));

    return {
      userId:
        payload.userId ||
        payload.sub ||
        payload.nameid ||
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ],
      role: payload.role || payload.roles,
      email: payload.email,
    };
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("authToken");
};

export const logout = () => {
  localStorage.removeItem("authToken");
  // Redirect to landing page after logout
  window.location.href = "/";
};
