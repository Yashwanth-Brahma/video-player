import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import ThemeToggle from './ThemeToggle';
import { retroFontFamily } from '../theme';

// ─── Header ─────────────────────────────────────────────────────────────────
// Retro-styled app bar with neon title and theme toggle

interface HeaderProps {
    isDark: boolean;
    onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDark, onToggleTheme }) => (
    <AppBar
        position="sticky"
        elevation={0}
        sx={{
            background: isDark
                ? 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)'
                : 'linear-gradient(135deg, #f0eef5 0%, #e0ddf0 100%)',
            borderBottom: `2px solid ${isDark ? 'rgba(0,255,245,0.2)' : 'rgba(176,38,255,0.2)'}`,
            backdropFilter: 'blur(10px)',
        }}
    >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, sm: 3 } }}>
            {/* Retro logo / title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                    variant="h3"
                    className="neon-glow"
                    sx={{
                        fontFamily: retroFontFamily,
                        color: isDark ? '#00fff5' : '#b026ff',
                        letterSpacing: 1,
                        lineHeight: 1.6,
                    }}
                >
                    ▶ RETRO PLAY
                </Typography>
            </Box>

            {/* Theme toggle */}
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </Toolbar>
    </AppBar>
);

export default Header;
