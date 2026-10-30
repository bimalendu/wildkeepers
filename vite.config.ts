import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages serves the site from /<repo>/; override with VITE_BASE for other hosts.
const base = process.env.VITE_BASE ?? '/wildkeepers/';

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

/**
 * Phaser's own bundler rewrites `typeof SOME_FLAG` into true/false at build time. Building from its source (which we do
 * to leave out the physics engines and other unused modules) means doing that rewrite ourselves; left alone, those
 * expressions are always truthy and would switch on the WebGL debug build.
 */
const phaserFlags = (): Plugin => ({
  name: 'phaser-build-flags',
  enforce: 'pre',
  transform(code, id) {
    if (!id.includes('/node_modules/phaser/src/')) return null;
    return code
      .replace(/typeof (WEBGL_RENDERER|CANVAS_RENDERER|FEATURE_SOUND)\b/g, 'true')
      .replace(/typeof (WEBGL_DEBUG|PLUGIN_CAMERA3D|PLUGIN_FBINSTANT)\b/g, 'false');
  },
});

export default defineConfig(({ command }) => ({
  base,
  // Production builds use a trimmed Phaser (src/phaser-lite.js). Dev and tests use the stock package.
  resolve:
    command === 'build'
      ? {
          alias: [
            { find: /^phaser$/, replacement: here('./src/phaser-lite.js') },
            { find: 'phaser3spectorjs', replacement: here('./src/empty.js') },
          ],
        }
      : {},
  define: command === 'build' ? { global: 'globalThis' } : {},
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: { manualChunks: (id: string) => (id.includes('node_modules/phaser') ? 'phaser' : undefined) },
    },
  },
  plugins: [
    ...(command === 'build' ? [phaserFlags()] : []),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icons/*.png'],
      workbox: { globPatterns: ['**/*.{js,css,html,png,svg,json,woff2,woff}'] },
      manifest: {
        name: 'Wildkeepers',
        short_name: 'Wildkeepers',
        description: 'Lead activist campaigns to restore ecosystems in every region of the world.',
        theme_color: '#10261c',
        background_color: '#10261c',
        display: 'standalone',
        orientation: 'any',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    include: ['tests/**/*.test.ts'],
    fsModuleCache: false,
  },
}));
