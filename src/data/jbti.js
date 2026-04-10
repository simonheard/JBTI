import config from './jbti-config.json' with { type: 'json' };
import dimensions from './jbti-dimensions.json' with { type: 'json' };
import questions from './jbti-questions.json' with { type: 'json' };

export const MODES = config.modes;
export const UI_COPY = config.ui;
export const DIMENSIONS = dimensions;
export const LIKERT_OPTIONS = config.likertOptions;
export const DISCLAIMER = config.disclaimer;

export const QUESTIONS = questions.map((question) => ({
  ...question,
  conservative: question.prompt.conservative,
  direct: question.prompt.direct,
  options: LIKERT_OPTIONS.map((option) => ({
    value: option.value,
    label: question.optionLabelsByValue?.[String(option.value)] ?? option.label,
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

const resultModuleLoaders = {
  a: () => import('./jbti-results-a.json', { with: { type: 'json' } }),
  b: () => import('./jbti-results-b.json', { with: { type: 'json' } }),
  c: () => import('./jbti-results-c.json', { with: { type: 'json' } }),
};

const resultCache = new Map();

export async function loadResultPreset(code) {
  if (!code) {
    return null;
  }

  if (resultCache.has(code)) {
    return resultCache.get(code);
  }

  const bucket = code[0]?.toLowerCase();
  const loadModule = resultModuleLoaders[bucket];

  if (!loadModule) {
    throw new Error(`No result bucket configured for code "${code}"`);
  }

  const module = await loadModule();
  const preset = module.default.find((item) => item.code === code) ?? null;

  if (preset) {
    resultCache.set(code, preset);
  }

  return preset;
}
