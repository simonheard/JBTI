# JBTI 人格测试系统

一个纯前端静态网页项目，使用 React + MUI 搭建，当前已完成以下骨架：

- 首页、答题页、结果页三段式流程
- 保守模式 / 直白模式全局切换
- 36 题固定结构（24 纯自身题 + 12 交叉题）
- 每次开始测试随机题序，每页 10 题
- 六维评分引擎、本地计算、6 字母代码输出
- 自定义 SVG 雷达图
- 维度描述、结果名称、简单总结、插画位、免责声明模板
- 维度 / 题库 / 结果拆分成多份 JSON，便于人工维护

## 本地启动

```bash
npm install
npm run dev
```

## 打包静态文件

```bash
npm run build
```

## 项目结构

```text
src/
  App.jsx                 页面流程与交互
  theme.js                双模式主题
  data/jbti-config.json   通用 UI 文案、量表选项、免责声明
  data/jbti-dimensions.json  6 个维度定义与强弱关联计划
  data/jbti-questions.json   36 道题骨架与 effectsByValue
  data/jbti-results-*.json   729 种结果代码占位
  data/jbti.js            JSON 配置适配层
  utils/scoring.js        计分引擎
  components/
    ModeToggle.jsx        模式切换
    RadarChart.jsx        雷达图
scripts/
  generate-jbti-data.mjs  重新生成拆分 JSON 的脚本
```

## 目前使用的是演示数据

当前项目中的以下内容是为了让骨架可以直接运行而填入的示例值，后续可按你的正式方案替换：

- 6 个维度的默认字母映射
- 36 道题的双模式占位文案
- 729 个结果代码的默认占位名称与占位总结
- 插画默认映射规则
- 结果页维度描述

建议优先修改这些文件：

- `src/data/jbti-dimensions.json`
- `src/data/jbti-questions.json`
- `src/data/jbti-results-a.json`
- `src/data/jbti-results-b.json`
- `src/data/jbti-results-c.json`

如果你调整了基础维度结构，可以运行：

```bash
node scripts/generate-jbti-data.mjs
```
