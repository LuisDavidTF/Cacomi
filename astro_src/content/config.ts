import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content', // v2 syntax, or use loaders for v5/v6 if needed, but 'content' works fine for .md in /content
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    author: z.string().default('Equipo Cacomi'),
    image: z.string().optional(),
    tags: z.array(z.string()).optional()
  })
});

const revistaCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    number: z.number(), // Número de edición
    articles: z.array(z.string()) // Array of blog slugs
  })
});

export const collections = {
  'blog': blogCollection,
  'revista': revistaCollection,
};
