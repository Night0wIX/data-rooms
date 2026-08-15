import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

// biome-ignore lint/style/noDefaultExport: default export required by Vite
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
});
