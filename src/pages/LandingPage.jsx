import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import styles from "../styles/LandingPage.module.css";
import wave from "../assets/emotions/drago(wave).svg";

function LandingPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div className={styles.landingPage} dir={isRTL ? "rtl" : "ltr"}>
      <HeroSection t={t} i18n={i18n} />
      <FeatureCards i18n={i18n} />

      {/* Call to Action Section */}

      <Footer>
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
          <Link to="/about" className="btn btn-secondary">
            {i18n.language === "ar"
              ? " معرفة المزيد عن الديسليكسيا"
              : "Learn More about dyslexia"}
          </Link>
        </div>
      </Footer>
    </div>
  );
}

function HeroSection({ t, i18n }) {
  return (
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
          <img src={wave} alt="Drago waves" className="styles.dragoCharacter" />
        </div>
      </div>
    </section>
  );
}

const cards = [
  {
    title: {
      en: "Dyslexia-Friendly",
      ar: "مخصص لعسر القراءة",
    },
    description: {
      en: "Specifically designed for children with dyslexia using appropriate fonts and visual aids",
      ar: "مصمم خصيصاً للأطفال المصابين بعسر القراءة مع خطوط ومساعدات بصرية مناسبة",
    },
    icon: "🎯",
  },
  {
    title: {
      en: "Interactive Learning",
      ar: "تعلم تفاعلي",
    },
    description: {
      en: "Engaging games and interactive activities that make learning fun and exciting",
      ar: "العاب وأنشطة تفاعلية تجعل التعلم ممتعاً ومشوقاً",
    },
    icon: "🎮",
  },
  {
    title: {
      en: "Progress Tracking",
      ar: "تتبع التقدم",
    },
    description: {
      en: "Track your child's progress and get detailed reports on their performance",
      ar: "تتبع تقدم طفلك وحصل على تقارير مفصلة عن أدائه",
    },
    icon: "📈",
  },
];

function FeatureCards({ i18n }) {
  return (
    <section className={styles.featuresSection}>
      <div className={styles.featuresContainer}>
        <div className={styles.featuresGrid}>
          {cards.map((card, index) => (
            <Card
              key={index}
              title={i18n.language === "ar" ? card.title.ar : card.title.en}
              description={
                i18n.language === "ar"
                  ? card.description.ar
                  : card.description.en
              }
              icon={card.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ title, description, icon }) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureIcon}>{icon}</div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDescription}>{description}</p>
    </div>
  );
}

export default LandingPage;
