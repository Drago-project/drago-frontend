import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/Auth.module.css";
import { Link, useNavigate } from "react-router-dom";

export default function SignUpForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // --- الحالة الرئيسية ---
  const [userType, setUserType] = useState(null);
  const [error, setError] = useState("");

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
    clinicName: "",
    doctorName: "",
  });

  // --- حالة فورم الدكتور ---
  const [doctorForm, setDoctorForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    licenseNumber: "",
    specialization: "",
    clinicName: "",
    clinicPhone: "",
    clinicWebsite: "",
    password: "",
    confirmPassword: "",
  });

  const [inClinic, setInClinic] = useState(false);

  // --- student handlers ---
  const handleStudentChange = (e) => {
    setStudentForm({ ...studentForm, [e.target.name]: e.target.value });
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentForm.email)) {
      setError(t("signup.invalidEmail"));
      return;
    }
    if (studentForm.password.length < 8) {
      setError(t("signup.passwordTooShort"));
      return;
    }
    if (studentForm.password !== studentForm.confirmPassword) {
      setError(t("signup.passwordsMismatch"));
      return;
    }

    // 2. تجهيز تاريخ الميلاد (تحويل من يوم/شهر/سنة إلى تاريخ كامل)
    const monthMap = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };

    // لو المستخدم مختارش تاريخ، نوقف العملية (اختياري، بس أمان)
    if (!studentForm.dobDay || !studentForm.dobMonth || !studentForm.dobYear) {
      setError("Please select a valid date of birth");
      return;
    }

    const day = studentForm.dobDay.toString().padStart(2, "0");
    const month = monthMap[studentForm.dobMonth];
    const year = studentForm.dobYear;

    // تكوين التاريخ بصيغة ISO
    const finalBirthDate = new Date(`${year}-${month}-${day}`).toISOString();

    // 3. API Call للطلاب
    try {
      const response = await fetch(
        "http://drago.runasp.net/api/Users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: studentForm.firstName,
            lastName: studentForm.lastName,
            birthDate: finalBirthDate, // التاريخ المجمع
            gender: studentForm.gender,
            email: studentForm.email,
            password: studentForm.password,
            confirmPassword: studentForm.confirmPassword,
            usageType: studentForm.usage, // تعديل الاسم ليطابق Swagger
            role: "Student", // إضافة الدور يدوياً
            clinicName: studentForm.clinicName || "N/A", // لو فاضية نبعت قيمة افتراضية
            doctorName: studentForm.doctorName || "N/A",
          }),
        }
      );

      if (response.ok) {
        console.log("✅ Student Registered Successfully");
        alert(t("signup.successMessage") || "تم إنشاء حساب الطالب بنجاح!");
        navigate("/home", { replace: true });
      } else {
        const errorData = await response.json();
        console.error("Error details:", errorData);
        setError(errorData.message || "حدث خطأ أثناء تسجيل الطالب.");
      }
    } catch (err) {
      console.error("Network Error:", err);
      setError("تعذر الاتصال بالخادم (Connection Error).");
    }
  };

  // --- doctor handlers ---
  const handleDoctorChange = (e) => {
    setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(doctorForm.email)) {
      setError(t("signup.invalidEmail"));
      return;
    }
    if (doctorForm.password.length < 8) {
      setError(t("signup.passwordTooShort"));
      return;
    }
    if (doctorForm.password !== doctorForm.confirmPassword) {
      setError(t("signup.passwordsMismatch"));
      return;
    }

    // 2. API Call للدكاترة
    try {
      const response = await fetch(
        "http://drago.runasp.net/api/Doctors/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: doctorForm.firstName,
            lastName: doctorForm.lastName,
            email: doctorForm.email,
            phoneNumber: doctorForm.phoneNumber,
            licenseNumber: doctorForm.licenseNumber,
            specialization: doctorForm.specialization,
            clinicName: doctorForm.clinicName,
            clinicPhone: doctorForm.clinicPhone,
            clinicLink: doctorForm.clinicWebsite,
            password: doctorForm.password,
            confirmPassword: doctorForm.confirmPassword,
          }),
        }
      );

      if (response.ok) {
        console.log("✅ Doctor Registered Successfully");
        alert(t("signup.successMessage") || "تم إنشاء حساب الدكتور بنجاح!");
        navigate("/home", { replace: true });
      } else {
        const errorData = await response.json();
        console.error("Error details:", errorData);
        setError(errorData.message || "حدث خطأ أثناء تسجيل الدكتور.");
      }
    } catch (err) {
      console.error("Network Error:", err);
      setError("تعذر الاتصال بالخادم (Connection Error).");
    }
  };

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

  // 1. اختيار النوع
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

  // 2. فورم الطالب
  if (userType === "student") {
    return (
      <>
        {renderBackButton()}
        <h2 className={styles["title"]}>{t("signup.title")}</h2>
        <p className={styles["subtitle"]}>{t("signup.subtitle")}</p>
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
  }

  // 3. فورم الدكتور
  if (userType === "doctor") {
    return (
      <>
        {renderBackButton()}
        <h2 className={styles["title"]}>{t("signup.title")}</h2>
        <p className={styles["subtitle"]}>{t("signup.subtitle")}</p>
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
            type="tel"
            name="phoneNumber"
            placeholder={t("signup.doctorPhonePlaceholder")}
            value={doctorForm.phoneNumber}
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
            onChange={handleDoctorChange}
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

          {error && <p className={styles["error-text"]}>{error}</p>}
        </form>
        <p className={styles["auth-link"]}>
          <Link to="/auth/login">{t("signup.alreadyAccount")}</Link>
        </p>
      </>
    );
  }
}
