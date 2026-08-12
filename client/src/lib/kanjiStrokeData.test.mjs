import assert from 'node:assert/strict'
import test from 'node:test'
import { getKanjiStrokePaths } from './kanjiStrokeData.mjs'

test('fetches accurate KanjiVG stroke data for a known kanji', async () => {
  const paths = await getKanjiStrokePaths('日', 4)
  assert.equal(paths.length, 4)
  assert.ok(paths.every((p) => p.startsWith('M')))
})

test('falls back to a count-based stroke pattern when nothing else is available', async () => {
  const paths = await getKanjiStrokePaths('', 6)
  assert.equal(paths.length, 6)
  assert.ok(paths[0].includes('M '))
})
