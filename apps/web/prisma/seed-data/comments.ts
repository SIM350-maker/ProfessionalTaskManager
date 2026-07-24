// Kenyan Context Seed Data — Comments
// Authentic Kenyan English comments on tasks

export interface SeedComment {
  taskIndex: number;
  content: string;
  authorUserIndex: number; // index in the users array
  daysAgo: number; // how many days ago to post
}

export const comments: SeedComment[] = [
  {
    taskIndex: 0, // API Gateway migration
    content: 'Team, let us schedule a design review for end of week. I want the architecture doc ready by Wednesday so we can circulate it beforehand.',
    authorUserIndex: 0,
    daysAgo: 2,
  },
  {
    taskIndex: 0,
    content: 'The rate limiting strategy needs to account for M-Pesa peak hours (8-10am and 4-6pm). Let me share the traffic data from last quarter.',
    authorUserIndex: 2,
    daysAgo: 1,
  },
  {
    taskIndex: 3, // Database schema migration
    content: 'Migration plan is approved. Please ensure we have a rollback strategy for each phase. We cannot afford downtime on M-Pesa.',
    authorUserIndex: 1,
    daysAgo: 4,
  },
  {
    taskIndex: 7, // Site acquisition
    content: 'I have identified 15 potential sites in Industrial Area but the landlords are asking for premium rates. The budget per site is KES 80K/month but we are seeing offers of KES 120K. We need to negotiate or find alternatives.',
    authorUserIndex: 7,
    daysAgo: 3,
  },
  {
    taskIndex: 12, // Micro-loan credit scoring
    content: 'The new credit scoring model is showing 92% accuracy on the test set. However, we need to be careful about bias — the training data over-represents Nairobi customers.',
    authorUserIndex: 14,
    daysAgo: 5,
  },
  {
    taskIndex: 13, // Chama integration
    content: 'Chama feature is looking good. I have shared the prototype with 5 chama groups in Kiambu for feedback. They are asking for M-Pesa statement auto-import feature.',
    authorUserIndex: 12,
    daysAgo: 2,
  },
  {
    taskIndex: 16, // Agent recruitment — Turkana
    content: 'We held a successful baraza in Lodwar yesterday. The county commissioner has offered to help identify potential agents. Over 50 people expressed interest.',
    authorUserIndex: 18,
    daysAgo: 1,
  },
  {
    taskIndex: 19, // Legacy system inventory
    content: 'The legacy system is more complex than anticipated. We found 3 undocumented interfaces that are critical for ATM switching. Adding these to the migration scope.',
    authorUserIndex: 21,
    daysAgo: 4,
  },
  {
    taskIndex: 24, // Regulatory compliance — CBK
    content: 'CBK has issued new guidelines on open banking APIs effective July 2026. We need to ensure our integration is compliant. I will share the circular via email.',
    authorUserIndex: 20,
    daysAgo: 6,
  },
  {
    taskIndex: 28, // Community engagement — Nakuru
    content: 'The Naivasha community meeting went well. Main concerns are water access and local employment. We need to prepare a CSR proposal for the community before we proceed.',
    authorUserIndex: 24,
    daysAgo: 3,
  },
  {
    taskIndex: 38, // Integrated service portal
    content: 'The MVP demo with the Huduma team went well. They have requested we prioritize eCitizen integration — currently citizens have to enter the same data twice.',
    authorUserIndex: 22,
    daysAgo: 1,
  },
  {
    taskIndex: 39, // Queue management system
    content: 'Queue management is working well at Nairobi GPO. Average wait time reduced from 45 minutes to 12 minutes. Mombasa and Kisumu rollouts starting next week.',
    authorUserIndex: 23,
    daysAgo: 3,
  },
  {
    taskIndex: 44, // Digital skills curriculum
    content: 'The curriculum has been reviewed by the Kenya Institute of Curriculum Development (KICD). They recommended adding modules on AI and data science given the current market demand.',
    authorUserIndex: 24,
    daysAgo: 5,
  },
  {
    taskIndex: 46, // Trainer recruitment
    content: 'We have received 800 applications for the 200 trainer positions. Shortlisting is underway. Priority counties: Turkana, Mandera, Wajir, Garissa, and Marsabit.',
    authorUserIndex: 23,
    daysAgo: 2,
  },
  {
    taskIndex: 48, // Community Wi-Fi pilot
    content: 'Solar-powered Wi-Fi solution is being tested in Kitui county. The equipment is handling 50 concurrent users well. Cost per hub is approximately KES 250K.',
    authorUserIndex: 22,
    daysAgo: 4,
  },
  {
    taskIndex: 26, // Turbine procurement
    content: 'Shortlisted bidders are Mitsubishi, Siemens, and GE. Technical evaluation scores are due by end of month. I will coordinate the evaluation panel meeting for next Tuesday.',
    authorUserIndex: 16,
    daysAgo: 7,
  },
  {
    taskIndex: 41, // Equipment procurement DWDM
    content: 'DWDM equipment has been delivered and customs clearance completed at Mombasa port. Transport to Nairobi scheduled for next week.',
    authorUserIndex: 17,
    daysAgo: 8,
  },
  {
    taskIndex: 34, // Smart grid sensor pilot
    content: 'Pilot sensors are transmitting data successfully. We are seeing interesting load patterns in the industrial area — peak demand is actually 3-5pm, not the typical evening peak.',
    authorUserIndex: 19,
    daysAgo: 10,
  },
];
