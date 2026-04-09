import { createTheme } from '@mui/material/styles';

const paletteMap = {
  conservative: {
    primary: '#5b6c5d',
    secondary: '#a96f4f',
    background: '#f7f2e8',
    paper: 'rgba(255, 252, 246, 0.82)',
    accent: '#d7e5d0',
    text: '#1f2721',
  },
  direct: {
    primary: '#0c5f57',
    secondary: '#df5b2e',
    background: '#f5efe6',
    paper: 'rgba(255, 248, 238, 0.86)',
    accent: '#ffd7c3',
    text: '#171716',
  },
};

export function getAppTheme(mode) {
  const palette = paletteMap[mode] ?? paletteMap.conservative;

  return createTheme({
    palette: {
      mode: 'light',
      primary: { main: palette.primary },
      secondary: { main: palette.secondary },
      background: {
        default: palette.background,
        paper: palette.paper,
      },
      text: {
        primary: palette.text,
      },
    },
    shape: {
      borderRadius: 24,
    },
    typography: {
      fontFamily:
        '"Avenir Next", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
      h1: {
        fontWeight: 700,
        letterSpacing: '-0.04em',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.03em',
      },
      h3: {
        fontWeight: 700,
      },
      button: {
        fontWeight: 700,
        textTransform: 'none',
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 22px 60px rgba(70, 52, 29, 0.08)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            paddingInline: 22,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            height: 10,
            borderRadius: 999,
          },
        },
      },
    },
    custom: {
      accent: palette.accent,
    },
  });
}
