import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Plugin para generar automáticamente _redirects para Render Static Sites (SPA fallback)
const renderRedirectsPlugin = () => ({
  name: 'render-redirects',
  buildStart() {
    const publicDir = path.resolve(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicDir, '_redirects'), '/*    /index.html   200\n');
  },
  closeBundle() {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      fs.writeFileSync(path.join(distPath, '_redirects'), '/*    /index.html   200\n');
    }
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), renderRedirectsPlugin()],
})

