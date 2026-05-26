// Communities — source of truth for /available-lots/ and the per-community
// detail pages at /available-lots/<slug>/.

export interface PlatMap {
  label: string;          // e.g., "Division 4 (Signed)"
  pdf: string;            // Path to PDF in /public/documents/plat-maps/
  preview: string;        // Path to JPG preview in /public/media/plat-maps/
  fileSizeMB?: number;    // Display label for the download button
}

export interface CommunityHighlight {
  title: string;
  body: string;
}

export interface GalleryPhoto {
  src: string;
  alt: string;
}

export interface CommunityHoa {
  amount: number;                          // dollar amount, e.g. 300
  cadence: 'annual' | 'monthly' | 'quarterly';
  description?: string;                    // optional: what the HOA covers
}

export interface Community {
  slug: string;
  name: string;
  status: 'selling' | 'coming-soon';
  description: string;        // 1-2 sentence card description (used on index)
  longDescription?: string;   // Multi-paragraph copy for the detail page
  image: string;              // Card thumbnail on the /available-lots/ index
  heroImage?: string;         // Larger image used as the detail-page hero (defaults to `image`)
  address?: string;           // General community location
  highlights?: CommunityHighlight[]; // Selling-point bullets shown on detail page
  gallery?: GalleryPhoto[];   // Photo strip for the detail page
  platMaps?: PlatMap[];
  hoa?: CommunityHoa;         // HOA fee info, displayed on the detail page if present
}

export const communities: Community[] = [
  {
    slug: 'granite-creek',
    name: 'Granite Creek',
    status: 'selling',
    description: 'In the heart of Ammon — minutes from shopping, dining, movies, and the golf course next door. A selective developer keeps the community a step above.',
    longDescription: "Granite Creek is in the heart of Ammon — close enough to everything you need that you barely have to drive. Shopping, dining, the movie theater, and the grocery store are all minutes away, and the golf course sits right next door. The community itself is a step up: a gorgeous entrance, well-maintained streets, and a developer who's been selective about who builds here means the homes around you are nicer too. It's the kind of place where the address alone tells people something.",
    image: '/media/uiwjnc4d/granitecreek_featuredimage-opt.jpg',
    address: 'Eagle Creek Rd, Ammon, ID',
    highlights: [
      { title: 'Heart of Ammon',                body: 'Convenient location — shopping, dining, and daily errands are all minutes away.' },
      { title: 'Golf course next door',         body: 'Walking distance to the golf course for round-after-work convenience.' },
      { title: 'Movies, groceries, restaurants', body: "Everything you'd drive across town for is right around the corner." },
      { title: 'Gorgeous community entrance',    body: 'A signature entrance that sets the tone for the whole neighborhood.' },
      { title: 'Selective developer',            body: 'A picky developer means higher-end homes, consistent quality, and neighbors who care.' },
      { title: 'A step above',                   body: "Granite Creek is the address that quietly tells people you've arrived." },
    ],
    platMaps: [
      {
        label: 'Division 3',
        pdf: '/documents/plat-maps/granite-creek-div3-recorded.pdf',
        preview: '/media/plat-maps/granite-creek-div3-recorded-preview.jpg',
        fileSizeMB: 0.6,
      },
      {
        label: 'Division 2',
        pdf: '/documents/plat-maps/granite-creek-div2.pdf',
        preview: '/media/plat-maps/granite-creek-div2-preview.jpg',
        fileSizeMB: 1.5,
      },
    ],
    hoa: {
      amount: 300,
      cadence: 'annual',
    },
  },
  {
    slug: 'hawks-landing',
    name: 'Hawks Landing',
    status: 'selling',
    description: "Bigger lots in Ammon's foothills — quiet streets, sweeping valley views, walking path and park within the community. Minutes from Idaho Falls.",
    longDescription: "Hawks Landing sits in Ammon's foothills — far enough to feel away from the bustle, close enough to Idaho Falls that everything you need is a short drive. Low-traffic streets, generous lots, and views that stretch across the valley to the mountains in every direction. A walking path loops the entire subdivision, and a community park with playground sits right in the middle. It's the kind of place where neighbors wave, kids ride bikes, and the air feels a little cleaner.",
    image: '/media/dq5d1fgo/hawks-landing-neighborhood-in-idaho-falls-entrance-1-2048x1365.jpg',
    heroImage: '/media/communities/hawks-landing/hero.jpg',
    address: 'Ammon, Idaho (Bonneville County foothills, minutes from Idaho Falls)',
    highlights: [
      { title: 'On the foothills',         body: "Up on Ammon's foothills — quiet, scenic, away from the bustle. Minutes from Idaho Falls amenities." },
      { title: 'Sweeping valley views',    body: 'Open-sky views across the valley and out to the mountains.' },
      { title: 'Low-traffic streets',      body: 'A residential community designed for safety, walkability, and calm.' },
      { title: 'Bigger lots',              body: 'Generous homesites with room to spread out — no shoulder-to-shoulder feel.' },
      { title: 'Walking path around the subdivision', body: 'A continuous loop trail for daily walks, runs, and stroller laps.' },
      { title: 'Community park + playground', body: 'A real park inside the neighborhood — green space, playground, room to play.' },
    ],
    gallery: [
      { src: '/media/communities/hawks-landing/drone-valley-view.jpg', alt: 'Aerial view of Hawks Landing on the foothills with the Idaho Falls valley stretching to the horizon' },
      { src: '/media/communities/hawks-landing/drone-park-aerial.jpg', alt: 'Aerial view of Hawks Landing showing the community park and surrounding homes' },
      { src: '/media/communities/hawks-landing/park.jpg', alt: 'Community park playground at Hawks Landing on a sunny day' },
      { src: '/media/communities/hawks-landing/walking-path.jpg', alt: 'Tree-lined walking path along a quiet street in Hawks Landing' },
      { src: '/media/communities/hawks-landing/home-detail.jpg', alt: 'A modern home in Hawks Landing with stone accents and a clean residential street' },
    ],
    platMaps: [
      {
        label: 'Division 4',
        pdf: '/documents/plat-maps/hawks-landing-div4-may2026.pdf',
        preview: '/media/plat-maps/hawks-landing-div4-may2026-preview.jpg',
        fileSizeMB: 3.6,
      },
    ],
    hoa: {
      amount: 50,
      cadence: 'monthly',
    },
  },
  {
    slug: 'the-parks',
    name: 'The Parks',
    status: 'selling',
    description: 'Quick move-in homes in Shelley — the community is fully built out, but Odyssey has finished homes ready to claim.',
    longDescription: 'The Parks in Shelley is a fully built-out community — Odyssey no longer offers raw lots here, but we do have spec homes available for quick move-in. Reach out for current availability.',
    image: '', // TODO: Curtis to provide The Parks community photo
    address: 'Shelley, Idaho',
  },
  {
    slug: 'moser-estates',
    name: 'Moser Estates',
    status: 'selling',
    description: 'Spec homes in Rigby — community is fully built out, Odyssey has finished/in-progress homes available.',
    longDescription: 'Moser Estates in Rigby is a fully built-out community — Odyssey no longer offers raw lots here, but we do have quick move-in homes available. Reach out for current availability.',
    image: '', // TODO: Curtis to provide Moser Estates community photo
    address: 'Rigby, Idaho',
    hoa: {
      amount: 400,
      cadence: 'annual',
    },
  },
  {
    slug: 'sand-creek-estates',
    name: 'Sand Creek Estates',
    status: 'selling',
    description: 'A vibrant, welcoming community in Idaho Falls designed for those who want the perfect balance of comfort and style.',
    longDescription: 'Sand Creek Estates is our newest active community in Idaho Falls — designed for buyers who want the perfect balance of comfort and style in a vibrant, welcoming neighborhood setting.',
    image: '/media/ruibxzeq/20250314_124453-opt.jpg',
    address: 'Boardwalk Rd, Idaho Falls, ID',
    platMaps: [
      {
        label: 'Division 2',
        pdf: '/documents/plat-maps/sand-creek-estates.pdf',
        preview: '/media/plat-maps/sand-creek-estates-preview.jpg',
        fileSizeMB: 1.7,
      },
    ],
  },
];
