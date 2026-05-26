// Videos showcased on /videos/ — one entry per YouTube video.
// Adding a new video: append an entry below. Per-video detail pages
// auto-generate from this list via /videos/[slug]/.

export type VideoCategory =
  | 'plan-tours'
  | 'community-tours'
  | 'cost-and-pricing'
  | 'behind-the-scenes'
  | 'construction-updates'
  | 'testimonials'
  | 'announcements'
  | 'tips-and-faqs';

export interface VideoSeriesRef {
  slug: string;                     // Matches a series slug in series.ts
  episode: number;                  // 1-indexed episode number
}

export interface Video {
  slug: string;                     // URL slug, lowercase, hyphenated
  youtubeId: string;                // 11-character YouTube video ID
  title: string;
  description: string;              // 1-3 sentence description for SEO + the card
  longDescription?: string;         // Optional fuller description for the detail page
  category: VideoCategory;
  publishedDate: string;            // ISO format YYYY-MM-DD
  durationSeconds?: number;         // Optional, helps with VideoObject schema
  thumbnailUrl?: string;            // Defaults to YouTube's auto thumbnail
  series?: VideoSeriesRef;          // Optional: this video is part of a tutorial series
}

export const videos: Video[] = [
  {
    slug: 'buildertrend-navigation-tutorial',
    youtubeId: 'TgDl2m4zvck',
    title: 'Buildertrend Navigation Tutorial (Episode 1)',
    description: "A walkthrough of how to navigate the Buildertrend client portal — your hub for documents, schedule, selections, and messaging throughout your Odyssey build.",
    longDescription: "Episode 1 of our Odyssey Homes client tutorial series. Learn how to navigate the Buildertrend platform — the system we use to keep you connected to every part of your build. We'll show you where to find your schedule, documents, selections, photos, and messaging tabs, so you always know what's happening and what's coming next.",
    category: 'tips-and-faqs',
    publishedDate: '2026-05-26',
    series: {
      slug: 'buildertrend-tutorials',
      episode: 1,
    },
  },
];

export const CATEGORY_LABELS: Record<VideoCategory, string> = {
  'plan-tours': 'Plan Tours',
  'community-tours': 'Community Tours',
  'cost-and-pricing': 'Cost & Pricing',
  'behind-the-scenes': 'Behind the Scenes',
  'construction-updates': 'Construction Updates',
  'testimonials': 'Testimonials',
  'announcements': 'Announcements',
  'tips-and-faqs': 'Tips & FAQs',
};

export function videoThumbnail(video: Video): string {
  return video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;
}

export function videosByCategory(category: VideoCategory): Video[] {
  return videos.filter(v => v.category === category);
}
