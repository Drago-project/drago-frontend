import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/Auth.module.css";
import { Link, useNavigate } from "react-router-dom";
import api from "../server/api";
import ForgotPassword from "./ForgotPassword";
import ResetPasswordWithCode from "./ResetPasswordCode";

export default function LoginForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // State for forgot password flow
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    if (errorMessage) setErrorMessage("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.email || !form.password) {
      setErrorMessage(t("login.missingFields"));
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/Auth/login", {
        email: form.email,
        password: form.password,
      });

      const data = response.data || {};
      const token =
        data.token || data.accessToken || data.jwt || data?.data?.token || null;

      if (token) {
        try {
          localStorage.setItem("authToken", token);
        } catch (e) {
          console.warn("Could not persist token:", e);
        }
      }

      try {
        const userObj = data.user || data || {};
        localStorage.setItem("userData", JSON.stringify(userObj));
      } catch (e) {
        console.warn("Could not persist user data:", e);
      }

      const decodeJwt = (jwt) => {
        try {
          const parts = jwt.split(".");
          if (parts.length !== 3) return null;
          const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          const padded = payload.padEnd(
            payload.length + ((4 - (payload.length % 4)) % 4),
            "=",
          );
          const json = atob(padded);
          return JSON.parse(json);
        } catch (e) {
          console.warn("Failed to decode JWT:", e);
          return null;
        }
      };

      let role = null;
      if (token) {
        const decoded = decodeJwt(token);
        if (decoded) {
          role =
            decoded.role ||
            decoded.roles ||
            decoded.roleName ||
            decoded.userRole ||
            null;
          if (Array.isArray(role) && role.length > 0) role = role[0];
        }
      }

      if (!role) {
        role = data.role || data.user?.role || data?.result?.role || null;
        if (Array.isArray(role) && role.length > 0) role = role[0];
      }

      const roleStr = (role || "").toString().toLowerCase();
      if (roleStr.includes("doctor") || roleStr.includes("dr")) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response) {
        setErrorMessage(
          err.response.data?.message || t("login.failed") || "Login failed",
        );
      } else {
        setErrorMessage(t("login.networkError") || "Network error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password flow
  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
  };

  const handleCodeSent = (email) => {
    setResetEmail(email);
    setShowForgotPassword(false);
    setShowResetPassword(true);
  };

  const handleResetSuccess = () => {
    setShowResetPassword(false);
    setResetEmail("");
    // Optionally show a success message
  };

  return (
    <>
      <h2 className={styles["title"]}>{t("login.title")}</h2>
      <p className={styles["subtitle"]}>{t("login.subtitle")}</p>

      {errorMessage && (
        <div className={styles["error-banner"]}>{errorMessage}</div>
      )}

      <form onSubmit={handleSubmit} className={styles["auth-form"]}>
        <input
          type="text"
          name="email"
          placeholder={t("login.emailPlaceholder")}
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder={t("login.passwordPlaceholder")}
          value={form.password}
          onChange={handleChange}
          required
          style={{ fontFamily: "monospace" }}
        />

        {/* Forgot Password Link */}
        <div
          style={{
            textAlign: "right",
            marginTop: "-8px",
            marginBottom: "12px",
          }}
        >
          <button
            type="button"
            onClick={handleForgotPasswordClick}
            style={{
              background: "none",
              border: "none",
              color: "#1877f2",
              fontSize: "14px",
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            {t("login.forgotPassword") || "Forgot password?"}
          </button>
        </div>

        <button type="submit" className={styles["auth-btn"]} disabled={loading}>
          {loading ? "..." : t("login.loginButton")}
        </button>
      </form>

      <p className={styles["auth-link"]}>
        <Link to="/auth/signup">{t("login.createAccount")}</Link>
      </p>

      {/* Forgot Password Modal - Step 1: Enter Email */}
      {showForgotPassword && (
        <ForgotPassword
          onClose={() => setShowForgotPassword(false)}
          onCodeSent={handleCodeSent}
        />
      )}

      {/* Reset Password Modal - Step 2: Enter Code + New Password */}
      {showResetPassword && (
        <ResetPasswordWithCode
          email={resetEmail}
          onClose={() => {
            setShowResetPassword(false);
            setResetEmail("");
          }}
          onSuccess={handleResetSuccess}
        />
      )}
    </>
  );
}
