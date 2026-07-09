const LEVEL_ORDER = ['N5', 'N4', 'N3', 'N2', 'N1'] as const

export const CANONICAL_KANJI_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1', 'OTHER'] as const

export const normalizeKanjiLevel = (value?: string | number | null): string => {
  const raw = String(value ?? 'OTHER').trim().toUpperCase()

  switch (raw) {
    case '1':
      return 'N1'
    case '2':
      return 'N2'
    case '3':
      return 'N3'
    case '4':
      return 'N4'
    case '5':
      return 'N5'
    case 'OTHER':
      return 'OTHER'
    default:
      return raw
  }
}

export const mapRequestedKanjiLevel = (level?: string): string | undefined => {
  if (!level) return undefined

  const normalized = normalizeKanjiLevel(level)

  if (CANONICAL_KANJI_LEVELS.includes(normalized as (typeof CANONICAL_KANJI_LEVELS)[number])) {
    return normalized
  }

  return undefined
}

export const sortKanjiLevels = (values: string[]) => {
  const unique = Array.from(new Set(values.map((value) => normalizeKanjiLevel(value)).filter(Boolean)))
  return unique.sort((a, b) => LEVEL_ORDER.indexOf(a as typeof LEVEL_ORDER[number]) - LEVEL_ORDER.indexOf(b as typeof LEVEL_ORDER[number]))
}
