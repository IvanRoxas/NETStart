export interface ShopCatalogItem {
  id: string;
  title: string;
  type: string;
  category: string;
  subCategory: string;
  price: number;
  imageUrl: string;
  tag: string;
  description: string;
}

export const SHOP_CATALOG: ShopCatalogItem[] = [
  // ==========================================
  // BACKGROUNDS (15 Items)
  // ==========================================
  {
    id: 'bg-xenon-plains',
    title: 'Alien Crystal World',
    type: 'BACKGROUND',
    category: 'PROFILE',
    subCategory: 'Background',
    price: 250,
    imageUrl: '/assets/global/shop/backgrounds/Alien Landspace Background.jpg',
    tag: 'Background',
    description: 'A glowing exoplanet with shiny crystals under two bright suns!'
  },
  {
    id: 'bg-celestial-horizon',
    title: 'Glowing Planet Horizon',
    type: 'BACKGROUND',
    category: 'PROFILE',
    subCategory: 'Background',
    price: 300,
    imageUrl: '/assets/global/shop/backgrounds/Alien Planet Background.jpg',
    tag: 'Background',
    description: 'A beautiful planet with shiny rings glowing in outer space.'
  },
  {
    id: 'bg-hyperion-rift',
    title: 'Hyperion Cosmic Cloud',
    type: 'BACKGROUND',
    category: 'PROFILE',
    subCategory: 'Background',
    price: 350,
    imageUrl: '/assets/global/shop/backgrounds/Alien Space Background.jpg',
    tag: 'Background',
    description: 'A colorful cloud of space dust where new stars are born.'
  },
  {
    id: 'bg-mothership-docks',
    title: 'Spaceship Hangar',
    type: 'BACKGROUND',
    category: 'PROFILE',
    subCategory: 'Background',
    price: 400,
    imageUrl: '/assets/global/shop/backgrounds/Alien Spaceship Background.jpg',
    tag: 'Background',
    description: 'The giant docking bay inside a friendly alien flagship.'
  },
  {
    id: 'bg-neo-solaris',
    title: 'Neo Solaris City',
    type: 'BACKGROUND',
    category: 'PROFILE',
    subCategory: 'Background',
    price: 300,
    imageUrl: '/assets/global/shop/backgrounds/City Background.jpg',
    tag: 'Background',
    description: 'A futuristic city protected by energy shields and flying cars.'
  },
  {
    id: 'bg-andromeda-spiral',
    title: 'Spiral Galaxy',
    type: 'BACKGROUND',
    category: 'PROFILE',
    subCategory: 'Background',
    price: 320,
    imageUrl: '/assets/global/shop/backgrounds/Galaxy Background.jpg',
    tag: 'Background',
    description: 'A giant spinning galaxy filled with billions of shining stars!'
  },
  {
    id: 'bg-abyssal-expanse',
    title: 'Quiet Deep Space',
    type: 'BACKGROUND',
    category: 'PROFILE',
    subCategory: 'Background',
    price: 200,
    imageUrl: '/assets/global/shop/backgrounds/Isolated Space Background.jpg',
    tag: 'Background',
    description: 'A calm, peaceful view of twinkling stars in deep space.'
  },
  {
    id: 'bg-mars-colony-ridge',
    title: 'Mars Sunset Vista',
    type: 'BACKGROUND',
    category: 'PROFILE',
    subCategory: 'Background',
    price: 350,
    imageUrl: '/assets/global/shop/backgrounds/Mars Background.jpg',
    tag: 'Background',
    description: 'The red hills of Mars under a peaceful starry blue sunset.'
  },
  {
    id: 'bg-meteor-cascade',
    title: 'Shooting Star Storm',
    type: 'BACKGROUND',
    category: 'PROFILE',
    subCategory: 'Background',
    price: 280,
    imageUrl: '/assets/global/shop/backgrounds/Meteor Background.jpg',
    tag: 'Background',
    description: 'A fast shower of bright shooting meteors flying past!'
  },
  {
    id: 'bg-violet-nebula',
    title: 'Purple Cosmic Glow',
    type: 'BACKGROUND',
    category: 'PROFILE',
    subCategory: 'Background',
    price: 320,
    imageUrl: '/assets/global/shop/backgrounds/Purple Galaxy Background.jpg',
    tag: 'Background',
    description: 'A bright purple space cloud that lights up the dark sky.'
  },
  {
    id: 'bg-astrolink-relay',
    title: 'AstroLink Satellite Relay',
    type: 'BACKGROUND',
    category: 'PROFILE',
    subCategory: 'Background',
    price: 260,
    imageUrl: '/assets/global/shop/backgrounds/Satellites Background.jpg',
    tag: 'Background',
    description: 'Friendly space satellites sending messages between planets!'
  },
  {
    id: 'bg-retro-orbit',
    title: 'Retro Arcade Space',
    type: 'BACKGROUND',
    category: 'PROFILE',
    subCategory: 'Background',
    price: 220,
    imageUrl: '/assets/global/shop/backgrounds/Space Game Background.jpg',
    tag: 'Background',
    description: 'A fun retro pixel-style world used in cadet training games.'
  },
  {
    id: 'bg-orbital-waypoint',
    title: 'Space Station Zenith',
    type: 'BACKGROUND',
    category: 'PROFILE',
    subCategory: 'Background',
    price: 380,
    imageUrl: '/assets/global/shop/backgrounds/Space Platform Background.jpg',
    tag: 'Background',
    description: 'An observation deck where rocket ships refuel and rest.'
  },
  {
    id: 'bg-star-cruiser-bridge',
    title: 'Spaceship Command Deck',
    type: 'BACKGROUND',
    category: 'PROFILE',
    subCategory: 'Background',
    price: 420,
    imageUrl: '/assets/global/shop/backgrounds/Spaceship Background.jpg',
    tag: 'Background',
    description: 'The main cockpit of a big cruiser heading to outer planets.'
  },
  {
    id: 'bg-warp-corridor',
    title: 'Hyperspace Tunnel',
    type: 'BACKGROUND',
    category: 'PROFILE',
    subCategory: 'Background',
    price: 450,
    imageUrl: '/assets/global/shop/backgrounds/Travel Wallpaper.jpg',
    tag: 'Background',
    description: 'Zooming super fast across galaxies through warp speed!'
  },

  // ==========================================
  // PROFILE AVATARS / ICONS (25 Items)
  // ==========================================
  {
    id: 'icon-astronaut-red',
    title: 'Astro Cadet Red',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 150,
    imageUrl: '/assets/global/shop/avatars/Astronaut Portrait_3.png',
    tag: 'Profile Icon',
    description: 'Standard issue rookie spacesuit with red mission accents.'
  },
  {
    id: 'icon-astronaut-blue',
    title: 'Astro Specialist Blue',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 180,
    imageUrl: '/assets/global/shop/avatars/Astronaut Portrait_5.png',
    tag: 'Profile Icon',
    description: 'High-tech pressurized helmet suited for deep spacewalk operations.'
  },
  {
    id: 'icon-astronaut-gold',
    title: 'Commander Gold Helmet',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 220,
    imageUrl: '/assets/global/shop/avatars/Astronaut Portrait_14.png',
    tag: 'Profile Icon',
    description: 'Solar-shielded visor engineered for high-radiation orbits.'
  },
  {
    id: 'icon-astronaut-veteran',
    title: 'Deep Space Veteran',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 250,
    imageUrl: '/assets/global/shop/avatars/Astronaut Portrait_15.png',
    tag: 'Profile Icon',
    description: 'A seasoned explorer who has voyaged to the outer boundaries of the solar system.'
  },
  {
    id: 'icon-fox-explorer',
    title: 'Fox Navigator',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 180,
    imageUrl: '/assets/global/shop/avatars/Animal Portrait_6.png',
    tag: 'Profile Icon',
    description: 'A quick-witted fox scout ready for planetary expeditions.'
  },
  {
    id: 'icon-wolf-scout',
    title: 'Wolf Ranger',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 180,
    imageUrl: '/assets/global/shop/avatars/Anthropomorphic_9.png',
    tag: 'Profile Icon',
    description: 'A brave canine ranger scanning uncharted asteroid belts.'
  },
  {
    id: 'icon-cyber-panda',
    title: 'Cyber Panda',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 200,
    imageUrl: '/assets/global/shop/avatars/Panda Portrait_7.png',
    tag: 'Profile Icon',
    description: 'Chill space panda with high-speed neural optic implants.'
  },
  {
    id: 'icon-cryo-penguin',
    title: 'Cryo Penguin',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 200,
    imageUrl: '/assets/global/shop/avatars/Penguin Portrait_3.png',
    tag: 'Profile Icon',
    description: 'Sub-zero survivor thriving in the icy oceans of Europa.'
  },
  {
    id: 'icon-pixel-green',
    title: 'Pixel Cadet Emerald',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 140,
    imageUrl: '/assets/global/shop/avatars/gameboy portrait_3.png',
    tag: 'Profile Icon',
    description: 'Classic 8-bit monochromatic handheld astronaut avatar.'
  },
  {
    id: 'icon-pixel-amber',
    title: 'Pixel Cadet Amber',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 140,
    imageUrl: '/assets/global/shop/avatars/gameboy portrait_6.png',
    tag: 'Profile Icon',
    description: 'Retro pixel display from the earliest planetary mission consoles.'
  },
  {
    id: 'icon-cadet-hope',
    title: 'Cadet Hope',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 150,
    imageUrl: '/assets/global/shop/avatars/Little Girl Portrait_2.png',
    tag: 'Profile Icon',
    description: 'Next-generation space cadet eager to program her first rover.'
  },
  {
    id: 'icon-forge-engineer',
    title: 'Forge Engineer',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 220,
    imageUrl: '/assets/global/shop/avatars/Blacksmith Portrait_2.png',
    tag: 'Profile Icon',
    description: 'Master mechanic keeping warp engines running at peak output.'
  },
  {
    id: 'icon-starlight-pioneer',
    title: 'Starlight Pioneer',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 200,
    imageUrl: '/assets/global/shop/avatars/Blond Villager Women_4.png',
    tag: 'Profile Icon',
    description: 'Colony botanist nurturing life on distant lunar outposts.'
  },
  {
    id: 'icon-rover-driver',
    title: 'Colony Rover Pilot',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 180,
    imageUrl: '/assets/global/shop/avatars/Peasant portrait_3.png',
    tag: 'Profile Icon',
    description: 'Hardworking pilot hauling heavy ore across martian canyons.'
  },
  {
    id: 'icon-orbital-chef',
    title: 'Orbital Chef',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 180,
    imageUrl: '/assets/global/shop/avatars/Women Baker Portrait5.png',
    tag: 'Profile Icon',
    description: 'Culinary expert preparing nutritious rations for long voyages.'
  },
  {
    id: 'icon-hydroponics-specialist',
    title: 'Hydroponics Specialist',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 190,
    imageUrl: '/assets/global/shop/avatars/Women Peasant_1.png',
    tag: 'Profile Icon',
    description: 'Cultivating sustainable crops inside pressurized orbital biodomes.'
  },
  {
    id: 'icon-syndicate-boss',
    title: 'Belt Syndicate Broker',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 240,
    imageUrl: '/assets/global/shop/avatars/Man Mafia_13.png',
    tag: 'Profile Icon',
    description: 'Smooth-talking merchant brokering deals at the asteroid belt.'
  },
  {
    id: 'icon-starlight-archer',
    title: 'Starlight Sentinel',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 240,
    imageUrl: '/assets/global/shop/avatars/Elf_4.png',
    tag: 'Profile Icon',
    description: 'Celestial marksman with supernatural orbital precision.'
  },
  {
    id: 'icon-arcane-astromancer',
    title: 'Arcane Astromancer',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 260,
    imageUrl: '/assets/global/shop/avatars/Elf_6.png',
    tag: 'Profile Icon',
    description: 'Harnessing the cosmic energy of twin solar flares.'
  },
  {
    id: 'icon-solar-druid',
    title: 'Solar Druid',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 230,
    imageUrl: '/assets/global/shop/avatars/Elf_10.png',
    tag: 'Profile Icon',
    description: 'Attuned to extraterrestrial flora and glowing crystal blooms.'
  },
  {
    id: 'icon-lunar-sentinel',
    title: 'Lunar Elf Guardian',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 250,
    imageUrl: '/assets/global/shop/avatars/Elf_14.png',
    tag: 'Profile Icon',
    description: 'Guardian of the moon temples and ancient star gates.'
  },
  {
    id: 'icon-nebula-sage',
    title: 'Nebula Sage',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 260,
    imageUrl: '/assets/global/shop/avatars/Elf_20.png',
    tag: 'Profile Icon',
    description: 'Keeper of stellar knowledge and constellation maps.'
  },
  {
    id: 'icon-cosmic-sorcerer',
    title: 'Cosmic Sorcerer Purple',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 270,
    imageUrl: '/assets/global/shop/avatars/Magic Heroes by Captainskeleto 1_9.png',
    tag: 'Profile Icon',
    description: 'Channelling dark matter and warp energy into impenetrable shields.'
  },
  {
    id: 'icon-star-knight',
    title: 'Star Knight Emerald',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 270,
    imageUrl: '/assets/global/shop/avatars/Magic Heroes by Captainskeleto 1_12.png',
    tag: 'Profile Icon',
    description: 'Armored vanguard defending planetary outposts.'
  },
  {
    id: 'icon-solar-paladin',
    title: 'Solar Paladin Gold',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 300,
    imageUrl: '/assets/global/shop/avatars/Magic Heroes by Captainskeleto 3_2.png',
    tag: 'Profile Icon',
    description: 'Warrior clad in polished meteor-forged gold armor.'
  }
];

export function getCatalogItemById(id: string): ShopCatalogItem | undefined {
  return SHOP_CATALOG.find(item => item.id === id);
}
