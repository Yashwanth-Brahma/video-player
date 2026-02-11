import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import VideoCard from '../components/VideoCard';
import { categoryGroups } from '../data/videoData';

// ─── Home Page ──────────────────────────────────────────────────────────────
// Scrollable video feed grouped by category.
// Each section displays a grid of VideoCards.

const HomePage: React.FC = () => {
    // Track a global index for stagger animations across all cards
    let globalIndex = 0;

    return (
        <Box
            sx={{
                pb: 10, // space for mini-player at bottom
                minHeight: '100vh',
            }}
        >
            {categoryGroups.map((group) => (
                <motion.div
                    key={group.slug}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Box sx={{ px: { xs: 1.5, sm: 3 }, py: 2 }}>
                        {/* Category header */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                mb: 2,
                            }}
                        >
                            {/* Category icon */}
                            <Box
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(0,255,245,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid',
                                    borderColor: 'primary.main',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                }}
                            >
                                <img
                                    src={group.iconUrl}
                                    alt={group.name}
                                    style={{ width: 22, height: 22, objectFit: 'contain' }}
                                    onError={(e) => {
                                        // Fallback: show category initial
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </Box>

                            <Box>
                                <Typography
                                    variant="h4"
                                    className="neon-glow"
                                    sx={{
                                        color: 'primary.main',
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {group.name}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
                                >
                                    {group.videos.length} videos
                                </Typography>
                            </Box>
                        </Box>

                        {/* Video grid */}
                        <Grid container spacing={1.5}>
                            {group.videos.map((video) => {
                                const idx = globalIndex++;
                                return (
                                    <Grid
                                        size={{ xs: 6, sm: 4, md: 3 }}
                                        key={video.id}
                                    >
                                        <VideoCard video={video} index={idx} />
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>

                    {/* Separator line between categories */}
                    <Box
                        sx={{
                            mx: 3,
                            height: '1px',
                            background: (theme) =>
                                `linear-gradient(90deg, transparent, ${theme.palette.primary.main}40, transparent)`,
                        }}
                    />
                </motion.div>
            ))}
        </Box>
    );
};

export default HomePage;
