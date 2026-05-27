// Floor plan inventory — source of truth for /semi-custom-home-floor-plans/.
//
// To update: edit entries below. New renderings drop into
// /public/media/renderings/<plan>-<style>-exterior.jpg.
// Coming-soon plans become live when (a) a rendering exists, (b) sq ft is set.
//
// Sq ft + descriptions sourced from Base Plan flyers in Odyssey Team Folder/
// Base Plans/ (synced 2026-05-26). The 15-item STANDARD_FEATURES list is the
// universal "what's included" list from every flyer — kept once here, shown on
// every plan detail page automatically.

export interface Plan {
  slug: string;
  name: string;
  status: 'live' | 'coming-soon';
  totalSqFt?: number;
  mainSqFt?: number;
  upperSqFt?: number;        // For two-story plans (Aria, Charleston, Oak Haven)
  basementSqFt?: number;
  beds?: number;              // Maximum (with finished basement)
  baths?: number;
  garage?: string;            // Standard garage configuration
  garageOption?: string;      // Alternative configuration available at selections
  styles: Array<'Farmhouse' | 'Modern' | 'Traditional'>;
  basementFinished: 'finished' | 'framed-unfinished' | 'optional';
  shortDescription?: string;
  description?: string;       // Long-form (from flyer)
  features?: string[];        // Plan-specific highlights (in addition to STANDARD_FEATURES)
  exteriorImage?: string;
  mainFloorImage?: string;
  basementImage?: string;
}

// Universal standard features — every Odyssey plan includes these by default.
// Source: shared "Standard Features" list on every Base Plan flyer.
export const STANDARD_FEATURES: string[] = [
  "9' Flat Main Floor Ceiling",
  'Front Covered Porch',
  'Main Floor LVP Except Bedrooms & Stairs',
  'Air Conditioning',
  'Tray Ceiling Master Bedroom',
  'Tray Ceiling Family Room',
  'Whole House Rain Gutters',
  'Double Sinks in Master Bathroom',
  'Tile Shower Surrounds',
  'Tile Kitchen Backsplash',
  'Granite/Quartz Countertops',
  'Keyless Entry to the Garage',
  'Comfort Height Vanities in All Bathrooms',
  'Oversized Kitchen Pantry',
  '50 oz Carpet with Moisture Barrier Carpet Pad',
];

// Standard garage convention across the lineup (per Curtis 2026-05-26):
// 3-car is now standard on every plan. Buyers can downsize to a 2-car at
// selections for a cost savings.
const STD_GARAGE = '3-car';
const STD_GARAGE_OPTION = '2-car alternative available — saves on cost';

export const plans: Plan[] = [
  // ── LIVE PLANS (alphabetical) ──────────────────────────────────────────
  {
    slug: 'ashwood',
    name: 'Ashwood',
    status: 'live',
    totalSqFt: 3739,
    mainSqFt: 1811,
    basementSqFt: 1928,
    beds: 6,
    baths: 3,
    garage: STD_GARAGE,
    garageOption: STD_GARAGE_OPTION,
    styles: ['Farmhouse', 'Modern', 'Traditional'],
    basementFinished: 'optional',
    shortDescription: 'An open, flowing six-bedroom design with a vaulted family room and three exterior styles to choose from.',
    description: "The Ashwood offers an exceptional design with an open, flowing layout that blends comfort and function. Upon entering, you're greeted by a spacious entryway that leads into the family room with its bright, open feel and 9-foot flat ceilings. At the heart of the home is the well-appointed kitchen, featuring a large island, abundant granite or quartz counter space, and ample cabinetry for storage. A generous walk-in pantry keeps everything organized, while the adjoining dining area offers plenty of room for gatherings and includes direct access to the backyard. The main floor also provides two comfortable bedrooms that share a convenient hallway bathroom, along with a private master retreat. The master suite stands out with its spacious layout and luxurious en-suite, creating a relaxing haven you'll look forward to every day.",
    features: [
      'Vaulted family room',
      'Kitchen with large island and walk-in pantry',
      'Master suite with luxurious en-suite',
      'Dining area opening directly to the backyard',
      'Three exterior styles: Farmhouse, Modern, or Traditional',
    ],
    exteriorImage: '/media/l5xpucwx/ashwood-farmhouse-elevation-exterior-1.jpg',
    mainFloorImage: '/media/lxddqyqs/ashwood-farmhouse-main-1-980x757.jpg',
    basementImage: '/media/242hyhpf/ashwood-farmhouse-basement-1-980x757.jpg',
  },
  {
    slug: 'clearwater',
    name: 'Clearwater',
    status: 'live',
    totalSqFt: 3250,
    mainSqFt: 1625,
    basementSqFt: 1625,
    beds: 6,
    baths: 3,
    garage: STD_GARAGE,
    garageOption: STD_GARAGE_OPTION,
    styles: ['Traditional'],
    basementFinished: 'framed-unfinished',
    shortDescription: 'A thoughtfully designed traditional plan with three bedrooms and two full baths on the main floor.',
    description: "The Clearwater is a thoughtfully designed floor plan that offers comfortable and efficient living with three bedrooms and two full bathrooms conveniently located on the main floor. The open-concept layout seamlessly connects the living, dining, and kitchen areas, creating a bright and welcoming atmosphere that's perfect for everyday living or entertaining guests. The kitchen features a functional layout with ample counter space and a generous pantry, while a covered front porch adds charm and outdoor living potential. The master suite serves as a private retreat, complete with a spacious bathroom that includes double sinks, a walk-in shower, freestanding tub, and a private toilet room. The home includes an unfinished basement already framed for a family room, three additional bedrooms, and another full bathroom — offering endless possibilities for future growth, guest space, or a home office setup.",
    features: [
      'Open-concept main level',
      'Three bedrooms and two full baths on the main floor',
      'Master suite with double sinks, walk-in shower, freestanding tub',
      'Framed basement ready for expansion (family room + 3 BR + bath)',
      'Covered front porch',
    ],
    exteriorImage: '/media/oaycjwqo/clearwater-front-exterior.jpg',
    mainFloorImage: '/media/nwmeyslt/clearwater-main-20.jpg',
    basementImage: '/media/pphm0ie4/clearwater-basement.png',
  },
  {
    slug: 'cottage',
    name: 'Cottage',
    status: 'live',
    totalSqFt: 3440,
    mainSqFt: 1720,
    basementSqFt: 1720,
    beds: 6,
    baths: 3,
    garage: STD_GARAGE,
    garageOption: STD_GARAGE_OPTION,
    styles: ['Traditional'],
    basementFinished: 'framed-unfinished',
    shortDescription: 'Traditional charm with a covered porch, two dormers, and a basement framed for future expansion.',
    description: 'The Cottage blends charm with modern functionality in a thoughtfully designed traditional floor plan. Featuring an inviting covered porch, graceful arched entry, and two eye-catching dormers, this home offers timeless style from the moment you arrive. Inside, the open-concept layout seamlessly connects the living, dining, and kitchen areas, creating a spacious and welcoming atmosphere perfect for both everyday living and entertaining. On the main floor, you\'ll find three comfortable bedrooms and two full bathrooms, including a beautiful master suite with a large walk-in closet and a luxurious bathroom. The master bathroom features double sinks, an oversized walk-in shower, and a private toilet room. The unfinished basement is already framed for a family room, three bedrooms, a full bathroom, and plenty of storage — offering the perfect opportunity for future expansion.',
    features: [
      'Covered porch with arched entry and two dormers',
      'Open-concept main living area',
      'Master suite with walk-in closet, dual sinks, oversized walk-in shower',
      'Three bedrooms and two full baths on the main floor',
      'Framed basement ready for customization (family room + 3 BR + bath)',
    ],
    exteriorImage: '/media/quqab0wv/cottage-front-exterior.jpg',
    mainFloorImage: '/media/tf2dyj0e/cottage-main-20.png',
    basementImage: '/media/gwnp2k2y/cottage-basement.png',
  },
  {
    slug: 'cottonwood',
    name: 'Cottonwood',
    status: 'live',
    totalSqFt: 3980,
    mainSqFt: 1990,
    basementSqFt: 1990,
    beds: 6,
    baths: 3,
    garage: STD_GARAGE,
    garageOption: STD_GARAGE_OPTION,
    styles: ['Traditional'],
    basementFinished: 'optional',
    shortDescription: 'Our most generous floor plan — open-concept living with smart, flexible design throughout.',
    description: 'The Cottonwood is designed with comfort, functionality, and style in mind. Featuring a spacious open-concept layout, this plan seamlessly connects the kitchen, dining, and living areas — making it perfect for both everyday living and entertaining. Natural light fills the home, highlighting thoughtfully placed details that create a warm and inviting atmosphere. With generous square footage and a smart design, the Cottonwood provides plenty of room for growing families or those looking for a home that adapts to their lifestyle. The primary suite is a true sanctuary, complete with a walk-in closet and a luxurious bathroom for ultimate relaxation. Additional bedrooms are comfortably sized and flexible for use as guest rooms, home offices, or hobby spaces.',
    features: [
      'Largest plan in the lineup at 3,980 sq ft',
      'Spacious open-concept main level',
      'Primary suite with walk-in closet and spa-style bath',
      'Flexible additional bedrooms (guest room, office, hobby space)',
      'Full basement matching the main floor footprint',
    ],
    exteriorImage: '/media/ztoaf0qt/cottonwood-front-exterior.jpg',
    mainFloorImage: '/media/lnxhaez3/cottonwood-main.jpg',
    basementImage: '/media/ddseqfie/cottonwood-basement.jpg',
  },
  {
    slug: 'oleander',
    name: 'Oleander',
    status: 'live',
    totalSqFt: 3226,
    mainSqFt: 1613,
    basementSqFt: 1613,
    beds: 6,
    baths: 3,
    garage: STD_GARAGE,
    garageOption: STD_GARAGE_OPTION,
    styles: ['Traditional'],
    basementFinished: 'optional',
    shortDescription: 'An efficient, light-filled traditional plan designed to maximize both style and livability.',
    description: 'The Oleander is designed to maximize both style and livability. With its open-concept layout, the Oleander brings together the kitchen, dining, and living areas into one seamless space, perfect for family time and entertaining. The kitchen features ample cabinetry, counter space, and a central island that makes cooking and hosting effortless. Large windows invite natural light throughout, creating an airy, welcoming feel in every corner of the home. The thoughtfully designed primary suite includes a spacious walk-in closet and a luxurious bathroom retreat. Additional bedrooms are versatile and well-sized — ideal for kids, guests, or a home office.',
    features: [
      'Open-concept kitchen, dining, and living',
      'Central kitchen island with ample counter space',
      'Large windows for natural light throughout',
      'Primary suite with walk-in closet and spa-style bath',
      'A right-sized entry point into the semi-custom lineup',
    ],
    exteriorImage: '/media/dtubu2m2/oleander-front-exterior.jpg',
    mainFloorImage: '/media/kenf4fkm/oleander-main.jpg',
    basementImage: '/media/2nwofbfx/oleander-basement.jpg',
  },
  {
    slug: 'ponderosa',
    name: 'Ponderosa',
    status: 'live',
    totalSqFt: 3484,
    mainSqFt: 1742,
    basementSqFt: 1742,
    beds: 6,
    baths: 3,
    garage: STD_GARAGE,
    garageOption: STD_GARAGE_OPTION,
    styles: ['Traditional'],
    basementFinished: 'framed-unfinished',
    shortDescription: 'A traditional plan blending classic design with modern convenience, with a framed basement ready for expansion.',
    description: "The Ponderosa is a traditional floor plan that blends classic design with modern convenience. From the inviting covered porch and dormer accents to the open-concept living space inside, this home is designed for comfortable, everyday living. The main floor features three well-sized bedrooms and two full bathrooms, including a private master suite with a shower, free-standing tub, double sinks, and a separate toilet room. The heart of the home is the spacious kitchen, complete with a generously sized pantry and plenty of counter space — perfect for cooking, hosting, or gathering with family and friends. A standout feature is the U-shaped staircase leading to the unfinished basement, already framed for a large family room, three additional bedrooms, and a full bathroom.",
    features: [
      'Covered porch with dormer accents',
      'U-shaped staircase to basement',
      'Master suite with shower, free-standing tub, double sinks, separate toilet room',
      'Three bedrooms and two full baths on the main floor',
      'Framed basement (family room + 3 BR + bath)',
    ],
    exteriorImage: '/media/vcjn0ffb/ponderosa-front-exterior.jpg',
    mainFloorImage: '/media/s0bbcucs/ponderosa-main.png',
    basementImage: '/media/hg1hesh3/ponderosa-basement-floor.png',
  },
  {
    slug: 'redwood',
    name: 'Redwood',
    status: 'live',
    totalSqFt: 3894,
    mainSqFt: 1947,
    basementSqFt: 1947,
    beds: 6,
    baths: 3,
    garage: STD_GARAGE,
    garageOption: STD_GARAGE_OPTION,
    styles: ['Traditional'],
    basementFinished: 'framed-unfinished',
    shortDescription: 'A spacious single-story plan delivering nearly 4,000 sq ft with a full daylight basement.',
    description: "The Redwood is a spacious single-story plan with a full daylight basement, delivering nearly 4,000 square feet of total living potential. The open main floor connects the kitchen, dining, and great room into a single, light-filled space that's perfect for entertaining or everyday family life. A covered front porch, window above the garage, and 9-foot main floor ceiling give the home its character on the outside, while a thoughtfully laid-out primary suite anchors the private side of the house. The full basement is framed and ready to finish — ideal for additional bedrooms, a family room, or a home gym. The Redwood is built for buyers who want one-level living with substantial expansion options below.",
    features: [
      'Spacious single-story main floor with daylight basement',
      'Open-concept kitchen, dining, and great room',
      'Covered front porch + window above garage',
      'Primary suite anchoring the private wing',
      'Framed basement ready to finish (family room + bedrooms + bath)',
    ],
    exteriorImage: '/media/renderings/redwood-traditional-exterior.jpg',
  },
  {
    slug: 'rockford',
    name: 'Rockford',
    status: 'live',
    totalSqFt: 3712,
    mainSqFt: 1856,
    basementSqFt: 1856,
    beds: 6,
    baths: 3,
    garage: STD_GARAGE,
    garageOption: STD_GARAGE_OPTION,
    styles: ['Farmhouse', 'Modern', 'Traditional'],
    basementFinished: 'finished',
    shortDescription: 'A great room and kitchen anchor the main level, with optional vaulted master ceilings.',
    description: "The Rockford offers the perfect blend of comfort, efficiency, and style. With a thoughtfully designed open layout, the Rockford seamlessly connects the living room, dining area, and kitchen, creating a central gathering place for family and friends. The kitchen is both functional and stylish, featuring generous counter space, a central island, and plenty of storage to keep everything within easy reach. Bright, open spaces and modern finishes give the Rockford a welcoming feel that's as practical as it is beautiful. The primary suite is a private retreat with a spacious walk-in closet and a spa-inspired bathroom, while additional bedrooms provide ample space for children, guests, or a dedicated office.",
    features: [
      'Optional vaulted ceilings in master bedroom',
      'Dual sinks, stand-up shower, soaking tub in master bath',
      'Master walk-in closet',
      'Finished basement with family room',
      'Three exterior styles: Farmhouse, Modern, or Traditional',
    ],
    exteriorImage: '/media/xkmcigyq/rockford-floor-plan-farmhouse-elevation.jpg',
    mainFloorImage: '/media/zodelwqx/rockford-official-main.jpg',
    basementImage: '/media/io5lpg1o/rockford-official-basement.jpg',
  },
  {
    slug: 'willow',
    name: 'Willow',
    status: 'live',
    totalSqFt: 3470,
    mainSqFt: 1735,
    basementSqFt: 1735,
    beds: 6,
    baths: 3,
    garage: STD_GARAGE,
    garageOption: STD_GARAGE_OPTION,
    styles: ['Traditional'],
    basementFinished: 'optional',
    shortDescription: 'An elegant traditional plan that combines practicality with spa-inspired comfort.',
    description: 'The Willow combines elegance and practicality in a beautifully designed layout. With its inviting entryway and spacious open-concept living areas, the Willow creates a warm and welcoming atmosphere the moment you step inside. The kitchen is the true heart of the home — featuring abundant counter space, a central island, and seamless flow to the dining and living rooms, making it perfect for family gatherings or entertaining friends. The primary suite is a relaxing retreat with a spacious walk-in closet and a spa-inspired bathroom, while additional bedrooms provide comfort and flexibility for children, guests, or a home office.',
    features: [
      'Inviting entryway and open-concept living',
      'Central kitchen island with abundant counter space',
      'Primary suite with walk-in closet and spa-inspired bath',
      'Versatile additional bedrooms',
      'Optional outdoor living and bonus spaces',
    ],
    exteriorImage: '/media/ho0ftc12/willow-front-exterior.jpg',
    mainFloorImage: '/media/sotle4ra/willow-main-floor.jpg',
    basementImage: '/media/dbajf1ho/willow-basement.jpg',
  },

  // ── COMING-SOON PLANS (alphabetical) ──────────────────────────────────
  // Have sq ft + description but awaiting new renderings before promoting
  // to live with detail pages. Birch, Cypress, White Pine = existing single-
  // story specs that we're already building. Aria, Charleston, Oak Haven
  // are new two-story additions to the lineup (added 2026-05-26).
  // Aria — two-story farmhouse, daylight basement (re-added 2026-05-27 with
  // specs from Aria base plan PDF + rendering from Aria Ai Front.png).
  {
    slug: 'aria',
    name: 'Aria',
    status: 'live',
    mainSqFt: 1243,
    upperSqFt: 1243,
    basementSqFt: 1243,
    beds: 5,
    baths: 3,
    garage: STD_GARAGE,
    garageOption: STD_GARAGE_OPTION,
    styles: ['Farmhouse', 'Modern', 'Traditional'],
    basementFinished: 'optional',
    shortDescription: 'A thoughtfully designed two-story farmhouse with three full living levels, oversized garage, and a daylight basement.',
    description: "The Aria is a thoughtfully designed two-story farmhouse that blends classic exterior charm with modern interior comfort. With a daylight basement, three full living levels, and an oversized garage, this plan offers exceptional space for growing families. The main floor features an open-concept layout connecting the kitchen, dining, and living areas, while the upper level delivers generous bedroom space and additional bathrooms. The walk-out basement provides flexible square footage that can be configured for additional bedrooms, a family room, or future expansion. The Aria is ideal for homeowners who want farmhouse styling with the practicality of a multi-level home and ample storage and parking.",
    features: [
      'Three full living levels (main, upper, daylight basement)',
      'Open-concept kitchen, dining, and living on the main floor',
      'Generous bedroom space on the upper level',
      'Walk-out daylight basement — flexible expansion space',
      'Oversized attached garage',
    ],
    exteriorImage: '/media/renderings/aria-exterior.png',
  },
  {
    slug: 'birch',
    name: 'Birch',
    status: 'coming-soon',
    mainSqFt: 1646,
    basementSqFt: 1646,
    beds: 6,
    baths: 3,
    garage: STD_GARAGE,
    garageOption: STD_GARAGE_OPTION,
    styles: ['Traditional'],
    basementFinished: 'framed-unfinished',
    shortDescription: 'A single-story plan with character and curb appeal — dormer accents and 9-foot ceilings throughout.',
    description: "The Birch combines comfortable everyday living with thoughtful custom touches throughout. This single-story plan features a covered front porch, an open kitchen and great room layout, and a primary suite with private bath. The basement is framed and ready to finish — offering room for additional bedrooms, a family room, or recreational space as your needs grow. With a window above the garage, dormer accents, and a 9-foot main floor ceiling, the Birch delivers character and curb appeal alongside an efficient floor plan.",
    features: [
      'Single-story open kitchen + great room',
      'Primary suite with private bath',
      'Window above garage + dormer accents',
      'Framed basement ready to finish',
    ],
  },
  // Charleston — two-story compact footprint with vertical layout (re-added
  // 2026-05-27 with specs from Charleston base plan PDF + rendering from
  // Charleston Ai Front.png).
  {
    slug: 'charleston',
    name: 'Charleston',
    status: 'live',
    mainSqFt: 1005,
    upperSqFt: 1005,
    basementSqFt: 1005,
    beds: 5,
    baths: 3,
    garage: STD_GARAGE,
    garageOption: STD_GARAGE_OPTION,
    styles: ['Farmhouse', 'Modern', 'Traditional'],
    basementFinished: 'optional',
    shortDescription: 'Efficient two-story living in a compact, attractive footprint — three full levels delivering surprising square footage on a smaller lot.',
    description: "The Charleston offers efficient two-story living in a compact, attractive footprint. This plan stacks comfortable living spaces across three levels — main, upper, and basement — delivering surprising square footage on a smaller lot. The main floor opens to a connected kitchen, dining, and living area, while the upper floor accommodates the primary bedroom suite plus additional bedrooms and bathrooms. The full daylight basement adds even more flexibility for finished living space, storage, or future expansion. With an attached garage and a smart vertical layout, the Charleston is ideal for buyers who want maximum livability without a sprawling footprint.",
    features: [
      'Three full living levels (main, upper, daylight basement)',
      'Connected kitchen, dining, and living on the main floor',
      'Primary bedroom suite on the upper level',
      'Full daylight basement — flexible expansion space',
      'Smart vertical layout for smaller lots',
    ],
    exteriorImage: '/media/renderings/charleston-exterior.png',
  },
  {
    slug: 'cypress',
    name: 'Cypress',
    status: 'coming-soon',
    mainSqFt: 1741,
    basementSqFt: 1741,
    beds: 6,
    baths: 3,
    garage: STD_GARAGE,
    garageOption: STD_GARAGE_OPTION,
    styles: ['Traditional'],
    basementFinished: 'framed-unfinished',
    shortDescription: 'A single-story plan with timeless appeal — covered porch, dormer detail, and basement ready for expansion.',
    description: 'The Cypress is a single-story plan designed for comfort, function, and timeless appeal. The exterior features a covered front porch with gable detail, a dormer, and a window above the garage — giving the home strong curb appeal. Inside, the open-concept main floor connects the kitchen, dining, and living spaces around a 9-foot ceiling, while the primary suite tucks away for privacy with its own walk-in closet and bathroom. The unfinished basement is framed and ready for future expansion, with an extra sink rough-in for a basement bathroom built in for flexibility down the road.',
    features: [
      'Covered front porch with gable detail',
      'Dormer + window above garage',
      'Open-concept main floor with 9-ft ceiling',
      'Private primary suite with walk-in closet',
      'Framed basement with extra sink rough-in for future bath',
    ],
  },
  {
    slug: 'oak-haven',
    name: 'Oak Haven',
    status: 'coming-soon',
    mainSqFt: 1602,
    basementSqFt: 1602,
    // upperSqFt: TBD — two-story plan, "most expansive plan in our collection"
    styles: ['Traditional'],
    basementFinished: 'optional',
    shortDescription: 'Our most expansive plan — generous living space, multiple gathering areas, and a refined exterior.',
    description: 'The Oak Haven is the most expansive plan in our collection, designed for families who want generous living space, multiple gathering areas, and a refined exterior. The main floor offers a welcoming entry, open kitchen and great room, and connection to a substantial back covered patio for outdoor living. The upper floor features additional bedrooms, full bathrooms, and bonus space that adapts to office, playroom, or media room use. The basement is partially finished with room to expand.',
    features: [
      'Most expansive plan in the lineup',
      'Substantial back covered patio',
      'Upper-floor bonus space (office, playroom, or media room)',
      'Multiple gathering areas across three levels',
      'Partially finished basement',
      'Oversized garage',
    ],
  },
  {
    slug: 'sage',
    name: 'Sage',
    status: 'coming-soon',
    styles: ['Traditional'],
    basementFinished: 'optional',
    // No Base Plan flyer found 2026-05-26 — flagged with Curtis. May be a custom
    // one-off, a renamed plan, or pending documentation. Currently used by a spec
    // home at 5471 Boardwalk Rd in Sand Creek Estates.
  },
  {
    slug: 'white-pine',
    name: 'White Pine',
    status: 'coming-soon',
    mainSqFt: 1740,
    basementSqFt: 1740,
    beds: 6,
    baths: 3,
    garage: STD_GARAGE,
    garageOption: STD_GARAGE_OPTION,
    styles: ['Traditional'],
    basementFinished: 'framed-unfinished',
    shortDescription: 'A single-story spec plan prioritizing outdoor living, oversized storage, and flexible expansion.',
    description: 'The White Pine is a single-story spec plan that prioritizes outdoor living, oversized storage, and flexible expansion space. The covered front porch and 355-square-foot back covered patio give the home generous indoor-outdoor connection — ideal for entertaining, morning coffee, or quiet evenings outside. Inside, the open kitchen and great room create a warm central gathering space, while the primary suite offers private retreat. The oversized 1,019-square-foot garage easily fits multiple vehicles plus storage or workshop needs. The unfinished basement is framed and ready to finish, offering nearly 1,600 square feet of additional living potential.',
    features: [
      'Covered front porch + 355 sq ft back covered patio',
      'Open kitchen and great room',
      'Oversized 1,019 sq ft garage',
      'Framed basement ready to finish (~1,600 sq ft potential)',
    ],
  },
];

export const livePlans = plans.filter(p => p.status === 'live');
export const comingSoonPlans = plans.filter(p => p.status === 'coming-soon');
