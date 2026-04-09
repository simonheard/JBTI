import { useEffect, useMemo, useState } from 'react';
import {
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
} from './data/jbti.js';
import { getAppTheme } from './theme.js';
import { calculateResult } from './utils/scoring.js';

const QUESTIONS_PER_PAGE = 10;

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
    </Stack>
  );
}

function QuestionCard({ question, index, value, onChange, mode }) {
  return (
    <GlassCard>
      <Stack spacing={2.5}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip label={`Q${index + 1}`} color="primary" />
          <Typography variant="body2" color="text.secondary">
            {question.type === 'cross'
              ? mode === 'conservative'
                ? '交叉题'
                : '多维题'
              : mode === 'conservative'
                ? '核心题'
                : '单维题'}
          </Typography>
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
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            {mode === 'conservative' ? '上一页' : '上一页'}
          </Button>

          <Typography variant="body2" color="text.secondary">
            {UI_COPY.testHint[mode]}
          </Typography>

          {page < totalPages - 1 ? (
            <Button
              variant="contained"
              onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
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

function ResultPage({ mode, setMode, result, onRestart }) {
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
              {result.name}
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
        <Stack spacing={1.25}>
          <Typography variant="h5">{UI_COPY.resultSummaryTitle[mode]}</Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            {result.summary}
          </Typography>
        </Stack>
      </GlassCard>

      <GlassCard>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5">{UI_COPY.resultIllustrationTitle[mode]}</Typography>
            <Typography variant="body2" color="text.secondary">
              {UI_COPY.resultIllustrationDescription[mode]}
            </Typography>
          </Box>
          <CardMedia
            component="img"
            image={result.illustrationUrl}
            alt={result.name}
            sx={{
              borderRadius: 4,
              border: '1px solid rgba(60,60,60,0.08)',
              backgroundColor: 'rgba(255,255,255,0.6)',
            }}
          />
        </Stack>
      </GlassCard>

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
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
            {DISCLAIMER[mode]}
          </Typography>
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

  const result = useMemo(() => calculateResult(answers, mode), [answers, mode]);

  useEffect(() => {
    document.title = `JBTI 人格测试系统 · ${MODES[mode].label}`;
  }, [mode]);

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
                onSubmit={() => setStage('result')}
              />
            )}

            {stage === 'result' && (
              <ResultPage
                mode={mode}
                setMode={setMode}
                result={result}
                onRestart={() => {
                  setAnswers({});
                  setPage(0);
                  setOrderedQuestions(createQuestionOrder());
                  setStage('home');
                }}
              />
            )}
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
