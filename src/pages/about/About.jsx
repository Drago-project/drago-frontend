import { useTranslation } from "react-i18next";
import Image01 from "../../assets/about/section-01.jpeg";
import Image02 from "../../assets/about/section-02.jpeg";
import Image03 from "../../assets/about/section-03.jpeg";
import "./About.css";
import Footer from "../../components/Footer";

function About() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <>
      {" "}
      <div className={`about-page ${isArabic ? "rtl" : "ltr"}`}>
        <div className="container">
          <h1 className="page-title">{t("about.title")}</h1>

          {/* Section 1: What is Dyslexia? */}
          <section className="about-section">
            <div className="section-content">
              <div className="text-content">
                <h2 className="section-title">{t("about.section1.title")}</h2>
                <p className="section-text">{t("about.section1.content")}</p>
              </div>
              <div className="image-content">
                <img
                  src={Image01}
                  alt={t("about.section1.title")}
                  className="section-image"
                />
              </div>
            </div>
          </section>

          {/* Section 2: How Does Dyslexia Affect Learning? */}
          <section className="about-section reverse">
            <div className="section-content">
              <div className="image-content">
                <img
                  src={Image02}
                  alt={t("about.section2.title")}
                  className="section-image"
                />
              </div>
              <div className="text-content">
                <h2 className="section-title">{t("about.section2.title")}</h2>
                <p className="section-text">{t("about.section2.content")}</p>
              </div>
            </div>
          </section>

          {/* Section 3: How Our Games Help */}
          <section className="about-section">
            <div className="section-content">
              <div className="text-content">
                <h2 className="section-title">{t("about.section3.title")}</h2>
                <p className="section-text">{t("about.section3.content")}</p>
              </div>
              <div className="image-content">
                <img
                  src={Image03}
                  alt={t("about.section3.title")}
                  className="section-image"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer></Footer>
    </>
  );
}

export default About;
