import React, { useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import { darkTheme, lightTheme } from './theme';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import PlayerPage from './pages/PlayerPage';
import MiniPlayer from './components/MiniPlayer';
import { usePlayerStore } from './store/usePlayerStore';

// ─── App Shell ──────────────────────────────────────────────────────────────
// Root component with theme provider, header, home page, full-page player
// overlay, and persistent mini-player.

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true); // dark theme by default
  const isPlayerOpen = usePlayerStore((s) => s.isPlayerOpen);

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <CssBaseline />

      {/* Header — always visible under the player overlay */}
      <Header isDark={isDark} onToggleTheme={() => setIsDark((d) => !d)} />

      {/* Home page — always rendered for persistence */}
      <HomePage />

      {/* Full-page player overlay */}
      <AnimatePresence>
        {isPlayerOpen && <PlayerPage />}
      </AnimatePresence>

      {/* Mini player — persists while browsing */}
      <MiniPlayer />
    </ThemeProvider>
  );
};

export default App;
