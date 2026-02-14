import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import styles from "../styles/Emailverification.module.css";
import api from "../server/api";

function ResetPassword() {
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

  // Validate token on mount
  useEffect(() => {
    validateToken();
  }, []);

  const validateToken = async () => {
    if (!formData.email || !formData.token) {
      setTokenValid(false);
      setError("Invalid reset link. Missing email or token.");
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
        setError("This password reset link is invalid or has expired.");
      }
    } catch (err) {
      setTokenValid(false);
      setError("Invalid reset link. Please request a new password reset.");
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
      Boolean
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
      setError("Passwords do not match");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
    if (!passwordRegex.test(formData.newPassword)) {
      setError(
        "Password must contain uppercase, lowercase, number, and special character"
      );
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

      setSuccessMsg(
        response.data.message || "Password reset successfully!"
      );

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      if (err.response) {
        const data = err.response.data;
        setError(
          data?.message || "Failed to reset password. Please try again."
        );
      } else {
        setError("Network error. Please check your connection.");
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
            <div
              style={{
                width: "60px",
                height: "60px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #44958e",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
          </div>
          <h2 className={styles.title}>Validating Reset Link...</h2>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
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
          <h2 className={styles.title}>Invalid Reset Link</h2>
          <p className={styles.subtitle}>{error}</p>
          <button
            onClick={() => navigate("/auth/login")}
            className={styles.verifyBtn}
            style={{ marginTop: "20px" }}
          >
            Go to Login
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

        <h2 className={styles.title}>Reset Password</h2>
        <p className={styles.subtitle}>Enter your new password below.</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <input
              type="password"
              placeholder="New Password"
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
                transition: "all 0.3s ease",
              }}
              required
              disabled={loading}
              minLength={8}
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
                Password strength: {passwordStrength}
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
              Must be 8+ characters with uppercase, lowercase, number, and
              special character
            </small>
          </div>

          <input
            type="password"
            placeholder="Confirm New Password"
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
              transition: "all 0.3s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#44958e";
              e.target.style.boxShadow = "0 0 0 3px rgba(68, 149, 142, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e9ecef";
              e.target.style.boxShadow = "none";
            }}
            required
            disabled={loading}
          />

          {error && <p className={styles.errorMsg}>{error}</p>}
          {successMsg && <p className={styles.successMsg}>{successMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className={styles.verifyBtn}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;