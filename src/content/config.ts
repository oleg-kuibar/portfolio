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
    // Series support
    series: z.string().optional(),
    seriesPart: z.number().int().positive().optional(),
    seriesDescription: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
