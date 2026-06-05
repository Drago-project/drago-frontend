import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto logout on 401, but do not redirect during login attempts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";
      const isLoginRequest = requestUrl.includes("/api/Auth/login");

      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");

      if (!isLoginRequest) {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  },
);
export default api;
