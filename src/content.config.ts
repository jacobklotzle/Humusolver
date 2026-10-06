import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const seo = {
  title: z.string().max(70),
  description: z.string().max(170),
};

const products = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/products' }),
  schema: ({ image }) =>
    z.object({
      ...seo,
      name: z.string(),
      order: z.number(),
      form: z.string(),
      tagline: z.string(),
      summary: z.string(),
      bestFor: z.array(z.string()),
      body: z.array(z.string()),
      image: image(),
      imageAlt: z.string(),
      omriEligible: z.boolean().default(false),
      rates: z.array(z.object({ use: z.string(), rate: z.string(), notes: z.string().optional() })),
      packages: z.array(z.object({ size: z.string(), price: z.string(), note: z.string().optional() })),
      faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    }),
});

const uses = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/uses' }),
  schema: ({ image }) =>
    z.object({
      ...seo,
      h1: z.string(),
      kind: z.enum(['audience', 'method']),
      order: z.number(),
      cardTitle: z.string(),
      summary: z.string(),
      lede: z.string(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      products: z.array(z.string()).default([]),
      operation: z.string().optional(), // pre-selects the quote form
      researchTags: z.array(z.string()).default([]),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.object({
      ...seo,
      h1: z.string(),
      eyebrow: z.string().optional(),
      lede: z.string().optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
    }),
});

const research = defineCollection({
  loader: file('./src/content/research.yaml'),
  schema: z.object({
    category: z.enum(['crops', 'soil', 'pasture', 'livestock', 'review']),
    title: z.string(),
    authors: z.string(),
    year: z.number(),
    journal: z.string(),
    url: z.url(),
    doi: z.string().optional(),
    openAccess: z.boolean(),
    studyType: z.string(),
    conditions: z.string(),
    finding: z.string(),
    result: z.enum(['positive', 'mixed', 'none']).default('positive'),
    tags: z.array(z.string()).default([]),
  }),
});

const faq = defineCollection({
  loader: file('./src/content/faq.yaml'),
  schema: z.object({
    order: z.number().default(0),
    q: z.string(),
    a: z.string(),
    topic: z.enum(['product', 'application', 'ordering', 'science', 'organic']),
    home: z.boolean().default(false),
  }),
});

const photos = defineCollection({
  loader: file('./src/content/photos.yaml'),
  schema: ({ image }) =>
    z.object({
      order: z.number().default(0),
      src: image(),
      alt: z.string(),
      caption: z.string(),
      group: z.enum(['Row crops', 'Roots', 'Pasture & forage', 'Greenhouse', 'Fruit & vegetables']),
    }),
});

export const collections = { products, uses, pages, research, faq, photos };
