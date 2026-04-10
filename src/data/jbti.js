import config from './jbti-config.json' with { type: 'json' };
import dimensions from './jbti-dimensions.json' with { type: 'json' };
import questions from './jbti-questions.json' with { type: 'json' };
import resultsA from './jbti-results-a.json' with { type: 'json' };
import resultsB from './jbti-results-b.json' with { type: 'json' };
import resultsC from './jbti-results-c.json' with { type: 'json' };

export const MODES = config.modes;
export const UI_COPY = config.ui;
export const DIMENSIONS = dimensions;
export const LIKERT_OPTIONS = config.likertOptions;
export const DISCLAIMER = config.disclaimer;
export const RESULT_PRESETS = Object.fromEntries(
  [...resultsA, ...resultsB, ...resultsC].map((item) => [item.code, item])
);

export const QUESTIONS = questions.map((question) => ({
  ...question,
  conservative: question.prompt.conservative,
  direct: question.prompt.direct,
  options: LIKERT_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
    effects: question.effectsByValue[String(option.value)] ?? {},
  })),
}));

export const QUESTION_MAP = Object.fromEntries(
  QUESTIONS.map((question) => [question.id, question])
);

export function createQuestionOrder() {
  const next = [...QUESTIONS];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}
