
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // Change to match correct worker for pdfjs-dist@4.x+
    include: ["pdfjs-dist/build/pdf.worker.mjs"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Update for correct worker entry file
          "pdfjs-worker": ["pdfjs-dist/build/pdf.worker.mjs"],
        },
      },
    },
  },
}));
