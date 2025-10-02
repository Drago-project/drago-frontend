import React, { useState } from "react";
// افترض أن لديك ملف تنسيق خاص بالدخول
import styles from "../styles/Login.module.css";
import logo from "../assets/emotions/drago(writing).svg";
import Footer from "../components/footer";

// ----------------------------------------------------
// 1. كائن النصوص لدعم اللغتين (Translation Texts)
// ----------------------------------------------------
const texts = {
  en: {
    title: "Welcome Back",
    subtitle: "Log in to your account.",
    emailPlaceholder: "Mobile number or email address",
    passwordPlaceholder: "Password",
    loginButton: "Log In",
    forgotPassword: "Forgot password?",
    createAccount: "Create a new account",
    languageSwitch: "العربية",
    missingFields: "Please enter your email and password.",
  },
  ar: {
    title: "مرحباً بعودتك",
    subtitle: "سجل الدخول إلى حسابك.",
    emailPlaceholder: "رقم الهاتف المحمول أو البريد الإلكتروني",
    passwordPlaceholder: "كلمة المرور",
    loginButton: "تسجيل الدخول",
    forgotPassword: "هل نسيت كلمة المرور؟",
    createAccount: "إنشاء حساب جديد",
    languageSwitch: "English",
    missingFields: "الرجاء إدخال بريدك الإلكتروني وكلمة المرور.",
  },
};

export default function Login() {
  // حالة اللغة
  const [language, setLanguage] = useState("en");
  const t = texts[language];

  // حالة حقول الدخول
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // دالة التبديل بين اللغات
  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // التحقق من الحقول
    if (!form.email || !form.password) {
      alert(t.missingFields);
      return;
    }

    // هنا يتم إرسال بيانات الدخول إلى الخادم
    console.log("Logging in with:", form);
  };

  return (
    <>
      {/* تطبيق اتجاه النص (Right-to-Left) */}
      <div dir={language === "ar" ? "rtl" : "ltr"}>
        {/* زر تغيير اللغة */}
        <button onClick={toggleLanguage} className={styles["lang-btn"]}>
          {t.languageSwitch}
        </button>

        <div className={styles["login-container"]}>
          <img src={logo} alt="Logo" />
          <h2 className={styles["title"]}>{t.title}</h2>
          <p className={styles["subtitle"]}>{t.subtitle}</p>

          <form onSubmit={handleSubmit} className={styles["login-form"]}>
            <input
              type="text"
              name="email"
              placeholder={t.emailPlaceholder}
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder={t.passwordPlaceholder}
              value={form.password}
              onChange={handleChange}
              required
            />

            {/* رابط "نسيت كلمة المرور" */}
            <p className={styles["forgot-link"]}>
              <a href="/forgot-password">{t.forgotPassword}</a>
            </p>

            <button type="submit" className={styles["login-btn"]}>
              {t.loginButton}
            </button>
          </form>

          {/* رابط إنشاء حساب جديد */}
          <p className={styles["create-account"]}>
            <a href="/signup">{t.createAccount}</a>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
