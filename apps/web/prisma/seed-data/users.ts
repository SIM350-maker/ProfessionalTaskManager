// Kenyan Context Seed Data — Users
// Research-based: Authentic Kenyan first names and surnames by ethnicity

type UserRole = 'ADMINISTRATOR' | 'MANAGER' | 'TEAM_MEMBER';

export interface SeedUser {
  email: string;
  firstName: string;
  lastName: string;
  password: string; // plain text, will be hashed during seed
  role: UserRole;
  organizationSlug: string;
  jobTitle: string;
  department: string;
  timezone: string;
}

// Kenyan names by ethnic background
const kenyanNames: Array<{ first: string; last: string }> = [
  // Kikuyu
  { first: 'James', last: 'Kariuki' },
  { first: 'Grace', last: 'Wanjiku' },
  { first: 'Peter', last: 'Kamau' },
  { first: 'Mary', last: 'Nyambura' },
  { first: 'John', last: 'Mwangi' },
  // Luo
  { first: 'Kevin', last: 'Otieno' },
  { first: 'Faith', last: 'Akinyi' },
  { first: 'David', last: 'Ochieng' },
  { first: 'Sarah', last: 'Adhiambo' },
  { first: 'Michael', last: 'Omondi' },
  // Luhya
  { first: 'Esther', last: 'Wekesa' },
  { first: 'Samuel', last: 'Wanyonyi' },
  { first: 'Alice', last: 'Nekesa' },
  { first: 'Patrick', last: 'Wanjala' },
  { first: 'Diana', last: 'Naliaka' },
  // Kalenjin
  { first: 'William', last: 'Kiprop' },
  { first: 'Nancy', last: 'Chebet' },
  { first: 'Daniel', last: 'Kiprono' },
  { first: 'Ruth', last: 'Jepkosgei' },
  { first: 'Thomas', last: 'Kipruto' },
  // Kamba
  { first: 'Charles', last: 'Mutua' },
  { first: 'Elizabeth', last: 'Mwikali' },
  { first: 'Joseph', last: 'Ndambuki' },
  { first: 'Margaret', last: 'Ndanu' },
  { first: 'Benjamin', last: 'Mutiso' },
  // Coast/Mijikenda
  { first: 'Hassan', last: 'Mwarabu' },
  { first: 'Amina', last: 'Mohamed' },
  { first: 'Ali', last: 'Abdallah' },
  { first: 'Fatuma', last: 'Salim' },
  { first: 'Omar', last: 'Mwikali' },
];

const jobTitles = [
  'Project Manager',
  'Senior Software Engineer',
  'Business Analyst',
  'Scrum Master',
  'Product Owner',
  'Solutions Architect',
  'Quality Assurance Engineer',
  'DevOps Engineer',
  'UI/UX Designer',
  'Data Analyst',
  'Technical Lead',
  'Infrastructure Engineer',
  'Security Analyst',
  'Database Administrator',
  'Systems Administrator',
];

const departments = [
  'Engineering',
  'Product',
  'Operations',
  'Information Technology',
  'Digital Transformation',
  'Project Management Office',
  'Research & Development',
  'Infrastructure',
  'Cybersecurity',
  'Innovation Lab',
];

function getUsersForOrganization(
  orgIndex: number,
  orgSlug: string,
  startNameIndex: number,
): SeedUser[] {
  const admin = kenyanNames[startNameIndex % kenyanNames.length]!;
  const manager = kenyanNames[(startNameIndex + 1) % kenyanNames.length]!;
  const teamMembers = [
    kenyanNames[(startNameIndex + 2) % kenyanNames.length]!,
    kenyanNames[(startNameIndex + 3) % kenyanNames.length]!,
    kenyanNames[(startNameIndex + 4) % kenyanNames.length]!,
  ];

  return [
    {
      email: `${admin.first.toLowerCase()}.${admin.last.toLowerCase()}@${orgSlug}.com`,
      firstName: admin.first,
      lastName: admin.last,
      password: 'Password123',
      role: 'ADMINISTRATOR',
      organizationSlug: orgSlug,
      jobTitle: 'Chief Technology Officer',
      department: 'Executive',
      timezone: 'Africa/Nairobi',
    },
    {
      email: `${manager.first.toLowerCase()}.${manager.last.toLowerCase()}@${orgSlug}.com`,
      firstName: manager.first,
      lastName: manager.last,
      password: 'Password123',
      role: 'MANAGER',
      organizationSlug: orgSlug,
      jobTitle: 'Senior Project Manager',
      department: 'Project Management Office',
      timezone: 'Africa/Nairobi',
    },
    ...teamMembers.map((name, i) => ({
      email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@${orgSlug}.com`,
      firstName: name.first,
      lastName: name.last,
      password: 'Password123',
      role: 'TEAM_MEMBER' as UserRole,
      organizationSlug: orgSlug,
      jobTitle: jobTitles[(orgIndex * 3 + i) % jobTitles.length]!,
      department: departments[(orgIndex * 3 + i) % departments.length]!,
      timezone: 'Africa/Nairobi',
    })),
  ];
}

export const users: SeedUser[] = [
  ...getUsersForOrganization(0, 'safaricom-plc', 0),
  ...getUsersForOrganization(1, 'equity-bank-kenya', 5),
  ...getUsersForOrganization(2, 'kcb-group', 10),
  ...getUsersForOrganization(3, 'kengen', 15),
  ...getUsersForOrganization(4, 'ministry-of-ict', 20),
];
