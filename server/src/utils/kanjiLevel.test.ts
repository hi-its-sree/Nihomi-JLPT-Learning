import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeKanjiLevel, mapRequestedKanjiLevel } from './kanjiLevel'

describe('kanji level normalization', () => {
  it('converts legacy numeric values to modern JLPT labels', () => {
    assert.equal(normalizeKanjiLevel('1'), 'N1')
    assert.equal(normalizeKanjiLevel('2'), 'N2')
    assert.equal(normalizeKanjiLevel('3'), 'N3')
    assert.equal(normalizeKanjiLevel('4'), 'N4')
    assert.equal(normalizeKanjiLevel('5'), 'N5')
    assert.equal(normalizeKanjiLevel('OTHER'), 'OTHER')
  })

  it('keeps canonical levels unchanged and normalizes query values', () => {
    assert.equal(normalizeKanjiLevel('N3'), 'N3')
    assert.equal(mapRequestedKanjiLevel('N5'), 'N5')
    assert.equal(mapRequestedKanjiLevel('other'), 'OTHER')
    assert.equal(mapRequestedKanjiLevel('3'), 'N3')
  })
})
