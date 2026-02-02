import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Footer from "../components/Footer";
import styles from "../styles/Contact.module.css";

// ✅ تم تعديل مسار الصورة هنا لتستخدم drago(reading).svg
import ContactImage from "../assets/emotions/drago(reading).svg";

function ContactUs() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    setStatus("success");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <>
      <div className={`${styles.contactPage} ${isArabic ? "rtl" : "ltr"}`}>
        <div className="container">
          <h1 className={styles.pageTitle}>{t("contact.title")}</h1>

          <section className={styles.contactSection}>
            <div className={styles.sectionContent}>
              {/* Form Wrapper */}
              <div className={styles.textContent}>
                <h2 className={styles.sectionTitle}>{t("contact.subtitle")}</h2>
                <p className={styles.sectionText}>{t("contact.desc")}</p>

                <form onSubmit={handleSubmit} className={styles.contactForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">{t("contact.form.name")}</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t("contact.form.namePlaceholder")}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email">{t("contact.form.email")}</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t("contact.form.emailPlaceholder")}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="message">{t("contact.form.message")}</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t("contact.form.messagePlaceholder")}
                      rows="5"
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className={styles.submitBtn}>
                    {t("contact.form.send")}
                  </button>

                  {status === "success" && (
                    <p className={styles.successMsg}>
                      {t("contact.successMsg")}
                    </p>
                  )}
                </form>
              </div>

              {/* Image Section */}
              <div className={styles.imageContent}>
                <img
                  src={ContactImage}
                  alt="Contact Drago"
                  className={styles.sectionImage}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ContactUs;
