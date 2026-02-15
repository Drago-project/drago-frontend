import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // استيراد Hook الترجمة
import styles from "../styles/Emailverification.module.css";
import api from "../server/api";

function ResetPassword() {
  const { t } = useTranslation(); // تفعيل الترجمة
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: searchParams.get("email") || "",
    token: searchParams.get("token") || "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");

  useEffect(() => {
    validateToken();
  }, []);

  const validateToken = async () => {
    if (!formData.email || !formData.token) {
      setTokenValid(false);
      setError(t("resetPassword.errorMessage")); // استخدام الترجمة من الملف
      setValidating(false);
      return;
    }

    try {
      const response = await api.post("/api/Auth/validate-reset-token", {
        email: formData.email,
        token: formData.token,
      });

      setTokenValid(response.data.success);

      if (!response.data.success) {
        setError(t("resetPassword.errorMessage"));
      }
    } catch (err) {
      setTokenValid(false);
      setError(t("resetPassword.errorMessage"));
    } finally {
      setValidating(false);
    }
  };

  const checkPasswordStrength = (password) => {
    if (password.length === 0) return "";
    if (password.length < 8) return "weak";

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);

    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(
      Boolean,
    ).length;

    if (score < 3) return "weak";
    if (score === 3) return "medium";
    return "strong";
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({ ...formData, newPassword: password });
    setPasswordStrength(checkPasswordStrength(password));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError(t("resetPassword.passwordMismatch"));
      return;
    }

    if (formData.newPassword.length < 8) {
      setError(t("resetPassword.passwordTooShort"));
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
    if (!passwordRegex.test(formData.newPassword)) {
      setError(t("resetPassword.passwordWeak"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/Auth/reset-password", {
        email: formData.email,
        token: formData.token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setSuccessMsg(response.data.message || t("resetPassword.successMessage"));

      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || t("resetPassword.errorMessage"));
      } else {
        setError(t("resetPassword.networkError"));
      }
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.iconContainer}>
            <div className={styles.spinner} />{" "}
            {/* يفضل نقل الـ CSS للملف الخاص به */}
          </div>
          <h2 className={styles.title}>{t("resetPassword.resetting")}</h2>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.iconContainer}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f44336"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className={styles.title}>{t("resetPassword.errorMessage")}</h2>
          <button
            onClick={() => navigate("/auth/login")}
            className={styles.verifyBtn}
            style={{ marginTop: "20px" }}
          >
            {t("signup.alreadyAccount").split("?")[1] || "Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.iconContainer}>
          <svg
            className={styles.emailIcon}
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2 className={styles.title}>{t("resetPassword.title")}</h2>
        <p className={styles.subtitle}>
          {t("resetPassword.subtitle")} {formData.email}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <input
              type="password"
              placeholder={t("resetPassword.newPasswordPlaceholder")}
              value={formData.newPassword}
              onChange={handlePasswordChange}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: `3px solid ${
                  passwordStrength === "strong"
                    ? "#4caf50"
                    : passwordStrength === "medium"
                      ? "#ff9800"
                      : "#e9ecef"
                }`,
                fontSize: "1rem",
                fontFamily: "inherit",
              }}
              required
              disabled={loading}
            />
            {passwordStrength && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  backgroundColor:
                    passwordStrength === "strong"
                      ? "#e8f5e9"
                      : passwordStrength === "medium"
                        ? "#fff3e0"
                        : "#ffebee",
                  color:
                    passwordStrength === "strong"
                      ? "#2e7d32"
                      : passwordStrength === "medium"
                        ? "#e65100"
                        : "#c62828",
                }}
              >
                {t("resetPassword.passwordStrength")}:{" "}
                {t(`resetPassword.${passwordStrength}`)}
              </div>
            )}
            <small
              style={{
                display: "block",
                marginTop: "6px",
                color: "#6c757d",
                fontSize: "0.85rem",
              }}
            >
              {t("resetPassword.passwordRequirements")}
            </small>
          </div>

          <input
            type="password"
            placeholder={t("resetPassword.confirmPasswordPlaceholder")}
            value={formData.confirmPassword}
            onChange={(e) => {
              setFormData({ ...formData, confirmPassword: e.target.value });
              setError("");
            }}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "12px",
              border: "3px solid #e9ecef",
              fontSize: "1rem",
              marginBottom: "20px",
              fontFamily: "inherit",
            }}
            required
            disabled={loading}
          />

          {error && <p className={styles.errorMsg}>{error}</p>}
          {successMsg && <p className={styles.successMsg}>{successMsg}</p>}

          <button type="submit" disabled={loading} className={styles.verifyBtn}>
            {loading
              ? t("resetPassword.resetting")
              : t("resetPassword.resetButton")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
