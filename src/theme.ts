import { createTheme } from '@mui/material/styles';

// ─── Retro Neon Palette ─────────────────────────────────────────────────────
const neonCyan = '#00fff5';
const neonPink = '#ff2d95';
const neonPurple = '#b026ff';
const neonYellow = '#f5ff00';

const retroFontFamily = `'Press Start 2P', 'Courier New', monospace`;
const bodyFontFamily = `'Inter', 'Roboto', sans-serif`;

// ─── Shared component overrides ─────────────────────────────────────────────
const sharedComponents = {
    MuiCssBaseline: {
        styleOverrides: `
      @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@300;400;500;600;700&display=swap');
    `,
    },
    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: 4,
                textTransform: 'none' as const,
                fontFamily: bodyFontFamily,
                fontWeight: 600,
            },
        },
    },
    MuiChip: {
        styleOverrides: {
            root: {
                fontFamily: retroFontFamily,
                fontSize: '0.55rem',
                letterSpacing: '0.5px',
            },
        },
    },
};

// ─── Dark Theme (Default) ───────────────────────────────────────────────────
export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: neonCyan },
        secondary: { main: neonPink },
        background: {
            default: '#0a0a0f',
            paper: '#12121a',
        },
        text: {
            primary: '#e0e0e0',
            secondary: '#a0a0a0',
        },
    },
    typography: {
        fontFamily: bodyFontFamily,
        h1: { fontFamily: retroFontFamily, fontSize: '1.3rem' },
        h2: { fontFamily: retroFontFamily, fontSize: '1rem' },
        h3: { fontFamily: retroFontFamily, fontSize: '0.85rem' },
        h4: { fontFamily: retroFontFamily, fontSize: '0.75rem' },
        h5: { fontFamily: retroFontFamily, fontSize: '0.65rem' },
        h6: { fontFamily: retroFontFamily, fontSize: '0.55rem' },
    },
    components: sharedComponents,
    shape: { borderRadius: 8 },
});

// ─── Light Theme ────────────────────────────────────────────────────────────
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: neonPurple },
        secondary: { main: neonPink },
        background: {
            default: '#f0eef5',
            paper: '#ffffff',
        },
        text: {
            primary: '#1a1a2e',
            secondary: '#555577',
        },
    },
    typography: {
        fontFamily: bodyFontFamily,
        h1: { fontFamily: retroFontFamily, fontSize: '1.3rem' },
        h2: { fontFamily: retroFontFamily, fontSize: '1rem' },
        h3: { fontFamily: retroFontFamily, fontSize: '0.85rem' },
        h4: { fontFamily: retroFontFamily, fontSize: '0.75rem' },
        h5: { fontFamily: retroFontFamily, fontSize: '0.65rem' },
        h6: { fontFamily: retroFontFamily, fontSize: '0.55rem' },
    },
    components: sharedComponents,
    shape: { borderRadius: 8 },
});

export { neonCyan, neonPink, neonPurple, neonYellow, retroFontFamily, bodyFontFamily };
