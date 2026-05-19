export interface Community {
  slug: string;
  name: string;
  status: 'selling' | 'coming-soon';
  description: string;
  image: string;
}

export const communities: Community[] = [
  {
    slug: 'granite-creek',
    name: 'Granite Creek',
    status: 'selling',
    description: 'Experience luxury living in Granite Creek, featuring expansive lots and high-end semi-custom homes.',
    image: '/media/uiwjnc4d/granitecreek_featuredimage-opt.jpg',
  },
  {
    slug: 'hawks-landing',
    name: 'Hawks Landing',
    status: 'selling',
    description: 'Spacious homesites with stunning views, modern semi-custom designs, and easy access to outdoor recreation in Idaho Falls.',
    image: '/media/dq5d1fgo/hawks-landing-neighborhood-in-idaho-falls-entrance-1-2048x1365.jpg',
  },
  {
    slug: 'sand-creek-estates',
    name: 'Sand Creek Estates',
    status: 'coming-soon',
    description: 'A vibrant, welcoming community designed for those who want the perfect balance of comfort and style.',
    image: '/media/ruibxzeq/20250314_124453-opt.jpg',
  },
];
