// Astro configuration for static site generation and GitHub Pages deployment
// site: full URL where the site will be hosted
// base: repository name (must match your GitHub repo)
// trailingSlash: ensures all URLs end with / for consistency

import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://username.github.io',
  base: '/repo-name',
  trailingSlash: 'always',
  output: 'static'
});
