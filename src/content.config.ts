import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const howToCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/how-to' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    tools: z.array(z.string()),
    tags: z.array(z.string()),
    readingTime: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const compareCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/compare' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    tools: z.array(z.string()),
    tags: z.array(z.string()),
  }),
});

export const collections = {
  'how-to': howToCollection,
  'compare': compareCollection,
};
