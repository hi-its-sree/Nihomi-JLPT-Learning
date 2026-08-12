// Geometry for grading a hand-drawn stroke against the KanjiVG reference path.
//
// Everything works in the same 0-200 coordinate space the stroke player renders
// in, so drawn points and reference paths are directly comparable.
//
// The grading is deliberately forgiving: it checks that a stroke was drawn in
// roughly the right place, in roughly the right shape, in the right direction,
// and as the right stroke in the sequence. It is not handwriting recognition.

const SVG_NS = 'http://www.w3.org/2000/svg'

export const SAMPLES = 32

// Mean deviation (in viewBox units) still counted as a correct stroke. The
// canvas is 200 units across, so 30 is about 15% of the character's width.
const TOLERANCE_MEAN = 30
// A backwards stroke has to beat the forward reading by this much before we
// call it a direction error rather than a general shape miss.
const DIRECTION_MARGIN = 8
// Shorter than this (total drawn length) and it's a tap or a slip, not a stroke.
const MIN_STROKE_LENGTH = 12

let scratchSvg = null

function getScratchSvg() {
  if (scratchSvg && scratchSvg.isConnected) return scratchSvg
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('width', '0')
  svg.setAttribute('height', '0')
  svg.setAttribute('viewBox', '0 0 200 200')
  svg.style.position = 'absolute'
  svg.style.left = '-9999px'
  svg.style.pointerEvents = 'none'
  document.body.appendChild(svg)
  scratchSvg = svg
  return svg
}

// Turn an SVG path 'd' string into evenly spaced points, by measuring the real
// path with the browser's own geometry rather than parsing the commands.
export function samplePath(d, samples = SAMPLES) {
  if (!d) return []
  const svg = getScratchSvg()
  const path = document.createElementNS(SVG_NS, 'path')
  path.setAttribute('d', d)
  svg.appendChild(path)
  try {
    const length = path.getTotalLength()
    if (!length || !Number.isFinite(length)) return []
    const points = []
    for (let i = 0; i < samples; i += 1) {
      const at = path.getPointAtLength((length * i) / (samples - 1))
      points.push({ x: at.x, y: at.y })
    }
    return points
  } catch {
    return []
  } finally {
    svg.removeChild(path)
  }
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function polylineLength(points) {
  let total = 0
  for (let i = 1; i < points.length; i += 1) total += distance(points[i - 1], points[i])
  return total
}

// Resample a freehand polyline to a fixed number of evenly spaced points so it
// can be compared point-for-point against a sampled reference path.
export function resample(points, samples = SAMPLES) {
  if (points.length === 0) return []
  if (points.length === 1) return Array.from({ length: samples }, () => points[0])

  // Interpolated points get spliced into the working copy as the walk proceeds,
  // so copy first — callers keep their own array intact.
  const working = points.map((point) => ({ x: point.x, y: point.y }))

  const total = polylineLength(working)
  if (total === 0) return Array.from({ length: samples }, () => working[0])

  const step = total / (samples - 1)
  const out = [working[0]]
  let segmentIndex = 1
  let carried = 0

  while (out.length < samples && segmentIndex < working.length) {
    const from = working[segmentIndex - 1]
    const to = working[segmentIndex]
    const segment = distance(from, to)

    if (carried + segment >= step) {
      const ratio = (step - carried) / segment
      const next = { x: from.x + (to.x - from.x) * ratio, y: from.y + (to.y - from.y) * ratio }
      out.push(next)
      working.splice(segmentIndex, 0, next)
      segmentIndex += 1
      carried = 0
    } else {
      carried += segment
      segmentIndex += 1
    }
  }

  while (out.length < samples) out.push(working[working.length - 1])
  return out
}

function meanDistance(a, b) {
  const count = Math.min(a.length, b.length)
  if (count === 0) return Infinity
  let total = 0
  for (let i = 0; i < count; i += 1) total += distance(a[i], b[i])
  return total / count
}

// How far a drawn stroke sits from one reference stroke, in both directions.
export function strokeDeviation(drawnPoints, targetPoints) {
  if (!targetPoints || targetPoints.length === 0) return { forward: Infinity, backward: Infinity }
  const drawn = resample(drawnPoints, targetPoints.length)
  return {
    forward: meanDistance(drawn, targetPoints),
    backward: meanDistance(drawn, [...targetPoints].reverse()),
  }
}

// Grade one drawn stroke against the stroke the learner was asked for, using
// the remaining strokes to tell "wrong shape" apart from "wrong order".
//
// `targets` is the full list of sampled reference strokes; `expectedIndex` is
// the stroke the drill is currently asking for.
export function gradeStroke(drawnPoints, targets, expectedIndex) {
  const expected = targets[expectedIndex]
  if (!expected || expected.length === 0) {
    return { ok: false, reason: 'unavailable', message: 'No reference stroke for this character.' }
  }

  if (drawnPoints.length < 2 || polylineLength(drawnPoints) < MIN_STROKE_LENGTH) {
    return { ok: false, reason: 'too-short', message: 'That was too short to read as a stroke — draw the whole line.' }
  }

  const { forward, backward } = strokeDeviation(drawnPoints, expected)

  if (forward <= TOLERANCE_MEAN) {
    return { ok: true, reason: 'match', deviation: forward, message: 'Nice — that stroke is in the right place.' }
  }

  // Same line, drawn the wrong way round. Worth calling out on its own: stroke
  // direction is a rule learners are meant to internalise, not a near miss.
  if (backward <= TOLERANCE_MEAN && backward + DIRECTION_MARGIN < forward) {
    return { ok: false, reason: 'direction', deviation: backward, message: 'Right line, wrong direction — kanji strokes go top-to-bottom and left-to-right.' }
  }

  // Does it match some other stroke better? Then it's an ordering mistake.
  let bestIndex = -1
  let bestDeviation = Infinity
  targets.forEach((target, index) => {
    if (index === expectedIndex) return
    const { forward: otherForward } = strokeDeviation(drawnPoints, target)
    if (otherForward < bestDeviation) {
      bestDeviation = otherForward
      bestIndex = index
    }
  })

  if (bestIndex >= 0 && bestDeviation <= TOLERANCE_MEAN && bestDeviation < forward) {
    return {
      ok: false,
      reason: 'order',
      deviation: bestDeviation,
      matchedIndex: bestIndex,
      message: `That's stroke ${bestIndex + 1} — stroke ${expectedIndex + 1} comes first.`,
    }
  }

  return { ok: false, reason: 'shape', deviation: forward, message: 'Not quite — check the position and shape, then try again.' }
}
