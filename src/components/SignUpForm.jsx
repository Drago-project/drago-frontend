import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/Auth.module.css";
import { Link } from "react-router-dom";

export default function SignUpForm() {
  const { t } = useTranslation(); // --- الحالة الرئيسية ---

  const [userType, setUserType] = useState(null); // --- حالة فورم الطالب ---
  const [error, setError] = useState("");
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
    clinicName: "",
    doctorName: "",
  }); // --- حالة فورم الدكتور ---

  const [doctorForm, setDoctorForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "", // --- مضاف --- (رقم تليفون الدكتور)
    licenseNumber: "",
    specialization: "",
    clinicName: "", // --- مضاف ---
    clinicPhone: "", // --- مضاف ---
    clinicWebsite: "", // --- مضاف --- (اختياري)
    password: "",
    confirmPassword: "",
  }); // --- دوال خاصة بالطالب ---
  const [inClinic, setInClinic] = useState(false);
  // --- student handlers ---
  const handleStudentChange = (e) => {
    setStudentForm({ ...studentForm, [e.target.name]: e.target.value });
  };

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    setError(""); //delete previous errors

    //----------- Validation---------------------

    //check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentForm.email)) {
      setError(t("signup.invalidEmail"));
      return;
    }
    //check password length
    if (studentForm.password.length < 8) {
      setError(t("signup.passwordTooShort"));
      return;
    }
    //check password match
    if (studentForm.password !== studentForm.confirmPassword) {
      setError(t("signup.passwordsMismatch"));
      return;
    }

    console.log("✅ بيانات الطالب:", studentForm);
    setError(""); // نجاح التسجيل
  };

  // --- doctor handlers ---
  const handleDoctorChange = (e) => {
    setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });
  };

  const handleDoctorSubmit = (e) => {
    e.preventDefault();
    setError(""); //delete previous errors
    //----------- Validation---------------------
    //check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(doctorForm.email)) {
      setError(t("signup.invalidEmail"));
      return;
    }
    //check password length
    if (doctorForm.password.length < 8) {
      setError(t("signup.passwordTooShort"));
      return;
    }
    //check password match
    if (doctorForm.password !== doctorForm.confirmPassword) {
      setError(t("signup.passwordsMismatch"));
      return;
    }

    console.log("✅ بيانات الدكتور:", doctorForm);
    setError(""); // نجاح التسجيل
  };

  const renderBackButton = () => (
    <button
      type="button"
      onClick={() => setUserType(null)}
      className={styles["back-btn"]}
    >
      {t("signup.backButton")}
    </button>
  ); // --- العرض (Render) --- // 1. إذا لم يتم اختيار النوع بعد (userType هو null)

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
  } // 2. إذا اختار "طالب"

  if (userType === "student") {
    return (
      <>
        {renderBackButton()}
        <h2 className={styles["title"]}>{t("signup.title")}</h2>
        <p className={styles["subtitle"]}>{t("signup.subtitle")}</p>
        {/* --- فورم الطالب (كما هو) --- */}
        <form onSubmit={handleStudentSubmit} className={styles["auth-form"]}>
          {/* ... كود فورم الطالب يظل كما هو ... */}
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
              <option>Jan</option> <option>Feb</option>
              <option>Mar</option> <option>Apr</option>
              <option>May</option> <option>Jun</option>
              <option>Jul</option> <option>Aug</option>
              <option>Sep</option> <option>Oct</option> <option>Nov</option>
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
              />
              {t("signup.female")}
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="Male"
                onChange={handleStudentChange}
              />
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
            onChange={(e) => {
              handleStudentChange(e);
              setInClinic(
                e.target.value === "clinic" || e.target.value === "both"
              );
            }}
            required
            className={styles["usage-select"]}
          >
            <option value="">{t("signup.choose")}</option>
            <option value="clinic">{t("signup.clinic")}</option>
            <option value="home">{t("signup.home")}</option>
            <option value="both">{t("signup.both")}</option>
          </select>
          {inClinic && (
            <div>
              <input
                type="text"
                name="clinicName"
                placeholder={t("signup.clinicNamePlaceholder")}
                value={studentForm.clinicName}
                onChange={handleStudentChange}
                required
              />
              <input
                type="text"
                name="doctorName"
                placeholder={t("signup.doctorNamePlaceholder")}
                value={studentForm.doctorName}
                onChange={handleStudentChange}
                required
              />
            </div>
          )}
          <button type="submit" className={styles["auth-btn"]}>
            {t("signup.signUpButton")}
          </button>
          {error && <p className={styles["error-text"]}>{error}</p>}
        </form>
        <p className={styles["auth-link"]}>
          <Link to="/auth/login">{t("signup.alreadyAccount")}</Link>
        </p>
      </>
    );
  } // 3. إذا اختار "دكتور" (هنا التعديلات)

  if (userType === "doctor") {
    return (
      <>
        {renderBackButton()} {/* --- تم نقل زر الرجوع هنا ليكون ظاهراً --- */}
        <h2 className={styles["title"]}>{t("signup.title")}</h2>
        <p className={styles["subtitle"]}>{t("signup.subtitle")}</p>
        {/* --- فورم الدكتور (المعدل) --- */}
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
          {/* --- الحقول المضافة --- */}
          <input
            type="tel"
            name="phoneNumber"
            placeholder={t("signup.doctorPhonePlaceholder")}
            value={doctorForm.phoneNumber}
            onChange={handleDoctorChange}
            required
          />
          {/* --- نهاية الحقول المضافة --- */}
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
          {/* --- الحقول المضافة --- */}
          <input
            type="text"
            name="clinicName"
            placeholder={t("signup.clinicNamePlaceholder")}
            value={doctorForm.clinicName}
            onChange={handleDoctorChange}
            required
          />
          <input
            type="tel"
            name="clinicPhone"
            placeholder={t("signup.clinicPhonePlaceholder")}
            value={doctorForm.clinicPhone}
            onChange={handleDoctorChange}
            required
          />
          <input
            type="url"
            name="clinicWebsite"
            placeholder={t("signup.clinicWebsitePlaceholder")}
            value={doctorForm.clinicWebsite}
            onChange={handleDoctorChange} // اختياري - لا يوجد required
          />
          {/* --- نهاية الحقول المضافة --- */}
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
          <b utton type="submit" className={styles["auth-btn"]}>
            {t("signup.signUpButton")}
          </b>
          {error && <p className={styles["error-text"]}>{error}</p>}
        </form>
        <p className={styles["auth-link"]}>
          <Link to="/auth/login">{t("signup.alreadyAccount")}</Link>
        </p>
      </>
    );
  }
}
