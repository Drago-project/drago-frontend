import React, { useState } from "react";
import styles from "../styles/SignUp.module.css";
import logo from "../assets/emotions/drago(writing).svg";
import Footer from "../components/footer";

// ----------------------------------------------------
// 1. كائن النصوص لدعم اللغتين
// ----------------------------------------------------
const texts = {
  en: {
    title: "Create a new account",
    subtitle: "It's quick and easy.",
    firstName: "First name",
    lastName: "Surname",
    dobLabel: "Date of birth",
    day: "Day",
    month: "Month",
    year: "Year",
    genderLabel: "Gender",
    female: "Female",
    male: "Male",
    emailPlaceholder: "Mobile number or email address",
    passwordPlaceholder: "New password",
    confirmPasswordPlaceholder: "Confirm password",
    usageLabel: "Will you be using Drago at school or at home?",
    choose: "-- Please choose --",
    school: "At School",
    home: "At Home",
    both: "Both",
    signUpButton: "Sign Up",
    alreadyAccount: "Already have an account? Go to login",
    passwordsMismatch: "Passwords do not match!",
    languageSwitch: "العربية", // زر التبديل للغة الأخرى
  },
  ar: {
    title: "إنشاء حساب جديد",
    subtitle: "الأمر سريع وسهل.",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    dobLabel: "تاريخ الميلاد",
    day: "يوم",
    month: "شهر",
    year: "سنة",
    genderLabel: "النوع",
    female: "أنثى",
    male: "ذكر",
    emailPlaceholder: "رقم الهاتف المحمول أو البريد الإلكتروني",
    passwordPlaceholder: "كلمة مرور جديدة",
    confirmPasswordPlaceholder: "تأكيد كلمة المرور",
    usageLabel: "هل ستستخدم Drago في المدرسة أم في المنزل؟",
    choose: "-- يرجى الاختيار --",
    school: "في المدرسة",
    home: "في المنزل",
    both: "كلاهما",
    signUpButton: "تسجيل",
    alreadyAccount: "هل لديك حساب بالفعل؟ اذهب لتسجيل الدخول",
    passwordsMismatch: "كلمات المرور غير متطابقة!",
    languageSwitch: "English", // زر التبديل للغة الأخرى
  },
};

export default function SignUp() {
  // ----------------------------------------------------
  // 2. حالة اللغة
  // ----------------------------------------------------
  const [language, setLanguage] = useState("en"); // يمكن تغيير القيمة الافتراضية
  const t = texts[language]; // 't' هو اختصار لـ texts، وهو يحتوي على النصوص الحالية

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

  // ----------------------------------------------------
  // 3. دالة التبديل بين اللغات
  // ----------------------------------------------------
  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // استخدام رسالة التنبيه المناسبة للغة الحالية
    if (form.password !== form.confirmPassword) {
      alert(t.passwordsMismatch);
      return;
    }
    console.log(form);
  };

  // ----------------------------------------------------
  // 4. الريندر (Render) - تطبيق النصوص والاتجاه
  // ----------------------------------------------------
  return (
    <>

      <div className={styles["signup-page"]}>
        {/* الصورة الجانبية (ديسكتوب بس) */}
        <div className={styles["signup-left"]}>
          <img src={logo} alt="Logo" />
        </div>

        <div className={styles["signup-container"]}>
          <img src={logo} alt="Logo" />

        </div>
      </div>

      {/* تطبيق اتجاه النص (Right-to-Left) إذا كانت اللغة عربية */}
      <div dir={language === "ar" ? "rtl" : "ltr"}>
        {/* زر تغيير اللغة */}
        <button onClick={toggleLanguage} className={styles["lang-btn"]}>
          {t.languageSwitch}
        </button>

        <div className={styles["signup-left"]}>

          <img src={logo} alt="Logo" />
        </div>

        <div className={styles["signup-container"]}>
          <img src={logo} alt="Logo" />

          <h2 className={styles["title"]}>{t.title}</h2>
          <p className={styles["subtitle"]}>{t.subtitle}</p>

          <form onSubmit={handleSubmit} className={styles["signup-form"]}>
            <div className={styles["row"]}>
              <input
                type="text"
                name="firstName"
                // استخدام النص من كائن الترجمة
                placeholder={t.firstName}
                value={form.firstName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="lastName"
                // استخدام النص من كائن الترجمة
                placeholder={t.lastName}
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <label className={styles["label"]}>{t.dobLabel}</label>
            <div className={styles["row"]}>
              <select
                name="dobDay"
                value={form.dobDay}
                onChange={handleChange}
                required
              >
                <option value="">{t.day}</option>
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
                <option value="">{t.month}</option>
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
                <option value="">{t.year}</option>
                {Array.from({ length: 100 }, (_, i) => 2025 - i).map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </select>
            </div>

            <label className={styles["label"]}>{t.genderLabel}</label>
            <div className={`${styles["row"]} ${styles["gender"]}`}>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  onChange={handleChange}
                  required
                />{" "}
                {t.female}
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  onChange={handleChange}
                />{" "}
                {t.male}
              </label>
              {/* <label>
                <input type="radio" name="gender" value="Custom" onChange={handleChange} /> {t.custom}
              </label> */}
            </div>

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

            <input
              type="password"
              name="confirmPassword"
              placeholder={t.confirmPasswordPlaceholder}
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            <label className={styles["label"]}>{t.usageLabel}</label>
            <select
              name="usage"
              value={form.usage}
              onChange={handleChange}
              required
            >
              <option value="">{t.choose}</option>
              <option value="school">{t.school}</option>
              <option value="home">{t.home}</option>
              <option value="both">{t.both}</option>
            </select>

            <button type="submit" className={styles["signup-btn"]}>
              {t.signUpButton}
            </button>
          </form>

          <p className={styles["already"]}>{t.alreadyAccount}</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
