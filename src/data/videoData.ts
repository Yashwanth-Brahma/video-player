import type { Dataset, Video, CategoryGroup } from '../types';
import rawData from './dataset.json';

// ─── Data Adapter ───────────────────────────────────────────────────────────
// Transforms the raw dataset.json structure into normalized app types

const dataset = rawData as Dataset;

/** All videos flattened, with category info attached */
export const allVideos: Video[] = dataset.categories.flatMap((entry) =>
    entry.contents.map((content) => ({
        id: content.slug,
        title: content.title,
        category: entry.category.name,
        categorySlug: entry.category.slug,
        thumbnailUrl: content.thumbnailUrl,
        youtubeId: content.slug,
        mediaUrl: content.mediaUrl,
        duration: content.duration || '',
    }))
);

/** Videos grouped by category for the home page feed */
export const categoryGroups: CategoryGroup[] = dataset.categories.map((entry) => ({
    name: entry.category.name,
    slug: entry.category.slug,
    iconUrl: entry.category.iconUrl,
    videos: entry.contents.map((content) => ({
        id: content.slug,
        title: content.title,
        category: entry.category.name,
        categorySlug: entry.category.slug,
        thumbnailUrl: content.thumbnailUrl,
        youtubeId: content.slug,
        mediaUrl: content.mediaUrl,
        duration: content.duration || '',
    })),
}));

/** Get related videos (same category, excluding the current video) */
export const getRelatedVideos = (video: Video): Video[] =>
    allVideos.filter((v) => v.category === video.category && v.id !== video.id);
