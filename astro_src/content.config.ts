import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./astro_src/content/blog" }),
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
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./astro_src/content/revista" }),
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
