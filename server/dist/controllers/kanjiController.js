import { kanjiService } from '../services/kanjiService';
import { buildResponse } from '../utils/response';
import { kanjiListQuerySchema, kanjiCharacterParamSchema } from '../utils/validation';
import { normalizeKanjiLevel } from '../utils/kanjiLevel';
const normalizeQueryValue = (value) => {
    if (value === null || value === undefined)
        return undefined;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
};
export class KanjiController {
    async list(c) {
        try {
            const rawQuery = {
                page: normalizeQueryValue(c.req.query('page')),
                limit: normalizeQueryValue(c.req.query('limit')),
                level: normalizeQueryValue(c.req.query('level')) ? normalizeKanjiLevel(normalizeQueryValue(c.req.query('level'))) : undefined,
                q: normalizeQueryValue(c.req.query('q')),
                sortBy: normalizeQueryValue(c.req.query('sortBy')),
                sortOrder: normalizeQueryValue(c.req.query('sortOrder')),
            };
            const parsed = kanjiListQuerySchema.safeParse(rawQuery);
            if (!parsed.success) {
                console.error('Invalid kanji query parameters', { rawQuery, errors: parsed.error.format() });
                return c.json({ success: false, message: 'Invalid query parameters', errors: parsed.error.flatten() }, 400);
            }
            const { items, pagination } = await kanjiService.listKanji(parsed.data);
            return c.json(buildResponse('Kanji fetched successfully', items, pagination), 200);
        }
        catch (error) {
            console.error('Failed to fetch kanji list', error);
            return c.json({ success: false, message: 'Failed to fetch kanji list' }, 500);
        }
    }
    async getByCharacter(c) {
        try {
            const parsed = kanjiCharacterParamSchema.safeParse({
                character: c.req.param('character'),
            });
            if (!parsed.success) {
                return c.json({ success: false, message: 'Invalid character parameter' }, 400);
            }
            const entry = await kanjiService.getKanjiByCharacter(parsed.data.character);
            if (!entry) {
                return c.json({ success: false, message: 'Kanji not found' }, 404);
            }
            return c.json(buildResponse('Kanji fetched successfully', entry), 200);
        }
        catch (error) {
            console.error('Failed to fetch kanji details', error);
            return c.json({ success: false, message: 'Failed to fetch kanji details' }, 500);
        }
    }
    async getRandom(c) {
        try {
            const entry = await kanjiService.getRandomKanji();
            if (!entry) {
                return c.json({ success: false, message: 'No kanji available' }, 404);
            }
            return c.json(buildResponse('Random kanji fetched successfully', entry), 200);
        }
        catch (error) {
            console.error('Failed to fetch random kanji', error);
            return c.json({ success: false, message: 'Failed to fetch random kanji' }, 500);
        }
    }
    async getStats(c) {
        try {
            const stats = await kanjiService.getStats();
            return c.json(buildResponse('Kanji statistics fetched successfully', stats), 200);
        }
        catch (error) {
            console.error('Failed to fetch kanji statistics', error);
            return c.json({ success: false, message: 'Failed to fetch kanji statistics' }, 500);
        }
    }
}
export const kanjiController = new KanjiController();
