import React, { useState } from "react";
import styles from "../styles/SignUp.module.css";
import logo from "../assets/emotions/drago(writing).svg";
import Footer from "../components/footer";

export default function SignUp() {
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
      alert("Passwords do not match!");
      return;
    }
    console.log(form);
  };

  return (
    <>
      <div className={styles["signup-page"]}>
        {/* الصورة الجانبية (ديسكتوب بس) */}
        <div className={styles["signup-left"]}>
          <img src={logo} alt="Logo" />
        </div>

        {/* الفورم */}
        <div className={styles["signup-container"]}>
          {/* الصورة (موبايل فقط) */}
          <img src={logo} alt="Logo" />

          <h2 className={styles["title"]}>Create a new account</h2>
          <p className={styles["subtitle"]}>It's quick and easy.</p>

          <form onSubmit={handleSubmit} className={styles["signup-form"]}>
            <div className={styles["row"]}>
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={form.firstName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Surname"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <label className={styles["label"]}>Date of birth</label>
            <div className={styles["row"]}>
              <select
                name="dobDay"
                value={form.dobDay}
                onChange={handleChange}
                required
              >
                <option value="">Day</option>
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
                <option value="">Month</option>
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
                <option value="">Year</option>
                {Array.from({ length: 100 }, (_, i) => 2025 - i).map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </select>
            </div>

            <label className={styles["label"]}>Gender</label>
            <div className={`${styles["row"]} ${styles["gender"]}`}>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  onChange={handleChange}
                  required
                />{" "}
                Female
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  onChange={handleChange}
                />{" "}
                Male
              </label>
              {/* <label>
              <input type="radio" name="gender" value="Custom" onChange={handleChange} /> Custom
            </label> */}
            </div>

            <input
              type="text"
              name="email"
              placeholder="Mobile number or email address"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="New password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            <label className={styles["label"]}>
              Will you be using Drago at school or at home?
            </label>
            <select
              name="usage"
              value={form.usage}
              onChange={handleChange}
              required
            >
              <option value="">-- Please choose --</option>
              <option value="school">At School</option>
              <option value="home">At Home</option>
              <option value="both">Both</option>
            </select>

            <button type="submit" className={styles["signup-btn"]}>
              Sign Up
            </button>
          </form>

          <p className={styles["already"]}>
            Already have an account? Go to login
          </p>
        </div>
      </div>
      <Footer/>
    </>
  );
}
