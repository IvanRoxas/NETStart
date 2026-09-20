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
    planet: "/Planets/Mercury.svg",
    totalAchievements: 3,
    earnedAchievements: 3,
    playtime: "2 hrs",
    lastPlayed: "2 days ago",
    badges: [
      { id: 'b1', name: 'First Variable', icon: 'M' },
      { id: 'b2', name: 'Type Master', icon: 'M' },
      { id: 'b3', name: 'Boolean Logic', icon: 'M' },
    ]
  },
  {
    id: 2,
    title: "Venus",
    planet: "/Planets/Venus.svg",
    totalAchievements: 3,
    earnedAchievements: 2,
    playtime: "4 hrs",
    lastPlayed: "Yesterday",
    badges: [
      { id: 'b11', name: 'For Loop Pioneer', icon: 'V' },
      { id: 'b12', name: 'While Loop Wizard', icon: 'V' },
      { id: 'b13', name: 'Infinite Loop Survivor', icon: '∞' },
    ]
  },
  {
    id: 3,
    title: "Mars",
    planet: "/Planets/Mars.svg",
    totalAchievements: 3,
    earnedAchievements: 0,
    playtime: "0 hrs",
    lastPlayed: "Never",
    badges: [
      { id: 'b21', name: 'HTML Explorer', icon: 'M' },
      { id: 'b22', name: 'Tag Master', icon: 'M' },
      { id: 'b23', name: 'Semantic Structurer', icon: 'M' },
    ]
  },
  {
    id: 4,
    title: "Jupiter",
    planet: "/Planets/Jupiter.svg",
    totalAchievements: 3,
    earnedAchievements: 0,
    playtime: "0 hrs",
    lastPlayed: "Never",
    badges: [
      { id: 'b31', name: 'Java Initiate', icon: 'J' },
      { id: 'b32', name: 'Class Creator', icon: 'J' },
      { id: 'b33', name: 'Inheritance Sage', icon: 'J' },
    ]
  },
  {
    id: 5,
    title: "Saturn",
    planet: "/Planets/Saturn.svg",
    totalAchievements: 3,
    earnedAchievements: 0,
    playtime: "0 hrs",
    lastPlayed: "Never",
    badges: [
      { id: 'b41', name: 'C++ Pioneer', icon: 'S' },
      { id: 'b42', name: 'Pointer Master', icon: 'S' },
      { id: 'b43', name: 'Memory Manager', icon: 'S' },
    ]
  },
  {
    id: 6,
    title: "Earth",
    planet: "/Planets/Earth.svg",
    totalAchievements: 3,
    earnedAchievements: 0,
    playtime: "0 hrs",
    lastPlayed: "Never",
    badges: [
      { id: 'b19', name: 'Python Initiate', icon: 'E' },
      { id: 'b20', name: 'Script Runner', icon: 'E' },
      { id: 'b26', name: 'Function Crafter', icon: 'E' },
    ]
  }
];

export const specialBadges: Badge[] = [
  { id: 'b_create_account', name: 'Ready for Blast Off!', image: '/Planets/Mercury.svg', description: 'Create an account' },
  { id: 'b_verify_account', name: 'Verified Explorer', image: '/Planets/Venus.svg', description: 'Verify your account' },
  { id: 'b_change_pfp', name: 'A New Look', image: '/Planets/Mars.svg', description: 'Change your profile picture' },
  { id: 'b_aptitude_test', name: 'Aptitude Tested', image: '/Planets/Jupiter.svg', description: 'Take the aptitude test' },
  { id: 'b_first_mission', name: 'First Mission', image: '/Planets/Saturn.svg', description: 'Complete your first mission' },
  { id: 'b_first_planet', name: 'First Planet', image: '/Planets/Earth.svg', description: 'Complete your first planet' },
  { id: 'b_buy_reward', name: 'Shopaholic', image: '/Planet 7.svg', description: 'Buy something from the rewards shop' },
  { id: 'b_change_bg', name: 'Interior Designer', image: '/Planet 8.svg', description: 'Change your profile background' },
  { id: 'b_reach_lvl5', name: 'Level 5 Reached', image: '/Meteor.svg', description: 'Reach Level 5' },
  { id: 'b_reach_lvl10', name: 'Level 10 Reached', image: '/Spaceship.svg', description: 'Reach Level 10' }
];

export const allBadges: Badge[] = [...modulesData.flatMap(module => module.badges), ...specialBadges];


