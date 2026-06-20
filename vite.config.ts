import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/ekb-metro/" : "/",

  plugins: [react(), tailwindcss()],

  build: {
    target: "es2022",
    sourcemap: false,
    cssCodeSplit: true,
    reportCompressedSize: true,
  },

  server: {
    port: 3000,
    host: "0.0.0.0",
    hmr: process.env.DISABLE_HMR !== "true",
    watch: process.env.DISABLE_HMR === "true" ? null : {},
  },

  preview: {
    port: 4173,
    open: true,
  },
}));
