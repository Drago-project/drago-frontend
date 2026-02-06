import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Emailverification.module.css";
import api from "../server/api";

function EmailVerification({ email, userType, onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef([]);

  // Timer for resend button cooldown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Take only the last digit
    setCode(newCode);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
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

    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const verificationCode = code.join("");
    
    if (verificationCode.length !== 6) {
      setError(t("verification.codeIncomplete"));
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const endpoint = userType === "doctor" 
        ? "/api/Doctors/verify-email"
        : "/api/Users/verify-email";

      const response = await api.post(endpoint, {
        email: email,
        code: verificationCode,
      });

      console.log("✅ Email verified successfully", response.data);
      
      // Success! Navigate based on user type
      if (userType === "doctor") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/home", { replace: true });
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

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;

    setIsResending(true);
    setError("");

    try {
      const endpoint = userType === "doctor"
        ? "/api/Doctors/resend-verification"
        : "/api/Users/resend-verification";

      await api.post(endpoint, { email: email });

      setResendTimer(60); // 60 second cooldown
      alert(t("verification.codeSent"));
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
              type="text"
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
            className={styles.resendBtn}
          >
            {isResending
              ? t("verification.sending")
              : resendTimer > 0
                ? `${t("verification.resend")} (${resendTimer}s)`
                : t("verification.resend")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailVerification;