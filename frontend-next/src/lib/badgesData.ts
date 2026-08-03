export interface Badge {
  id: string;
  name: string;
  icon?: string;
  image?: string;
  description?: string;
  xpReward?: number;
}

export interface ModuleData {
  id: number;
  title: string;
  planet: string;
  totalAchievements: number;
  earnedAchievements: number;
  playtime: string;
  lastPlayed: string;
  badges: Badge[];
}

export const modulesData: ModuleData[] = [
  {
    id: 1,
    title: "Mercury",
    planet: "/Planet 1.svg",
    totalAchievements: 10,
    earnedAchievements: 10,
    playtime: "2 hrs",
    lastPlayed: "2 days ago",
    badges: [
      { id: 'b1', name: 'First Variable', icon: 'M' },
      { id: 'b2', name: 'Type Master', icon: 'M' },
      { id: 'b3', name: 'String Theory', icon: 'M' },
      { id: 'b4', name: 'Number Cruncher', icon: 'M' },
      { id: 'b5', name: 'Boolean Logic', icon: 'M' },
      { id: 'b6', name: 'Array of Hope', icon: 'M' },
      { id: 'b7', name: 'Object Oriented', icon: 'M' },
      { id: 'b8', name: 'Null Void', icon: '!' },
      { id: 'b9', name: 'Undefined Space', icon: '?' },
      { id: 'b10', name: 'Completionist', icon: '★' },
    ]
  },
  {
    id: 2,
    title: "Venus",
    planet: "/Planet 3.svg",
    totalAchievements: 15,
    earnedAchievements: 8,
    playtime: "4 hrs",
    lastPlayed: "Yesterday",
    badges: [
      { id: 'b11', name: 'For Loop Pioneer', icon: 'V' },
      { id: 'b12', name: 'While Loop Wizard', icon: 'V' },
      { id: 'b13', name: 'Infinite Loop Survivor', icon: '∞' },
      { id: 'b14', name: 'Do While Master', icon: 'V' },
      { id: 'b15', name: 'Break and Continue', icon: 'V' },
      { id: 'b16', name: 'Nested Loops', icon: 'V' },
      { id: 'b17', name: 'Array Iteration', icon: 'V' },
      { id: 'b18', name: 'Object Iteration', icon: 'V' },
    ]
  },
  {
    id: 3,
    title: "Earth",
    planet: "/Planet 2.svg",
    totalAchievements: 12,
    earnedAchievements: 2,
    playtime: "1 hr",
    lastPlayed: "Today",
    badges: [
      { id: 'b19', name: 'If Statement', icon: 'E' },
      { id: 'b20', name: 'Else Statement', icon: 'E' },
    ]
  },
  {
    id: 4,
    title: "Mars",
    planet: "/Planet 4.svg",
    totalAchievements: 20,
    earnedAchievements: 0,
    playtime: "0 hrs",
    lastPlayed: "Never",
    badges: []
  },
  {
    id: 5,
    title: "Jupiter",
    planet: "/Planet 5.svg",
    totalAchievements: 15,
    earnedAchievements: 0,
    playtime: "0 hrs",
    lastPlayed: "Never",
    badges: []
  },
  {
    id: 6,
    title: "Saturn",
    planet: "/Planet 6.svg",
    totalAchievements: 10,
    earnedAchievements: 0,
    playtime: "0 hrs",
    lastPlayed: "Never",
    badges: []
  },
  {
    id: 7,
    title: "Uranus",
    planet: "/Planet 7.svg",
    totalAchievements: 10,
    earnedAchievements: 0,
    playtime: "0 hrs",
    lastPlayed: "Never",
    badges: []
  },
  {
    id: 8,
    title: "Neptune",
    planet: "/Planet 8.svg",
    totalAchievements: 5,
    earnedAchievements: 0,
    playtime: "0 hrs",
    lastPlayed: "Never",
    badges: []
  }
];

export const specialBadges: Badge[] = [
  { id: 'b_create_account', name: 'Ready for Blast Off!', image: '/Planet 1.svg', description: 'Create an account' },
  { id: 'b_verify_account', name: 'Verified Explorer', image: '/Planet 2.svg', description: 'Verify your account' },
  { id: 'b_change_pfp', name: 'A New Look', image: '/Planet 3.svg', description: 'Change your profile picture' },
  { id: 'b_aptitude_test', name: 'Aptitude Tested', image: '/Planet 4.svg', description: 'Take the aptitude test' },
  { id: 'b_first_mission', name: 'First Mission', image: '/Planet 5.svg', description: 'Complete your first mission' },
  { id: 'b_first_planet', name: 'First Planet', image: '/Planet 6.svg', description: 'Complete your first planet' },
  { id: 'b_buy_reward', name: 'Shopaholic', image: '/Planet 7.svg', description: 'Buy something from the rewards shop' },
  { id: 'b_change_bg', name: 'Interior Designer', image: '/Planet 8.svg', description: 'Change your profile background' },
  { id: 'b_reach_lvl5', name: 'Level 5 Reached', image: '/Meteor.svg', description: 'Reach Level 5' },
  { id: 'b_reach_lvl10', name: 'Level 10 Reached', image: '/Spaceship.svg', description: 'Reach Level 10' }
];

export const allBadges: Badge[] = [...modulesData.flatMap(module => module.badges), ...specialBadges];

