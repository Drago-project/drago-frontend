import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n.js";

import App from "./App.jsx";

import { registerSW } from "virtual:pwa-register";

// Auto-update silently in background
registerSW({ onNeedRefresh() {}, onOfflineReady() {} });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
