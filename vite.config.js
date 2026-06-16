import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["app-icon.svg", "fonts/**/*", "sounds/**/*"],
        manifest: {
          name: "Drago",
          short_name: "Drago",
          description: "AI-powered educational platform for dyslexia support",
          theme_color: "#44958E",
          background_color: "#F8F9FA",
          display: "standalone",
          orientation: "portrait",
          scope: "/",
          start_url: "/",
          icons: [
            {
              src: "app-icon.svg",
              sizes: "any",
              type: "image/svg+xml",
              purpose: "any",
            },
            {
              src: "icons/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "icons/icon-192.png",
              sizes: "192x192",
              type: "image/png",
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 4194304,
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2,otf,ttf}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/drago-back\.runasp\.net\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                networkTimeoutSeconds: 10,
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
    server: {
      proxy: {
        "/api/volcano/check_word": {
          target: env.HF_API_BASE || "https://mohamed4111-dyslexia-v2.hf.space",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/volcano/, ""),
          configure: (proxy, options) => {
            proxy.on("proxyReq", (proxyReq, req, res) => {
              if (env.HF_API_KEY) {
                proxyReq.setHeader("X-API-Key", env.HF_API_KEY);
              }
            });
          },
        },
        "/api/volcano": {
          target: env.HF_API_BASE || "https://mohamed4111-dyslexia-v2.hf.space",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/volcano/, ""),
        },
        "/api/tomb/questions": {
          target: env.HF_TOMB_URL || "https://huggingface.co/spaces/T1a2T3a4/tartiiiiib/raw/main/generated_questions.json",
          changeOrigin: true,
          rewrite: () => "",
        },
      },
    },
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
  };
});
