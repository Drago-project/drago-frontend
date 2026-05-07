import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "../styles/Emailverification.module.css";
import { authAPI } from "../server/endpoints";

function ResetPasswordCode({ email, onClose, onSuccess }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const inputRefs = useRef([]);

  // Timer for resend
  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    setResendTimer(180); // 3 minutes cooldown
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Handle code input
  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-show password fields when all 6 digits are entered
    if (newCode.join("").length === 6 && !newCode.includes("")) {
      setShowPasswordFields(true);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (pastedData.length === 6) {
      setShowPasswordFields(true);
    }
  };

  // Password strength checker
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
    setNewPassword(password);
    setPasswordStrength(checkPasswordStrength(password));
    setError("");
  };

  // Handle reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    const resetCode = code.join("");

    if (resetCode.length !== 6) {
      setError(t("resetPassword.invalidCode"));
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError(t("resetPassword.invalidCode"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("resetPassword.passwordMismatch"));
      return;
    }

    if (newPassword.length < 8) {
      setError(t("resetPassword.passwordTooShort"));
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
    if (!passwordRegex.test(newPassword)) {
      setError(t("resetPassword.passwordWeak"));
      return;
    }

    setIsResetting(true);
    setError("");

    try {
      const response = await authAPI.resetPassword(
        email,
        resetCode,
        newPassword,
        confirmPassword,
      );

      console.log("Password reset successfully", response.data);

      setSuccessMsg(t("resetPassword.successMessage"));

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/auth/login", { replace: true });
        }
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      if (err.response) {
        const data = err.response.data;
        setError(data?.message || t("resetPassword.errorMessage"));
      } else {
        setError(t("resetPassword.networkError"));
      }
    } finally {
      setIsResetting(false);
    }
  };

  // Resend code
  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;

    setIsResending(true);
    setError("");

    try {
      await authAPI.forgotPassword(email);

      setResendTimer(240); // 4 minutes cooldown
      setSuccessMsg(t("resetPassword.codeSent"));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Resend error:", err);
      if (err.response) {
        const data = err.response.data;
        setError(data?.message || t("resetPassword.errorMessage"));
      } else {
        setError(t("resetPassword.networkError"));
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

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
          {t("resetPassword.subtitle")} <strong>{email}</strong>
        </p>

        <form onSubmit={handleResetPassword}>
          {/* 6-Digit Code Input */}
          <div className={styles.codeInputContainer}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="tel"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={styles.codeInput}
                autoFocus={index === 0}
                disabled={isResetting}
              />
            ))}
          </div>

          {/* Password Fields - Show after code is complete */}
          {showPasswordFields && (
            <div style={{ marginTop: "20px", animation: "fadeIn 0.3s ease" }}>
              <div style={{ marginBottom: "20px" }}>
                <input
                  type="password"
                  placeholder={t("resetPassword.newPasswordPlaceholder")}
                  value={newPassword}
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
                  disabled={isResetting}
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
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
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
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(68, 149, 142, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e9ecef";
                  e.target.style.boxShadow = "none";
                }}
                required
                disabled={isResetting}
              />
            </div>
          )}

          {error && <p className={styles.errorMsg}>{error}</p>}
          {successMsg && <p className={styles.successMsg}>{successMsg}</p>}

          <button
            type="submit"
            disabled={isResetting || !showPasswordFields}
            className={styles.verifyBtn}
            style={{
              opacity: !showPasswordFields ? 0.5 : 1,
              cursor: !showPasswordFields ? "not-allowed" : "pointer",
            }}
          >
            {isResetting
              ? t("resetPassword.resetting")
              : t("resetPassword.resetButton")}
          </button>
        </form>

        {/* Resend Code Section */}
        <div className={styles.resendSection}>
          <p className={styles.resendText}>{t("resetPassword.didntReceive")}</p>
          <button
            onClick={handleResend}
            disabled={resendTimer > 0 || isResending}
            className={`${styles.resendBtn} ${
              resendTimer > 0 || isResending ? styles.disabled : ""
            }`}
          >
            {isResending
              ? t("resetPassword.resending")
              : resendTimer > 0
                ? `${t("resetPassword.resendIn")} ${formatTime(resendTimer)}`
                : t("resetPassword.resendCode")}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default ResetPasswordCode;
