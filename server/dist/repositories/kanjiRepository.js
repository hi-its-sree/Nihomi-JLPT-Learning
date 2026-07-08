import { db } from '../db';
const toKanjiRecord = (entry) => ({
    id: entry.id,
    character: entry.character,
    onReadings: entry.onReadings ?? [],
    kunReadings: entry.kunReadings ?? [],
    meaning: entry.meaning,
    level: String(entry.level ?? 'OTHER').trim().toUpperCase() === '5'
        ? 'OTHER'
        : String(entry.level ?? 'OTHER').trim().toUpperCase(),
    strokeCount: entry.strokeCount ?? null,
});
const mapRequestedKanjiLevel = (level) => {
    if (!level)
        return undefined;
    const normalized = String(level).trim().toUpperCase();
    switch (normalized) {
        case 'N1':
            return '1';
        case 'N2':
            return '2';
        case 'N3':
            return '3';
        case 'N4':
            return '4';
        case 'N5':
        case '5':
        case 'OTHER':
            return 'OTHER';
        default:
            return undefined;
    }
};
export const kanjiRepository = {
    async findMany(query) {
        const { page, limit, level, q, sortBy, sortOrder } = query;
        const where = {};
        const normalizedLevel = mapRequestedKanjiLevel(level);
        if (normalizedLevel) {
            if (Array.isArray(normalizedLevel)) {
                where.level = { in: normalizedLevel };
            }
            else {
                where.level = normalizedLevel;
            }
        }
        if (q) {
            where.OR = [
                { character: { contains: q, mode: 'insensitive' } },
                { meaning: { contains: q, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await Promise.all([
            db.kanjiEntry.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            db.kanjiEntry.count({ where }),
        ]);
        return {
            items: items.map(toKanjiRecord),
            total,
        };
    },
    async findByCharacter(character) {
        const entry = await db.kanjiEntry.findUnique({
            where: { character },
        });
        return entry ? toKanjiRecord(entry) : null;
    },
    async getRandom() {
        const count = await db.kanjiEntry.count();
        if (count === 0)
            return null;
        const skip = Math.floor(Math.random() * count);
        const entry = await db.kanjiEntry.findMany({
            take: 1,
            skip,
        });
        return entry[0] ? toKanjiRecord(entry[0]) : null;
    },
    async getStats() {
        const [total, grouped] = await Promise.all([
            db.kanjiEntry.count(),
            db.kanjiEntry.groupBy({
                by: ['level'],
                _count: { level: true },
            }),
        ]);
        return {
            total,
            byLevel: grouped.map((item) => ({
                level: item.level,
                count: item._count.level,
            })),
        };
    },
};
