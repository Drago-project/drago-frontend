import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/Emailverification.module.css";
import api from "../server/api";

function ForgotPassword({ onClose, onCodeSent }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await api.post("/api/Auth/forgot-password", {
        email: email.trim(),
      });

      console.log("Password reset code sent successfully", response.data);

      setSuccessMsg("A 6-digit code has been sent to your email!");

      // Call onCodeSent callback after showing success message
      setTimeout(() => {
        if (onCodeSent) {
          onCodeSent(email);
        }
      }, 1500);
    } catch (err) {
      console.error("Forgot password error:", err);
      if (err.response) {
        const data = err.response.data;
        setError(
          data?.message || "Failed to send reset code. Please try again.",
        );
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
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

        <h2 className={styles.title}>Forgot Password</h2>
        <p className={styles.subtitle}>
          Enter your email address and we'll send you a 6-digit code to reset
          your password.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
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
            disabled={isLoading}
          />

          {error && <p className={styles.errorMsg}>{error}</p>}
          {successMsg && <p className={styles.successMsg}>{successMsg}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className={styles.verifyBtn}
          >
            {isLoading ? "Sending..." : "Send Reset Code"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
