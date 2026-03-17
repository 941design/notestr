import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon.svg"],
      manifest: {
        name: "notetastr — encrypted task manager",
        short_name: "notetastr",
        description: "Encrypted task manager on Nostr with MLS groups",
        theme_color: "#0d1117",
        background_color: "#0d1117",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,woff,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^wss?:\/\/.*/,
            handler: "NetworkOnly" as const,
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
  define: {
    global: "globalThis",
  },
});
