import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Чтобы GitLab Pages работал и на уникальном домене, и в подпапке проекта
  base: './',
  plugins: [react()],
})
