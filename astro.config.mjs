// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { site } from './src/data/site.ts';

// https://astro.build/config
export default defineConfig({
  site: site.url,
  integrations: [sitemap()],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          loadPaths: ['./src/styles'],
          additionalData: (content, filepath) => {
            const name = String(filepath ?? '').replace(/\\/g, '/');
            if (name.includes('_variables.scss') || name.includes('_mixins.scss')) {
              return content;
            }
            return `@use "variables" as *;\n@use "mixins" as *;\n${content}`;
          },
        },
      },
    },
  },
});
