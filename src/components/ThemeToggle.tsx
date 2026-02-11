import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

// ─── Theme Toggle Button ────────────────────────────────────────────────────
// Animated dark/light mode switch with smooth rotation

interface ThemeToggleProps {
    isDark: boolean;
    onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => (
    <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
        <motion.div
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            animate={{ rotate: isDark ? 0 : 180 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
            <IconButton
                onClick={onToggle}
                sx={{
                    color: isDark ? '#f5ff00' : '#b026ff',
                    '&:hover': {
                        backgroundColor: isDark
                            ? 'rgba(245,255,0,0.1)'
                            : 'rgba(176,38,255,0.1)',
                    },
                }}
            >
                {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
        </motion.div>
    </Tooltip>
);

export default ThemeToggle;
