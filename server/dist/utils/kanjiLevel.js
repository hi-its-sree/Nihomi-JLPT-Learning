const LEVEL_ORDER = ['N5', 'N4', 'N3', 'N2', 'N1'];
export const CANONICAL_KANJI_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1', 'OTHER'];
export const normalizeKanjiLevel = (value) => {
    const raw = String(value ?? 'OTHER').trim().toUpperCase();
    switch (raw) {
        case '1':
            return 'N1';
        case '2':
            return 'N2';
        case '3':
            return 'N3';
        case '4':
            return 'N4';
        case '5':
            return 'N5';
        case 'OTHER':
            return 'OTHER';
        default:
            return raw;
    }
};
export const mapRequestedKanjiLevel = (level) => {
    if (!level)
        return undefined;
    const normalized = normalizeKanjiLevel(level);
    if (CANONICAL_KANJI_LEVELS.includes(normalized)) {
        return normalized;
    }
    return undefined;
};
export const sortKanjiLevels = (values) => {
    const unique = Array.from(new Set(values.map((value) => normalizeKanjiLevel(value)).filter(Boolean)));
    return unique.sort((a, b) => LEVEL_ORDER.indexOf(a) - LEVEL_ORDER.indexOf(b));
};
