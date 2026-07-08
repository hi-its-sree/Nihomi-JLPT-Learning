import { z } from 'zod';
export const kanjiListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    level: z.string().trim().optional(),
    q: z.string().trim().optional(),
    sortBy: z.enum(['character', 'meaning', 'level', 'strokeCount']).default('character'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
});
export const kanjiCharacterParamSchema = z.object({
    character: z.string().trim().min(1),
});
