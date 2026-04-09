import config from './jbti-config.json';

export const MODES = config.modes;
export const UI_COPY = config.ui;
export const DIMENSIONS = config.dimensions;
export const LIKERT_OPTIONS = config.likertOptions;
export const DISCLAIMER = config.disclaimer;
export const RESULT_PRESETS = Object.fromEntries(
  config.results.map((item) => [item.code, item])
);
export const FALLBACK_RESULTS = config.fallbackResults;

export const QUESTIONS = config.questions.map((question) => ({
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
