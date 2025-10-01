import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styles from "../styles/LandingPage.module.css";
import wave from "../assets/emotions/drago(wave).svg";

function LandingPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div className={styles.landingPage} dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>{t("welcome")}</h1>
            <p className={styles.heroSubtitle}>
              {i18n.language === "ar"
                ? "تطبيق تعليمي مخصص للأطفال المصابين بعسر القراءة، يساعدهم على تعلم القراءة بطريقة ممتعة وتفاعلية مع دراجو الصديق المفضل"
                : "An educational app designed for children with dyslexia, helping them learn to read in a fun and interactive way with their favorite buddy Drago"}
            </p>
            <div className={styles.heroActions}>
              <Link to="/signup" className="btn btn-primary">
                {t("lesson")}
              </Link>
              <Link to="/login" className="btn btn-outline">
                {i18n.language === "ar" ? "تسجيل دخول" : "Sign In"}
              </Link>
            </div>
          </div>
          <div>
            <img
              src={wave}
              alt="Drago waves"
              className="styles.dragoCharacter"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresContainer}>
          <h2 className={styles.featuresTitle}>
            {i18n.language === "ar" ? "لماذا دراجو؟" : "Why Drago?"}
          </h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎯</div>
              <h3 className={styles.featureTitle}>
                {i18n.language === "ar"
                  ? "مخصص لعسر القراءة"
                  : "Dyslexia-Friendly"}
              </h3>
              <p className={styles.featureDescription}>
                {i18n.language === "ar"
                  ? "مصمم خصيصاً للأطفال المصابين بعسر القراءة مع خطوط ومساعدات بصرية مناسبة"
                  : "Specifically designed for children with dyslexia using appropriate fonts and visual aids"}
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎮</div>
              <h3 className={styles.featureTitle}>
                {i18n.language === "ar"
                  ? "تعلم تفاعلي"
                  : "Interactive Learning"}
              </h3>
              <p className={styles.featureDescription}>
                {i18n.language === "ar"
                  ? "العاب وأنشطة تفاعلية تجعل التعلم ممتعاً ومشوقاً"
                  : "Engaging games and interactive activities that make learning fun and exciting"}
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📈</div>
              <h3 className={styles.featureTitle}>
                {i18n.language === "ar" ? "تتبع التقدم" : "Progress Tracking"}
              </h3>
              <p className={styles.featureDescription}>
                {i18n.language === "ar"
                  ? "تتبع تقدم طفلك وحصل على تقارير مفصلة عن أدائه"
                  : "Track your child's progress and get detailed reports on their performance"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>
            {i18n.language === "ar"
              ? "ابدأ رحلة التعلم اليوم"
              : "Start the Learning Journey Today"}
          </h2>
          <p className={styles.ctaSubtitle}>
            {i18n.language === "ar"
              ? "انضم إلى آلاف الأطفال الذين يتعلمون القراءة مع دراجو"
              : "Join thousands of children learning to read with Drago"}
          </p>
          <div className={styles.ctaActions}>
            <Link to="/signup" className="btn btn-primary">
              {i18n.language === "ar"
                ? "إنشاء حساب مجاني"
                : "Create Free Account"}
            </Link>
            <Link to="#" className="btn btn-outline">
              {i18n.language === "ar" ? "معرفة المزيد" : "Learn More"}
            </Link>
          </div>
        </div>
          <p>copyright © 2026 Drago</p>
      </section>
    </div>
  );
}

export default LandingPage;
