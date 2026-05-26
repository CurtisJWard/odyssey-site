// Video series — groups of related tutorial videos that share a narrative arc.
// Each video in `videos.ts` can optionally belong to a series via its
// `series.slug` field. The series landing page at /videos/series/<slug>/ lists
// all episodes in order.

import { videos, type Video } from './videos';

export interface VideoSeries {
  slug: string;                    // URL slug, lowercase, hyphenated
  name: string;                    // Display name
  shortName?: string;              // Optional shorter name for compact spots
  description: string;             // 1-2 sentence card description
  longDescription?: string;        // Multi-paragraph copy for the series landing page
  heroImage?: string;              // Optional hero image for the series landing page
  category?: string;               // Optional thematic category for the series
}

export const series: VideoSeries[] = [
  {
    slug: 'buildertrend-tutorials',
    name: 'How to Use Buildertrend',
    shortName: 'Buildertrend Tutorials',
    description: 'Step-by-step walkthroughs of the Buildertrend client portal — your hub for documents, schedule, selections, photos, and messaging during your Odyssey build.',
    longDescription: "Every Odyssey client gets access to Buildertrend — the platform we use to keep you connected to your build at every stage. This series walks you through every part of the platform you'll actually use: where to find your schedule, how to approve selections, how to communicate with your project team, and how to see what's coming next. Watch in order or jump to whatever you need.",
    category: 'Client Resources',
  },
  {
    slug: 'build-estimate-tutorials',
    name: 'How to Use the Build Estimate',
    shortName: 'Build Estimate Tutorials',
    description: 'Walk through the Odyssey estimator — how to browse plans, customize options, generate your itemized cost summary, and save your progress.',
    longDescription: "The Odyssey Estimator is where the magic happens — every plan, every option, every dollar laid out in front of you. This series walks you through using it: browsing the floor plans, selecting your community and lot, customizing finishes and upgrades, and generating your itemized Cost Summary. By the end, you'll be building your number from your own couch.",
    category: 'Client Resources',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

export function seriesBySlug(slug: string): VideoSeries | undefined {
  return series.find(s => s.slug === slug);
}

export function videosInSeries(seriesSlug: string): Video[] {
  return videos
    .filter(v => v.series?.slug === seriesSlug)
    .sort((a, b) => (a.series?.episode || 0) - (b.series?.episode || 0));
}

export function standaloneVideos(): Video[] {
  return videos.filter(v => !v.series);
}

export function activeSeries(): VideoSeries[] {
  // Only return series that have at least one published video
  return series.filter(s => videosInSeries(s.slug).length > 0);
}
