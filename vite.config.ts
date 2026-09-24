import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/trendgram/',

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg'],

      manifest: {
        name: 'Trendgram',
        short_name: 'Trendgram',
        description:
          'PWA de oportunidades de distorções e arbitragem estatística em mercados globais.',
        theme_color: '#0b1020',
        background_color: '#0b1020',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/trendgram/',
        scope: '/trendgram/',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],

  server: {
    host: '0.0.0.0',
    port: 5173
  },

  preview: {
    host: '0.0.0.0',
    port: 4173
  }
});
