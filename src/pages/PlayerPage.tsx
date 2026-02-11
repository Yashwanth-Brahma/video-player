import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import CancelIcon from '@mui/icons-material/Cancel';
import VideoPlayer from '../components/VideoPlayer';
import RelatedVideos from '../components/RelatedVideos';
import { usePlayerStore } from '../store/usePlayerStore';
import { getRelatedVideos, getNextVideo } from '../data/videoData';

// ─── Player Page ────────────────────────────────────────────────────────────

const PlayerPage: React.FC = () => {
    const { currentVideo, minimize, isPlayerOpen, setVideo, setSeekTime } = usePlayerStore();
    const [showRelated, setShowRelated] = useState(false);

    // Auto-play next state
    const [countdown, setCountdown] = useState<number | null>(null);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const nextVideoRef = useRef(currentVideo ? getNextVideo(currentVideo) : null);

    const relatedVideos = currentVideo ? getRelatedVideos(currentVideo) : [];

    // Keep next video reference updated
    useEffect(() => {
        nextVideoRef.current = currentVideo ? getNextVideo(currentVideo) : null;
    }, [currentVideo]);

    // Clean up countdown on unmount
    useEffect(() => {
        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, []);

    // ── Auto-play countdown logic ───────────────────────────────────────────
    const handleVideoEnded = useCallback(() => {
        const next = nextVideoRef.current;
        if (!next) return;

        setCountdown(2);
        let remaining = 2;

        countdownRef.current = setInterval(() => {
            remaining -= 1;
            if (remaining <= 0) {
                if (countdownRef.current) clearInterval(countdownRef.current);
                countdownRef.current = null;
                setCountdown(null);
                setSeekTime(0);
                setVideo(next);
            } else {
                setCountdown(remaining);
            }
        }, 1000);
    }, [setVideo, setSeekTime]);

    const cancelAutoPlay = useCallback(() => {
        if (countdownRef.current) clearInterval(countdownRef.current);
        countdownRef.current = null;
        setCountdown(null);
    }, []);

    const playNextNow = useCallback(() => {
        cancelAutoPlay();
        const next = nextVideoRef.current;
        if (next) {
            setSeekTime(0);
            setVideo(next);
        }
    }, [cancelAutoPlay, setVideo, setSeekTime]);

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
    const nextVideo = getNextVideo(currentVideo);

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
                            height: '50vh',
                            bgcolor: '#000',
                        }}
                    >
                        <VideoPlayer
                            youtubeId={currentVideo.youtubeId}
                            onVideoEnded={handleVideoEnded}
                        />

                        {/* ── Auto-Play Countdown Overlay ── */}
                        <AnimatePresence>
                            {countdown !== null && nextVideo && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                        position: 'absolute',
                                        top: 0, left: 0, right: 0, bottom: 0,
                                        background: 'rgba(0,0,0,0.85)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 20,
                                        gap: 16,
                                    }}
                                >
                                    {/* Countdown ring */}
                                    <Box sx={{ position: 'relative', width: 80, height: 80 }}>
                                        <svg viewBox="0 0 80 80" width={80} height={80}>
                                            <circle
                                                cx="40" cy="40" r="35"
                                                fill="none"
                                                stroke="rgba(0,255,245,0.2)"
                                                strokeWidth="4"
                                            />
                                            <motion.circle
                                                cx="40" cy="40" r="35"
                                                fill="none"
                                                stroke="#00fff5"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                                strokeDasharray={220}
                                                initial={{ strokeDashoffset: 0 }}
                                                animate={{ strokeDashoffset: 220 }}
                                                transition={{ duration: 2, ease: 'linear' }}
                                                style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                                            />
                                        </svg>
                                        <Typography
                                            sx={{
                                                position: 'absolute',
                                                top: '50%', left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                color: '#00fff5',
                                                fontFamily: "'Press Start 2P', monospace",
                                                fontSize: '1.2rem',
                                                textShadow: '0 0 12px rgba(0,255,245,0.6)',
                                            }}
                                        >
                                            {countdown}
                                        </Typography>
                                    </Box>

                                    <Typography
                                        sx={{
                                            color: '#fff',
                                            fontSize: '0.75rem',
                                            textAlign: 'center',
                                            fontFamily: "'Press Start 2P', monospace",
                                        }}
                                    >
                                        UP NEXT
                                    </Typography>

                                    {/* Next video preview */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2 }}>
                                        <Box
                                            component="img"
                                            src={nextVideo.thumbnailUrl}
                                            alt={nextVideo.title}
                                            sx={{
                                                width: 80,
                                                height: 45,
                                                objectFit: 'cover',
                                                borderRadius: 1,
                                                border: '1px solid rgba(0,255,245,0.3)',
                                            }}
                                        />
                                        <Typography
                                            sx={{
                                                color: '#fff',
                                                fontSize: '0.65rem',
                                                maxWidth: 160,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                            }}
                                        >
                                            {nextVideo.title}
                                        </Typography>
                                    </Box>

                                    {/* Action buttons */}
                                    <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                                        <Button
                                            onClick={playNextNow}
                                            variant="contained"
                                            size="small"
                                            startIcon={<SkipNextIcon />}
                                            sx={{
                                                bgcolor: '#00fff5',
                                                color: '#000',
                                                fontWeight: 700,
                                                fontFamily: "'Press Start 2P', monospace",
                                                fontSize: '0.45rem',
                                                '&:hover': { bgcolor: '#00ccc0' },
                                                textTransform: 'none',
                                            }}
                                        >
                                            Play Now
                                        </Button>
                                        <Button
                                            onClick={cancelAutoPlay}
                                            variant="outlined"
                                            size="small"
                                            startIcon={<CancelIcon />}
                                            sx={{
                                                borderColor: 'rgba(255,255,255,0.3)',
                                                color: '#fff',
                                                fontFamily: "'Press Start 2P', monospace",
                                                fontSize: '0.45rem',
                                                '&:hover': {
                                                    borderColor: '#ff4444',
                                                    color: '#ff4444',
                                                },
                                                textTransform: 'none',
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </Box>
                                </motion.div>
                            )}
                        </AnimatePresence>

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
