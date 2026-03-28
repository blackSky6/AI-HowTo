import { defineCollection, z } from 'astro:content';

const howToCollection = defineCollection({
  type: 'content',
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
  type: 'content',
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
