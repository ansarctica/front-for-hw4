import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite" // <--- Important
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()], // <--- Plugin must be here
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})