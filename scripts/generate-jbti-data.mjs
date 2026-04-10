import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../src/data');

const scoreRanges = {
  low: [0, 39],
  medium: [40, 69],
  high: [70, 100],
};

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

const dimensions = [
  {
    id: 'sexual_desire_intensity',
    order: 1,
    name: {
      conservative: '性欲强度',
      direct: '欲望强度',
    },
    codeLevels: { low: 'A', medium: 'B', high: 'C' },
    scoreRanges,
    crossPlan: {
      selfQuestions: 4,
      strong: { dimensionId: 'intensity_openness', count: 2 },
      weak: [
        { dimensionId: 'mind_body_orientation', count: 1 },
        { dimensionId: 'power_dynamic_tendency', count: 1 },
      ],
    },
    descriptions: {
      conservative: {
        low: '你对性冲动与主动欲求的体验相对克制，更容易受情境、安全感与整体状态影响。',
        medium: '你在欲望驱动与现实节奏之间较为平衡，既不会长期压低，也不会持续拉满。',
        high: '你对欲望信号的感知和驱动力通常更强，相关需求更容易进入你的注意中心。',
      },
      direct: {
        low: '你的欲望驱动偏低，不太会长期被性冲动牵着走。',
        medium: '你的欲望强度比较居中，看状态、看关系、看场合。',
        high: '你的欲望驱动明显偏高，相关需求更容易顶到前排。',
      },
    },
  },
  {
    id: 'sexual_spectrum_openness',
    order: 2,
    name: {
      conservative: '性谱系开放度',
      direct: '谱系开放度',
    },
    codeLevels: { low: 'D', medium: 'E', high: 'F' },
    scoreRanges,
    crossPlan: {
      selfQuestions: 4,
      strong: { dimensionId: 'relationship_openness', count: 2 },
      weak: [
        { dimensionId: 'intensity_openness', count: 1 },
        { dimensionId: 'power_dynamic_tendency', count: 1 },
      ],
    },
    descriptions: {
      conservative: {
        low: '你对性相关光谱、边界与尝试范围的接受度较谨慎，更偏向清晰、熟悉与可预期。',
        medium: '你对不同性表达和体验方式持相对开放但有筛选的态度，会看安全感与具体契合度。',
        high: '你对性相关光谱和可能性更开放，通常更能接受多样化的设定、表达和体验范围。',
      },
      direct: {
        low: '你的性谱系开放度偏低，不太想碰太陌生或太跳脱的设定。',
        medium: '你可以接受一些变化，但会先判断适不适合自己。',
        high: '你的开放度偏高，对不同玩法、表达和边界形式更容易保持开放。',
      },
    },
  },
  {
    id: 'intensity_openness',
    order: 3,
    name: {
      conservative: '性烈度开放度',
      direct: '烈度开放度',
    },
    codeLevels: { low: 'G', medium: 'H', high: 'I' },
    scoreRanges,
    crossPlan: {
      selfQuestions: 4,
      strong: { dimensionId: 'sexual_desire_intensity', count: 2 },
      weak: [
        { dimensionId: 'power_dynamic_tendency', count: 1 },
        { dimensionId: 'mind_body_orientation', count: 1 },
      ],
    },
    descriptions: {
      conservative: {
        low: '你对更高烈度、更刺激或更失控感的性体验接受度偏低，倾向温和、可控与循序推进。',
        medium: '你对烈度的接受度居中，会视对象、情绪和安全边界决定是否上调强度。',
        high: '你对更高刺激度、强烈感或张力更开放，往往不排斥更高烈度的体验设计。',
      },
      direct: {
        low: '你不太吃高烈度路线，更偏向温和、稳一点、可控一点。',
        medium: '你对烈度没有死板倾向，主要看人和当下状态。',
        high: '你对高刺激、高张力、更强烈的体验接受度更高。',
      },
    },
  },
  {
    id: 'mind_body_orientation',
    order: 4,
    name: {
      conservative: '精神肉体倾向',
      direct: '精神/肉体倾向',
    },
    codeLevels: { low: 'J', medium: 'K', high: 'L' },
    scoreRanges,
    crossPlan: {
      selfQuestions: 4,
      strong: { dimensionId: 'sexual_desire_intensity', count: 2 },
      weak: [
        { dimensionId: 'power_dynamic_tendency', count: 1 },
        { dimensionId: 'intensity_openness', count: 1 },
      ],
    },
    descriptions: {
      conservative: {
        low: '你更偏向肉体感受与即时体验本身，未必需要大量精神联结才能进入状态。',
        medium: '你在精神联结与身体体验之间较为均衡，通常两者都会影响你的投入质量。',
        high: '你更看重精神联结、情绪张力与心理层面的契合，纯身体刺激未必足够。',
      },
      direct: {
        low: '你更偏身体向，不一定需要很强的心灵连结才有感觉。',
        medium: '你两边都看，既要感觉也要状态。',
        high: '你明显更偏精神向，心理连接不到位时身体刺激也未必够用。',
      },
    },
  },
  {
    id: 'power_dynamic_tendency',
    order: 5,
    name: {
      conservative: '权力动态倾向',
      direct: '权力动态倾向',
    },
    codeLevels: { low: 'M', medium: 'N', high: 'O' },
    scoreRanges,
    crossPlan: {
      selfQuestions: 4,
      strong: { dimensionId: 'intensity_openness', count: 2 },
      weak: [
        { dimensionId: 'mind_body_orientation', count: 1 },
        { dimensionId: 'relationship_openness', count: 1 },
      ],
    },
    descriptions: {
      conservative: {
        low: '你对明显的权力差、控制感设计或角色动态兴趣较低，更偏向平衡、对等与自然流动。',
        medium: '你对权力动态没有绝对排斥或绝对偏好，更多取决于关系、信任和情境氛围。',
        high: '你对控制、交付、主导或服从等权力动态更敏感，也更可能把它视为核心张力来源。',
      },
      direct: {
        low: '你不太吃权力差那一套，更偏平等自然一点。',
        medium: '你对权力动态可接受，但不一定把它当核心。',
        high: '你对主导、服从、控制感这类张力更有感觉。',
      },
    },
  },
  {
    id: 'relationship_openness',
    order: 6,
    name: {
      conservative: '关系开放度',
      direct: '关系开放度',
    },
    codeLevels: { low: 'P', medium: 'Q', high: 'R' },
    scoreRanges,
    crossPlan: {
      selfQuestions: 4,
      strong: { dimensionId: 'sexual_spectrum_openness', count: 2 },
      weak: [
        { dimensionId: 'sexual_desire_intensity', count: 1 },
        { dimensionId: 'power_dynamic_tendency', count: 1 },
      ],
    },
    descriptions: {
      conservative: {
        low: '你对关系边界的开放方式较谨慎，更偏好排他、稳定与较少变量的结构。',
        medium: '你对关系开放度保持审慎弹性，会结合价值观、安全感与关系质量做判断。',
        high: '你对关系结构与边界安排更开放，较能接受非单一路径的连接形式。',
      },
      direct: {
        low: '你更偏排他和稳定，不太想把关系边界开太大。',
        medium: '你对关系开放度是审慎中立的，要看具体条件。',
        high: '你对关系边界更开放，不会默认只有一种连接方式。',
      },
    },
  },
];

const coreConfig = {
  authoringNote:
    '该文件只保留通用 UI 文案、量表选项和免责声明。维度、题目、结果已拆分到独立 JSON，便于人工维护。',
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
      conservative: '你可以中途切换模式，题目与结果文案会同步刷新，已选答案不会丢失。',
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
    {
      value: 1,
      label: {
        conservative: '完全不符合',
        direct: '完全不像',
      },
    },
    {
      value: 2,
      label: {
        conservative: '较不符合',
        direct: '不太像',
      },
    },
    {
      value: 3,
      label: {
        conservative: '一般',
        direct: '一般',
      },
    },
    {
      value: 4,
      label: {
        conservative: '较符合',
        direct: '比较像',
      },
    },
    {
      value: 5,
      label: {
        conservative: '完全符合',
        direct: '非常像',
      },
    },
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

const crossBlueprints = [
  {
    id: 'cross-1',
    dimensions: ['sexual_desire_intensity', 'intensity_openness'],
    pairType: 'strong',
    authoringNote:
      '强关联交叉题 1：性欲强度 × 性烈度开放度。',
  },
  {
    id: 'cross-2',
    dimensions: ['sexual_desire_intensity', 'intensity_openness'],
    pairType: 'strong',
    authoringNote:
      '强关联交叉题 2：性欲强度 × 性烈度开放度。',
  },
  {
    id: 'cross-3',
    dimensions: ['sexual_spectrum_openness', 'relationship_openness'],
    pairType: 'strong',
    authoringNote:
      '强关联交叉题 1：性谱系开放度 × 关系开放度。',
  },
  {
    id: 'cross-4',
    dimensions: ['sexual_spectrum_openness', 'relationship_openness'],
    pairType: 'strong',
    authoringNote:
      '强关联交叉题 2：性谱系开放度 × 关系开放度。',
  },
  {
    id: 'cross-5',
    dimensions: ['intensity_openness', 'power_dynamic_tendency'],
    pairType: 'strong',
    authoringNote:
      '强关联交叉题 1：性烈度开放度 × 权力动态倾向。',
  },
  {
    id: 'cross-6',
    dimensions: ['intensity_openness', 'power_dynamic_tendency'],
    pairType: 'strong',
    authoringNote:
      '强关联交叉题 2：性烈度开放度 × 权力动态倾向。',
  },
  {
    id: 'cross-7',
    dimensions: ['sexual_desire_intensity', 'mind_body_orientation'],
    pairType: 'strong',
    authoringNote:
      '强关联交叉题 1：性欲强度 × 精神肉体倾向。',
  },
  {
    id: 'cross-8',
    dimensions: ['sexual_desire_intensity', 'mind_body_orientation'],
    pairType: 'strong',
    authoringNote:
      '强关联交叉题 2：性欲强度 × 精神肉体倾向。',
  },
  {
    id: 'cross-9',
    dimensions: ['sexual_spectrum_openness', 'power_dynamic_tendency'],
    pairType: 'weak',
    authoringNote:
      '弱关联交叉题：性谱系开放度 × 权力动态倾向。',
  },
  {
    id: 'cross-10',
    dimensions: ['mind_body_orientation', 'relationship_openness'],
    pairType: 'weak',
    authoringNote:
      '弱关联交叉题：精神肉体倾向 × 关系开放度。该题用于补齐共享结构，可按需要替换为更合适的弱关联组合。',
  },
  {
    id: 'cross-11',
    dimensions: ['power_dynamic_tendency', 'relationship_openness'],
    pairType: 'weak',
    authoringNote:
      '弱关联交叉题：权力动态倾向 × 关系开放度。',
  },
  {
    id: 'cross-12',
    dimensions: ['sexual_spectrum_openness', 'mind_body_orientation'],
    pairType: 'weak',
    authoringNote:
      '弱关联交叉题：性谱系开放度 × 精神肉体倾向。该题用于补齐共享结构，可按需要替换为更合适的弱关联组合。',
  },
];

const illustrations = {
  lowWave: '/illustrations/steady-observer.svg',
  balanced: '/illustrations/balanced-spectrum.svg',
  highDrive: '/illustrations/surge-driver.svg',
};

function buildEffectsByValue(profile) {
  return Object.fromEntries(
    [1, 2, 3, 4, 5].map((value, index) => {
      const multiplier = index * 0.25;

      return [
        String(value),
        Object.fromEntries(
          Object.entries(profile).map(([dimensionId, maxScore]) => [
            dimensionId,
            Number((maxScore * multiplier).toFixed(2)),
          ])
        ),
      ];
    })
  );
}

function buildSelfQuestions() {
  return dimensions.flatMap((dimension) =>
    selfPromptSeeds[dimension.id].map(([conservative, direct], index) => ({
      id: `${dimension.id}-self-${index + 1}`,
      type: 'self',
      dimensions: [dimension.id],
      prompt: { conservative, direct },
      authoringNote: `纯自身题 ${index + 1}：仅服务于「${dimension.name.conservative}」。`,
      optionLabelsByValue: defaultOptionLabels,
      effectsByValue: buildEffectsByValue({ [dimension.id]: 5 }),
    }))
  );
}

function buildCrossQuestions() {
  return crossBlueprints.map((item, index) => {
    const [leftId, rightId] = item.dimensions;
    const left = dimensions.find((dimension) => dimension.id === leftId);
    const right = dimensions.find((dimension) => dimension.id === rightId);

    return {
      id: item.id,
      type: 'cross',
      dimensions: item.dimensions,
      pairType: item.pairType,
      prompt: {
        conservative: `【待填写】交叉题 ${index + 1}：围绕「${left.name.conservative} × ${right.name.conservative}」的场景题。`,
        direct: `【待填写】交叉题 ${index + 1}：${left.name.direct} × ${right.name.direct}。`,
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
  const profile = dimensions.map((dimension, index) => {
    const level = levels[index];
    return {
      dimensionId: dimension.id,
      dimensionName: dimension.name.conservative,
      level,
      letter: dimension.codeLevels[level],
    };
  });

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
    illustrationUrl: pickIllustration(levels),
    profile,
  };
}

function generateResultGroups() {
  const groups = { a: [], b: [], c: [] };
  const levelKeys = ['low', 'medium', 'high'];

  for (const d1 of levelKeys) {
    for (const d2 of levelKeys) {
      for (const d3 of levelKeys) {
        for (const d4 of levelKeys) {
          for (const d5 of levelKeys) {
            for (const d6 of levelKeys) {
              const entry = createResultEntry([d1, d2, d3, d4, d5, d6]);
              const bucket = entry.code[0].toLowerCase();
              groups[bucket].push(entry);
            }
          }
        }
      }
    }
  }

  return groups;
}

function sortQuestions(questions) {
  return questions.sort((left, right) => left.id.localeCompare(right.id, 'en'));
}

async function main() {
  await mkdir(dataDir, { recursive: true });

  const questions = sortQuestions([
    ...buildSelfQuestions(),
    ...buildCrossQuestions(),
  ]);
  const results = generateResultGroups();

  await writeFile(
    path.join(dataDir, 'jbti-config.json'),
    `${JSON.stringify(coreConfig, null, 2)}\n`
  );
  await writeFile(
    path.join(dataDir, 'jbti-dimensions.json'),
    `${JSON.stringify(dimensions, null, 2)}\n`
  );
  await writeFile(
    path.join(dataDir, 'jbti-questions.json'),
    `${JSON.stringify(questions, null, 2)}\n`
  );
  await writeFile(
    path.join(dataDir, 'jbti-results-a.json'),
    `${JSON.stringify(results.a, null, 2)}\n`
  );
  await writeFile(
    path.join(dataDir, 'jbti-results-b.json'),
    `${JSON.stringify(results.b, null, 2)}\n`
  );
  await writeFile(
    path.join(dataDir, 'jbti-results-c.json'),
    `${JSON.stringify(results.c, null, 2)}\n`
  );

  console.log('JBTI data generated successfully.');
  console.log(
    JSON.stringify(
      {
        dimensions: dimensions.length,
        questions: questions.length,
        results: results.a.length + results.b.length + results.c.length,
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
