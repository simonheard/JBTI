import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import App from './App.jsx';
import { getAppTheme } from './theme.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={getAppTheme('conservative')}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            minHeight: '100vh',
            background:
              'linear-gradient(145deg, #f6efe3 0%, #e8efe8 48%, #f4f1ea 100%)',
          },
          '#root': {
            minHeight: '100vh',
          },
        }}
      />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
