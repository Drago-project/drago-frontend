import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/Auth.module.css";
import { Link } from "react-router-dom";

export default function LoginForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      alert(t("login.missingFields"));
      return;
    }
    console.log("Logging in with:", form);
  };

  return (
    <>
      <h2 className={styles["title"]}>{t("login.title")}</h2>
      <p className={styles["subtitle"]}>{t("login.subtitle")}</p>

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
        />

        <button type="submit" className={styles["auth-btn"]}>
          {t("login.loginButton")}
        </button>
      </form>

      <p className={styles["auth-link"]}>
        <Link to="/auth/signup">{t("login.createAccount")}</Link>
      </p>
    </>
  );
}


