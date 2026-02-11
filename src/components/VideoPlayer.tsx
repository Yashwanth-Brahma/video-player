import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Box, IconButton, Slider, Typography, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Forward10Icon from '@mui/icons-material/Forward10';
import Replay10Icon from '@mui/icons-material/Replay10';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../store/usePlayerStore';

// ─── Video Player ───────────────────────────────────────────────────────────

interface VideoPlayerProps {
    youtubeId: string;
    compact?: boolean;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: (() => void) | undefined;
    }
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ youtubeId, compact = false }) => {
    const { isPlaying, togglePlay, setPlaying, seekTime, setSeekTime } = usePlayerStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const playerDivRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const [showControls, setShowControls] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [playerReady, setPlayerReady] = useState(false);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const currentVideoIdRef = useRef(youtubeId);

    const playerVars = {
        autoplay: 1,
        controls: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        showinfo: 0,
        iv_load_policy: 3,
        disablekb: 1,
        fs: 0,
    };

    // Load YouTube API once
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(tag);
        }
    }, []);

    // Init / switch video
    useEffect(() => {
        if (playerRef.current && playerReady && youtubeId !== currentVideoIdRef.current) {
            currentVideoIdRef.current = youtubeId;
            setCurrentTime(0);
            setDuration(0);
            playerRef.current.loadVideoById(youtubeId);
            setTimeout(() => {
                try { playerRef.current?.playVideo?.(); } catch (_) { }
            }, 300);
            setPlaying(true);
            return;
        }

        const createPlayer = () => {
            if (!playerDivRef.current || playerRef.current) return;
            playerRef.current = new window.YT.Player(playerDivRef.current, {
                videoId: youtubeId,
                playerVars,
                events: {
                    onReady: (event: any) => {
                        setPlayerReady(true);
                        currentVideoIdRef.current = youtubeId;
                        setDuration(event.target.getDuration?.() || 0);
                        // Resume from stored seek time
                        const storedTime = usePlayerStore.getState().seekTime;
                        if (storedTime > 0) {
                            event.target.seekTo(storedTime, true);
                            setCurrentTime(storedTime);
                        }
                        event.target.playVideo();
                        setPlaying(true);
                    },
                    onStateChange: (event: any) => {
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            setPlaying(true);
                            const dur = event.target.getDuration?.() || 0;
                            if (dur > 0) setDuration(dur);
                        } else if (event.data === window.YT.PlayerState.PAUSED) {
                            setPlaying(false);
                        }
                    },
                },
            });
        };

        if (window.YT?.Player) {
            setTimeout(createPlayer, 300);
        } else {
            const prev = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => { prev?.(); createPlayer(); };
        }
    }, [youtubeId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Save position & destroy on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            // Save current playback time so the next player instance can resume
            try {
                const t = playerRef.current?.getCurrentTime?.() || 0;
                if (t > 0) setSeekTime(t);
            } catch (_) { }
            try { playerRef.current?.destroy?.(); } catch (_) { }
            playerRef.current = null;
            setPlayerReady(false);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Time polling
    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (playerRef.current?.getCurrentTime) {
                setCurrentTime(playerRef.current.getCurrentTime() || 0);
                if (duration <= 0 && playerRef.current.getDuration) {
                    const dur = playerRef.current.getDuration() || 0;
                    if (dur > 0) setDuration(dur);
                }
            }
        }, 400);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [duration]);

    // Sync play/pause
    useEffect(() => {
        if (!playerRef.current || !playerReady) return;
        try {
            if (isPlaying) playerRef.current.playVideo?.();
            else playerRef.current.pauseVideo?.();
        } catch (_) { }
    }, [isPlaying, playerReady]);

    // Fullscreen listener
    useEffect(() => {
        const h = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', h);
        return () => document.removeEventListener('fullscreenchange', h);
    }, []);

    const resetHideTimer = useCallback(() => {
        setShowControls(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }, []);

    const skip = useCallback((seconds: number) => {
        if (playerRef.current?.seekTo) {
            const t = Math.max(0, (playerRef.current.getCurrentTime?.() || 0) + seconds);
            playerRef.current.seekTo(t, true);
            setCurrentTime(t);
        }
    }, []);

    const handleSeek = useCallback((_: Event, value: number | number[]) => {
        const t = value as number;
        if (playerRef.current?.seekTo) {
            playerRef.current.seekTo(t, true);
            setCurrentTime(t);
        }
    }, []);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const handleFullscreen = useCallback(() => {
        if (!containerRef.current) return;
        if (document.fullscreenElement) document.exitFullscreen();
        else containerRef.current.requestFullscreen();
    }, []);

    if (compact) {
        return (
            <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                <div ref={playerDivRef} style={{ width: '100%', height: '100%' }} />
            </Box>
        );
    }

    return (
        <Box
            ref={containerRef}
            sx={{
                position: 'relative',
                width: '100%',
                // height is controlled by the parent (flex child in PlayerPage)
                height: '100%',
                bgcolor: '#000',
            }}
            onMouseMove={resetHideTimer}
            onTouchStart={resetHideTimer}
            onClick={resetHideTimer}
        >
            {/* Player fills the container */}
            <div
                ref={playerDivRef}
                style={{ width: '100%', height: '100%' }}
            />

            {/* Click overlay for play/pause */}
            <Box
                onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                    resetHideTimer();
                }}
                sx={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 3,
                    cursor: 'pointer',
                }}
            />

            {/* Custom Controls Overlay */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                            padding: '40px 12px 12px',
                            zIndex: 5,
                        }}
                    >
                        <Slider
                            value={currentTime}
                            max={duration || 100}
                            onChange={handleSeek as any}
                            size="small"
                            sx={{
                                color: '#00fff5',
                                height: 4,
                                mb: 0.5,
                                '& .MuiSlider-thumb': {
                                    width: 12, height: 12,
                                    boxShadow: '0 0 8px rgba(0,255,245,0.6)',
                                    '&:hover': { boxShadow: '0 0 12px rgba(0,255,245,0.8)' },
                                },
                                '& .MuiSlider-rail': { opacity: 0.3 },
                            }}
                        />
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                            <IconButton onClick={() => skip(-10)} sx={{ color: '#fff' }} size="small">
                                <Replay10Icon fontSize="small" />
                            </IconButton>
                            <IconButton
                                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                sx={{
                                    color: '#00fff5',
                                    bgcolor: 'rgba(0,255,245,0.1)',
                                    '&:hover': { bgcolor: 'rgba(0,255,245,0.2)' },
                                }}
                                size="small"
                            >
                                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                            <IconButton onClick={() => skip(10)} sx={{ color: '#fff' }} size="small">
                                <Forward10Icon fontSize="small" />
                            </IconButton>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: '#fff',
                                    fontFamily: "'Press Start 2P', monospace",
                                    fontSize: '0.5rem',
                                    ml: 1, flexGrow: 1,
                                }}
                            >
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </Typography>
                            <IconButton onClick={handleFullscreen} sx={{ color: '#fff' }} size="small">
                                {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
                            </IconButton>
                        </Stack>
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
};

export default VideoPlayer;
