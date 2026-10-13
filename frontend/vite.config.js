import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The React dev server runs on http://localhost:5173
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
