import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Box, IconButton, Slider, Typography, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Forward10Icon from '@mui/icons-material/Forward10';
import Replay10Icon from '@mui/icons-material/Replay10';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../store/usePlayerStore';

// ─── Video Player ───────────────────────────────────────────────────────────

interface VideoPlayerProps {
    youtubeId: string;
    compact?: boolean;
    onVideoEnded?: () => void;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: (() => void) | undefined;
    }
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ youtubeId, compact = false, onVideoEnded }) => {
    const { isPlaying, togglePlay, setPlaying, setSeekTime } = usePlayerStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const playerDivRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const [showControls, setShowControls] = useState(true);
    const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isCssFullscreen, setIsCssFullscreen] = useState(false);
    const [playerReady, setPlayerReady] = useState(false);
    const [skipFeedback, setSkipFeedback] = useState<string | null>(null);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const skipFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const currentVideoIdRef = useRef(youtubeId);
    const onVideoEndedRef = useRef(onVideoEnded);

    // Keep the callback ref fresh
    useEffect(() => { onVideoEndedRef.current = onVideoEnded; }, [onVideoEnded]);

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
        cc_load_policy: 0,
        mute: 1,  // Start muted so iOS allows autoplay, unmute after first play
        origin: typeof window !== 'undefined' ? window.location.origin : '',
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
                            setHasStartedPlaying(true);
                            // Unmute after autoplay succeeds (iOS muted-autoplay workaround)
                            try {
                                if (event.target.isMuted?.()) {
                                    event.target.unMute();
                                    event.target.setVolume(100);
                                }
                            } catch (_) { }
                            const dur = event.target.getDuration?.() || 0;
                            if (dur > 0) setDuration(dur);
                        } else if (event.data === window.YT.PlayerState.PAUSED) {
                            setPlaying(false);
                        } else if (event.data === window.YT.PlayerState.ENDED) {
                            setPlaying(false);
                            onVideoEndedRef.current?.();
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
            if (skipFeedbackTimerRef.current) clearTimeout(skipFeedbackTimerRef.current);
            // Only save seekTime if we're still playing the same video
            // (prevents overwriting seekTime:0 when a new video was just selected)
            try {
                const storeState = usePlayerStore.getState();
                const storeVideoId = storeState.currentVideo?.youtubeId;
                if (storeVideoId && storeVideoId === currentVideoIdRef.current) {
                    const t = playerRef.current?.getCurrentTime?.() || 0;
                    if (t > 0) setSeekTime(t);
                }
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

    // Fullscreen listener (standard + webkit)
    useEffect(() => {
        const h = () => setIsFullscreen(!!(
            document.fullscreenElement || (document as any).webkitFullscreenElement
        ));
        document.addEventListener('fullscreenchange', h);
        document.addEventListener('webkitfullscreenchange', h);
        return () => {
            document.removeEventListener('fullscreenchange', h);
            document.removeEventListener('webkitfullscreenchange', h);
        };
    }, []);

    // ── Keyboard shortcuts ──────────────────────────────────────────────────
    useEffect(() => {
        if (compact) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't capture if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    togglePlay();
                    resetHideTimer();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    skip(-10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    skip(10);
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [compact]); // eslint-disable-line react-hooks/exhaustive-deps

    const resetHideTimer = useCallback(() => {
        setShowControls(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        // Don't auto-hide controls until video has actually started playing
        // (on iOS, autoplay may fail — user needs to see the play button)
        if (!hasStartedPlaying) return;
        hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }, [hasStartedPlaying]);

    const showSkipFeedback = useCallback((label: string) => {
        setSkipFeedback(label);
        if (skipFeedbackTimerRef.current) clearTimeout(skipFeedbackTimerRef.current);
        skipFeedbackTimerRef.current = setTimeout(() => setSkipFeedback(null), 700);
    }, []);

    const skip = useCallback((seconds: number) => {
        if (playerRef.current?.seekTo) {
            const t = Math.max(0, (playerRef.current.getCurrentTime?.() || 0) + seconds);
            playerRef.current.seekTo(t, true);
            setCurrentTime(t);
            showSkipFeedback(seconds > 0 ? `+${seconds}s` : `${seconds}s`);
            resetHideTimer();
        }
    }, [showSkipFeedback, resetHideTimer]);

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
        const el = containerRef.current as any;
        if (!el) return;

        // ── EXIT fullscreen ──
        if (isFullscreen || isCssFullscreen) {
            // Exit native fullscreen
            const fsEl = document.fullscreenElement || (document as any).webkitFullscreenElement;
            if (fsEl) {
                if (document.exitFullscreen) document.exitFullscreen();
                else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
            }
            // Exit CSS fullscreen (iOS)
            if (isCssFullscreen) {
                setIsCssFullscreen(false);
                setIsFullscreen(false);
            }
            return;
        }

        // ── ENTER fullscreen ──
        // Try native API first (works on desktop + Android)
        if (el.requestFullscreen) {
            el.requestFullscreen().catch(() => {
                // Native failed — fall back to CSS fullscreen (iOS)
                setIsCssFullscreen(true);
                setIsFullscreen(true);
            });
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        } else {
            // iOS: no native fullscreen at all → use CSS fullscreen
            setIsCssFullscreen(true);
            setIsFullscreen(true);
        }
    }, [isFullscreen, isCssFullscreen]);

    // ── PiP handler ─────────────────────────────────────────────────────────
    const handlePiP = useCallback(async () => {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
                return;
            }
            // Try to get the iframe and request PiP on it
            const iframe = playerRef.current?.getIframe?.() as HTMLIFrameElement | undefined;
            if (!iframe) return;

            // Try getting the video element inside the iframe (same-origin only)
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                const video = iframeDoc?.querySelector('video');
                if (video && typeof video.requestPictureInPicture === 'function') {
                    await video.requestPictureInPicture();
                    return;
                }
            } catch (_) {
                // Cross-origin — expected for YouTube
            }

            // Fallback: try PiP on the iframe element itself (Chrome 111+)
            if (typeof (iframe as any).requestPictureInPicture === 'function') {
                await (iframe as any).requestPictureInPicture();
            }
        } catch (err) {
            console.warn('PiP not available:', err);
        }
    }, []);

    const pipSupported = typeof document !== 'undefined' && 'pictureInPictureEnabled' in document;

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
                position: isCssFullscreen ? 'fixed' : 'relative',
                ...(isCssFullscreen ? {
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 99999,
                    width: '100dvw',
                    height: '100dvh',
                    // Fallbacks for older browsers that don't support dvh
                    '@supports not (height: 100dvh)': {
                        height: '-webkit-fill-available',
                    },
                } : {
                    width: '100%',
                    height: '100%',
                }),
                bgcolor: '#000',
            }}
            onMouseMove={resetHideTimer}
            onTouchStart={resetHideTimer}
            onClick={resetHideTimer}
        >
            {/* Player fills the container */}
            <div
                ref={playerDivRef}
                style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
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

            {/* ── Skip Feedback Ripple ── */}
            <AnimatePresence>
                {skipFeedback && (
                    <motion.div
                        key={skipFeedback + Date.now()}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 10,
                            pointerEvents: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Box
                            sx={{
                                bgcolor: 'rgba(0,0,0,0.7)',
                                borderRadius: '50%',
                                width: 80,
                                height: 80,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid rgba(0,255,245,0.5)',
                                boxShadow: '0 0 20px rgba(0,255,245,0.3)',
                            }}
                        >
                            <Typography
                                sx={{
                                    color: '#00fff5',
                                    fontFamily: "'Press Start 2P', monospace",
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    textShadow: '0 0 10px rgba(0,255,245,0.8)',
                                }}
                            >
                                {skipFeedback}
                            </Typography>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

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
                            {/* Skip back — with press animation */}
                            <motion.div whileTap={{ scale: 0.75 }} whileHover={{ scale: 1.1 }}>
                                <IconButton onClick={() => skip(-10)} sx={{ color: '#fff' }} size="small">
                                    <Replay10Icon fontSize="small" />
                                </IconButton>
                            </motion.div>

                            {/* Play/Pause */}
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

                            {/* Skip forward — with press animation */}
                            <motion.div whileTap={{ scale: 0.75 }} whileHover={{ scale: 1.1 }}>
                                <IconButton onClick={() => skip(10)} sx={{ color: '#fff' }} size="small">
                                    <Forward10Icon fontSize="small" />
                                </IconButton>
                            </motion.div>

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

                            {/* PiP button */}
                            {pipSupported && (
                                <motion.div whileTap={{ scale: 0.8 }}>
                                    <IconButton onClick={handlePiP} sx={{ color: '#fff' }} size="small">
                                        <PictureInPictureAltIcon fontSize="small" />
                                    </IconButton>
                                </motion.div>
                            )}

                            {/* Fullscreen */}
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
