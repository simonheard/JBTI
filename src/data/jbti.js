import config from './jbti-config.json' with { type: 'json' };
import dimensions from './jbti-dimensions.json' with { type: 'json' };
import questionManifest from './questions/manifest.json' with { type: 'json' };

export const MODES = config.modes;
export const UI_COPY = config.ui;
export const DIMENSIONS = dimensions;
export const LIKERT_OPTIONS = config.likertOptions;
export const DISCLAIMER = config.disclaimer;

function compareOptionValues(left, right) {
  const leftNumber = Number(left);
  const rightNumber = Number(right);
  const leftIsNumber = Number.isFinite(leftNumber);
  const rightIsNumber = Number.isFinite(rightNumber);

  if (leftIsNumber && rightIsNumber) {
    return leftNumber - rightNumber;
  }

  return String(left).localeCompare(String(right), 'zh-Hans-CN');
}

function resolveQuestionOptions(question) {
  const explicitValues = new Set([
    ...Object.keys(question.optionLabelsByValue ?? {}),
    ...Object.keys(question.effectsByValue ?? {}),
  ]);

  const fallbackValues =
    explicitValues.size > 0
      ? [...explicitValues]
      : LIKERT_OPTIONS.map((option) => String(option.value));

  return fallbackValues
    .sort(compareOptionValues)
    .map((rawValue) => {
      const fallbackOption = LIKERT_OPTIONS.find(
        (option) => String(option.value) === String(rawValue)
      );

      return {
        value: rawValue,
        label: question.optionLabelsByValue?.[String(rawValue)] ?? fallbackOption?.label ?? {
          conservative: String(rawValue),
          direct: String(rawValue),
        },
        effects: question.effectsByValue?.[String(rawValue)] ?? {},
      };
    });
}

const questionModules = import.meta.glob('./questions/**/*.json', {
  eager: true,
  import: 'default',
});

const orderedQuestionFiles = [
  ...questionManifest.self.map((item) => item.file),
  ...questionManifest.cross.map((item) => item.file),
];

const questionLists = orderedQuestionFiles.map((relativePath) => {
  const modulePath = `./questions/${relativePath.replace('./', '')}`;
  return questionModules[modulePath] ?? [];
});

export const QUESTIONS = questionLists.flat().map((question) => ({
  ...question,
  conservative: question.prompt.conservative,
  direct: question.prompt.direct,
  options: resolveQuestionOptions(question),
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
  ...import.meta.glob('./results/*/*/*/*.json', {
    import: 'default',
  }),
};

const IS_PROD = import.meta.env.PROD;
const USE_RESULT_CACHE = IS_PROD;
const resultCache = new Map();

export async function loadResultPreset(code) {
  if (!code) {
    return null;
  }

  if (USE_RESULT_CACHE && resultCache.has(code)) {
    return resultCache.get(code);
  }

  const resultPath = `./results/${code[0]}/${code[1]}/${code[2]}/${code[3]}.json`;

  if (!IS_PROD) {
    const url = new URL(resultPath, import.meta.url);
    url.searchParams.set('t', String(Date.now()));

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch result file for code "${code}"`);
    }

    const entries = await response.json();
    return entries.find((item) => item.code === code) ?? null;
  }

  const loadModule = resultModuleLoaders[resultPath];

  if (!loadModule) {
    throw new Error(`No result file configured for code "${code}"`);
  }

  const module = await loadModule();
  const preset = module.default.find((item) => item.code === code) ?? null;

  if (USE_RESULT_CACHE && preset) {
    resultCache.set(code, preset);
  }

  return preset;
}
