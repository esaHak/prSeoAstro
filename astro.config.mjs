// Astro configuration for static site generation and Cloudflare Pages deployment
// site: full URL where the site will be hosted
// trailingSlash: ensures all URLs end with / for consistency

import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://prseoastro.pages.dev',
  trailingSlash: 'always',
  output: 'static'
});
