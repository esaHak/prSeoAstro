// Astro configuration for static site generation and Cloudflare Pages deployment
// site: full URL where the site will be hosted
// trailingSlash: ensures all URLs end with / for consistency

import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://prseoastro.pages.dev',
  trailingSlash: 'always',
  output: 'static',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      // Custom function to set priority based on URL depth
      serialize(item) {
        // Homepage gets highest priority
        if (item.url === 'https://prseoastro.pages.dev/') {
          item.priority = 1.0;
          item.changefreq = 'daily';
        }
        // Top-level categories (1 slash) get high priority
        else if ((item.url.match(/\//g) || []).length === 4) {
          item.priority = 0.9;
          item.changefreq = 'weekly';
        }
        // Second-level subcategories (2 slashes) get medium priority
        else if ((item.url.match(/\//g) || []).length === 5) {
          item.priority = 0.7;
          item.changefreq = 'weekly';
        }
        // Deeper pages get lower priority
        else {
          item.priority = 0.5;
          item.changefreq = 'monthly';
        }
        return item;
      }
    })
  ]
});
