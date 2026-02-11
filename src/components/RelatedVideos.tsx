import React from 'react';
import { Box, Typography, List, ListItemButton, ListItemText, Avatar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import type { Video } from '../types';
import { usePlayerStore } from '../store/usePlayerStore';

// ─── Related Videos Panel ───────────────────────────────────────────────────
// Shows videos from the same category. Selecting one switches playback instantly.

interface RelatedVideosProps {
    videos: Video[];
    isVisible: boolean;
}

const RelatedVideos: React.FC<RelatedVideosProps> = ({ videos, isVisible }) => {
    const setVideo = usePlayerStore((s) => s.setVideo);
    const currentVideo = usePlayerStore((s) => s.currentVideo);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    style={{ overflow: 'hidden' }}
                >
                    <Box
                        sx={{
                            bgcolor: 'background.paper',
                            borderTop: '2px solid',
                            borderColor: 'primary.main',
                            maxHeight: '50vh',
                            overflowY: 'auto',
                        }}
                    >
                        {/* Section header */}
                        <Box
                            sx={{
                                p: 2,
                                pb: 1,
                                position: 'sticky',
                                top: 0,
                                bgcolor: 'background.paper',
                                zIndex: 2,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Typography
                                variant="h5"
                                className="neon-glow"
                                sx={{ color: 'primary.main' }}
                            >
                                ▸ RELATED VIDEOS
                            </Typography>
                        </Box>

                        {/* Video list */}
                        <List disablePadding>
                            {videos.map((video, index) => {
                                const isActive = currentVideo?.id === video.id;
                                return (
                                    <motion.div
                                        key={video.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <ListItemButton
                                            onClick={() => setVideo(video)}
                                            selected={isActive}
                                            sx={{
                                                gap: 1.5,
                                                py: 1,
                                                px: 2,
                                                '&.Mui-selected': {
                                                    bgcolor: 'rgba(0,255,245,0.08)',
                                                    borderLeft: '3px solid',
                                                    borderColor: 'primary.main',
                                                },
                                                '&:hover': {
                                                    bgcolor: 'rgba(0,255,245,0.05)',
                                                },
                                            }}
                                        >
                                            {/* Thumbnail */}
                                            <Avatar
                                                variant="rounded"
                                                src={video.thumbnailUrl}
                                                alt={video.title}
                                                sx={{
                                                    width: 80,
                                                    height: 45,
                                                    borderRadius: 1,
                                                    border: isActive ? '2px solid' : '1px solid',
                                                    borderColor: isActive ? 'primary.main' : 'divider',
                                                }}
                                            >
                                                <PlayArrowIcon />
                                            </Avatar>

                                            {/* Title */}
                                            <ListItemText
                                                primary={video.title}
                                                primaryTypographyProps={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: isActive ? 700 : 500,
                                                    lineHeight: 1.3,
                                                    sx: {
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                    },
                                                }}
                                            />

                                            {/* Now playing indicator */}
                                            {isActive && (
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                                >
                                                    <PlayArrowIcon
                                                        sx={{ color: 'primary.main', fontSize: 20 }}
                                                    />
                                                </motion.div>
                                            )}
                                        </ListItemButton>
                                    </motion.div>
                                );
                            })}
                        </List>
                    </Box>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RelatedVideos;
