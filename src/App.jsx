import { useTranslation } from "react-i18next";
function App() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("welcome")}</h1>
      <LanguageToggle />
    </div>
  );
}

export default App;
