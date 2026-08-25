// src/server/auth.js
export const GUEST_MODE_KEY = "drago_guest_mode";

export const getAuthUser = () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    const encodedPayload = token.split(".")[1];
    const payload = JSON.parse(
      atob(
        encodedPayload
          .replace(/-/g, "+")
          .replace(/_/g, "/")
          .padEnd(
            encodedPayload.length + ((4 - (encodedPayload.length % 4)) % 4),
            "=",
          ),
      ),
    );

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

export const isGuestMode = () => {
  return localStorage.getItem(GUEST_MODE_KEY) === "true";
};

export const getProgressStorageKey = (key) => {
  if (isGuestMode() && !localStorage.getItem("authToken")) {
    return `${key}:guest`;
  }

  const user = getAuthUser();
  return user?.userId ? `${key}:user:${user.userId}` : `${key}:guest`;
};

export const startGuestMode = () => {
  localStorage.setItem(GUEST_MODE_KEY, "true");
};

export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem(GUEST_MODE_KEY);
  // Redirect to landing page after logout
  window.location.href = "/";
};
