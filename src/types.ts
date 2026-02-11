// ─── Dataset Shape (matches dataset.json) ───────────────────────────────────

/** A category entry from the raw dataset */
export interface RawCategoryEntry {
    category: {
        slug: string;
        name: string;
        iconUrl: string;
    };
    contents: RawContent[];
}

/** A single content item from the raw dataset */
export interface RawContent {
    title: string;
    mediaUrl: string;
    mediaType: string;
    thumbnailUrl: string;
    slug: string;
    duration?: string;  // human-readable, e.g. "3:45"
}

/** Root shape of dataset.json */
export interface Dataset {
    categories: RawCategoryEntry[];
}

// ─── Normalized App Types ───────────────────────────────────────────────────

/** Normalized video used throughout the app */
export interface Video {
    id: string;          // unique identifier (slug)
    title: string;
    category: string;    // human-readable category name
    categorySlug: string;
    thumbnailUrl: string;
    youtubeId: string;   // YouTube video ID for iframe embed
    mediaUrl: string;    // full embed URL
    duration: string;    // human-readable duration, e.g. "3:45"
}

/** Category with its videos */
export interface CategoryGroup {
    name: string;
    slug: string;
    iconUrl: string;
    videos: Video[];
}
