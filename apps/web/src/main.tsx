import "@/shared/i18n/i18n"

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import App from "./App.tsx"
import { QueryProvider } from "@/app/providers/query-provider"

import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>,
)