import { z } from 'zod'
import { CANONICAL_KANJI_LEVELS } from './kanjiLevel'

export const kanjiListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  level: z.string().trim().optional().transform((value) => (value ? value.toUpperCase() : value)).refine((value) => !value || CANONICAL_KANJI_LEVELS.includes(value as (typeof CANONICAL_KANJI_LEVELS)[number]), {
    message: 'level must be one of N5, N4, N3, N2, N1, or OTHER',
  }),
  q: z.string().trim().optional(),
  sortBy: z.enum(['character', 'meaning', 'level', 'strokeCount']).default('character'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export const kanjiCharacterParamSchema = z.object({
  character: z.string().trim().min(1),
})
