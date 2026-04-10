import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dimensions from '../src/data/jbti-dimensions.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../src/data');
const questionsDir = path.join(dataDir, 'questions');
const resultsDir = path.join(dataDir, 'results');

const levelLabelMap = {
  low: { conservative: '低', direct: '低' },
  medium: { conservative: '中', direct: '中' },
  high: { conservative: '高', direct: '高' },
};

const defaultOptionLabels = {
  '1': {
    conservative: '完全不符合',
    direct: '完全不像',
  },
  '2': {
    conservative: '较不符合',
    direct: '不太像',
  },
  '3': {
    conservative: '一般',
    direct: '一般',
  },
  '4': {
    conservative: '较符合',
    direct: '比较像',
  },
  '5': {
    conservative: '完全符合',
    direct: '非常像',
  },
};

const coreConfig = {
  authoringNote:
    '该文件只保留通用 UI 文案、量表选项和免责声明。维度、题目、结果已拆分到独立 JSON 目录，便于人工维护。',
  modes: {
    conservative: {
      id: 'conservative',
      label: '保守模式',
      helper: '语气更温和、间接，适合第一次体验或后续细化文案。',
    },
    direct: {
      id: 'direct',
      label: '直白模式',
      helper: '语气更直接、清晰，适合做更明确的结果呈现。',
    },
  },
  ui: {
    heroBadge: {
      conservative: 'JBTI · 六维性人格光谱',
      direct: 'JBTI · 六维性偏好拆解',
    },
    heroTitle: {
      conservative: '通过 36 道题，形成一份关于性偏好结构的六维光谱画像。',
      direct: '36 道题，拆出你在欲望、开放度、权力和关系上的组合倾向。',
    },
    heroDescription: {
      conservative:
        '当前版本已支持双模式切换、随机题序、分页答题、计分、结果总结和插画位。正式文案可以继续在拆分后的 JSON 中手动填充。',
      direct:
        '这一版重点是把结构搭干净：模式切换、随机出题、结果页、JSON 配置都已经接好，后面主要是继续填正式内容。',
    },
    projectNoticeTitle: {
      conservative: '项目声明',
      direct: '项目声明',
    },
    projectNotice: {
      conservative:
        '本项目完全开源，默认视为无版权开放参考。作者明确反对将其用于任何商用、付费包装或变相售卖；如果你硬要拿去商用，我也确实没什么办法，但这不代表我支持。',
      direct:
        '这项目就是完全开源的整活产物，默认按无版权开放参考处理。我明确反对你拿去商用、卖课、套壳收费；你非要这么干我也拦不住，但别说我同意。',
    },
    pageDisclaimer: {
      conservative:
        '本页面内容以娱乐和整活为主，不构成任何医疗、心理、关系、法律或人生建议。',
      direct:
        '这页内容纯属整活，不构成任何建议，别拿它当医疗、心理、关系、法律或人生指导。',
    },
    heroBadges: {
      conservative: [
        '36 题固定结构，每次开始随机排序',
        '6 个核心维度，输出 6 字母代码',
        '支持保守 / 直白两套文案',
        '所有内容均可在 JSON 中继续人工填充',
      ],
      direct: [
        '36 题随机出题顺序',
        '6 维结果直接出代码和雷达图',
        '双模式文案已经拆开',
        '题库和结果都能直接手改 JSON',
      ],
    },
    startButton: {
      conservative: '开始测试',
      direct: '开始拆解',
    },
    testTitle: {
      conservative: 'JBTI 答题页',
      direct: 'JBTI 作答页',
    },
    testHint: {
      conservative:
        '你可以中途切换模式，题目与结果文案会同步刷新，已选答案不会丢失。',
      direct: '模式随时能切，文案和结果会一起变，答案不会掉。',
    },
    resultCodeLabel: {
      conservative: 'JBTI 最终人格代码',
      direct: '你的六维人格代码',
    },
    resultSummaryTitle: {
      conservative: '简单总结',
      direct: '一句话总结',
    },
    resultIllustrationTitle: {
      conservative: '结果插画',
      direct: '人格插画',
    },
    resultIllustrationDescription: {
      conservative: '结果插画已预留正式素材位，可继续按代码逐条替换为更精准的视觉资源。',
      direct: '这里已经预留好插画位，后面直接换成正式图就行。',
    },
    shareButton: {
      conservative: '分享结果',
      direct: '分享这份结果',
    },
    restartButton: {
      conservative: '重新测试',
      direct: '再测一次',
    },
  },
  likertOptions: [
    { value: 1, label: defaultOptionLabels['1'] },
    { value: 2, label: defaultOptionLabels['2'] },
    { value: 3, label: defaultOptionLabels['3'] },
    { value: 4, label: defaultOptionLabels['4'] },
    { value: 5, label: defaultOptionLabels['5'] },
  ],
  disclaimer: {
    conservative:
      '本测试结果仅用于自我观察与交流参考，不构成医疗、心理诊断、关系建议或风险评估结论。相关偏好会随阶段、经验、关系与安全感变化，请结合现实边界与充分同意原则理解。',
    direct:
      '这份结果只适合做自我观察，不是医疗、诊断或关系建议。人的偏好会变，任何实践都应以边界、同意和安全为前提。',
  },
};

const selfPromptSeeds = {
  sexual_desire_intensity: [
    ['【待填写】围绕「性欲强度」的纯自身题 1。', '【待填写】欲望强度题 1。'],
    ['【待填写】围绕「性欲强度」的纯自身题 2。', '【待填写】欲望强度题 2。'],
    ['【待填写】围绕「性欲强度」的纯自身题 3。', '【待填写】欲望强度题 3。'],
    ['【待填写】围绕「性欲强度」的纯自身题 4。', '【待填写】欲望强度题 4。'],
  ],
  sexual_spectrum_openness: [
    ['【待填写】围绕「性谱系开放度」的纯自身题 1。', '【待填写】谱系开放度题 1。'],
    ['【待填写】围绕「性谱系开放度」的纯自身题 2。', '【待填写】谱系开放度题 2。'],
    ['【待填写】围绕「性谱系开放度」的纯自身题 3。', '【待填写】谱系开放度题 3。'],
    ['【待填写】围绕「性谱系开放度」的纯自身题 4。', '【待填写】谱系开放度题 4。'],
  ],
  intensity_openness: [
    ['【待填写】围绕「性烈度开放度」的纯自身题 1。', '【待填写】烈度开放度题 1。'],
    ['【待填写】围绕「性烈度开放度」的纯自身题 2。', '【待填写】烈度开放度题 2。'],
    ['【待填写】围绕「性烈度开放度」的纯自身题 3。', '【待填写】烈度开放度题 3。'],
    ['【待填写】围绕「性烈度开放度」的纯自身题 4。', '【待填写】烈度开放度题 4。'],
  ],
  mind_body_orientation: [
    ['【待填写】围绕「精神肉体倾向」的纯自身题 1。', '【待填写】精神/肉体题 1。'],
    ['【待填写】围绕「精神肉体倾向」的纯自身题 2。', '【待填写】精神/肉体题 2。'],
    ['【待填写】围绕「精神肉体倾向」的纯自身题 3。', '【待填写】精神/肉体题 3。'],
    ['【待填写】围绕「精神肉体倾向」的纯自身题 4。', '【待填写】精神/肉体题 4。'],
  ],
  power_dynamic_tendency: [
    ['【待填写】围绕「权力动态倾向」的纯自身题 1。', '【待填写】权力动态题 1。'],
    ['【待填写】围绕「权力动态倾向」的纯自身题 2。', '【待填写】权力动态题 2。'],
    ['【待填写】围绕「权力动态倾向」的纯自身题 3。', '【待填写】权力动态题 3。'],
    ['【待填写】围绕「权力动态倾向」的纯自身题 4。', '【待填写】权力动态题 4。'],
  ],
  relationship_openness: [
    ['【待填写】围绕「关系开放度」的纯自身题 1。', '【待填写】关系开放度题 1。'],
    ['【待填写】围绕「关系开放度」的纯自身题 2。', '【待填写】关系开放度题 2。'],
    ['【待填写】围绕「关系开放度」的纯自身题 3。', '【待填写】关系开放度题 3。'],
    ['【待填写】围绕「关系开放度」的纯自身题 4。', '【待填写】关系开放度题 4。'],
  ],
};

const crossBlueprints = {
  strong: [
    {
      id: 'cross-1',
      dimensions: ['sexual_desire_intensity', 'intensity_openness'],
      authoringNote: '强关联交叉题 1：性欲强度 × 性烈度开放度。',
    },
    {
      id: 'cross-2',
      dimensions: ['sexual_desire_intensity', 'intensity_openness'],
      authoringNote: '强关联交叉题 2：性欲强度 × 性烈度开放度。',
    },
    {
      id: 'cross-3',
      dimensions: ['sexual_spectrum_openness', 'relationship_openness'],
      authoringNote: '强关联交叉题 1：性谱系开放度 × 关系开放度。',
    },
    {
      id: 'cross-4',
      dimensions: ['sexual_spectrum_openness', 'relationship_openness'],
      authoringNote: '强关联交叉题 2：性谱系开放度 × 关系开放度。',
    },
    {
      id: 'cross-5',
      dimensions: ['intensity_openness', 'power_dynamic_tendency'],
      authoringNote: '强关联交叉题 1：性烈度开放度 × 权力动态倾向。',
    },
    {
      id: 'cross-6',
      dimensions: ['intensity_openness', 'power_dynamic_tendency'],
      authoringNote: '强关联交叉题 2：性烈度开放度 × 权力动态倾向。',
    },
    {
      id: 'cross-7',
      dimensions: ['sexual_desire_intensity', 'mind_body_orientation'],
      authoringNote: '强关联交叉题 1：性欲强度 × 精神肉体倾向。',
    },
    {
      id: 'cross-8',
      dimensions: ['sexual_desire_intensity', 'mind_body_orientation'],
      authoringNote: '强关联交叉题 2：性欲强度 × 精神肉体倾向。',
    },
  ],
  weak: [
    {
      id: 'cross-9',
      dimensions: ['sexual_spectrum_openness', 'power_dynamic_tendency'],
      authoringNote: '弱关联交叉题：性谱系开放度 × 权力动态倾向。',
    },
    {
      id: 'cross-10',
      dimensions: ['mind_body_orientation', 'relationship_openness'],
      authoringNote:
        '弱关联交叉题：精神肉体倾向 × 关系开放度。该题用于补齐共享结构，可按需要替换为更合适的弱关联组合。',
    },
    {
      id: 'cross-11',
      dimensions: ['power_dynamic_tendency', 'relationship_openness'],
      authoringNote: '弱关联交叉题：权力动态倾向 × 关系开放度。',
    },
    {
      id: 'cross-12',
      dimensions: ['sexual_spectrum_openness', 'mind_body_orientation'],
      authoringNote:
        '弱关联交叉题：性谱系开放度 × 精神肉体倾向。该题用于补齐共享结构，可按需要替换为更合适的弱关联组合。',
    },
  ],
};

const illustrations = {
  lowWave: '/illustrations/steady-observer.svg',
  balanced: '/illustrations/balanced-spectrum.svg',
  highDrive: '/illustrations/surge-driver.svg',
};

function sortById(items) {
  return [...items].sort((left, right) => left.id.localeCompare(right.id, 'en'));
}

function buildEffectsByValue(profile) {
  return Object.fromEntries(
    [1, 2, 3, 4, 5].map((value, index) => [
      String(value),
      Object.fromEntries(
        Object.entries(profile).map(([dimensionId, maxScore]) => [
          dimensionId,
          Number((maxScore * index * 0.25).toFixed(2)),
        ])
      ),
    ])
  );
}

function buildSelfQuestionsForDimension(dimension) {
  return selfPromptSeeds[dimension.id].map(([conservative, direct], index) => ({
    id: `${dimension.id}-self-${index + 1}`,
    type: 'self',
    dimensions: [dimension.id],
    prompt: { conservative, direct },
    authoringNote: `纯自身题 ${index + 1}：仅服务于「${dimension.name.conservative}」。`,
    optionLabelsByValue: defaultOptionLabels,
    effectsByValue: buildEffectsByValue({ [dimension.id]: 5 }),
  }));
}

function buildCrossQuestions(groupName) {
  return crossBlueprints[groupName].map((item, index) => {
    const [leftId, rightId] = item.dimensions;
    const left = dimensions.find((dimension) => dimension.id === leftId);
    const right = dimensions.find((dimension) => dimension.id === rightId);

    return {
      id: item.id,
      type: 'cross',
      pairType: groupName,
      dimensions: item.dimensions,
      prompt: {
        conservative: `【待填写】${groupName === 'strong' ? '强关联' : '弱关联'}交叉题 ${index + 1}：围绕「${left.name.conservative} × ${right.name.conservative}」的场景题。`,
        direct: `【待填写】${groupName === 'strong' ? '强关联' : '弱关联'}交叉题 ${index + 1}：${left.name.direct} × ${right.name.direct}。`,
      },
      authoringNote: item.authoringNote,
      optionLabelsByValue: defaultOptionLabels,
      effectsByValue: buildEffectsByValue({
        [leftId]: 2.5,
        [rightId]: 2.5,
      }),
    };
  });
}

function pickIllustration(levels) {
  const highCount = levels.filter((item) => item === 'high').length;
  const lowCount = levels.filter((item) => item === 'low').length;

  if (highCount >= 4) {
    return illustrations.highDrive;
  }

  if (lowCount >= 4) {
    return illustrations.lowWave;
  }

  return illustrations.balanced;
}

function createResultEntry(levels) {
  const profile = dimensions.map((dimension, index) => ({
    dimensionId: dimension.id,
    dimensionName: dimension.name.conservative,
    level: levels[index],
    letter: dimension.codeLevels[levels[index]],
  }));

  const code = profile.map((item) => item.letter).join('');

  return {
    code,
    name: {
      conservative: `【待命名】${code}`,
      direct: `【待命名】${code}`,
    },
    summary: {
      conservative: `当前组合：${profile
        .map(
          (item) =>
            `${item.dimensionName}=${levelLabelMap[item.level].conservative}`
        )
        .join('，')}。这是一条自动生成的占位总结，后续可按需要手动改写。`,
      direct: `这组代码里：${profile
        .map((item) => `${item.dimensionName}${levelLabelMap[item.level].direct}`)
        .join('、')}。这里先放占位总结，后面可以直接手改。`,
    },
    extra_gift: {
      conservative: '',
      direct: '',
    },
    illustrationUrl: pickIllustration(levels),
    profile,
  };
}

function groupResultsByPrefix() {
  const buckets = new Map();
  const levelKeys = ['low', 'medium', 'high'];

  for (const d1 of levelKeys) {
    for (const d2 of levelKeys) {
      for (const d3 of levelKeys) {
        for (const d4 of levelKeys) {
          for (const d5 of levelKeys) {
            for (const d6 of levelKeys) {
              const entry = createResultEntry([d1, d2, d3, d4, d5, d6]);
              const prefix = entry.code.slice(0, 4);
              const current = buckets.get(prefix) ?? [];
              current.push(entry);
              buckets.set(prefix, current);
            }
          }
        }
      }
    }
  }

  return buckets;
}

async function resetGeneratedDirs() {
  await rm(questionsDir, { recursive: true, force: true });
  await rm(resultsDir, { recursive: true, force: true });
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeQuestions() {
  const selfManifest = [];

  for (const dimension of dimensions) {
    const fileName = `${dimension.id}.json`;
    const relativePath = `./self/${fileName}`;
    const content = sortById(buildSelfQuestionsForDimension(dimension));

    await writeJson(path.join(questionsDir, 'self', fileName), content);
    selfManifest.push({
      dimensionId: dimension.id,
      file: relativePath,
      count: content.length,
    });
  }

  const crossStrong = sortById(buildCrossQuestions('strong'));
  const crossWeak = sortById(buildCrossQuestions('weak'));
  const strongChunks = [
    {
      file: './cross/strong-a.json',
      entries: crossStrong.slice(0, 4),
    },
    {
      file: './cross/strong-b.json',
      entries: crossStrong.slice(4),
    },
  ];

  for (const chunk of strongChunks) {
    await writeJson(
      path.join(questionsDir, chunk.file.replace('./', '')),
      chunk.entries
    );
  }

  await writeJson(path.join(questionsDir, 'cross', 'weak.json'), crossWeak);
  await writeJson(path.join(questionsDir, 'manifest.json'), {
    authoringNote:
      '题库已拆分为多个小文件；新增或移动题目时，记得同步更新此 manifest，或直接重新运行生成脚本。',
    self: selfManifest,
    cross: [
      ...strongChunks.map((chunk, index) => ({
        group: `strong-${index + 1}`,
        file: chunk.file,
        count: chunk.entries.length,
      })),
      { group: 'weak', file: './cross/weak.json', count: crossWeak.length },
    ],
  });

  return selfManifest.length * 4 + crossStrong.length + crossWeak.length;
}

async function writeResults() {
  const buckets = groupResultsByPrefix();

  for (const [prefix, entries] of buckets.entries()) {
    const [l1, l2, l3, l4] = prefix.split('');
    await writeJson(
      path.join(resultsDir, l1, l2, l3, `${l4}.json`),
      entries
    );
  }

  await writeJson(path.join(resultsDir, 'manifest.json'), {
    authoringNote:
      '结果按代码前四位拆分，每个文件仅包含相同前四位的 9 种代码组合。',
    prefixLength: 4,
    totalFiles: buckets.size,
    totalResults: Array.from(buckets.values()).reduce(
      (sum, entries) => sum + entries.length,
      0
    ),
  });

  return {
    totalFiles: buckets.size,
    totalResults: Array.from(buckets.values()).reduce(
      (sum, entries) => sum + entries.length,
      0
    ),
  };
}

async function cleanupLegacyFiles() {
  const legacyFiles = [
    'jbti-questions.json',
    'jbti-results-a.json',
    'jbti-results-b.json',
    'jbti-results-c.json',
  ];

  await Promise.all(
    legacyFiles.map((fileName) =>
      rm(path.join(dataDir, fileName), { force: true })
    )
  );
}

async function main() {
  await mkdir(dataDir, { recursive: true });
  await resetGeneratedDirs();
  await cleanupLegacyFiles();

  await writeJson(path.join(dataDir, 'jbti-config.json'), coreConfig);
  const questionCount = await writeQuestions();
  const resultStats = await writeResults();

  console.log('JBTI data generated successfully.');
  console.log(
    JSON.stringify(
      {
        dimensions: dimensions.length,
        questions: questionCount,
        resultFiles: resultStats.totalFiles,
        results: resultStats.totalResults,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
