import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/Auth.module.css";
import { Link } from "react-router-dom";

export default function SignUpForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
    usage: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert(t("signup.passwordsMismatch"));
      return;
    }
    console.log(form);
  };

  return (
    <>
      <h2 className={styles["title"]}>{t("signup.title")}</h2>
      <p className={styles["subtitle"]}>{t("signup.subtitle")}</p>

      <form onSubmit={handleSubmit} className={styles["auth-form"]}>
        <div className={styles["row"]}>
          <input
            type="text"
            name="firstName"
            placeholder={t("signup.firstName")}
            value={form.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder={t("signup.lastName")}
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <label className={styles["label"]}>{t("signup.dobLabel")}</label>
        <div className={styles["row"]}>
          <select
            name="dobDay"
            value={form.dobDay}
            onChange={handleChange}
            required
          >
            <option value="">{t("signup.day")}</option>
            {[...Array(31)].map((_, i) => (
              <option key={i + 1}>{i + 1}</option>
            ))}
          </select>
          <select
            name="dobMonth"
            value={form.dobMonth}
            onChange={handleChange}
            required
          >
            <option value="">{t("signup.month")}</option>
            <option>Jan</option>
            <option>Feb</option>
            <option>Mar</option>
            <option>Apr</option>
            <option>May</option>
            <option>Jun</option>
            <option>Jul</option>
            <option>Aug</option>
            <option>Sep</option>
            <option>Oct</option>
            <option>Nov</option>
            <option>Dec</option>
          </select>
          <select
            name="dobYear"
            value={form.dobYear}
            onChange={handleChange}
            required
          >
            <option value="">{t("signup.year")}</option>
            {Array.from({ length: 100 }, (_, i) => 2025 - i).map((year) => (
              <option key={year}>{year}</option>
            ))}
          </select>
        </div>

        <label className={styles["label"]}>{t("signup.genderLabel")}</label>
        <div className={`${styles["row"]} ${styles["gender"]}`}>
          <label>
            <input
              type="radio"
              name="gender"
              value="Female"
              onChange={handleChange}
              required
            /> {t("signup.female")}
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="Male"
              onChange={handleChange}
            /> {t("signup.male")}
          </label>
        </div>

        <input
          type="text"
          name="email"
          placeholder={t("signup.emailPlaceholder")}
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder={t("signup.passwordPlaceholder")}
          value={form.password}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder={t("signup.confirmPasswordPlaceholder")}
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />

        <label className={styles["label"]}>{t("signup.usageLabel")}</label>
        <select
          name="usage"
          value={form.usage}
          onChange={handleChange}
          required
          className={styles["usage-select"]}
        >
          <option value="">{t("signup.choose")}</option>
          <option value="school">{t("signup.school")}</option>
          <option value="home">{t("signup.home")}</option>
          <option value="both">{t("signup.both")}</option>
        </select>

        <button type="submit" className={styles["auth-btn"]}>
          {t("signup.signUpButton")}
        </button>
      </form>

      <p className={styles["auth-link"]}>
        <Link to="/auth/login">{t("signup.alreadyAccount")}</Link>
      </p>
    </>
  );
}


