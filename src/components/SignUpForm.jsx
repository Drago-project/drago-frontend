import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/Auth.module.css";
import { Link } from "react-router-dom";
import api from "../server/api";
import EmailVerification from "../components/Emailverification";

export default function SignUpForm() {
  const { t } = useTranslation();

  // --- الحالة الرئيسية ---
  const [userType, setUserType] = useState(null);
  const [error, setError] = useState("");
  const [invalidFields, setInvalidFields] = useState([]);

  // Email Verification State
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Field-level validation state -> real-time errors & valid tracking
  const [studentErrors, setStudentErrors] = useState({});
  const [doctorErrors, setDoctorErrors] = useState({});
  const [studentValidFields, setStudentValidFields] = useState([]);
  const [doctorValidFields, setDoctorValidFields] = useState([]);

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
  const validateStudentField = (name, value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (name === "email") {
      if (!emailRegex.test(value.trim())) return t("signup.invalidEmail");
      return "";
    }

    if (name === "password") {
      if (value.length < 8) return t("signup.passwordTooShort");
      if (!passwordRegex.test(value)) return t("signup.passwordTooShort");
      if (
        studentForm.confirmPassword &&
        studentForm.confirmPassword !== value
      ) {
        setStudentErrors((prev) => ({
          ...prev,
          confirmPassword: t("signup.passwordsMismatch"),
        }));
      } else {
        setStudentErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
      return "";
    }

    if (name === "confirmPassword") {
      if (value !== studentForm.password) return t("signup.passwordsMismatch");
      return "";
    }

    return "";
  };

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setInvalidFields([]);

    const msg = validateStudentField(name, value);
    setStudentErrors((prev) => ({ ...prev, [name]: msg }));

    setStudentValidFields((prev) => {
      const set = new Set(prev);
      if (!msg && value !== "") set.add(name);
      else set.delete(name);
      return Array.from(set);
    });
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
      setStudentErrors((prev) => ({
        ...prev,
        email: t("signup.invalidEmail"),
      }));
      setStudentValidFields((prev) => prev.filter((f) => f !== "email"));
      setInvalidFields(["email"]);
      setError(t("signup.invalidEmail"));
      return;
    }

    // Check password length
    if (studentForm.password.length < 8) {
      setStudentErrors((prev) => ({
        ...prev,
        password: t("signup.passwordTooShort"),
      }));
      setStudentValidFields((prev) => prev.filter((f) => f !== "password"));
      setInvalidFields(["password"]);
      setError(t("signup.passwordTooShort"));
      return;
    }

    // Check password complexity
    if (!passwordRegex.test(studentForm.password)) {
      setStudentErrors((prev) => ({
        ...prev,
        password: t("signup.passwordTooShort"),
      }));
      setStudentValidFields((prev) => prev.filter((f) => f !== "password"));
      setInvalidFields(["password"]);
      setError(t("signup.passwordTooShort"));
      return;
    }

    // Check password match
    if (studentForm.password !== studentForm.confirmPassword) {
      setStudentErrors((prev) => ({
        ...prev,
        confirmPassword: t("signup.passwordsMismatch"),
      }));
      setStudentValidFields((prev) =>
        prev.filter((f) => f !== "confirmPassword"),
      );
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

      // Show email verification modal
      setRegisteredEmail(studentForm.email);
      setShowVerification(true);
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
  const validateDoctorField = (name, value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^(010|011|012|015)\d{8}$/;
    const landlineRegex = /^0\d{1,2}\d{7}$/;
    const licenseRegex = /^mti-?qni-?\d{3}$/i;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (name === "email") {
      if (!emailRegex.test(value.trim())) return t("signup.invalidEmail");
      return "";
    }

    if (name === "phoneNumber") {
      if (!mobileRegex.test(value.trim()))
        return t("signup.invalidPhoneNumber");
      return "";
    }

    if (name === "licenseNumber") {
      if (!licenseRegex.test(value.trim()))
        return t("signup.invalidLicenseNumber");
      return "";
    }

    if (name === "clinicPhone") {
      if (!mobileRegex.test(value.trim()) && !landlineRegex.test(value.trim()))
        return t("signup.invalidPhoneNumber");
      return "";
    }

    if (name === "password") {
      if (value.length < 8) return t("signup.passwordTooShort");
      if (!passwordRegex.test(value)) return t("signup.passwordTooShort");
      if (doctorForm.confirmPassword && doctorForm.confirmPassword !== value) {
        setDoctorErrors((prev) => ({
          ...prev,
          confirmPassword: t("signup.passwordsMismatch"),
        }));
      } else {
        setDoctorErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
      return "";
    }

    if (name === "confirmPassword") {
      if (value !== doctorForm.password) return t("signup.passwordsMismatch");
      return "";
    }

    return "";
  };

  const handleDoctorChange = (e) => {
    const { name, value } = e.target;
    setDoctorForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setInvalidFields([]);

    const msg = validateDoctorField(name, value);
    setDoctorErrors((prev) => ({ ...prev, [name]: msg }));

    setDoctorValidFields((prev) => {
      const set = new Set(prev);
      if (!msg && value !== "") set.add(name);
      else set.delete(name);
      return Array.from(set);
    });
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInvalidFields([]);

    // 1. Validation - check one field at a time, stop at first error
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^(010|011|012|015)\d{8}$/;
    const landlineRegex = /^0\d{1,2}\d{7}$/;
    const licenseRegex = /^mti-?qni-?\d{3}$/i;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    // Check email first
    if (!emailRegex.test(doctorForm.email.trim())) {
      setDoctorErrors((prev) => ({ ...prev, email: t("signup.invalidEmail") }));
      setDoctorValidFields((prev) => prev.filter((f) => f !== "email"));
      setInvalidFields(["email"]);
      setError(t("signup.invalidEmail"));
      return;
    }

    // Check phone number
    if (!mobileRegex.test(doctorForm.phoneNumber.trim())) {
      setDoctorErrors((prev) => ({
        ...prev,
        phoneNumber: t("signup.invalidPhoneNumber"),
      }));
      setDoctorValidFields((prev) => prev.filter((f) => f !== "phoneNumber"));
      setInvalidFields(["phoneNumber"]);
      setError(t("signup.invalidPhoneNumber"));
      return;
    }

    // Check license number
    if (!licenseRegex.test(doctorForm.licenseNumber.trim())) {
      setDoctorErrors((prev) => ({
        ...prev,
        licenseNumber: t("signup.invalidLicenseNumber"),
      }));
      setDoctorValidFields((prev) => prev.filter((f) => f !== "licenseNumber"));
      setInvalidFields(["licenseNumber"]);
      setError(t("signup.invalidLicenseNumber"));
      return;
    }

    // Check clinic phone
    if (
      !mobileRegex.test(doctorForm.clinicPhone.trim()) &&
      !landlineRegex.test(doctorForm.clinicPhone.trim())
    ) {
      setDoctorErrors((prev) => ({
        ...prev,
        clinicPhone: t("signup.invalidPhoneNumber"),
      }));
      setDoctorValidFields((prev) => prev.filter((f) => f !== "clinicPhone"));
      setInvalidFields(["clinicPhone"]);
      setError(t("signup.invalidPhoneNumber"));
      return;
    }

    // Check password length
    if (doctorForm.password.length < 8) {
      setDoctorErrors((prev) => ({
        ...prev,
        password: t("signup.passwordTooShort"),
      }));
      setDoctorValidFields((prev) => prev.filter((f) => f !== "password"));
      setInvalidFields(["password"]);
      setError(t("signup.passwordTooShort"));
      return;
    }

    // Check password complexity
    if (!passwordRegex.test(doctorForm.password)) {
      setDoctorErrors((prev) => ({
        ...prev,
        password: t("signup.passwordTooShort"),
      }));
      setDoctorValidFields((prev) => prev.filter((f) => f !== "password"));
      setInvalidFields(["password"]);
      setError(t("signup.passwordTooShort"));
      return;
    }

    // Check password match
    if (doctorForm.password !== doctorForm.confirmPassword) {
      setDoctorErrors((prev) => ({
        ...prev,
        confirmPassword: t("signup.passwordsMismatch"),
      }));
      setDoctorValidFields((prev) =>
        prev.filter((f) => f !== "confirmPassword"),
      );
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

      // Show email verification modal
      setRegisteredEmail(doctorForm.email);
      setShowVerification(true);
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

  // Email Verification Modal
  if (showVerification) {
    return (
      <EmailVerification
        email={registeredEmail}
        userType={userType}
        onClose={() => setShowVerification(false)}
      />
    );
  }

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
        <h2 className={styles["title"]}>{t("signup.title")}</h2>
        <p className={styles["subtitle"]}>{t("signup.subtitle")}</p>
        {error && <p className={styles["form-error-top"]}>{error}</p>}
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

          <div className={styles["input-wrapper"]}>
            <input
              type="email"
              name="email"
              placeholder={t("signup.emailPlaceholder")}
              value={studentForm.email}
              onChange={handleStudentChange}
              className={
                studentErrors.email || invalidFields.includes("email")
                  ? styles.invalid
                  : studentValidFields.includes("email")
                    ? styles.valid
                    : ""
              }
              required
            />
            <span className={styles["field-icon"]}>
              {studentValidFields.includes("email")
                ? "✓"
                : studentErrors.email
                  ? "!"
                  : ""}
            </span>
            {studentErrors.email && (
              <small className={styles["field-error"]}>
                {studentErrors.email}
              </small>
            )}
          </div>

          <div className={styles["input-wrapper"]}>
            <input
              type="password"
              name="password"
              placeholder={t("signup.passwordPlaceholder")}
              value={studentForm.password}
              onChange={handleStudentChange}
              className={
                studentErrors.password || invalidFields.includes("password")
                  ? styles.invalid
                  : studentValidFields.includes("password")
                    ? styles.valid
                    : ""
              }
              required
            />
            <span className={styles["field-icon"]}>
              {studentValidFields.includes("password")
                ? "✓"
                : studentErrors.password
                  ? "!"
                  : ""}
            </span>
            {studentErrors.password && (
              <small className={styles["field-error"]}>
                {studentErrors.password}
              </small>
            )}
          </div>

          <div className={styles["input-wrapper"]}>
            <input
              type="password"
              name="confirmPassword"
              placeholder={t("signup.confirmPasswordPlaceholder")}
              value={studentForm.confirmPassword}
              onChange={handleStudentChange}
              className={
                studentErrors.confirmPassword ||
                invalidFields.includes("confirmPassword")
                  ? styles.invalid
                  : studentValidFields.includes("confirmPassword")
                    ? styles.valid
                    : ""
              }
              required
            />
            <span className={styles["field-icon"]}>
              {studentValidFields.includes("confirmPassword")
                ? "✓"
                : studentErrors.confirmPassword
                  ? "!"
                  : ""}
            </span>
            {studentErrors.confirmPassword && (
              <small className={styles["field-error"]}>
                {studentErrors.confirmPassword}
              </small>
            )}
          </div>

          <label className={styles["label"]}>{t("signup.usageLabel")}</label>
          <select
            name="usage"
            value={studentForm.usage}
            onChange={(e) => {
              handleStudentChange(e);
              setInClinic(
                e.target.value === "clinic" || e.target.value === "both",
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
        </form>

        {renderBackButton()}
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
        {error && <p className={styles["form-error-top"]}>{error}</p>}
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

          <div className={styles["input-wrapper"]}>
            <input
              type="email"
              name="email"
              placeholder={t("signup.emailPlaceholder")}
              value={doctorForm.email}
              onChange={handleDoctorChange}
              className={
                doctorErrors.email || invalidFields.includes("email")
                  ? styles.invalid
                  : doctorValidFields.includes("email")
                    ? styles.valid
                    : ""
              }
              required
            />
            <span className={styles["field-icon"]}>
              {doctorValidFields.includes("email")
                ? "✓"
                : doctorErrors.email
                  ? "!"
                  : ""}
            </span>
            {doctorErrors.email && (
              <small className={styles["field-error"]}>
                {doctorErrors.email}
              </small>
            )}
          </div>

          <div className={styles["input-wrapper"]}>
            <input
              type="tel"
              name="phoneNumber"
              placeholder={t("signup.doctorPhonePlaceholder")}
              value={doctorForm.phoneNumber}
              onChange={handleDoctorChange}
              className={
                doctorErrors.phoneNumber ||
                invalidFields.includes("phoneNumber")
                  ? styles.invalid
                  : doctorValidFields.includes("phoneNumber")
                    ? styles.valid
                    : ""
              }
              required
            />
            <span className={styles["field-icon"]}>
              {doctorValidFields.includes("phoneNumber")
                ? "✓"
                : doctorErrors.phoneNumber
                  ? "!"
                  : ""}
            </span>
            {doctorErrors.phoneNumber && (
              <small className={styles["field-error"]}>
                {doctorErrors.phoneNumber}
              </small>
            )}
          </div>

          <div className={styles["input-wrapper"]}>
            <input
              type="text"
              name="licenseNumber"
              placeholder={t("signup.licenseNumberPlaceholder")}
              value={doctorForm.licenseNumber}
              onChange={handleDoctorChange}
              className={
                doctorErrors.licenseNumber ||
                invalidFields.includes("licenseNumber")
                  ? styles.invalid
                  : doctorValidFields.includes("licenseNumber")
                    ? styles.valid
                    : ""
              }
              required
            />
            <span className={styles["field-icon"]}>
              {doctorValidFields.includes("licenseNumber")
                ? "✓"
                : doctorErrors.licenseNumber
                  ? "!"
                  : ""}
            </span>
            {doctorErrors.licenseNumber && (
              <small className={styles["field-error"]}>
                {doctorErrors.licenseNumber}
              </small>
            )}
          </div>

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

          <div className={styles["input-wrapper"]}>
            <input
              type="tel"
              name="clinicPhone"
              placeholder={t("signup.clinicPhonePlaceholder")}
              value={doctorForm.clinicPhone}
              onChange={handleDoctorChange}
              className={
                doctorErrors.clinicPhone ||
                invalidFields.includes("clinicPhone")
                  ? styles.invalid
                  : doctorValidFields.includes("clinicPhone")
                    ? styles.valid
                    : ""
              }
              required
            />
            <span className={styles["field-icon"]}>
              {doctorValidFields.includes("clinicPhone")
                ? "✓"
                : doctorErrors.clinicPhone
                  ? "!"
                  : ""}
            </span>
            {doctorErrors.clinicPhone && (
              <small className={styles["field-error"]}>
                {doctorErrors.clinicPhone}
              </small>
            )}
          </div>

          <input
            type="url"
            name="clinicWebsite"
            placeholder={t("signup.clinicWebsitePlaceholder")}
            value={doctorForm.clinicWebsite}
            onChange={handleDoctorChange}
          />

          <div className={styles["input-wrapper"]}>
            <input
              type="password"
              name="password"
              placeholder={t("signup.passwordPlaceholder")}
              value={doctorForm.password}
              onChange={handleDoctorChange}
              className={
                doctorErrors.password || invalidFields.includes("password")
                  ? styles.invalid
                  : doctorValidFields.includes("password")
                    ? styles.valid
                    : ""
              }
              required
            />
            <span className={styles["field-icon"]}>
              {doctorValidFields.includes("password")
                ? "✓"
                : doctorErrors.password
                  ? "!"
                  : ""}
            </span>
            {doctorErrors.password && (
              <small className={styles["field-error"]}>
                {doctorErrors.password}
              </small>
            )}
          </div>

          <div className={styles["input-wrapper"]}>
            <input
              type="password"
              name="confirmPassword"
              placeholder={t("signup.confirmPasswordPlaceholder")}
              value={doctorForm.confirmPassword}
              onChange={handleDoctorChange}
              className={
                doctorErrors.confirmPassword ||
                invalidFields.includes("confirmPassword")
                  ? styles.invalid
                  : doctorValidFields.includes("confirmPassword")
                    ? styles.valid
                    : ""
              }
              required
            />
            <span className={styles["field-icon"]}>
              {doctorValidFields.includes("confirmPassword")
                ? "✓"
                : doctorErrors.confirmPassword
                  ? "!"
                  : ""}
            </span>
            {doctorErrors.confirmPassword && (
              <small className={styles["field-error"]}>
                {doctorErrors.confirmPassword}
              </small>
            )}
          </div>

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
