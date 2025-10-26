import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/Auth.module.css";
import { Link } from "react-router-dom";

export default function SignUpForm() {
  const { t } = useTranslation();

  // --- الحالة الرئيسية ---
  // null = لم يختر بعد, 'student' = اختار طالب, 'doctor' = اختار دكتور
  const [userType, setUserType] = useState(null);

  // --- حالة فورم الطالب ---
  const [studentForm, setStudentForm] = useState({
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

  // --- حالة فورم الدكتور ---
  const [doctorForm, setDoctorForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    licenseNumber: "", // رقم رخصة مزاولة المهنة
    specialization: "", // التخصص (مثل: تخاطب، نفسي، إلخ)
  });

  // --- دوال خاصة بالطالب ---
  const handleStudentChange = (e) => {
    setStudentForm({ ...studentForm, [e.target.name]: e.target.value });
  };

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (studentForm.password !== studentForm.confirmPassword) {
      alert(t("signup.passwordsMismatch"));
      return;
    }
    console.log("بيانات الطالب:", studentForm);
    // هنا ترسل بيانات الطالب إلى السيرفر
  };

  // --- دوال خاصة بالدكتور ---
  const handleDoctorChange = (e) => {
    setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });
  };

  const handleDoctorSubmit = (e) => {
    e.preventDefault();
    if (doctorForm.password !== doctorForm.confirmPassword) {
      alert(t("signup.passwordsMismatch"));
      return;
    }
    console.log("بيانات الدكتور:", doctorForm);
    // هنا ترسل بيانات الدكتور إلى السيرفر
  };

  // --- دالة لرسم زر "الرجوع" ---
  const renderBackButton = () => (
    <button
      type="button"
      onClick={() => setUserType(null)}
      className={styles["back-btn"]}
    >
      {t("signup.backButton")}
    </button>
  );

  // --- العرض (Render) ---

  // 1. إذا لم يتم اختيار النوع بعد (userType هو null)
  if (userType === null) {
    return (
      <div className={styles["user-type-selector"]}>
        <h2 className={styles["title"]}>{t("signup.whoAreYou")}</h2>
        <p className={styles["subtitle"]}>{t("signup.selectUserType")}</p>

        <div className={styles["user-type-buttons"]}>
          <button
            className={styles["auth-btn"]}
            onClick={() => setUserType("student")}
          >
            {t("signup.iamStudent")}
          </button>

          <button
            className={styles["auth-btn"]}
            onClick={() => setUserType("doctor")}
          >
            {t("signup.iamDoctor")}
          </button>
        </div>
      </div>
    );
  }

  // 2. إذا اختار "طالب"
  if (userType === "student") {
    return (
      <>
        <h2 className={styles["title"]}>{t("signup.title")}</h2>
        <p className={styles["subtitle"]}>{t("signup.subtitle")}</p>

        {/* --- فورم الطالب (الكود الخاص بك) --- */}
        <form onSubmit={handleStudentSubmit} className={styles["auth-form"]}>
          <div className={styles["row"]}>
            <input
              type="text"
              name="firstName"
              placeholder={t("signup.firstName")}
              value={studentForm.firstName}
              onChange={handleStudentChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder={t("signup.lastName")}
              value={studentForm.lastName}
              onChange={handleStudentChange}
              required
            />
          </div>

          <label className={styles["label"]}>{t("signup.dobLabel")}</label>
          <div className={styles["row"]}>
            <select
              name="dobDay"
              value={studentForm.dobDay}
              onChange={handleStudentChange}
              required
            >
              <option value="">{t("signup.day")}</option>
              {[...Array(31)].map((_, i) => (
                <option key={i + 1}>{i + 1}</option>
              ))}
            </select>
            <select
              name="dobMonth"
              value={studentForm.dobMonth}
              onChange={handleStudentChange}
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
              value={studentForm.dobYear}
              onChange={handleStudentChange}
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
                onChange={handleStudentChange}
                required
              />{" "}
              {t("signup.female")}
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="Male"
                onChange={handleStudentChange}
              />{" "}
              {t("signup.male")}
            </label>
          </div>

          <input
            type="email"
            name="email"
            placeholder={t("signup.emailPlaceholder")}
            value={studentForm.email}
            onChange={handleStudentChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder={t("signup.passwordPlaceholder")}
            value={studentForm.password}
            onChange={handleStudentChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder={t("signup.confirmPasswordPlaceholder")}
            value={studentForm.confirmPassword}
            onChange={handleStudentChange}
            required
          />

          <label className={styles["label"]}>{t("signup.usageLabel")}</label>
          <select
            name="usage"
            value={studentForm.usage}
            onChange={handleStudentChange}
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
        {renderBackButton()}

        <p className={styles["auth-link"]}>
          <Link to="/auth/login">{t("signup.alreadyAccount")}</Link>
        </p>
      </>
    );
  }

  // 3. إذا اختار "دكتور"
  if (userType === "doctor") {
    return (
      <>
        <h2 className={styles["title"]}>{t("signup.title")}</h2>
        <p className={styles["subtitle"]}>{t("signup.subtitle")}</p>

        {/* --- فورم الدكتور (الكود الجديد) --- */}
        <form onSubmit={handleDoctorSubmit} className={styles["auth-form"]}>
          <div className={styles["row"]}>
            <input
              type="text"
              name="firstName"
              placeholder={t("signup.firstName")}
              value={doctorForm.firstName}
              onChange={handleDoctorChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder={t("signup.lastName")}
              value={doctorForm.lastName}
              onChange={handleDoctorChange}
              required
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder={t("signup.emailPlaceholder")}
            value={doctorForm.email}
            onChange={handleDoctorChange}
            required
          />

          <input
            type="text"
            name="licenseNumber"
            placeholder={t("signup.licenseNumberPlaceholder")}
            value={doctorForm.licenseNumber}
            onChange={handleDoctorChange}
            required
          />

          <input
            type="text"
            name="specialization"
            placeholder={t("signup.specializationPlaceholder")}
            value={doctorForm.specialization}
            onChange={handleDoctorChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder={t("signup.passwordPlaceholder")}
            value={doctorForm.password}
            onChange={handleDoctorChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder={t("signup.confirmPasswordPlaceholder")}
            value={doctorForm.confirmPassword}
            onChange={handleDoctorChange}
            required
          />

          <button type="submit" className={styles["auth-btn"]}>
            {t("signup.signUpButton")}
          </button>
        </form>

        {renderBackButton()}
        <p className={styles["auth-link"]}>
          <Link to="/auth/login">{t("signup.alreadyAccount")}</Link>
        </p>
      </>
    );
  }
}
