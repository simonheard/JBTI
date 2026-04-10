import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  CardMedia,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import ModeToggle from './components/ModeToggle.jsx';
import RadarChart from './components/RadarChart.jsx';
import {
  DISCLAIMER,
  DIMENSIONS,
  MODES,
  QUESTIONS,
  UI_COPY,
  createQuestionOrder,
  loadResultPreset,
} from './data/jbti.js';
import { getAppTheme } from './theme.js';
import { calculateResult } from './utils/scoring.js';

const QUESTIONS_PER_PAGE = 10;
const IS_DEV = import.meta.env.DEV;

function scrollToPageTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

function GlassCard({ children, sx }) {
  return (
    <Paper
      sx={{
        p: { xs: 2.5, md: 4 },
        backgroundColor: 'background.paper',
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

function DebugStageSwitcher({ stage, onChange }) {
  if (!IS_DEV) {
    return null;
  }

  return (
    <Paper
      sx={{
        position: 'sticky',
        top: 12,
        zIndex: 30,
        px: 1.5,
        py: 1.25,
        bgcolor: 'rgba(255,255,255,0.86)',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
      >
        <Typography variant="body2" fontWeight={700}>
          Debug Stage
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={stage}
          onChange={(_, nextStage) => {
            if (nextStage) {
              onChange(nextStage);
            }
          }}
          sx={{
            '& .MuiToggleButtonGroup-grouped': {
              borderRadius: '999px !important',
            },
          }}
        >
          <ToggleButton value="home">首页</ToggleButton>
          <ToggleButton value="test">题目页</ToggleButton>
          <ToggleButton value="result">结果页</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </Paper>
  );
}

function HeroPage({ mode, setMode, onStart }) {
  return (
    <Stack spacing={3.5}>
      <Chip
        label={UI_COPY.heroBadge[mode]}
        color="secondary"
        sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
      />
      <Typography variant="h2" sx={{ fontSize: { xs: 34, md: 58 }, maxWidth: 760 }}>
        {UI_COPY.heroTitle[mode]}
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 720, lineHeight: 1.7 }}>
        {UI_COPY.heroDescription[mode]}
      </Typography>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
      >
        <Stack spacing={1}>
          <ModeToggle mode={mode} onChange={setMode} />
          <Typography variant="body2" color="text.secondary">
            {MODES[mode].helper}
          </Typography>
        </Stack>

        <Button size="large" variant="contained" color="primary" onClick={onStart}>
          {UI_COPY.startButton[mode]}
        </Button>
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        useFlexGap
        flexWrap="wrap"
      >
        {UI_COPY.heroBadges[mode].map((item) => (
          <Paper
            key={item}
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: 999,
              bgcolor: 'rgba(255,255,255,0.68)',
            }}
          >
            <Typography variant="body2" fontWeight={700}>
              {item}
            </Typography>
          </Paper>
        ))}
      </Stack>

      <GlassCard sx={{ p: 2.25 }}>
        <Stack spacing={1}>
          <Typography variant="subtitle1" fontWeight={700}>
            {UI_COPY.projectNoticeTitle[mode]}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            {UI_COPY.projectNotice[mode]}
          </Typography>
          <Typography variant="body2" color="secondary.main" fontWeight={700}>
            {UI_COPY.pageDisclaimer[mode]}
          </Typography>
        </Stack>
      </GlassCard>
    </Stack>
  );
}

function QuestionCard({ question, index, value, onChange, mode }) {
  const questionTypeLabel =
    question.type === 'cross'
      ? mode === 'conservative'
        ? '交叉题'
        : '多维题'
      : mode === 'conservative'
        ? '核心题'
        : '单维题';

  return (
    <GlassCard>
      <Stack spacing={2.5}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip label={`Q${index + 1}`} color="primary" />
          {IS_DEV && (
            <Typography variant="body2" color="text.secondary">
              {questionTypeLabel}
            </Typography>
          )}
        </Stack>

        <Typography variant="h5" sx={{ lineHeight: 1.6 }}>
          {question[mode]}
        </Typography>

        <ToggleButtonGroup
          fullWidth
          exclusive
          value={value ?? null}
          onChange={(_, nextValue) => {
            if (nextValue) {
              onChange(question.id, nextValue);
            }
          }}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(5, 1fr)' },
            gap: 1,
            '& .MuiToggleButtonGroup-grouped': {
              borderRadius: '18px !important',
              border: '1px solid rgba(60,60,60,0.12) !important',
            },
          }}
        >
          {question.options.map((option) => (
            <ToggleButton key={option.value} value={option.value}>
              <Stack spacing={0.25}>
                <Typography fontWeight={700}>{option.value}</Typography>
                <Typography variant="caption">{option.label[mode]}</Typography>
              </Stack>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
    </GlassCard>
  );
}

function TestPage({
  mode,
  setMode,
  answers,
  setAnswers,
  page,
  setPage,
  onSubmit,
  orderedQuestions,
}) {
  const totalPages = Math.ceil(orderedQuestions.length / QUESTIONS_PER_PAGE);
  const sliceStart = page * QUESTIONS_PER_PAGE;
  const currentQuestions = orderedQuestions.slice(
    sliceStart,
    sliceStart + QUESTIONS_PER_PAGE
  );
  const progress = Math.round((Object.keys(answers).length / orderedQuestions.length) * 100);
  const allCurrentAnswered = currentQuestions.every((question) => answers[question.id]);

  return (
    <Stack spacing={3}>
      <GlassCard sx={{ overflow: 'hidden' }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h4">{UI_COPY.testTitle[mode]}</Typography>
              <Typography variant="body2" color="text.secondary">
                第 {page + 1} / {totalPages} 页，已完成 {Object.keys(answers).length} / {orderedQuestions.length} 题
              </Typography>
            </Box>
            <ModeToggle mode={mode} onChange={setMode} />
          </Stack>
          <LinearProgress variant="determinate" value={progress} color="secondary" />
        </Stack>
      </GlassCard>

      {currentQuestions.map((question, index) => (
        <QuestionCard
          key={question.id}
          question={question}
          index={sliceStart + index}
          value={answers[question.id]}
          onChange={(id, nextValue) =>
            setAnswers((current) => ({ ...current, [id]: nextValue }))
          }
          mode={mode}
        />
      ))}

      <GlassCard>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <Button
            variant="outlined"
            disabled={page === 0}
            onClick={() => {
              setPage((current) => Math.max(0, current - 1));
              scrollToPageTop();
            }}
          >
            {mode === 'conservative' ? '上一页' : '上一页'}
          </Button>

          <Typography variant="body2" color="text.secondary">
            {UI_COPY.testHint[mode]}
          </Typography>

          {page < totalPages - 1 ? (
            <Button
              variant="contained"
              onClick={() => {
                setPage((current) => Math.min(totalPages - 1, current + 1));
                scrollToPageTop();
              }}
              disabled={!allCurrentAnswered}
            >
              {mode === 'conservative' ? '下一页' : '下一页'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              disabled={Object.keys(answers).length < orderedQuestions.length}
              onClick={onSubmit}
            >
              {mode === 'conservative' ? '提交并生成结果' : '提交并生成结果'}
            </Button>
          )}
        </Stack>
      </GlassCard>
    </Stack>
  );
}

function ResultPage({ mode, setMode, result, preset, loading, error, onRestart }) {
  const resultName = preset?.name?.[mode] ?? (loading ? '结果加载中' : '结果未命中');
  const resultSummary =
    preset?.summary?.[mode] ??
    (loading
      ? mode === 'conservative'
        ? '正在加载当前代码对应的结果文案。'
        : '正在加载这组代码对应的结果说明。'
      : mode === 'conservative'
        ? '当前代码没有找到对应结果文案，请检查结果配置。'
        : '这组代码还没配到对应结果文案。');
  const resultExtraGift = preset?.extra_gift?.[mode]?.trim() ?? '';
  const resultIllustration =
    (typeof preset?.illustrationUrl === 'string'
      ? preset.illustrationUrl
      : preset?.illustrationUrl?.[mode]) ?? '/illustrations/balanced-spectrum.svg';

  return (
    <Stack spacing={3}>
      <GlassCard>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              {UI_COPY.resultCodeLabel[mode]}
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: 44, md: 72 }, letterSpacing: '0.08em' }}>
              {result.code}
            </Typography>
            <Typography variant="h6" color="secondary.main" fontWeight={700}>
              {resultName}
            </Typography>
          </Box>

          <Stack spacing={1.5} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
            <ModeToggle mode={mode} onChange={setMode} />
            <Typography variant="body2" color="text.secondary">
              当前结果基于 {MODES[mode].label} 文案呈现
            </Typography>
          </Stack>
        </Stack>
      </GlassCard>

      <GlassCard>
        <RadarChart data={result.dimensions} mode={mode} />
      </GlassCard>

      <GlassCard>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }} alignItems="stretch">
          <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5">{UI_COPY.resultSummaryTitle[mode]}</Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              {resultSummary}
            </Typography>
            {resultExtraGift ? (
              <Stack spacing={0.75} sx={{ pt: 1 }}>
                <Typography variant="subtitle1" color="secondary.main" fontWeight={700}>
                  {mode === 'conservative' ? '额外彩蛋' : 'Extra Gift'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {resultExtraGift}
                </Typography>
              </Stack>
            ) : null}
          </Stack>

          <Stack spacing={2.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ width: '100%' }}>
              <Typography variant="h5">{UI_COPY.resultIllustrationTitle[mode]}</Typography>
            </Box>
            <CardMedia
              component="img"
              image={resultIllustration}
              alt={resultName}
              loading="lazy"
              fetchpriority="low"
              decoding="async"
              sx={{
                width: '100%',
                maxWidth: { xs: '100%', md: 560 },
                maxHeight: { xs: 420, md: 460 },
                objectFit: 'contain',
                alignSelf: 'center',
                borderRadius: 4,
                border: '1px solid rgba(60,60,60,0.08)',
                backgroundColor: 'rgba(255,255,255,0.6)',
              }}
            />
          </Stack>
        </Stack>
      </GlassCard>

      {error && (
        <Alert severity="warning">
          {mode === 'conservative'
            ? '结果文案加载失败，当前仍会显示代码与维度结果。请检查结果 JSON。'
            : '结果文案没加载出来，但代码和维度分数还在。去检查结果 JSON。'}
        </Alert>
      )}

      <Stack spacing={2}>
        {result.dimensions.map((dimension) => (
          <GlassCard key={dimension.id}>
            <Stack spacing={1.25}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">
                  {dimension.label} · {dimension.letter}
                </Typography>
                <Chip label={`${dimension.percent}%`} color="secondary" />
              </Stack>
              <Typography variant="body1">{dimension.description}</Typography>
            </Stack>
          </GlassCard>
        ))}
      </Stack>

      <GlassCard>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack spacing={0.75} sx={{ maxWidth: 720 }}>
            <Typography variant="body2" color="secondary.main" fontWeight={700}>
              {UI_COPY.pageDisclaimer[mode]}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {DISCLAIMER[mode]}
            </Typography>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="outlined"
              onClick={() =>
                window.alert(
                  mode === 'conservative'
                    ? '分享功能可在下一阶段接入。'
                    : '分享按钮已经留位，下一步可以接真实分享逻辑。'
                )
              }
            >
              {UI_COPY.shareButton[mode]}
            </Button>
            <Button variant="contained" onClick={onRestart}>
              {UI_COPY.restartButton[mode]}
            </Button>
          </Stack>
        </Stack>
      </GlassCard>
    </Stack>
  );
}

export default function App() {
  const [mode, setMode] = useState('conservative');
  const [stage, setStage] = useState('home');
  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [orderedQuestions, setOrderedQuestions] = useState(QUESTIONS);
  const [resultPreset, setResultPreset] = useState(null);
  const [resultLoading, setResultLoading] = useState(false);
  const [resultError, setResultError] = useState(null);

  const result = useMemo(() => calculateResult(answers, mode), [answers, mode]);

  function createDebugAnswers() {
    return Object.fromEntries(QUESTIONS.map((question) => [question.id, 3]));
  }

  useEffect(() => {
    document.title = `JBTI 人格测试系统 · ${MODES[mode].label}`;
  }, [mode]);

  useEffect(() => {
    let cancelled = false;

    if (stage !== 'result') {
      return undefined;
    }

    setResultLoading(true);
    setResultError(null);

    loadResultPreset(result.code)
      .then((preset) => {
        if (cancelled) {
          return;
        }

        setResultPreset(preset);
        setResultLoading(false);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setResultPreset(null);
        setResultError(error);
        setResultLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [stage, result.code]);

  return (
    <ThemeProvider theme={getAppTheme(mode)}>
      <Box
        sx={{
          minHeight: '100vh',
          py: { xs: 3, md: 5 },
          background:
            mode === 'direct'
              ? 'radial-gradient(circle at top left, rgba(255, 181, 142, 0.7), transparent 28%), linear-gradient(145deg, #f7efe3 0%, #f0efe8 45%, #f8e9db 100%)'
              : 'radial-gradient(circle at top right, rgba(212, 230, 208, 0.9), transparent 26%), linear-gradient(145deg, #f6efe3 0%, #e9efe8 45%, #f5f1ea 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <DebugStageSwitcher
              stage={stage}
              onChange={(nextStage) => {
                if (nextStage === 'test' || nextStage === 'result') {
                  setOrderedQuestions((current) =>
                    current.length === QUESTIONS.length ? current : createQuestionOrder()
                  );
                }

                if (nextStage === 'result' && Object.keys(answers).length < QUESTIONS.length) {
                  setAnswers(createDebugAnswers());
                }

                if (nextStage === 'home') {
                  setResultPreset(null);
                  setResultError(null);
                  setResultLoading(false);
                }

                setPage(0);
                setStage(nextStage);
                scrollToPageTop();
              }}
            />

            <GlassCard
              sx={{
                background:
                  mode === 'direct'
                    ? 'linear-gradient(135deg, rgba(255,249,242,0.88), rgba(255,236,222,0.84))'
                    : 'linear-gradient(135deg, rgba(255,252,247,0.88), rgba(242,248,241,0.84))',
              }}
            >
              {stage === 'home' && (
                <HeroPage
                  mode={mode}
                  setMode={setMode}
                  onStart={() => {
                    setOrderedQuestions(createQuestionOrder());
                    setStage('test');
                    setPage(0);
                    scrollToPageTop();
                  }}
                />
              )}

              {stage !== 'home' && (
                <Stack spacing={1.5}>
                  <Typography variant="h5" fontWeight={700}>
                    JBTI 人格测试系统
                  </Typography>
                  <Divider />
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} useFlexGap>
                    {DIMENSIONS.map((dimension) => (
                      <Chip
                        key={dimension.id}
                        label={`${dimension.order}. ${dimension.name[mode]}`}
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Stack>
              )}
            </GlassCard>

            {stage === 'test' && (
              <TestPage
                mode={mode}
                setMode={setMode}
                answers={answers}
                setAnswers={setAnswers}
                page={page}
                setPage={setPage}
                orderedQuestions={orderedQuestions}
                onSubmit={() => {
                  setResultPreset(null);
                  setResultError(null);
                  setStage('result');
                }}
              />
            )}

            {stage === 'result' && (
              <ResultPage
                mode={mode}
                setMode={setMode}
                result={result}
                preset={resultPreset}
                loading={resultLoading}
                error={resultError}
                onRestart={() => {
                  setAnswers({});
                  setPage(0);
                  setOrderedQuestions(createQuestionOrder());
                  setResultPreset(null);
                  setResultError(null);
                  setResultLoading(false);
                  setStage('home');
                  scrollToPageTop();
                }}
              />
            )}
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
