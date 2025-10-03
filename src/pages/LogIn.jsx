import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/Login.module.css";
import logo from "../assets/emotions/drago(writing).svg";
import Footer from "../components/footer";


export default function Login() {


  const {t, i18n} = useTranslation();

  // حالة حقول الدخول
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };



  const handleSubmit = (e) => {
    e.preventDefault();

    // التحقق من الحقول
    if (!form.email || !form.password) {
      alert(t("login.missingFields"));
      return;
    }

    // هنا يتم إرسال بيانات الدخول إلى الخادم
    console.log("Logging in with:", form);
  };

  return (
    <>
      {/* تطبيق اتجاه النص (Right-to-Left) */}
      <div dir={i18n.language === "ar" ? "rtl" : "ltr"}>
     
        <div className={styles["login-container"]}>
          <img src={logo} alt="Logo" />
          <h2 className={styles["title"]}>{t("login.title")}</h2>
          <p className={styles["subtitle"]}>{t("login.subtitle")}</p>

          <form onSubmit={handleSubmit} className={styles["login-form"]}>
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

            {/* رابط "نسيت كلمة المرور" */}
            <p className={styles["forgot-link"]}>
              <a href="/forgot-password">{t("login.forgotPassword")}</a>
            </p>

            <button type="submit" className={styles["login-btn"]}>
              {t("login.loginButton")}
            </button>
          </form>

          {/* رابط إنشاء حساب جديد */}
          <p className={styles["create-account"]}>
            <a href="/signup">{t("login.createAccount")}</a>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
