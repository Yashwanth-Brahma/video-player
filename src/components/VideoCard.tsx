import React from 'react';
import { Card, CardMedia, CardContent, Typography, Chip, Box } from '@mui/material';
import { motion } from 'framer-motion';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import type { Video } from '../types';
import { usePlayerStore } from '../store/usePlayerStore';

// ─── Video Card ─────────────────────────────────────────────────────────────
// Displays a video thumbnail with title, category badge, and play overlay.
// Clicking opens the full-page player via Zustand store.

interface VideoCardProps {
    video: Video;
    index: number; // for staggered animation
}

const VideoCard: React.FC<VideoCardProps> = ({ video, index }) => {
    const setVideo = usePlayerStore((s) => s.setVideo);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
        >
            <Card
                onClick={() => setVideo(video)}
                sx={{
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
                    '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: (theme) =>
                            `0 0 15px ${theme.palette.primary.main}40, 0 4px 20px rgba(0,0,0,0.3)`,
                    },
                    '&:hover .play-overlay': {
                        opacity: 1,
                    },
                }}
            >
                {/* Thumbnail */}
                <Box sx={{ position: 'relative', paddingTop: '56.25%' /* 16:9 */ }}>
                    <CardMedia
                        component="img"
                        image={video.thumbnailUrl}
                        alt={video.title}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />

                    {/* Play overlay on hover */}
                    <Box
                        className="play-overlay"
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                        }}
                    >
                        <PlayArrowIcon
                            sx={{
                                fontSize: 48,
                                color: '#00fff5',
                                filter: 'drop-shadow(0 0 10px rgba(0,255,245,0.6))',
                            }}
                        />
                    </Box>

                    {/* Category badge */}
                    <Chip
                        label={video.category}
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            bgcolor: 'rgba(0,0,0,0.7)',
                            color: '#00fff5',
                            backdropFilter: 'blur(4px)',
                            fontSize: '0.5rem',
                            height: 22,
                        }}
                    />

                    {/* Duration badge */}
                    {video.duration && (
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 6,
                                right: 6,
                                bgcolor: 'rgba(0,0,0,0.85)',
                                color: '#f5ff00',
                                px: 0.8,
                                py: 0.2,
                                borderRadius: '4px',
                                fontSize: '0.6rem',
                                fontFamily: "'Press Start 2P', monospace",
                                fontWeight: 700,
                                letterSpacing: '0.5px',
                                border: '1px solid rgba(245,255,0,0.3)',
                            }}
                        >
                            {video.duration}
                        </Box>
                    )}
                </Box>

                {/* Title */}
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {video.title}
                    </Typography>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default VideoCard;
