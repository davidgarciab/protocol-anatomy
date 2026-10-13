import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const source = z.object({
  title: z.string().min(3),
  url: z
    .string()
    .regex(/^https:\/\/\S+$/, 'Source URLs must be https and must not point at localhost')
    .refine((value) => !/localhost|127\.0\.0\.1/i.test(value), {
      message: 'Source URLs must not point at localhost',
    }),
  kind: z.enum(['docs', 'whitepaper', 'code', 'governance', 'security', 'specification', 'research']),
  publisher: z.string().min(2),
});

const version = z.object({
  name: z.string().min(1),
  status: z.enum(['released', 'active', 'historical', 'deprecated', 'proposed', 'in-development']),
  note: z.string().min(8),
});

const shared = {
  title: z.string().min(3),
  description: z.string().min(40).max(180),
  summary: z.string().min(80),
  status: z.literal('published'),
  published: date,
  lastVerified: date,
  tags: z.array(z.string().min(2)).min(1),
  sources: z.array(source).min(1),
  order: z.number().int().positive(),
};

const protocols = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/protocols' }),
  schema: z.object({
    ...shared,
    category: z.string().min(3),
    mechanism: z.string().min(12),
    versionContext: z.string().min(20),
    concepts: z.array(z.string()),
    guides: z.array(z.string()),
    glossary: z.array(z.string()),
    versions: z.array(version).min(1),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    ...shared,
    protocol: z.enum(['aave', 'uniswap', 'maker-sky', 'curve', 'lido']),
    versionContext: z.string().min(20),
    concepts: z.array(z.string()),
    glossary: z.array(z.string()),
    relatedGuides: z.array(z.string()),
    versions: z.array(version).min(1),
  }),
});

const concepts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/concepts' }),
  schema: z.object({
    ...shared,
    group: z.enum(['markets', 'credit', 'monetary', 'engineering']),
    protocols: z.array(z.string()),
    glossary: z.array(z.string()),
    related: z.array(z.string()),
  }),
});

const site = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/site' }),
  schema: z.object({
    ...shared,
  }),
});

export const collections = { protocols, guides, concepts, site };
