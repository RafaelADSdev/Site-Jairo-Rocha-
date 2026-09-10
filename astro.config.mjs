import { defineConfig } from 'astro/config';
export default defineConfig({
  devToolbar: { enabled: false },
  redirects: {
    '/imovel/sopro': '/sopro'
  },
  vite: {
    server: {
      watch: {
        ignored: ['**/*.pdf']
      }
    }
  }
});
