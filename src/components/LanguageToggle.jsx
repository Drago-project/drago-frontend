import { useTranslation } from "react-i18next";

function LanguageToggle({ onLanguageChange }) {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    // Call the callback function if provided (to close mobile menu)
    if (onLanguageChange) {
      onLanguageChange();
    }
  };

  const isArabic = i18n.language === "ar";

  return (
    <button
      onClick={toggleLanguage}
      className="language-toggle"
      style={{
        padding: "8px 16px",
        border: "2px solid #44968e",
        borderRadius: "8px",
        backgroundColor: "transparent",
        color: "#44968e",
        fontSize: '16px',
        fontFamily: "inherit",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
      onMouseOver={(e) => {
        const el = e.currentTarget;
        el.style.backgroundColor = "#44968e";
        el.style.color = "white";
      }}
      onMouseOut={(e) => {
        const el = e.currentTarget;
        el.style.backgroundColor = "transparent";
        el.style.color = "#44968e";
      }}
    >
      <span>{isArabic ? "English" : "العربية"}</span>
    </button>
  );
}

export default LanguageToggle;
