// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
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
