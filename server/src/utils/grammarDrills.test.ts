import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildGrammarDrill, patternCores, clozeTarget, tooSimilar, BLANK } from './grammarDrills'

const entry = (id: string, pattern: string, meaning: string, structure: string, example: string) => ({
  id, pattern, meaning, structure, example, level: 'N5', translation: 'translation',
})

const ENTRIES = [
  entry('1', 'A。けれども、～B。(A. Keredomo,~ B.)', 'however', 'Statement A + けれども', '今日は晴れている。けれども、寒いです。'),
  entry('2', 'A。しかし、～B。 (A. Shikashi, ~B.)', 'but', 'Sentence A + しかし', '今日は忙しい。しかし、時間がある。'),
  entry('3', '～てください (~te kudasai)', 'please do', 'Verb te-form + ください', 'ちょっと待ってください。'),
  entry('4', '～たい (~tai)', 'want to do', 'Verb stem + たい', '水が飲みたいです。'),
  entry('5', '～から (~kara)', 'because', 'Reason + から', '寒いから、家にいます。'),
]

// Deterministic stand-in for Math.random so option order is reproducible.
const seeded = (seed: number) => () => {
  seed = (seed * 1103515245 + 12345) % 2147483648
  return seed / 2147483648
}

describe('patternCores', () => {
  it('strips the romaji gloss and returns Japanese fragments, longest first', () => {
    assert.deepEqual(patternCores('A。けれども、～B。(A. Keredomo,~ B.)'), ['けれども'])
    assert.equal(patternCores('～てください (~te kudasai)')[0], 'てください')
  })

  it('ignores single characters and placeholder letters', () => {
    assert.deepEqual(patternCores('A + B (a plus b)'), [])
  })
})

describe('clozeTarget', () => {
  it('finds the fragment the example sentence actually contains', () => {
    assert.equal(clozeTarget(ENTRIES[0]), 'けれども')
  })

  it('returns null when the sentence does not show the pattern', () => {
    assert.equal(clozeTarget(entry('x', '～ようだ (you da)', 'seems', 's', 'まったく関係ない文です。')), null)
  })
})

describe('tooSimilar', () => {
  it('catches glosses that restate each other', () => {
    assert.equal(
      tooSimilar("Expresses reason or cause; 'because', 'since'.", "Express the reason or cause; 'because', 'since'."),
      true,
    )
    assert.equal(tooSimilar('please do', 'please do'), true)
  })

  it('folds plurals idempotently', () => {
    // Regression: an earlier stemmer turned "expresses" into "express" but
    // "express" into "expres", so the same word stopped matching itself.
    assert.equal(tooSimilar('expresses reason', 'express reason'), true)
    assert.equal(tooSimilar('express reason', 'express reason'), true)
  })

  it('leaves genuinely different meanings alone', () => {
    assert.equal(tooSimilar('want to do something', 'because of the weather'), false)
    assert.equal(tooSimilar('please do', 'want to do'), false)
  })
})

describe('buildGrammarDrill', () => {
  it('never offers a distractor that restates the answer', () => {
    const twins = [
      entry('1', '～から (kara)', "Expresses reason or cause; 'because', 'since'.", 'Reason + から', '寒いから、家にいます。'),
      entry('2', '～ので (node)', "Express the reason or cause; 'because', 'since'.", 'Reason + ので', '寒いので、家にいます。'),
      entry('3', '～たい (tai)', 'want to do', 'Verb stem + たい', '水が飲みたいです。'),
      entry('4', '～ましょう (mashou)', "let's do", 'Verb stem + ましょう', '行きましょう。'),
    ]
    for (let seed = 1; seed <= 40; seed += 1) {
      for (const q of buildGrammarDrill(twins, 4, seeded(seed))) {
        if (q.type !== 'meaning') continue
        const answer = q.options[q.correct]
        const clashes = q.options.filter((o, i) => i !== q.correct && tooSimilar(o, answer))
        assert.equal(clashes.length, 0, `ambiguous options in ${q.id}: ${JSON.stringify(q.options)}`)
      }
    }
  })

  it('builds the requested number of questions', () => {
    const questions = buildGrammarDrill(ENTRIES, 3, seeded(7))
    assert.equal(questions.length, 3)
  })

  it('never asks for more questions than there are entries', () => {
    assert.equal(buildGrammarDrill(ENTRIES, 99, seeded(1)).length, ENTRIES.length)
  })

  it('returns nothing for an empty bank', () => {
    assert.deepEqual(buildGrammarDrill([], 5, seeded(1)), [])
  })

  it('always points `correct` at a real option, with no duplicate options', () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      for (const q of buildGrammarDrill(ENTRIES, 5, seeded(seed))) {
        assert.ok(q.correct >= 0 && q.correct < q.options.length, `correct out of range in ${q.id}`)
        assert.equal(new Set(q.options).size, q.options.length, `duplicate options in ${q.id}`)
        assert.ok(q.options.length >= 2, `too few options in ${q.id}`)
        assert.ok(q.prompt.length > 0 && q.explanation.length > 0)
      }
    }
  })

  it('blanks the pattern out of the sentence for cloze questions', () => {
    const cloze = []
    for (let seed = 1; seed <= 60 && cloze.length === 0; seed += 1) {
      cloze.push(...buildGrammarDrill(ENTRIES, 5, seeded(seed)).filter((q) => q.type === 'cloze'))
    }
    assert.ok(cloze.length > 0, 'expected at least one cloze question across seeds')
    for (const q of cloze) {
      assert.ok(q.prompt.includes(BLANK), `cloze prompt missing the blank: ${q.prompt}`)
      assert.ok(!q.prompt.includes(q.options[q.correct]), 'the answer is still visible in the sentence')
    }
  })

  it('blanks every occurrence so a doubled pattern cannot leak the answer', () => {
    // Regression: 〜といい〜といい repeats its core, and blanking only the first
    // left the answer sitting in the sentence being asked about.
    const doubled = [
      entry('1', 'Noun といい Noun といい (~toii~toii)', 'both X and Y', 'Noun + といい', '食べ物といい観光地といい、素晴らしい。'),
      entry('2', '～たい (tai)', 'want to do', 'Verb stem + たい', '水が飲みたいです。'),
      entry('3', '～から (kara)', 'because', 'Reason + から', '寒いから、家にいます。'),
      entry('4', '～ましょう (mashou)', "let's do", 'Verb stem + ましょう', '行きましょう。'),
    ]
    let seen = 0
    for (let seed = 1; seed <= 60; seed += 1) {
      for (const q of buildGrammarDrill(doubled, 4, seeded(seed))) {
        if (q.type !== 'cloze') continue
        seen += 1
        assert.ok(!q.prompt.includes(q.options[q.correct]), `answer visible in prompt: ${q.prompt}`)
      }
    }
    assert.ok(seen > 0, 'expected cloze questions across seeds')
  })

  it('draws distractors from other entries, never repeating the answer', () => {
    for (let seed = 1; seed <= 30; seed += 1) {
      for (const q of buildGrammarDrill(ENTRIES, 5, seeded(seed))) {
        const answer = q.options[q.correct]
        assert.equal(q.options.filter((o) => o === answer).length, 1, `answer repeated in ${q.id}`)
      }
    }
  })
})
