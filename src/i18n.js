import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resources from "./content/locales";

const RTL_LANGUAGES = "ar";

// Function to update document direction and language
const updateDocumentLanguage = (lng) => {
  const isRTL = RTL_LANGUAGES === lng;
  document.documentElement.lang = lng;
  document.documentElement.dir = isRTL ? "rtl" : "ltr";

  // Update title for accessibility
  document.title = lng === "ar" ? "دراجو" : "Drago";
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "drago_language",
    },
    // React options for better performance
    react: {
      useSuspense: false,
      bindI18n: "languageChanged loaded",
    },

    // Debugging in development
     debug: import.meta.env.DEV
  });

i18n.on("languageChanged", updateDocumentLanguage);
updateDocumentLanguage(i18n.language);

export default i18n;
