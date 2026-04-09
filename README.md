# JBTI 人格测试系统

一个纯前端静态网页项目，使用 React + MUI 搭建，当前已完成以下骨架：

- 首页、答题页、结果页三段式流程
- 保守模式 / 直白模式全局切换
- 36 题固定结构（24 纯自身题 + 12 交叉题）
- 每次开始测试随机题序，每页 10 题
- 六维评分引擎、本地计算、6 字母代码输出
- 自定义 SVG 雷达图
- 维度描述、结果名称、简单总结、插画位、免责声明模板

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
  data/jbti-config.json   维度、题库、选项分值、结果与文案总配置
  data/jbti.js            JSON 配置适配层
  utils/scoring.js        计分引擎
  components/
    ModeToggle.jsx        模式切换
    RadarChart.jsx        雷达图
```

## 目前使用的是演示数据

当前项目中的以下内容是为了让骨架可以直接运行而填入的示例值，后续可按你的正式方案替换：

- 6 个维度名称
- 每个维度的低 / 中 / 高字母映射
- 36 道题目的双模式示例文案
- 结果页维度描述
- 部分整体人格标签映射

建议你下一步优先替换 `src/data/jbti-config.json` 中的数据内容，不需要改动页面逻辑。
