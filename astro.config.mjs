import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';
import clerk from '@clerk/astro';

export default defineConfig({
  site: 'https://aihowto.shop',
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true },
    cloudflareModules: true,
    compatibilityFlags: ['nodejs_compat'],
  }),
  integrations: [
    clerk(),
    mdx(),
    tailwind(),
  ],
});
