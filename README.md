# JBTI 人格测试系统

## 声明

本项目完全开源，默认按无版权开放参考处理。

我明确反对任何形式的商用，包括但不限于付费分发、套壳售卖、课程包装、咨询引流或其他变相盈利行为。

如果你硬要拿去商用，我也确实没什么办法阻止，但这不代表我授权、认可或支持。

另外，这个项目从定位上就是整活向的实验作品，不构成任何医疗、心理、关系、法律、职业或人生建议。

一个纯前端静态网页项目，使用 React + MUI 搭建，当前版本已经具备以下能力：

- 首页、答题页、结果页三段式流程
- 保守模式 / 直白模式全局切换
- 36 题固定结构（24 纯自身题 + 12 交叉题）
- 每次开始测试随机题序，每页 10 题
- 六维评分引擎、本地计算、6 字母代码输出
- 自定义 SVG 雷达图
- 结果名称、简单总结、插画位、页面声明、免责声明模板
- 题库和结果拆成目录化 JSON，便于人工维护
- 结果文案按代码前缀 lazy load
- 开发环境专用的页面调试切换按钮

## 本地启动

```bash
npm install
npm run dev
```

开发环境页面顶部会出现 `Debug Stage` 切换器，可直接在首页 / 题目页 / 结果页之间跳转。

## 打包静态文件

```bash
npm run build
```

## 当前目录结构

```text
src/
  App.jsx                 页面流程与交互
  theme.js                双模式主题
  data/
    jbti-config.json      通用 UI 文案、量表选项、免责声明
    jbti-dimensions.json  6 个维度定义、字母映射、描述、交叉关系计划
    jbti.js               JSON 配置适配层
    questions/
      manifest.json       题库文件索引
      self/*.json         各维度自身题
      cross/*.json        强/弱关联交叉题
    results/
      manifest.json       结果文件索引
      */*/*/*.json        按代码前四位拆分的结果占位文件
  utils/scoring.js        计分引擎
  components/
    ModeToggle.jsx        模式切换
    RadarChart.jsx        雷达图
scripts/
  generate-jbti-data.mjs  按维度定义重新生成题库和结果目录
```

## 配置基准

`src/data/jbti-dimensions.json` 是当前项目最重要的基础配置之一。

这里定义了：

- 维度顺序
- 维度中英双模式名称
- 每个维度 `low / medium / high` 对应的字母
- 分段区间
- 各维度描述
- 每个维度的强/弱交叉关系计划

特别注意：

- 结果代码使用的字母，完全以 `src/data/jbti-dimensions.json` 中的 `codeLevels` 为准
- 生成脚本不会再替你重写这个文件
- 如果你改了维度字母或维度关系，重新运行生成脚本即可同步刷新题库与结果文件

## 目前哪些内容还是占位

当前项目中的以下内容是为了让骨架可以直接运行而填入的示例值，后续可按你的正式方案替换：

- 多数题目的双模式占位文案
- 各题的默认选项文案
- 729 个结果代码的默认占位名称与占位总结
- 插画默认映射规则
- 页面里的部分通用文案

## 建议优先修改的文件

- `src/data/jbti-dimensions.json`
- `src/data/questions/self/*.json`
- `src/data/questions/cross/*.json`
- `src/data/results/*/*/*/*.json`
- `src/data/jbti-config.json`

## 重新生成数据文件

如果你修改了这些内容，建议重新生成：

- 维度字母
- 维度交叉关系
- 题库拆分结构
- 结果文件结构

```bash
node scripts/generate-jbti-data.mjs
```

这个脚本现在会做的事：

- 读取 `src/data/jbti-dimensions.json`
- 重新生成 `src/data/questions/` 目录
- 重新生成 `src/data/results/` 目录
- 保留 `src/data/jbti-dimensions.json` 本身不被覆盖

## 题目结构说明

每道题目前支持这些核心字段：

- `prompt.conservative` / `prompt.direct`
- `optionLabelsByValue`
- `effectsByValue`

其中：

- `optionLabelsByValue` 支持每题单独覆盖 1-5 选项文案
- 每个选项文案都支持 `conservative / direct` 两版
- `effectsByValue` 支持一个选项同时影响多个维度

## 结果结构说明

结果文件按代码前四位拆分。

例如某个结果代码前四位是 `QSMF`，它会落在类似这样的文件里：

- `src/data/results/Q/S/M/F.json`

每个结果对象当前包含：

- `code`
- `name.conservative` / `name.direct`
- `summary.conservative` / `summary.direct`
- `illustrationUrl`
- `profile`

## 维护建议

- 想改字母：改 `src/data/jbti-dimensions.json`
- 想改题目：改 `src/data/questions/`
- 想改结果名称或总结：改 `src/data/results/`
- 想改首页、按钮、声明、免责声明：改 `src/data/jbti-config.json`
- 改完基础结构后，跑一次 `node scripts/generate-jbti-data.mjs`
