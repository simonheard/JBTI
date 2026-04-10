import {
  DIMENSIONS,
  QUESTION_MAP,
  QUESTIONS,
} from '../data/jbti.js';

function clampPercent(score, min, max) {
  if (max <= min) {
    return 0;
  }

  const normalized = ((score - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

function resolveLevel(score, ranges) {
  if (score <= ranges.low[1]) {
    return 'low';
  }

  if (score <= ranges.medium[1]) {
    return 'medium';
  }

  return 'high';
}

export function calculateResult(answers, mode) {
  const answeredCount = Object.keys(answers).filter((questionId) =>
    Object.hasOwn(QUESTION_MAP, questionId)
  ).length;

  const totals = Object.fromEntries(
    DIMENSIONS.map((dimension) => [
      dimension.id,
      { score: 0, min: 0, max: 0 },
    ])
  );

  QUESTIONS.forEach((question) => {
    const values = question.options.map((option) => option.effects);

    question.dimensions.forEach((dimensionId) => {
      const impacts = values.map((effects) => effects[dimensionId] ?? 0);
      totals[dimensionId].min += Math.min(...impacts);
      totals[dimensionId].max += Math.max(...impacts);
    });

    if (!Object.hasOwn(answers, question.id)) {
      return;
    }

    const answer = answers[question.id];
    const selected = question.options.find((option) => option.value === answer);
    if (!selected) {
      return;
    }

    Object.entries(selected.effects).forEach(([dimensionId, effect]) => {
      totals[dimensionId].score += effect;
    });
  });

  const dimensions = DIMENSIONS.map((dimension) => {
    const raw = totals[dimension.id];
    const percent = clampPercent(raw.score, raw.min, raw.max);
    const level = resolveLevel(percent, dimension.scoreRanges);

    return {
      id: dimension.id,
      label: dimension.name[mode],
      percent,
      level,
      letter: dimension.codeLevels[level],
      description: dimension.descriptions[mode][level],
    };
  });

  const code = dimensions.map((item) => item.letter).join('');
  return {
    code,
    dimensions,
    completionRate: Math.round((answeredCount / Object.keys(QUESTION_MAP).length) * 100),
  };
}
