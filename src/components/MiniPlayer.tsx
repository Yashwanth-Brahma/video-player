import React from 'react';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import VideoPlayer from './VideoPlayer';
import { usePlayerStore } from '../store/usePlayerStore';

// ─── Mini Player ────────────────────────────────────────────────────────────
// Docked mini-player at bottom. Embeds the actual VideoPlayer in compact mode
// so the video continues playing. Play/pause + close + restore controls.

const MiniPlayer: React.FC = () => {
    const { currentVideo, isPlaying, isMini, togglePlay, restore, close } =
        usePlayerStore();

    const bind = useDrag(
        ({ down, movement: [, my], velocity: [, vy], cancel }) => {
            if (!down && (my > 60 || vy > 0.5)) {
                close();
            }
            if (!down && my < -40) {
                restore();
                cancel();
            }
        },
        { axis: 'y', filterTaps: true }
    );

    const gestureHandlers = bind();

    return (
        <AnimatePresence>
            {isMini && currentVideo && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1300,
                        touchAction: 'none',
                    }}
                >
                    <div {...gestureHandlers} style={{ touchAction: 'none' }}>
                        <Paper
                            elevation={16}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: 0,
                                borderRadius: '12px 12px 0 0',
                                overflow: 'hidden',
                                bgcolor: 'background.paper',
                                borderTop: '2px solid',
                                borderColor: 'primary.main',
                                boxShadow: (theme) =>
                                    `0 -4px 20px ${theme.palette.primary.main}30`,
                            }}
                        >
                            {/* Live video preview — actual YouTube player in compact mode */}
                            <Box
                                onClick={restore}
                                sx={{
                                    width: 120,
                                    height: 68,
                                    flexShrink: 0,
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    bgcolor: '#000',
                                }}
                            >
                                <VideoPlayer
                                    youtubeId={currentVideo.youtubeId}
                                    compact
                                />
                                {/* Clickable overlay — so tapping the preview restores full player */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        zIndex: 2,
                                    }}
                                />
                                {/* Neon border accent */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        border: '1px solid',
                                        borderColor: 'primary.main',
                                        opacity: 0.5,
                                        zIndex: 3,
                                    }}
                                />
                            </Box>

                            {/* Title — tap to restore */}
                            <Box
                                onClick={restore}
                                sx={{
                                    flex: 1,
                                    px: 1.5,
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    minWidth: 0,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {currentVideo.title}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'text.secondary',
                                        fontSize: '0.6rem',
                                        fontFamily: "'Press Start 2P', monospace",
                                    }}
                                >
                                    {currentVideo.category}
                                </Typography>
                            </Box>

                            {/* Controls */}
                            <Box sx={{ display: 'flex', alignItems: 'center', pr: 1, gap: 0.5 }}>
                                <IconButton onClick={restore} size="small" sx={{ color: 'primary.main' }}>
                                    <OpenInFullIcon fontSize="small" />
                                </IconButton>

                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        togglePlay();
                                    }}
                                    sx={{
                                        color: 'primary.main',
                                        bgcolor: 'rgba(0,255,245,0.1)',
                                        '&:hover': { bgcolor: 'rgba(0,255,245,0.2)' },
                                    }}
                                    size="small"
                                >
                                    {isPlaying ? (
                                        <PauseIcon fontSize="small" />
                                    ) : (
                                        <PlayArrowIcon fontSize="small" />
                                    )}
                                </IconButton>

                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        close();
                                    }}
                                    size="small"
                                    sx={{ color: 'text.secondary' }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Paper>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MiniPlayer;
