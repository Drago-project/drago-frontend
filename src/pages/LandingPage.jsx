import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import styles from "../styles/LandingPage.module.css";
import wave from "../assets/emotions/drago(wave).svg";
import Interactive from "../assets/animation/celebration drago.json";
import Dyslexic from "../assets/emotions/drago(reading).svg";
import Tracker from "../assets/animation/writting.json";
import Separator1 from "../assets/backgrunds/wave-haikei.svg";
import Separator2 from "../assets/backgrunds/wave-haikei (1).svg";

import { usePWAInstall } from "../hooks/usePWAInstall";
import { BsAspectRatio } from "react-icons/bs";
import Lottie from "lottie-react";

function LandingPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { canInstall, install } = usePWAInstall();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("install") === "true" && canInstall) {
      install(); // auto-trigger the prompt
    }
  }, [canInstall, install]);

  return (
    <div className={styles.landingPage} dir={isRTL ? "rtl" : "ltr"}>
      <HeroSection
        t={t}
        i18n={i18n}
        canInstall={canInstall}
        install={install}
      />

      <img
        src={Separator1}
        alt=""
        style={{
          display: "block",
          width: "100%",
          aspectRatio: "960 / 200",
          objectFit: "cover",
        }}
      />

      <FeatureCards i18n={i18n} />

      <img
        src={Separator2}
        alt=""
        style={{
          display: "block",
          width: "100%",
          aspectRatio: "960 / 200",
          objectFit: "cover",
        }}
      />

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

function HeroSection({ t, i18n, canInstall, install }) {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            {t("welcome")}{" "}
            <span className={styles.dragoHighlight}>{t("drago")}</span>
          </h1>
          <p className={styles.heroSubtitle}>
            {i18n.language === "ar"
              ? "تعلم بطريقة ممتعة وتفاعلية للأطفال ذوي عسر القراءة."
              : "Fun, interactive learning for dyslexic children."}
          </p>
          <div className={styles.heroActions}>
            <Link to="/signup" className="btn btn-primary">
              {t("lesson")}
            </Link>
            <Link to="/login" className="btn btn-outline">
              {i18n.language === "ar" ? "تسجيل دخول" : "Sign In"}
            </Link>

            {canInstall && (
              <button onClick={install} className="btn btn-outline">
                {i18n.language === "ar" ? "📲 تثبيت التطبيق" : "📲 Install App"}
              </button>
            )}
          </div>
        </div>
        <div>
          <img
            src={wave}
            alt="Drago waves"
            className={styles.dragoCharacter}
            width="500"
            height="500"
          />
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
    icon: {
      src: Dyslexic,
      alt: "Dyslexia friendly illustration",
    },
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
    icon: {
      animationData: Interactive,
      alt: "Interactive learning illustration",
    },
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
    icon: {
      animationData: Tracker,
      alt: "Progress tracking illustration",
    },
  },
];

function FeatureCards({ i18n }) {
  return (
    <section className={styles.featuresSection}>
      <div className={styles.featuresContainer}>
        <h2 className={styles.featuresTitle}>
          {i18n.language === "ar" ? "مميزات دراجو" : "Why Drago?"}
        </h2>
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
              bounce={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ title, description, icon, bounce }) {
  const isSvgIcon = icon && typeof icon === "object" && icon.src;
  const isLottieIcon = icon && typeof icon === "object" && icon.animationData;

  return (
    <div className={styles.featureCard}>
      <div className={styles.featureCardInner}>
        {/* Front */}
        <div className={styles.featureCardFront}>
          <div className={styles.featureIcon} style={bounce ? { animation: "bounce 2s infinite" } : {}}>
            {isLottieIcon ? (
              <Lottie
                animationData={icon.animationData}
                loop
                autoplay
                style={{ width: "100%", height: "100%" }}
              />
            ) : isSvgIcon ? (
              <img src={icon.src} alt={icon.alt || title} />
            ) : (
              icon
            )}
          </div>

          <h3 className={styles.featureTitle}>{title}</h3>

          {/* يظهر فقط في الموبايل */}
          <p className={styles.mobileDescription}>{description}</p>
        </div>

        {/* Back */}
        <div className={styles.featureCardBack}>
          <p className={styles.featureDescription}>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
