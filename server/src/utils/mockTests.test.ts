import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildMockTestsPayload } from './mockTests'

describe('buildMockTestsPayload', () => {
  it('builds live mock tests from real content and user mastery', () => {
    const payload = buildMockTestsPayload({
      currentLevel: 'N3',
      progressEntries: [
        { level: 'N3', category: 'vocabulary', mastery: 72 },
        { level: 'N3', category: 'grammar', mastery: 64 },
      ],
      vocabularyEntries: [
        { word: '学校', meaning: 'school' },
        { word: '先生', meaning: 'teacher' },
      ],
      kanjiEntries: [{ character: '学', meaning: 'study' }],
      grammarEntries: [{ pattern: '〜てください', meaning: 'please do' }],
      availableLevels: ['N5', 'N4', 'N3'],
    })

    assert.equal(payload.tests.length, 3)
    assert.equal(payload.tests[0].level, 'N5')
    assert.equal(payload.tests[2].level, 'N3')
    assert.equal(payload.tests[2].bestScore, 68)
    assert.ok(payload.tests[2].questions.length > 0)
    assert.equal(payload.readiness.N3, 68)
  })
})
