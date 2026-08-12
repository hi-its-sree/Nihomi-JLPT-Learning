function normalizeLevel(value) {
    const upper = String(value ?? '').toUpperCase();
    return ['N1', 'N2', 'N3', 'N4', 'N5'].includes(upper) ? upper : 'N5';
}
function scoreFromProgress(progress) {
    return Math.max(0, Math.min(100, Math.round(progress)));
}
function buildQuestion(label, options, answerIndex, explanation) {
    return {
        id: `${label}-${Math.random().toString(36).slice(2, 8)}`,
        text: label,
        options,
        correct: answerIndex,
        explanation,
    };
}
export function buildMockTestsPayload(params) {
    const levels = params.availableLevels.map(normalizeLevel).filter((level, index, all) => all.indexOf(level) === index);
    const currentLevel = normalizeLevel(params.currentLevel);
    const currentIndex = levels.indexOf(currentLevel);
    const safeLevels = currentIndex >= 0 ? levels.slice(0, currentIndex + 1) : levels;
    const progressByCategory = Object.fromEntries(params.progressEntries.map((entry) => [entry.category.toLowerCase(), entry.mastery]));
    const vocabMastery = scoreFromProgress(progressByCategory.vocabulary ?? 0);
    const grammarMastery = scoreFromProgress(progressByCategory.grammar ?? 0);
    const kanjiMastery = scoreFromProgress(progressByCategory.kanji ?? 0);
    const tests = safeLevels.map((level, index) => {
        const baseQuestions = [
            buildQuestion(`${level} vocabulary sample: ${params.vocabularyEntries[0]?.word ?? '日本語'} means ${params.vocabularyEntries[0]?.meaning ?? 'language'}`, ['language', 'city', 'food', 'book'], 0, 'This question is generated from your stored vocabulary content.'),
            buildQuestion(`${level} grammar sample: ${params.grammarEntries[0]?.pattern ?? '〜てください'} means ${params.grammarEntries[0]?.meaning ?? 'please do'}`, ['please do', 'to go', 'to eat', 'to see'], 0, 'This question uses your grammar database entries.'),
            buildQuestion(`${level} kanji sample: ${params.kanjiEntries[0]?.character ?? '日'} means ${params.kanjiEntries[0]?.meaning ?? 'day'}`, ['day', 'water', 'tree', 'mountain'], 0, 'This item is derived from your kanji database.'),
        ];
        const score = level === currentLevel
            ? Math.max(0, Math.min(100, Math.round((vocabMastery + grammarMastery + kanjiMastery) / 3)))
            : Math.max(0, Math.min(100, 40 + index * 8));
        return {
            id: `mock-${level.toLowerCase()}`,
            level,
            title: `${level} Live Mock Test`,
            sections: ['Vocabulary', 'Grammar', 'Reading'],
            durationMin: 60 + index * 15,
            questions: baseQuestions,
            bestScore: score,
            attempts: index,
            taken: score >= 70,
        };
    });
    const readiness = Object.fromEntries(safeLevels.map((level) => [level, level === currentLevel ? Math.max(0, Math.min(100, Math.round((progressByCategory.vocabulary ?? 0) * 0.4 + (progressByCategory.grammar ?? 0) * 0.35 + (progressByCategory.kanji ?? 0) * 0.25))) : 0]));
    return {
        tests,
        readiness,
    };
}
