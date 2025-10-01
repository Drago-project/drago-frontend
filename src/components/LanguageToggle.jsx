import { useTranslation } from "react-i18next";

function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
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
        e.target.style.backgroundColor = "#44968e";
        e.target.style.color = "white";
      }}
      onMouseOut={(e) => {
        e.target.style.backgroundColor = "transparent";
        e.target.style.color = "#44968e";
      }}
    >
      <span>{isArabic ? "English" : "العربية"}</span>
    </button>
  );
}

export default LanguageToggle;
