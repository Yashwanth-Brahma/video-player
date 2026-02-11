import { create } from 'zustand';
import type { Video } from '../types';

// ─── Centralized Playback State ─────────────────────────────────────────────

interface PlayerState {
    /** Currently active video (null = nothing playing) */
    currentVideo: Video | null;
    /** Whether the video is playing */
    isPlaying: boolean;
    /** Whether the player is in mini (minimized) mode */
    isMini: boolean;
    /** Whether the full-page player is open */
    isPlayerOpen: boolean;
    /** Saved playback position (seconds) — used to resume across mini/full transitions */
    seekTime: number;

    // ── Actions ────────────────────────────────────────────────────────────────
    setVideo: (video: Video) => void;
    togglePlay: () => void;
    setPlaying: (playing: boolean) => void;
    setSeekTime: (time: number) => void;
    minimize: () => void;
    restore: () => void;
    close: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
    currentVideo: null,
    isPlaying: false,
    isMini: false,
    isPlayerOpen: false,
    seekTime: 0,

    /** Set video, auto-play, open full player */
    setVideo: (video) =>
        set({
            currentVideo: video,
            isPlaying: true,
            isMini: false,
            isPlayerOpen: true,
            seekTime: 0, // new video starts from 0
        }),

    togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

    setPlaying: (playing) => set({ isPlaying: playing }),

    setSeekTime: (time) => set({ seekTime: time }),

    /** Collapse to mini-player */
    minimize: () => set({ isMini: true, isPlayerOpen: false }),

    /** Restore from mini-player to full-screen */
    restore: () => set({ isMini: false, isPlayerOpen: true }),

    /** Close player entirely */
    close: () =>
        set({
            currentVideo: null,
            isPlaying: false,
            isMini: false,
            isPlayerOpen: false,
            seekTime: 0,
        }),
}));
