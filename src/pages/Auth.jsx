import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "../styles/Auth.module.css";
import logo from "../assets/emotions/drago(writing).svg";
import Footer from "../components/Footer";

export default function Auth() {
  const { i18n } = useTranslation();

  return (
    <>
      <div
        dir={i18n.language === "ar" ? "rtl" : "ltr"}
        className={styles["auth-page"]}
      >
        <div className={styles["auth-left"]}>
          {/* ضفنا كلاس نيم هنا عشان نتحكم في حجمه */}
          <img src={logo} alt="Logo" className={styles.authMainLogo} />
        </div>

        <div className={styles["auth-container"]}>
          {/* ضفنا كلاس نيم هنا كمان */}
          <img src={logo} alt="Logo" className={styles.authFormLogo} />
          <Outlet />
        </div>
      </div>
      <Footer />
    </>
  );
}
