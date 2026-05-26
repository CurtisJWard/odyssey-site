export interface TeamMember {
  name: string;
  title: string;
  experience?: string;
  image: string;
  bio: string;
}

export const team: TeamMember[] = [
  {
    name: 'Derek Thompson',
    title: 'CEO',
    experience: '10+ years',
    image: '/media/z3akmgp5/headshots-010724-27-1.jpg',
    bio: 'Derek leads Odyssey Homes with a commitment to excellence and a passion for innovation, exceeding expectations on every project.',
  },
  {
    name: 'Curtis Ward',
    title: 'Builder',
    experience: '20 years',
    image: '/media/rbse31rv/headshots-010724-28-1.jpg',
    bio: 'Curtis is an experienced builder committed to quality craftsmanship who leads his team with passion and precision.',
  },
  {
    name: 'Natasha Ellis',
    title: 'Office Manager, Designer & Billing',
    image: '/media/aggl5qin/img_4846-1.jpg',
    bio: 'Natasha runs operations, design, and billing to ensure seamless project execution and financial management.',
  },
  {
    name: 'Shantell Hayden',
    title: 'Office Assistant & Permits',
    image: '/media/i5cldyim/img_4850-1.jpg',
    bio: 'Shantell specializes in building permits and brings the organized, detail-oriented focus that keeps every project compliant.',
  },
  {
    name: 'Rick Michelson',
    title: 'Foreman',
    experience: '10+ years',
    image: '/media/rf3bqw4a/headshots-010724-12-1.jpg',
    bio: 'Rick brings deep field expertise to ensure tasks are executed efficiently and to the highest standard on every site.',
  },
  {
    name: 'Susan Allred-Patterson',
    title: 'Project Consultant',
    experience: '25 yrs real estate · 15 in new construction',
    image: '/media/rywjeszz/headshots-010724-3-1.jpg',
    bio: 'Susan provides weekly client communication and meticulous attention to detail across every phase of the build.',
  },
  {
    name: 'Kaysha Landon',
    title: 'Project Consultant',
    experience: '7 yrs real estate · 6 in new construction',
    image: '/media/j3sh2ujv/headshots-010724-5-1.jpg',
    bio: 'Kaysha focuses on the details and consistent weekly communication that keep our clients informed throughout the build.',
  },
  {
    name: 'Gary Rasmussen',
    title: 'Project Consultant',
    experience: '10 yrs real estate · 7 in new construction',
    image: '/media/lbrm5os2/gary-rasmussen-real-estate-agent-east-idaho.jpg',
    bio: 'Gary ensures detail and consistent communication across every phase of construction.',
  },
];
