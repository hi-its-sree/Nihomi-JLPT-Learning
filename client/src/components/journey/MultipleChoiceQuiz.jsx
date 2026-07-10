import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// questions: [{ id, prompt, choices: string[], correctIndex, explanation }]
// onComplete(score 0-100) fires after the last question is answered and acknowledged.
export default function MultipleChoiceQuiz({ questions, onComplete }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [correctCount, setCorrectCount] = useState(0)

  const question = questions[index]
  const isLast = index === questions.length - 1
  const isCorrect = selected === question.correctIndex

  function choose(choiceIndex) {
    if (selected !== null) return
    setSelected(choiceIndex)
    if (choiceIndex === question.correctIndex) setCorrectCount((c) => c + 1)
  }

  function next() {
    if (isLast) {
      onComplete?.(Math.round((correctCount / questions.length) * 100))
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
  }

  return (
    <div>
      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-plum)', marginBottom: 8 }}>
        Question {index + 1} of {questions.length}
      </p>
      <AnimatePresence mode="wait">
        <motion.div key={question.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }}>
          <p className="test-question" style={{ marginBottom: 14 }}>{question.prompt}</p>
          <div className="test-options">
            {question.choices.map((choice, i) => {
              let cls = ''
              if (selected !== null) {
                if (i === question.correctIndex) cls = 'correct'
                else if (i === selected) cls = 'incorrect'
              }
              return (
                <button key={i} type="button" className={`test-option ${cls}`} onClick={() => choose(i)} disabled={selected !== null}>
                  {choice}
                </button>
              )
            })}
          </div>

          {selected !== null && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className={`dialogue-feedback ${isCorrect ? 'correct' : 'incorrect'}`} style={{ marginTop: 14 }}>
              {isCorrect ? '✓ Correct! ' : '✗ Not quite. '}{question.explanation}
            </motion.div>
          )}

          {selected !== null && (
            <button type="button" className="primary-btn" style={{ marginTop: 16 }} onClick={next}>
              {isLast ? 'Finish' : 'Next'} →
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
