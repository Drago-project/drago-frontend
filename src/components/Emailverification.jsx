import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Emailverification.module.css";
import { usersAPI, doctorsAPI } from "../server/endpoints";

function EmailVerification({ email, userType, onClose, onVerified }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");
  const inputRefs = useRef([]);

  // ----------------- Timer -----------------
  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    setResendTimer(180);
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // ----------------- Handle Change -----------------
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ----------------- Handle KeyDown -----------------
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  // ----------------- Handle Paste -----------------
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
  };

  // ----------------- Auto Verify -----------------
  useEffect(() => {
    if (code.join("").length === 6 && !code.includes("") && !isVerifying) {
      handleVerify();
    }
  }, [code]);

  // ----------------- Handle Verify -----------------
  const handleVerify = async () => {
    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      setError(t("verification.codeIncomplete"));
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response =
        userType === "doctor"
          ? await doctorsAPI.verifyEmail(email, verificationCode)
          : await usersAPI.verifyEmail(email, verificationCode);

      console.log("Email verified successfully", response.data);

      // Extract and store the authentication token from the response
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

      // Store user data if provided
      try {
        const userObj = data.user || data || {};
        localStorage.setItem("userData", JSON.stringify(userObj));
      } catch (e) {
        console.warn("Could not persist user data:", e);
      }

      if (onVerified) {
        onVerified();
      } else if (userType === "doctor") {
        navigate("/dashboard", { replace: true });
      } else {
        const needsPretest = localStorage.getItem("needsPretest") === "true";
        navigate(needsPretest ? "/pretest" : "/home", { replace: true });
      }
    } catch (err) {
      console.error("Verification error:", err);
      if (err.response) {
        const data = err.response.data;
        setError(data?.message || t("verification.failed"));
      } else {
        setError(t("verification.networkError"));
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // ----------------- Handle Resend -----------------
  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;

    setIsResending(true);
    setError("");

    try {
      userType === "doctor"
        ? await doctorsAPI.resendVerification(email)
        : await usersAPI.resendVerification(email);

      setResendTimer(240);
      setSuccessMsg(t("verification.codeSent"));
    } catch (err) {
      console.error("Resend error:", err);
      if (err.response) {
        const data = err.response.data;
        setError(data?.message || t("verification.resendFailed"));
      } else {
        setError(t("verification.networkError"));
      }
    } finally {
      setIsResending(false);
    }
  };

  // ----------------- Render -----------------
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
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        <h2 className={styles.title}>{t("verification.title")}</h2>
        <p className={styles.subtitle}>
          {t("verification.subtitle")} <strong>{email}</strong>
        </p>

        <div className={styles.codeInputContainer}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="tel"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={styles.codeInput}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}
        {successMsg && <p className={styles.successMsg}>{successMsg}</p>}

        <button
          onClick={handleVerify}
          disabled={isVerifying}
          className={styles.verifyBtn}
        >
          {isVerifying ? t("verification.verifying") : t("verification.verify")}
        </button>

        <div className={styles.resendSection}>
          <p className={styles.resendText}>{t("verification.didntReceive")}</p>
          <button
            onClick={handleResend}
            disabled={resendTimer > 0 || isResending}
            className={`${styles.resendBtn} ${
              resendTimer > 0 || isResending ? styles.disabled : ""
            }`}
          >
            {isResending
              ? t("verification.sending")
              : resendTimer > 0
                ? `You can resend in ${formatTime(resendTimer)}`
                : t("verification.resend")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailVerification;
