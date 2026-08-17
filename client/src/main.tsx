import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import "@fontsource-variable/inter";
import "@/styles/index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to initialize the application");
}

const root = createRoot(rootElement);

root.render(
  // <StrictMode>
  <App />,
  // </StrictMode>,
);
