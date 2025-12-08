import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/Auth.module.css";
import { Link, useNavigate } from "react-router-dom";
import api from "../server/api";

export default function SignUpForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // --- الحالة الرئيسية ---
  const [userType, setUserType] = useState(null);
  const [error, setError] = useState("");
  const [invalidFields, setInvalidFields] = useState([]);

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
    // Clear errors when user starts typing
    setError("");
    setInvalidFields([]);
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInvalidFields([]);

    // 1. Validation - check one field at a time, stop at first error
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    // Check email first
    if (!emailRegex.test(studentForm.email.trim())) {
      setInvalidFields(["email"]);
      setError(t("signup.invalidEmail"));
      return;
    }

    // Check password length
    if (studentForm.password.length < 8) {
      setInvalidFields(["password"]);
      setError(t("signup.passwordTooShort"));
      return;
    }

    // Check password complexity
    if (!passwordRegex.test(studentForm.password)) {
      setInvalidFields(["password"]);
      setError(t("signup.passwordTooShort"));
      return;
    }

    // Check password match
    if (studentForm.password !== studentForm.confirmPassword) {
      setInvalidFields(["confirmPassword"]);
      setError(t("signup.passwordsMismatch"));
      return;
    }

    // 2. تجهيز تاريخ الميلاد
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

    if (!studentForm.dobDay || !studentForm.dobMonth || !studentForm.dobYear) {
      setError("Please select a valid date of birth");
      return;
    }

    const day = studentForm.dobDay.toString().padStart(2, "0");
    const month = monthMap[studentForm.dobMonth];
    const year = studentForm.dobYear;
    const finalBirthDate = new Date(`${year}-${month}-${day}`).toISOString();

    // 3. API Call للطلاب
    try {
      const payload = {
        firstName: studentForm.firstName,
        lastName: studentForm.lastName,
        birthDate: finalBirthDate,
        gender: studentForm.gender,
        email: studentForm.email,
        password: studentForm.password,
        confirmPassword: studentForm.confirmPassword,
        usageType: studentForm.usage,
        role: "Student",
        clinicName: studentForm.clinicName || "N/A",
        doctorName: studentForm.doctorName || "N/A",
      };

      const response = await api.post("/api/Users/register", payload);

      console.log("✅ Student Registered Successfully", response.data);
      alert(t("signup.successMessage") || "تم إنشاء حساب الطالب بنجاح!");
      navigate("/home", { replace: true });
    } catch (err) {
      console.error("Signup (student) error:", err);
      if (err.response) {
        const data = err.response.data;
        setError(data?.message || JSON.stringify(data));
      } else {
        setError("تعذر الاتصال بالخادم (Connection Error).");
      }
    }
  };

  // --- doctor handlers ---
  const handleDoctorChange = (e) => {
    setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });
    // Clear errors when user starts typing
    setError("");
    setInvalidFields([]);
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInvalidFields([]);

    // 1. Validation - check one field at a time, stop at first error
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^(010|011|012|015)\d{8}$/;
    const landlineRegex = /^0\d{2,3}\d{7}$/;
    const licenseRegex = /^mti-?qni-?\d{3}$/i;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    // Check email first
    if (!emailRegex.test(doctorForm.email.trim())) {
      setInvalidFields(["email"]);
      setError(t("signup.invalidEmail"));
      return;
    }

    // Check phone number
    if (!mobileRegex.test(doctorForm.phoneNumber.trim())) {
      setInvalidFields(["phoneNumber"]);
      setError(t("signup.invalidPhoneNumber"));
      return;
    }

    // Check license number
    if (!licenseRegex.test(doctorForm.licenseNumber.trim())) {
      setInvalidFields(["licenseNumber"]);
      setError(t("signup.invalidLicenseNumber"));
      return;
    }

    // Check clinic phone
    if (
      !mobileRegex.test(doctorForm.clinicPhone.trim()) &&
      !landlineRegex.test(doctorForm.clinicPhone.trim())
    ) {
      setInvalidFields(["clinicPhone"]);
      setError(t("signup.invalidPhoneNumber"));
      return;
    }

    // Check password length
    if (doctorForm.password.length < 8) {
      setInvalidFields(["password"]);
      setError(t("signup.passwordTooShort"));
      return;
    }

    // Check password complexity
    if (!passwordRegex.test(doctorForm.password)) {
      setInvalidFields(["password"]);
      setError(t("signup.passwordTooShort"));
      return;
    }

    // Check password match
    if (doctorForm.password !== doctorForm.confirmPassword) {
      setInvalidFields(["confirmPassword"]);
      setError(t("signup.passwordsMismatch"));
      return;
    }

    // 2. API Call للدكاترة
    try {
      const payload = {
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
      };

      const response = await api.post("/api/Doctors/register", payload);

      console.log("Doctor Registered Successfully", response.data);
      alert(t("signup.successMessage") || "تم إنشاء حساب الدكتور بنجاح!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Signup (doctor) error:", err);
      if (err.response) {
        const data = err.response.data;
        setError(data?.message || JSON.stringify(data));
      } else {
        setError("تعذر الاتصال بالخادم (Connection Error).");
      }
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
            className={invalidFields.includes("email") ? styles.invalid : ""}
            required
          />
          <input
            type="password"
            name="password"
            placeholder={t("signup.passwordPlaceholder")}
            value={studentForm.password}
            onChange={handleStudentChange}
            className={invalidFields.includes("password") ? styles.invalid : ""}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder={t("signup.confirmPasswordPlaceholder")}
            value={studentForm.confirmPassword}
            onChange={handleStudentChange}
            className={
              invalidFields.includes("confirmPassword") ? styles.invalid : ""
            }
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

          {error && <p className={styles["error-text"]}>{error}</p>}

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
            className={invalidFields.includes("email") ? styles.invalid : ""}
            required
          />

          <input
            type="tel"
            name="phoneNumber"
            placeholder={t("signup.doctorPhonePlaceholder")}
            value={doctorForm.phoneNumber}
            onChange={handleDoctorChange}
            className={
              invalidFields.includes("phoneNumber") ? styles.invalid : ""
            }
            required
          />

          <input
            type="text"
            name="licenseNumber"
            placeholder={t("signup.licenseNumberPlaceholder")}
            value={doctorForm.licenseNumber}
            onChange={handleDoctorChange}
            className={
              invalidFields.includes("licenseNumber") ? styles.invalid : ""
            }
            required
          />

          <select
            name="specialization"
            value={doctorForm.specialization}
            onChange={handleDoctorChange}
            required
          >
            <option value="" disabled>
              {t("signup.specializationPlaceholder")}
            </option>
            <option value="speechLanguagePathology">
              {t("signup.specializations.speechLanguagePathology")}
            </option>
            <option value="learningDisabilities">
              {t("signup.specializations.learningDisabilities")}
            </option>
            <option value="specialEducation">
              {t("signup.specializations.specialEducation")}
            </option>
            <option value="behavioralTherapy">
              {t("signup.specializations.behavioralTherapy")}
            </option>
            <option value="other">{t("signup.specializations.other")}</option>
          </select>

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
            className={
              invalidFields.includes("clinicPhone") ? styles.invalid : ""
            }
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
            className={invalidFields.includes("password") ? styles.invalid : ""}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder={t("signup.confirmPasswordPlaceholder")}
            value={doctorForm.confirmPassword}
            onChange={handleDoctorChange}
            className={
              invalidFields.includes("confirmPassword") ? styles.invalid : ""
            }
            required
          />

          {error && <p className={styles["error-text"]}>{error}</p>}

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
}
