// Site-wide constants. Edit these to change the value everywhere it appears.

export const site = {
  name: 'Odyssey Homes',
  tagline: 'Your Trusted Eastern Idaho Semi-Custom Home Builder',
  // Service area — used across the site for SEO + lead qualification.
  // Expanded 2026-05-26 from Idaho-Falls-only to broader Eastern Idaho
  // to capture searches in Ammon, Rigby, Rexburg, Shelley, Blackfoot.
  serviceArea: {
    primary: ['Idaho Falls', 'Ammon', 'Rigby', 'Rexburg', 'Shelley', 'Blackfoot'],
    occasional: ['Pocatello'],
    excluded: ['Boise', 'remodels of any kind'],
    positioning: 'New construction only — we build homes from the foundation up. No remodels, no additions.',
  },
  phone: '(208) 450-5500',
  phoneHref: 'tel:+12084505500',
  email: 'office@buildodyssey.com',
  emailHref: 'mailto:office@buildodyssey.com',
  // Single canonical address. 1333 Odyssey Drive was previously listed as
  // "Office" but it was a shared address with another Curtis-owned company —
  // removed 2026-05-26 to maintain clean public separation between the two
  // brands. 2999 Lancer is now the sole Odyssey Homes address everywhere.
  addresses: [
    { line1: '2999 Lancer Avenue', line2: 'Ammon, Idaho 83406', label: 'Office & Showroom', isShowroom: true },
  ],
  showroom: {
    line1: '2999 Lancer Avenue',
    line2: 'Ammon, Idaho 83406',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=2999+Lancer+Avenue+Ammon+ID+83406',
  },
  social: {
    facebook: 'https://www.facebook.com/OdysseyHomesIdaho/',
    instagram: 'https://www.instagram.com/odysseyhomesid/',
    youtube: 'https://www.youtube.com/@buildodysseyhomes',
  },
  // Buildertrend customer portal — canonical client-facing login URL.
  // Note: login.buildertrend.com requires a state token (session-specific,
  // doesn't work for general links). buildertrend.net is the customer
  // entry point Buildertrend supports for direct linking.
  clientPortalUrl: 'https://buildertrend.net/',
  // Cross-promo to Guardian Homes. Locked link per Curtis (2026-05-10).
  affiliate: {
    name: 'Guardian Homes',
    description: 'Odyssey Homes partners closely with Guardian Homes, experts in fully custom, luxury residences throughout Idaho.',
    href: 'https://www.buildguardian.com/',
  },
  // Interest rate displayed on the homepage. Update here, ships site-wide.
  interestRate: '6.65%',
  interestRateUpdated: '2026-05-22',
};
