import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["app-icon.svg", "fonts/**/*", "sounds/**/*"],
      manifest: {
        name: "Drago - Dyslexia Learning App",
        short_name: "Drago",
        description: "AI-powered educational platform for dyslexia support",
        theme_color: "#44958E",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2,otf,ttf}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/drago-back\.runasp\.net\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
          {
            urlPattern: /^https:\/\/mohamed4111-dyslexia-v2\.hf\.space\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "hf-api-cache",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          i18n: ["i18next", "react-i18next"],
          lottie: ["lottie-react", "@lottiefiles/dotlottie-react"],
        },
      },
    },
  },
});
