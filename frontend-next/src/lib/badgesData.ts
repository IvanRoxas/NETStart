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
    planet: "/assets/planets/celestial/Mercury.svg",
    totalAchievements: 3,
    earnedAchievements: 3,
    playtime: "2 hrs",
    lastPlayed: "2 days ago",
    badges: [
      { id: 'b1', name: 'First Variable', icon: 'M', description: 'Learn how to store data using your first variable.' },
      { id: 'b2', name: 'Data Types', icon: 'M', description: 'Learn the difference between numbers, text, and other values.' },
      { id: 'b3', name: 'Boolean Logic', icon: 'M', description: 'Solve puzzles using true and false conditions.' },
    ]
  },
  {
    id: 2,
    title: "Venus",
    planet: "/assets/planets/celestial/Venus.svg",
    totalAchievements: 3,
    earnedAchievements: 2,
    playtime: "4 hrs",
    lastPlayed: "Yesterday",
    badges: [
      { id: 'b11', name: 'For Loops', icon: 'V', description: 'Repeat actions a set number of times using a for loop.' },
      { id: 'b12', name: 'While Loops', icon: 'V', description: 'Keep running code while a condition is true.' },
      { id: 'b13', name: 'Loop Master', icon: '∞', description: 'Control your loops so they start and stop correctly.' },
    ]
  },
  {
    id: 3,
    title: "Mars",
    planet: "/assets/planets/celestial/Mars.svg",
    totalAchievements: 3,
    earnedAchievements: 0,
    playtime: "0 hrs",
    lastPlayed: "Never",
    badges: [
      { id: 'b21', name: 'HTML Explorer', icon: 'M', description: 'Write your first HTML tags to build web elements.' },
      { id: 'b22', name: 'Tag Master', icon: 'M', description: 'Add headings, text, and buttons using HTML tags.' },
      { id: 'b23', name: 'Page Builder', icon: 'M', description: 'Organize different parts of a webpage cleanly.' },
    ]
  },
  {
    id: 4,
    title: "Jupiter",
    planet: "/assets/planets/celestial/Jupiter.svg",
    totalAchievements: 3,
    earnedAchievements: 0,
    playtime: "0 hrs",
    lastPlayed: "Never",
    badges: [
      { id: 'b31', name: 'Java Basics', icon: 'J', description: 'Write your first lines of code in Java.' },
      { id: 'b32', name: 'Class Creator', icon: 'J', description: 'Create a class blueprint to build objects.' },
      { id: 'b33', name: 'Inheritance', icon: 'J', description: 'Share traits and code between classes.' },
    ]
  },
  {
    id: 5,
    title: "Saturn",
    planet: "/assets/planets/celestial/Saturn.svg",
    totalAchievements: 3,
    earnedAchievements: 0,
    playtime: "0 hrs",
    lastPlayed: "Never",
    badges: [
      { id: 'b41', name: 'C++ Basics', icon: 'S', description: 'Get started writing fast code with C++.' },
      { id: 'b42', name: 'Pointers', icon: 'S', description: 'Learn how memory addresses and pointers work.' },
      { id: 'b43', name: 'Memory Manager', icon: 'S', description: 'Keep your computer memory clean and organized.' },
    ]
  },
  {
    id: 6,
    title: "Earth",
    planet: "/assets/planets/celestial/Earth.svg",
    totalAchievements: 3,
    earnedAchievements: 0,
    playtime: "0 hrs",
    lastPlayed: "Never",
    badges: [
      { id: 'b19', name: 'Python Basics', icon: 'E', description: 'Start coding with the easy-to-read Python language.' },
      { id: 'b20', name: 'Script Runner', icon: 'E', description: 'Run your Python script to see the results.' },
      { id: 'b26', name: 'Functions', icon: 'E', description: 'Write reusable blocks of code with functions.' },
    ]
  }
];

export const specialBadges: Badge[] = [
  { id: 'b_create_account', name: 'Ready for Blast Off!', image: '/assets/global/badges/milestones/CreateAccount.svg', description: 'Create your NETStart account to begin your journey.', xpReward: 0 },
  { id: 'b_verify_account', name: 'Verified Explorer', image: '/assets/global/badges/milestones/AccountVerified.svg', description: 'Verify your email address to confirm your account.', xpReward: 0 },
  { id: 'b_change_pfp', name: 'A New Look', image: '/assets/global/badges/milestones/ChangeProfileIcon.svg', description: 'Change your profile picture to customize your astronaut.', xpReward: 0 },
  { id: 'b_aptitude_test', name: 'Aptitude Tested', image: '/assets/global/badges/milestones/Aptitude Test.svg', description: 'Complete the aptitude test to discover your skills.', xpReward: 0 },
  { id: 'b_first_mission', name: 'First Mission', image: '/assets/global/badges/milestones/FirstMission.svg', description: 'Complete your very first coding mission.', xpReward: 0 },
  { id: 'b_buy_reward', name: 'First Purchase', image: '/assets/global/badges/milestones/FirstPurchase.svg', description: 'Buy your first item from the rewards shop.', xpReward: 0 },
  { id: 'b_change_bg', name: 'Interior Designer', image: '/assets/global/badges/milestones/ChangeBackground.svg', description: 'Customize your profile with a new background.', xpReward: 0 },
  { id: 'b_reach_lvl5', name: 'Level 5 Reached', image: '/assets/global/badges/milestones/Level 5.svg', description: 'Earn enough experience to reach Level 5.', xpReward: 0 },
  { id: 'b_reach_lvl10', name: 'Level 10 Reached', image: '/assets/global/badges/milestones/Level 10.svg', description: 'Earn enough experience to reach Level 10.', xpReward: 0 }
];

export const planetaryBadges: Badge[] = [
  { id: 'b_complete_moon', name: 'Moon Pioneer', image: '/assets/global/badges/planets/CompleteMoon.svg', description: 'Complete all missions on The Moon.', xpReward: 0 },
  { id: 'b_complete_mercury', name: 'Mercury Logician', image: '/assets/global/badges/planets/CompleteMercury.svg', description: 'Complete all missions on Mercury.', xpReward: 0 },
  { id: 'b_complete_venus', name: 'Venus Navigator', image: '/assets/global/badges/planets/CompleteVenus.svg', description: 'Complete all missions on Venus.', xpReward: 0 },
  { id: 'b_complete_mars', name: 'Mars Conqueror', image: '/assets/global/badges/planets/CompleteMars.svg', description: 'Complete all missions on Mars.', xpReward: 0 },
  { id: 'b_complete_jupiter', name: 'Jupiter Architect', image: '/assets/global/badges/planets/CompleteJupiter.svg', description: 'Complete all missions on Jupiter.', xpReward: 0 },
  { id: 'b_complete_saturn', name: 'Saturn Engineer', image: '/assets/global/badges/planets/CompleteSaturn.svg', description: 'Complete all missions on Saturn.', xpReward: 0 },
  { id: 'b_complete_earth', name: 'Earth Master', image: '/assets/global/badges/planets/CompleteEarth.svg', description: 'Complete all missions on Earth.', xpReward: 0 },
  { id: 'b_complete_all_planets', name: 'Grand Celestial Master', image: '/assets/global/badges/planets/CompleteAllPlanets.svg', description: 'Complete all planets in the solar system constellation.', xpReward: 0 }
];

export const allBadges: Badge[] = [...modulesData.flatMap(module => module.badges), ...specialBadges, ...planetaryBadges];


