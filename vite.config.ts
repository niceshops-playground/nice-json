import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Base path for GitHub Pages. The site is served from
// https://<user>.github.io/nice-json/. Override with VITE_BASE if you host it
// under a different path (e.g. a custom domain → "/").
const base = process.env.VITE_BASE ?? '/nice-json/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Nice JSON',
        short_name: 'Nice JSON',
        description:
          'Fast, private JSON pretty-printer, minifier and tree viewer. Everything runs in your browser.',
        theme_color: '#ec6608',
        background_color: '#1c1a17',
        display: 'standalone',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
})
