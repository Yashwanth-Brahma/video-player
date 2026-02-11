import React, { useState, useCallback } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import VideoPlayer from '../components/VideoPlayer';
import RelatedVideos from '../components/RelatedVideos';
import { usePlayerStore } from '../store/usePlayerStore';
import { getRelatedVideos } from '../data/videoData';

// ─── Player Page ────────────────────────────────────────────────────────────
// Full-page video player with:
// - YouTube player constrained to 50vh height, controls always visible
// - Title, category, and related toggle always visible below
// - Drag down to minimize to mini-player
// - Related videos list fills remaining space

const PlayerPage: React.FC = () => {
    const { currentVideo, minimize, isPlayerOpen } = usePlayerStore();
    const [showRelated, setShowRelated] = useState(false);

    const relatedVideos = currentVideo ? getRelatedVideos(currentVideo) : [];

    const dragBind = useDrag(
        ({ down, movement: [, my], velocity: [, vy], cancel }) => {
            if (!down) {
                if (my > 100 || (my > 40 && vy > 0.3)) { minimize(); cancel(); }
                if (my < -60) { setShowRelated(true); cancel(); }
            }
        },
        { axis: 'y', filterTaps: true }
    );

    const toggleRelated = useCallback(() => setShowRelated((p) => !p), []);

    if (!currentVideo || !isPlayerOpen) return null;

    const gestureHandlers = dragBind();

    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 1200,
                display: 'flex',
                flexDirection: 'column',
                touchAction: 'none',
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'background.default',
                    overflow: 'hidden',
                }}
            >
                {/* Top bar */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        gap: 1,
                        bgcolor: 'background.paper',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        flexShrink: 0,
                    }}
                >
                    <IconButton onClick={minimize} sx={{ color: 'text.primary' }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography
                        variant="body2"
                        sx={{
                            flex: 1,
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {currentVideo.title}
                    </Typography>
                </Box>

                {/* ── Video player area — fixed height of 50vh ── */}
                <div {...gestureHandlers} style={{ touchAction: 'none', flexShrink: 0 }}>
                    <Box
                        sx={{
                            position: 'relative',
                            height: '50vh',       // fixed height — always leaves room below
                            bgcolor: '#000',
                        }}
                    >
                        <VideoPlayer youtubeId={currentVideo.youtubeId} />

                        {/* Drag pill */}
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: -20,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 40,
                                height: 4,
                                borderRadius: 2,
                                bgcolor: 'primary.main',
                                opacity: 0.4,
                            }}
                        />
                    </Box>
                </div>

                {/* Video info */}
                <Box sx={{ px: 2, py: 1.5, bgcolor: 'background.paper', flexShrink: 0 }}>
                    <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 0.5 }}
                    >
                        {currentVideo.title}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'primary.main',
                            fontFamily: "'Press Start 2P', monospace",
                            fontSize: '0.5rem',
                        }}
                    >
                        {currentVideo.category}
                    </Typography>
                </Box>

                {/* Related toggle */}
                <Box
                    onClick={toggleRelated}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 1,
                        cursor: 'pointer',
                        bgcolor: 'background.paper',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        gap: 1,
                        flexShrink: 0,
                        '&:hover': { bgcolor: 'action.hover' },
                    }}
                >
                    {showRelated ? (
                        <KeyboardArrowDownIcon sx={{ color: 'primary.main' }} />
                    ) : (
                        <KeyboardArrowUpIcon sx={{ color: 'primary.main' }} />
                    )}
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'primary.main',
                            fontFamily: "'Press Start 2P', monospace",
                            fontSize: '0.5rem',
                        }}
                    >
                        {showRelated ? 'HIDE' : 'RELATED'} ({relatedVideos.length})
                    </Typography>
                </Box>

                {/* Related videos – fills remaining space */}
                <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                    <RelatedVideos videos={relatedVideos} isVisible={showRelated} />
                </Box>
            </Box>
        </motion.div>
    );
};

export default PlayerPage;
