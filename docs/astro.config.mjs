import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://cookiedialog.com', // Will work with any domain
  // base: '/cookiedialog', // Remove base for self-hosting
  outDir: './dist',
  integrations: [
    starlight({
      title: 'CookieDialog',
      description: 'Lightweight GDPR cookie consent dialog with geolocation support',
      logo: {
        light: './src/assets/cookie-sm.png',
        dark: './src/assets/cookie-sm.png',
        replacesTitle: false,
      },
      social: {
        github: 'https://github.com/timothydodd/cookiedialog',
      },
      // Theme options:
      // colorScheme: 'auto', // 'auto' (default), 'dark', 'light'
      // defaultLocale: 'root',
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', link: '/' },
            { label: 'Quick Start', link: '/getting-started/quick-start' },
            { label: 'Installation', link: '/getting-started/installation' },
            { label: 'Basic Usage', link: '/getting-started/basic-usage' },
          ],
        },
        {
          label: 'Configuration',
          items: [
            { label: 'Options', link: '/config/options' },
            { label: 'Categories', link: '/config/categories' },
            { label: 'Translations', link: '/config/translations' },
            { label: 'Themes', link: '/config/themes' },
          ],
        },
        {
          label: 'Features',
          items: [
            { label: 'Geolocation', link: '/features/geolocation' },
            { label: 'Storage', link: '/features/storage' },
            { label: 'Callbacks', link: '/features/callbacks' },
            { label: 'API Methods', link: '/features/api' },
          ],
        },
        {
          label: 'Examples',
          items: [
            { label: 'React', link: '/examples/react' },
            { label: 'Vue', link: '/examples/vue' },
            { label: 'Angular', link: '/examples/angular' },
            { label: 'WordPress', link: '/examples/wordpress' },
          ],
        },
        {
          label: 'Advanced',
          items: [
            { label: 'Custom Styling', link: '/advanced/styling' },
            { label: 'Custom Endpoint', link: '/advanced/endpoint' },
            { label: 'TypeScript', link: '/advanced/typescript' },
            { label: 'Testing', link: '/advanced/testing' },
          ],
        },
      ],
      head: [
        {
          tag: 'script',
          attrs: {
            src: 'https://cdn.jsdelivr.net/npm/cookiedialog@latest/dist/cookiedialog.min.js',
            defer: true,
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://cdn.jsdelivr.net/npm/cookiedialog@latest/dist/cookiedialog.min.css',
          },
        },
      ],
    }),
  ],
});