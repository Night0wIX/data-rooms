import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

const rootDir = dirname(fileURLToPath(import.meta.url));

// biome-ignore lint/style/noDefaultExport: default export required by Vite
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],

  resolve: {
    alias: {
      "@": resolve(rootDir, "src"),
    },
  },
});