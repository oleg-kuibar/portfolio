import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    author: z.string().default('Oleg Kuibar'),
    tags: z.array(z.string()),
    category: z.enum([
      'Frontend',
      'Backend',
      'DevOps',
      'Architecture',
      'Career',
      'Tutorial',
      'Thoughts',
    ]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
};
