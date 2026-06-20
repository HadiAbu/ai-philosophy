import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Polling is required for HMR to work inside Docker on Windows
    // because inotify events don't propagate from the host filesystem.
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
})
