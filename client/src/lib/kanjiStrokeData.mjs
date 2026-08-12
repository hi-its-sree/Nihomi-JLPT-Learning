// Hand-authored fallback strokes, used only when the KanjiVG lookup is
// unavailable (e.g. offline). These are rough approximations, not accurate
// stroke data — real accuracy comes from fetchKanjiVGPaths below.
const STROKE_DATA = {
  日: [
    'M 60,25 L 140,25',
    'M 60,25 L 60,175',
    'M 140,25 L 140,175',
    'M 60,100 L 140,100',
    'M 60,175 L 140,175',
  ],
  水: [
    'M 100,20 L 100,80',
    'M 100,80 C 80,120 40,150 30,170',
    'M 100,80 C 120,120 160,150 170,170',
    'M 55,95 C 45,120 40,140 50,160',
  ],
  山: [
    'M 50,150 L 50,50 L 50,150',
    'M 100,150 L 100,20 L 100,150',
    'M 150,150 L 150,80 L 150,150',
    'M 30,150 L 170,150',
  ],
  学: [
    'M 80,20 L 80,60',
    'M 60,40 L 140,40',
    'M 100,20 L 100,80',
    'M 50,80 L 150,80',
    'M 100,80 L 100,180',
    'M 60,120 L 140,120',
    'M 60,160 L 80,180 L 100,160',
    'M 100,160 L 120,180 L 140,160',
  ],
  人: [
    'M 70,35 L 70,170',
    'M 130,35 L 130,170',
    'M 60,95 L 140,95',
  ],
  大: [
    'M 50,35 L 50,165',
    'M 150,35 L 150,165',
    'M 55,100 L 145,100',
  ],
}

// KanjiVG stroke paths are authored on a 109x109 canvas; the player renders
// on a 0-200 viewBox, so fetched paths must be scaled up to line up with the
// grid and with the hand-authored/fallback data above.
const KANJIVG_VIEWBOX = 109
const TARGET_VIEWBOX = 200
const SCALE = TARGET_VIEWBOX / KANJIVG_VIEWBOX

const strokeCache = new Map()

function scalePathData(d, scale) {
  return d.replace(/-?\d*\.?\d+/g, (num) => {
    const scaled = parseFloat(num) * scale
    return Number.isInteger(scaled) ? String(scaled) : scaled.toFixed(2)
  })
}

function buildFallbackPaths(strokeCount) {
  const count = Math.max(1, Math.min(8, Number(strokeCount) || 4))
  return Array.from({ length: count }, (_, index) => {
    const y = 30 + index * 18
    return `M 50,${y} L 150,${Math.min(170, y + 8)}`
  })
}

function parseKanjiVGPaths(xmlText) {
  if (!xmlText) return []

  const strokeMatches = [...xmlText.matchAll(/<path[^>]*d="([^"]+)"/g)]
  if (strokeMatches.length === 0) return []

  return strokeMatches.map((match) => scalePathData(match[1].trim(), SCALE))
}

export async function fetchKanjiVGPaths(character) {
  const char = String(character ?? '').trim()
  if (!char) return []

  try {
    const response = await fetch(`https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg/kanji/${char.codePointAt(0).toString(16).toLowerCase().padStart(5, '0')}.svg`)
    if (!response.ok) return []
    const xmlText = await response.text()
    return parseKanjiVGPaths(xmlText)
  } catch {
    return []
  }
}

export async function getKanjiStrokePaths(character, strokeCount) {
  const char = String(character ?? '').trim()
  if (!char) return buildFallbackPaths(strokeCount)

  if (strokeCache.has(char)) return strokeCache.get(char)

  // Prefer the real KanjiVG stroke data — it's the accurate, authoritative
  // source. Hand-authored/synthetic paths are only used when that lookup fails.
  const kanjiVGPaths = await fetchKanjiVGPaths(char)
  const result = kanjiVGPaths.length > 0
    ? kanjiVGPaths
    : (STROKE_DATA[char] || buildFallbackPaths(strokeCount))

  strokeCache.set(char, result)
  return result
}
