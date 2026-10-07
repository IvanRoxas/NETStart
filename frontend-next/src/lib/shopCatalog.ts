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
  isDefaultOutfit?: boolean;
}

/**
 * Custom scale percentage for borders so intricate artwork
 * cleanly frames the avatar without any artwork intersection.
 */
export function getBorderScale(borderNameOrUrl?: string | null): string {
  if (!borderNameOrUrl) return '126%';
  const lower = borderNameOrUrl.toLowerCase();

  if (lower.includes('balcony') || lower.includes('austere')) return '144%';
  if (lower.includes('bee') || lower.includes('busy')) return '140%';
  if (lower.includes('flower') || lower.includes('blossom')) return '136%';
  if (lower.includes('cupcake')) return '134%';
  if (lower.includes('knitted') || lower.includes('love')) return '132%';
  if (lower.includes('garden')) return '132%';
  if (lower.includes('snow') || lower.includes('winter')) return '132%';
  if (lower.includes('ruby')) return '130%';
  if (lower.includes('golden') || lower.includes('ring') || lower.includes('halo')) return '128%';
  if (lower.includes('robot') || lower.includes('mecha')) return '130%';
  if (lower.includes('tech') || lower.includes('girl') || lower.includes('duo')) return '130%';
  if (lower.includes('mushroom')) return '128%';
  if (lower.includes('flame')) return '128%';
  if (lower.includes('paper')) return '126%';
  if (lower.includes('rope')) return '124%';

  return '126%';
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
    price: 150,
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
    price: 150,
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
    price: 150,
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
    price: 150,
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
    price: 150,
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
    price: 150,
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
    price: 150,
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
    price: 150,
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
    price: 150,
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
    price: 150,
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
    price: 150,
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
    price: 150,
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
    price: 150,
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
    price: 150,
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
    price: 150,
    imageUrl: '/assets/global/shop/backgrounds/Travel Wallpaper.jpg',
    tag: 'Background',
    description: 'Zooming super fast across galaxies through warp speed!'
  },

  // ==========================================
  // PROFILE AVATARS / ICONS (25 Items)
  // ==========================================
  {
    id: 'icon-astronaut-red',
    title: 'Red Space Cadet',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Astronaut Portrait_3.png',
    tag: 'Profile Icon',
    description: 'A bright red space helmet ready for rocket launches and space walks.'
  },
  {
    id: 'icon-astronaut-blue',
    title: 'Blue Spacewalker',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Astronaut Portrait_5.png',
    tag: 'Profile Icon',
    description: 'A cool blue astronaut suit made for floating around space stations.'
  },
  {
    id: 'icon-astronaut-gold',
    title: 'Golden Sun Visor',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Astronaut Portrait_14.png',
    tag: 'Profile Icon',
    description: 'A shiny golden helmet that shields your eyes from bright solar flares.'
  },
  {
    id: 'icon-astronaut-veteran',
    title: 'Deep Space Captain',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Astronaut Portrait_15.png',
    tag: 'Profile Icon',
    description: 'A trusted space explorer who has traveled all across the solar system.'
  },
  {
    id: 'icon-fox-explorer',
    title: 'Clever Squirrel',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Animal Portrait_6.png',
    tag: 'Profile Icon',
    description: 'A curious and speedy little squirrel looking for hidden space treasures.'
  },
  {
    id: 'icon-wolf-scout',
    title: 'Brave Cat Scout',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Anthropomorphic_9.png',
    tag: 'Profile Icon',
    description: 'A nimble feline scout who loves exploring rocky moon trails.'
  },
  {
    id: 'icon-cyber-panda',
    title: 'Chill Space Panda',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Panda Portrait_7.png',
    tag: 'Profile Icon',
    description: 'A calm and friendly panda wearing futuristic goggles.'
  },
  {
    id: 'icon-cryo-penguin',
    title: 'Snowy Penguin',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Penguin Portrait_3.png',
    tag: 'Profile Icon',
    description: 'A cheerful penguin bundled up and ready to slide on icy planets.'
  },
  {
    id: 'icon-pixel-green',
    title: 'Retro Green Pixel',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/gameboy portrait_3.png',
    tag: 'Profile Icon',
    description: 'A classic green pixel astronaut straight out of a handheld video game.'
  },
  {
    id: 'icon-pixel-amber',
    title: 'Retro Amber Pixel',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/gameboy portrait_6.png',
    tag: 'Profile Icon',
    description: 'A warm amber pixel astronaut glowing like an old computer screen.'
  },
  {
    id: 'icon-cadet-hope',
    title: 'Little Star Explorer',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Little Girl Portrait_2.png',
    tag: 'Profile Icon',
    description: 'A smiling young space cadet excited to learn how to code.'
  },
  {
    id: 'icon-forge-engineer',
    title: 'Master Builder',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Blacksmith Portrait_2.png',
    tag: 'Profile Icon',
    description: 'A strong workshop mechanic who loves building engines and fixing tools.'
  },
  {
    id: 'icon-starlight-pioneer',
    title: 'Sunny Explorer',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Blond Villager Women_4.png',
    tag: 'Profile Icon',
    description: 'A cheerful space colonist who greets every new visitor with a big smile.'
  },
  {
    id: 'icon-rover-driver',
    title: 'Moon Rover Driver',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Peasant portrait_3.png',
    tag: 'Profile Icon',
    description: 'A helpful pilot who drives rovers across bumpy craters.'
  },
  {
    id: 'icon-orbital-chef',
    title: 'Star Baker',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Women Baker Portrait5.png',
    tag: 'Profile Icon',
    description: 'Bakes the yummiest space cookies and treats for hungry astronauts.'
  },
  {
    id: 'icon-hydroponics-specialist',
    title: 'Plant Caretaker',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Women Peasant_1.png',
    tag: 'Profile Icon',
    description: 'Loves growing fresh vegetables and colorful flowers in orbital greenhouses.'
  },
  {
    id: 'icon-syndicate-boss',
    title: 'Mystery Detective',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Man Mafia_13.png',
    tag: 'Profile Icon',
    description: 'A slick investigator in a hat who solves secrets across spaceports.'
  },
  {
    id: 'icon-starlight-archer',
    title: 'Forest Archer',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Elf_4.png',
    tag: 'Profile Icon',
    description: 'A swift elf with sharp eyes who never misses a target.'
  },
  {
    id: 'icon-arcane-astromancer',
    title: 'Starlight Mage',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Elf_6.png',
    tag: 'Profile Icon',
    description: 'A magical elf who reads star maps and casts glowing light spells.'
  },
  {
    id: 'icon-solar-druid',
    title: 'Nature Elf',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Elf_10.png',
    tag: 'Profile Icon',
    description: 'A gentle friend to alien creatures and glowing space plants.'
  },
  {
    id: 'icon-lunar-sentinel',
    title: 'Moon Guardian',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Elf_14.png',
    tag: 'Profile Icon',
    description: 'A brave silver-haired protector watching over quiet starry skies.'
  },
  {
    id: 'icon-nebula-sage',
    title: 'Wise Star Sage',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Elf_20.png',
    tag: 'Profile Icon',
    description: 'A calm and thoughtful guide who knows all about distant galaxies.'
  },
  {
    id: 'icon-cosmic-sorcerer',
    title: 'Purple Wizard',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Magic Heroes by Captainskeleto 1_9.png',
    tag: 'Profile Icon',
    description: 'A mysterious wizard dressed in purple with sparkling magic energy.'
  },
  {
    id: 'icon-star-knight',
    title: 'Emerald Knight',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Magic Heroes by Captainskeleto 1_12.png',
    tag: 'Profile Icon',
    description: 'A valiant knight wearing shiny green armor to keep space stations safe.'
  },
  {
    id: 'icon-solar-paladin',
    title: 'Golden Knight',
    type: 'ICON',
    category: 'PROFILE',
    subCategory: 'Icons',
    price: 100,
    imageUrl: '/assets/global/shop/avatars/Magic Heroes by Captainskeleto 3_2.png',
    tag: 'Profile Icon',
    description: 'A heroic warrior clad in gleaming golden armor ready for any adventure.'
  },

  // ==========================================
  // PROFILE BORDERS (9 Items)
  // ==========================================
  {
    id: 'border-austere-balcony',
    title: 'Austere Balcony',
    type: 'BORDER',
    category: 'PROFILE',
    subCategory: 'Borders',
    price: 150,
    imageUrl: '/assets/global/shop/borders/Austere Balcony.svg',
    tag: 'Border',
    description: 'An elegant cosmic balcony overlooking the endless starry abyss.'
  },
  {
    id: 'border-cupcake',
    title: 'Sweet Cupcake',
    type: 'BORDER',
    category: 'PROFILE',
    subCategory: 'Borders',
    price: 150,
    imageUrl: '/assets/global/shop/borders/Cupcake.svg',
    tag: 'Border',
    description: 'A cheerful pastel border topped with delicious frosted cupcakes.'
  },
  {
    id: 'border-flame-on',
    title: 'Flame On!',
    type: 'BORDER',
    category: 'PROFILE',
    subCategory: 'Borders',
    price: 150,
    imageUrl: '/assets/global/shop/borders/Flame On!.svg',
    tag: 'Border',
    description: 'A blazing circular frame radiating with fiery energy.'
  },
  {
    id: 'border-flowers',
    title: 'Spring Blossoms',
    type: 'BORDER',
    category: 'PROFILE',
    subCategory: 'Borders',
    price: 150,
    imageUrl: '/assets/global/shop/borders/Spring Blossom.svg',
    tag: 'Border',
    description: 'A vibrant floral border blooming with cheerful botanical petals.'
  },
  {
    id: 'border-busy-bees',
    title: 'Busy Bees',
    type: 'BORDER',
    category: 'PROFILE',
    subCategory: 'Borders',
    price: 150,
    imageUrl: '/assets/global/shop/borders/Busy Bees.svg',
    tag: 'Border',
    description: 'A buzzing cosmic hive border surrounded by hardworking starry bees.'
  },
  {
    id: 'border-knitted-love',
    title: 'Knitted Hearts',
    type: 'BORDER',
    category: 'PROFILE',
    subCategory: 'Borders',
    price: 150,
    imageUrl: '/assets/global/shop/borders/Knitted Love.svg',
    tag: 'Border',
    description: 'A handcrafted pink yarn border stitched with sweet hearts.'
  },
  {
    id: 'border-mushrooms',
    title: 'Woodland Mushrooms',
    type: 'BORDER',
    category: 'PROFILE',
    subCategory: 'Borders',
    price: 150,
    imageUrl: '/assets/global/shop/borders/Mushrooms.svg',
    tag: 'Border',
    description: 'A whimsical forest border decorated with cozy red mushrooms.'
  },
  {
    id: 'border-paper-cuttings',
    title: 'Paper Cutout',
    type: 'BORDER',
    category: 'PROFILE',
    subCategory: 'Borders',
    price: 150,
    imageUrl: '/assets/global/shop/borders/Paper Cuttings.svg',
    tag: 'Border',
    description: 'An intricate craft border inspired by handcrafted paper art.'
  },
  {
    id: 'border-ropes',
    title: 'Nautical Rope',
    type: 'BORDER',
    category: 'PROFILE',
    subCategory: 'Borders',
    price: 150,
    imageUrl: '/assets/global/shop/borders/Ropes.svg',
    tag: 'Border',
    description: 'A sturdy twisted rope border made for rugged adventurers.'
  },
  {
    id: 'border-garden',
    title: 'Enchanted Garden',
    type: 'BORDER',
    category: 'PROFILE',
    subCategory: 'Borders',
    price: 150,
    imageUrl: '/assets/global/shop/borders/Garden.svg',
    tag: 'Border',
    description: 'A lush botanical border blooming with verdant vines, blossoms, and nature’s charm.'
  },
  {
    id: 'border-golden-ring',
    title: 'Golden Halo',
    type: 'BORDER',
    category: 'PROFILE',
    subCategory: 'Borders',
    price: 150,
    imageUrl: '/assets/global/shop/borders/Golden Ring.svg',
    tag: 'Border',
    description: 'A polished radiant golden ring border shimmering with pure stellar brilliance.'
  },
  {
    id: 'border-red-ruby',
    title: 'Crimson Ruby',
    type: 'BORDER',
    category: 'PROFILE',
    subCategory: 'Borders',
    price: 150,
    imageUrl: '/assets/global/shop/borders/Red Ruby.svg',
    tag: 'Border',
    description: 'A majestic frame embedded with precious glowing red rubies and royal gems.'
  },
  {
    id: 'border-snowy-winter',
    title: 'Snowy Frost',
    type: 'BORDER',
    category: 'PROFILE',
    subCategory: 'Borders',
    price: 150,
    imageUrl: '/assets/global/shop/borders/Snowy Winter.svg',
    tag: 'Border',
    description: 'A frosty crystal border glistening with falling snowflakes and winter magic.'
  },
  {
    id: 'border-tech-duo',
    title: 'Cyber Duo',
    type: 'BORDER',
    category: 'PROFILE',
    subCategory: 'Borders',
    price: 150,
    imageUrl: '/assets/global/shop/borders/Tech Girl and Boy.svg',
    tag: 'Border',
    description: 'A futuristic neon cyber border celebrating young coders and stellar tech explorers.'
  },
  {
    id: 'border-tech-robot',
    title: 'Mecha Automaton',
    type: 'BORDER',
    category: 'PROFILE',
    subCategory: 'Borders',
    price: 150,
    imageUrl: '/assets/global/shop/borders/Tech Robot.svg',
    tag: 'Border',
    description: 'An advanced robotic circuit frame equipped with high-tech gears and mechanical sensors.'
  },

  // ==========================================
  // AVATAR CUSTOMIZATION (140 Items)
  // ==========================================
  {
    id: "hair-black-bangs",
    title: "Raven Bangs",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/black/Bangs.png",
    tag: "Hair",
    description: "A sleek and stylish black hairstyle featuring soft bangs."
  },
  {
    id: "hair-black-bowl-cut",
    title: "Raven Bowl Cut",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/black/Bowl Cut.png",
    tag: "Hair",
    description: "A classic rounded bowl cut with a modern space-cadet vibe."
  },
  {
    id: "hair-black-curly",
    title: "Raven Curls",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/black/Curly.png",
    tag: "Hair",
    description: "Bouncy and full-bodied black curls packed with stellar personality."
  },
  {
    id: "hair-black-formal",
    title: "Raven Formal Cut",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/black/Formal.png",
    tag: "Hair",
    description: "A refined and polished black hairstyle tailored for star fleet ceremonies."
  },
  {
    id: "hair-black-messy",
    title: "Raven Tousled Hair",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/black/Messy.png",
    tag: "Hair",
    description: "A carefree and effortlessly cool tousled black hairstyle."
  },
  {
    id: "hair-black-pigtails",
    title: "Raven Pigtails",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/black/Pigtails.png",
    tag: "Hair",
    description: "Playful twin black pigtails full of youthful energetic charm."
  },
  {
    id: "hair-black-spiky",
    title: "Raven Spiky Hair",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/black/Spiky.png",
    tag: "Hair",
    description: "An energetic, gravity-defying spiky black hairstyle."
  },
  {
    id: "hair-black-wavy",
    title: "Raven Wavy Locks",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/black/Wavy.png",
    tag: "Hair",
    description: "Flowing and smooth black waves that shimmer under nebula light."
  },
  {
    id: "hair-blonde-bangs",
    title: "Golden Bangs",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/blonde/Bangs.svg",
    tag: "Hair",
    description: "A sleek and stylish blonde hairstyle featuring soft bangs."
  },
  {
    id: "hair-blonde-bowl-cut",
    title: "Golden Bowl Cut",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/blonde/Bowl Cut.svg",
    tag: "Hair",
    description: "A classic rounded bowl cut with a modern space-cadet vibe."
  },
  {
    id: "hair-blonde-curly",
    title: "Golden Curls",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/blonde/Curly.svg",
    tag: "Hair",
    description: "Bouncy and full-bodied blonde curls packed with stellar personality."
  },
  {
    id: "hair-blonde-formal",
    title: "Golden Formal Cut",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/blonde/Formal.svg",
    tag: "Hair",
    description: "A refined and polished blonde hairstyle tailored for star fleet ceremonies."
  },
  {
    id: "hair-blonde-messy",
    title: "Golden Tousled Hair",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/blonde/Messy.svg",
    tag: "Hair",
    description: "A carefree and effortlessly cool tousled blonde hairstyle."
  },
  {
    id: "hair-blonde-pigtails",
    title: "Golden Pigtails",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/blonde/Pigtails.svg",
    tag: "Hair",
    description: "Playful twin blonde pigtails full of youthful energetic charm."
  },
  {
    id: "hair-blonde-spiky",
    title: "Golden Spiky Hair",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/blonde/Spiky.svg",
    tag: "Hair",
    description: "An energetic, gravity-defying spiky blonde hairstyle."
  },
  {
    id: "hair-blonde-wavy",
    title: "Golden Wavy Locks",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/blonde/Wavy.svg",
    tag: "Hair",
    description: "Flowing and smooth blonde waves that shimmer under nebula light."
  },
  {
    id: "hair-brown-bangs",
    title: "Chestnut Bangs",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/brown/Bangs.svg",
    tag: "Hair",
    description: "A sleek and stylish brown hairstyle featuring soft bangs."
  },
  {
    id: "hair-brown-bowl-cut",
    title: "Chestnut Bowl Cut",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/brown/Bowl Cut.svg",
    tag: "Hair",
    description: "A classic rounded bowl cut with a modern space-cadet vibe."
  },
  {
    id: "hair-brown-curly",
    title: "Chestnut Curls",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/brown/Curly.svg",
    tag: "Hair",
    description: "Bouncy and full-bodied brown curls packed with stellar personality."
  },
  {
    id: "hair-brown-formal",
    title: "Chestnut Formal Cut",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/brown/Formal.svg",
    tag: "Hair",
    description: "A refined and polished brown hairstyle tailored for star fleet ceremonies."
  },
  {
    id: "hair-brown-messy",
    title: "Chestnut Tousled Hair",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/brown/Messy.svg",
    tag: "Hair",
    description: "A carefree and effortlessly cool tousled brown hairstyle."
  },
  {
    id: "hair-brown-pigtails",
    title: "Chestnut Pigtails",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/brown/Pigtails.svg",
    tag: "Hair",
    description: "Playful twin brown pigtails full of youthful energetic charm."
  },
  {
    id: "hair-brown-spiky",
    title: "Chestnut Spiky Hair",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/brown/Spiky.svg",
    tag: "Hair",
    description: "An energetic, gravity-defying spiky brown hairstyle."
  },
  {
    id: "hair-brown-wavy",
    title: "Chestnut Wavy Locks",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/brown/Wavy.svg",
    tag: "Hair",
    description: "Flowing and smooth brown waves that shimmer under nebula light."
  },
  {
    id: "hair-ginger-bangs",
    title: "Amber Bangs",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/ginger/Bangs.svg",
    tag: "Hair",
    description: "A sleek and stylish ginger hairstyle featuring soft bangs."
  },
  {
    id: "hair-ginger-bowl-cut",
    title: "Amber Bowl Cut",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/ginger/Bowl Cut.svg",
    tag: "Hair",
    description: "A classic rounded bowl cut with a modern space-cadet vibe."
  },
  {
    id: "hair-ginger-curly",
    title: "Amber Curls",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/ginger/Curly.svg",
    tag: "Hair",
    description: "Bouncy and full-bodied ginger curls packed with stellar personality."
  },
  {
    id: "hair-ginger-formal",
    title: "Amber Formal Cut",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/ginger/Formal.svg",
    tag: "Hair",
    description: "A refined and polished ginger hairstyle tailored for star fleet ceremonies."
  },
  {
    id: "hair-ginger-messy",
    title: "Amber Tousled Hair",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/ginger/Messy.svg",
    tag: "Hair",
    description: "A carefree and effortlessly cool tousled ginger hairstyle."
  },
  {
    id: "hair-ginger-pigtails",
    title: "Amber Pigtails",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/ginger/Pigtails.svg",
    tag: "Hair",
    description: "Playful twin ginger pigtails full of youthful energetic charm."
  },
  {
    id: "hair-ginger-spiky",
    title: "Amber Spiky Hair",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/ginger/Spiky.svg",
    tag: "Hair",
    description: "An energetic, gravity-defying spiky ginger hairstyle."
  },
  {
    id: "hair-ginger-wavy",
    title: "Amber Wavy Locks",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/ginger/Wavy.svg",
    tag: "Hair",
    description: "Flowing and smooth ginger waves that shimmer under nebula light."
  },
  {
    id: "hair-red-bangs",
    title: "Crimson Bangs",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/red/Bangs.svg",
    tag: "Hair",
    description: "A sleek and stylish red hairstyle featuring soft bangs."
  },
  {
    id: "hair-red-bowl-cut",
    title: "Crimson Bowl Cut",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/red/Bowl Cut.svg",
    tag: "Hair",
    description: "A classic rounded bowl cut with a modern space-cadet vibe."
  },
  {
    id: "hair-red-curly",
    title: "Crimson Curls",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/red/Curly.svg",
    tag: "Hair",
    description: "Bouncy and full-bodied red curls packed with stellar personality."
  },
  {
    id: "hair-red-formal",
    title: "Crimson Formal Cut",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/red/Formal.svg",
    tag: "Hair",
    description: "A refined and polished red hairstyle tailored for star fleet ceremonies."
  },
  {
    id: "hair-red-messy",
    title: "Crimson Tousled Hair",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/red/Messy.svg",
    tag: "Hair",
    description: "A carefree and effortlessly cool tousled red hairstyle."
  },
  {
    id: "hair-red-pigtails",
    title: "Crimson Pigtails",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/red/Pigtails.svg",
    tag: "Hair",
    description: "Playful twin red pigtails full of youthful energetic charm."
  },
  {
    id: "hair-red-spiky",
    title: "Crimson Spiky Hair",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/red/Spiky.svg",
    tag: "Hair",
    description: "An energetic, gravity-defying spiky red hairstyle."
  },
  {
    id: "hair-red-wavy",
    title: "Crimson Wavy Locks",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/red/Wavy.svg",
    tag: "Hair",
    description: "Flowing and smooth red waves that shimmer under nebula light."
  },
  {
    id: "hair-white-bangs",
    title: "Starlight Bangs",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/white/Bangs.svg",
    tag: "Hair",
    description: "A sleek and stylish white hairstyle featuring soft bangs."
  },
  {
    id: "hair-white-bowl-cut",
    title: "Starlight Bowl Cut",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/white/Bowl Cut.svg",
    tag: "Hair",
    description: "A classic rounded bowl cut with a modern space-cadet vibe."
  },
  {
    id: "hair-white-curly",
    title: "Starlight Curls",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/white/Curly.svg",
    tag: "Hair",
    description: "Bouncy and full-bodied white curls packed with stellar personality."
  },
  {
    id: "hair-white-formal",
    title: "Starlight Formal Cut",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/white/Formal.svg",
    tag: "Hair",
    description: "A refined and polished white hairstyle tailored for star fleet ceremonies."
  },
  {
    id: "hair-white-messy",
    title: "Starlight Tousled Hair",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/white/Messy.svg",
    tag: "Hair",
    description: "A carefree and effortlessly cool tousled white hairstyle."
  },
  {
    id: "hair-white-pigtails",
    title: "Starlight Pigtails",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/white/Pigtails.svg",
    tag: "Hair",
    description: "Playful twin white pigtails full of youthful energetic charm."
  },
  {
    id: "hair-white-spiky",
    title: "Starlight Spiky Hair",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/white/Spiky.svg",
    tag: "Hair",
    description: "An energetic, gravity-defying spiky white hairstyle."
  },
  {
    id: "hair-white-wavy",
    title: "Starlight Wavy Locks",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Hair",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/hair/white/Wavy.svg",
    tag: "Hair",
    description: "Flowing and smooth white waves that shimmer under nebula light."
  },
  {
    id: "acc-astro-helmet",
    title: "Astro Helmet",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Accessories",
    price: 80,
    imageUrl: "/assets/global/shop/avatar/accessories/AstroHelmet.svg",
    tag: "Accessory",
    description: "A pressurized astronaut helmet with an anti-glare gold visor."
  },
  {
    id: "acc-crown",
    title: "Imperial Star Crown",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Accessories",
    price: 80,
    imageUrl: "/assets/global/shop/avatar/accessories/Crown.svg",
    tag: "Accessory",
    description: "A majestic golden crown studded with shimmering cosmic gems."
  },
  {
    id: "acc-cute-bow",
    title: "Pretty Ribbon Bow",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Accessories",
    price: 80,
    imageUrl: "/assets/global/shop/avatar/accessories/Cute Bow.svg",
    tag: "Accessory",
    description: "A charming silk ribbon bow to brighten any explorer's day."
  },
  {
    id: "acc-field-hat",
    title: "Safari Field Hat",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Accessories",
    price: 80,
    imageUrl: "/assets/global/shop/avatar/accessories/Field Hat.svg",
    tag: "Accessory",
    description: "A durable wide-brim hat ideal for desert moons and sunny expeditions."
  },
  {
    id: "acc-flowers",
    title: "Wildflower Headband",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Accessories",
    price: 80,
    imageUrl: "/assets/global/shop/avatar/accessories/Flowers.svg",
    tag: "Accessory",
    description: "A fragrant crown of freshly harvested flowers from biodome greenhouses."
  },
  {
    id: "acc-headset",
    title: "Cosmic Comms Headset",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Accessories",
    price: 80,
    imageUrl: "/assets/global/shop/avatar/accessories/Headset.svg",
    tag: "Accessory",
    description: "A tactical communications headset tuned into deep space frequencies."
  },
  {
    id: "acc-horns",
    title: "Dubious Horns",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Accessories",
    price: 80,
    imageUrl: "/assets/global/shop/avatar/accessories/Horns.svg",
    tag: "Accessory",
    description: "A pair of mystical glowing horns forged in stellar plasma."
  },
  {
    id: "acc-night-cap",
    title: "Starry Night Cap",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Accessories",
    price: 80,
    imageUrl: "/assets/global/shop/avatar/accessories/Night Cap.svg",
    tag: "Accessory",
    description: "A cozy pointed sleeping cap designed for sweet dreams in zero gravity."
  },
  {
    id: "acc-orange-cap",
    title: "Retro Orange Cap",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Accessories",
    price: 80,
    imageUrl: "/assets/global/shop/avatar/accessories/Orange Cap.svg",
    tag: "Accessory",
    description: "A bold orange baseball cap bringing sporty street vibes to orbit."
  },
  {
    id: "acc-straw-hat",
    title: "Voyager Straw Hat",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Accessories",
    price: 80,
    imageUrl: "/assets/global/shop/avatar/accessories/Straw Hat.svg",
    tag: "Accessory",
    description: "A breezy woven straw hat inspired by legendary explorers of old."
  },
  {
    id: "acc-bandages",
    title: "Tactical Face Bandages",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Accessories",
    price: 80,
    imageUrl: "/assets/global/shop/avatar/accessories/Bandages.svg",
    tag: "Accessory",
    description: "Sturdy facial dressings proving you survived your latest daring mission."
  },
  {
    id: "acc-burglar-mask",
    title: "Shadow Bandit Mask",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Accessories",
    price: 80,
    imageUrl: "/assets/global/shop/avatar/accessories/BurglarMask.svg",
    tag: "Accessory",
    description: "A classic domino eye mask for stealthy nighttime operations."
  },
  {
    id: "acc-clown-nose",
    title: "Jester Red Nose",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Accessories",
    price: 80,
    imageUrl: "/assets/global/shop/avatar/accessories/ClownNose.svg",
    tag: "Accessory",
    description: "A bright red clown nose guaranteed to bring smiles across the station."
  },
  {
    id: "acc-eyepatch",
    title: "Corsair Eyepatch",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Accessories",
    price: 80,
    imageUrl: "/assets/global/shop/avatar/accessories/Eyepatch.svg",
    tag: "Accessory",
    description: "A rugged leather eyepatch worn by legendary space privateers."
  },
  {
    id: "acc-mask",
    title: "Protective Face Mask",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Accessories",
    price: 80,
    imageUrl: "/assets/global/shop/avatar/accessories/Mask.svg",
    tag: "Accessory",
    description: "A breathable sterile mask filtering hazardous atmospheric particles."
  },
  {
    id: "acc-monocle",
    title: "Gold Rim Monocle",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Accessories",
    price: 80,
    imageUrl: "/assets/global/shop/avatar/accessories/Monocle.svg",
    tag: "Accessory",
    description: "An aristocratic golden monocle adding instant intellectual flair."
  },
  {
    id: "acc-moustache",
    title: "Dapper Moustache",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Accessories",
    price: 80,
    imageUrl: "/assets/global/shop/avatar/accessories/Moustache.svg",
    tag: "Accessory",
    description: "A handsomely groomed handlebar moustache worthy of an admiral."
  },
  {
    id: "acc-shades",
    title: "Cool Star Shades",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Accessories",
    price: 80,
    imageUrl: "/assets/global/shop/avatar/accessories/Shades.svg",
    tag: "Accessory",
    description: "Tinted sunglasses that block out ultraviolet radiation and solar flares."
  },
  {
    id: "acc-whiskers",
    title: "Playful Cat Whiskers",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Accessories",
    price: 80,
    imageUrl: "/assets/global/shop/avatar/accessories/Whiskers.svg",
    tag: "Accessory",
    description: "Cute hand-drawn feline face whiskers for extra cosmic charm."
  },
  // --- TOPS: JACKETS & SUITS ---
  {
    id: "top-astro-suit",
    title: "Galactic AstroSuit",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 0,
    imageUrl: "/assets/global/shop/avatar/tops/AstroSuit.svg",
    tag: "Top",
    description: "A state-of-the-art EVA pressurized suit engineered for deep space travel. Default astronaut attire.",
    isDefaultOutfit: true,
  },
  {
    id: "top-black-jacket",
    title: "Midnight Bomber Jacket",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Black Jacket.svg",
    tag: "Top",
    description: "A sharp black zip-up bomber jacket lined with thermal space insulation."
  },
  {
    id: "top-sporty-jacket",
    title: "Athletic Track Jacket",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Sporty Jacket.svg",
    tag: "Top",
    description: "A high-performance training jacket made for low-gravity athletic drills."
  },

  // --- TOPS: HOODIES ---
  {
    id: "top-hoodie",
    title: "Classic Slate Hoodie",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Hoodie.svg",
    tag: "Top",
    description: "An ultra-cozy slate pullover hoodie for relaxing after long coding sessions."
  },
  {
    id: "top-hoodie-green",
    title: "Lime Green Hoodie",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Hoodie (Green).svg",
    tag: "Top",
    description: "A vibrant green hoodie bursting with natural planetary energy."
  },
  {
    id: "top-hoodie-orange",
    title: "Solar Orange Hoodie",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Hoodie (Orange).svg",
    tag: "Top",
    description: "A high-visibility orange fleece hoodie radiating sunny warmth."
  },
  {
    id: "top-hoodie-purple",
    title: "Deep Violet Hoodie",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Hoodie (Purple).svg",
    tag: "Top",
    description: "A rich royal purple hoodie combining comfort and stellar style."
  },
  {
    id: "top-hoodie-red",
    title: "Crimson Flame Hoodie",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Hoodie (Red).svg",
    tag: "Top",
    description: "A bold red hoodie that stands out in any cosmic environment."
  },
  {
    id: "top-hoodie-yellow",
    title: "Sunshine Yellow Hoodie",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Hoodie (Yellow).svg",
    tag: "Top",
    description: "A warm yellow hoodie bringing happiness wherever you explore."
  },

  // --- TOPS: SWEATERS & KNITS ---
  {
    id: "top-sweater",
    title: "Cozy Cream Knit Sweater",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Sweater.svg",
    tag: "Top",
    description: "A chunky hand-knit cream sweater keeping you warm in deep space chill."
  },
  {
    id: "top-sweater-black",
    title: "Onyx Wool Sweater",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Sweater (Black).svg",
    tag: "Top",
    description: "A sophisticated black knitted pullover suited for chilly evenings."
  },
  {
    id: "top-sweater-green",
    title: "Forest Green Sweater",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Sweater (Green).svg",
    tag: "Top",
    description: "A deep pine-green knit sweater crafted with warm thermal wool."
  },
  {
    id: "top-sweater-yellow",
    title: "Golden Ochre Sweater",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Sweater (Yellow).svg",
    tag: "Top",
    description: "A golden knit sweater glowing with rich autumn colors."
  },

  // --- TOPS: SHIRTS & TEES ---
  {
    id: "top-tee",
    title: "Everyday White Tee",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Tee.svg",
    tag: "Top",
    description: "A soft and timeless cotton crewneck t-shirt perfect for daily wear."
  },
  {
    id: "top-stripey-top",
    title: "Classic Striped Longsleeve",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Stripey Top.svg",
    tag: "Top",
    description: "A monochrome striped crewneck offering timeless nautical flair."
  },
  {
    id: "top-stripey-top-blue",
    title: "Marine Blue Striped Top",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Stripey Top (Blue).svg",
    tag: "Top",
    description: "A navy-striped long sleeve top reminiscent of ocean-faring voyages."
  },
  {
    id: "top-stripey-top-green",
    title: "Mint Green Striped Top",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Stripey Top (Green).svg",
    tag: "Top",
    description: "A fresh green striped top designed for casual weekend leisure."
  },
  {
    id: "top-stripey-top-red",
    title: "Candy Cane Striped Top",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Stripey Top (Red).svg",
    tag: "Top",
    description: "A vibrant red and white striped shirt full of festive spirit."
  },

  // --- TOPS: DRESSES & GOWNS ---
  {
    id: "top-cloudy-dress",
    title: "Sky Blue Cloudy Dress",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Cloudy Dress.svg",
    tag: "Top",
    description: "A dreamy baby-blue dress patterned with fluffy white stratospheric clouds."
  },
  {
    id: "top-cloudy-dress-black",
    title: "Midnight Cloudy Dress",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Cloudy Dress (Black).svg",
    tag: "Top",
    description: "A chic black dress floating with mystical nocturnal clouds."
  },
  {
    id: "top-cloudy-dress-pink",
    title: "Rose Cloudy Dress",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Cloudy Dress (Pink).svg",
    tag: "Top",
    description: "A lovely pink sun-dress adorned with whimsical cotton clouds."
  },
  {
    id: "top-cloudy-dress-yellow",
    title: "Sunbeam Cloudy Dress",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Cloudy Dress (Yellow).svg",
    tag: "Top",
    description: "A cheerful sunny dress brightening up every planetary colony."
  },
  {
    id: "top-formal-dress",
    title: "Midnight Gala Gown",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Formal Dress.svg",
    tag: "Top",
    description: "An elegant dark evening gown tailored for diplomatic galas and banquets."
  },
  {
    id: "top-formal-dress-green",
    title: "Emerald Ballroom Dress",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Formal Dress (Green).svg",
    tag: "Top",
    description: "A luxurious emerald silk gown that sparkles under chandeliers."
  },
  {
    id: "top-formal-dress-red",
    title: "Ruby Velvet Dress",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Formal Dress (Red).svg",
    tag: "Top",
    description: "A breathtaking crimson velvet gown radiating confidence and grace."
  },
  {
    id: "top-formal-dress-white",
    title: "Starlight White Gown",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Formal Dress (White).svg",
    tag: "Top",
    description: "A pristine white formal dress woven from radiant cosmic fibers."
  },

  // --- TOPS: APRONS ---
  {
    id: "top-apron",
    title: "Chef's White Apron",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Apron.svg",
    tag: "Top",
    description: "A clean culinary apron ready for whipping up gourmet space meals."
  },
  {
    id: "top-apron-blue",
    title: "Azure Work Apron",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Apron (Blue).svg",
    tag: "Top",
    description: "A sturdy denim-blue utility apron with deep tool pockets."
  },
  {
    id: "top-apron-orange",
    title: "Sunset Orange Apron",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Apron (Orange).svg",
    tag: "Top",
    description: "A warm and bright orange apron favored by spaceport baristas."
  },
  {
    id: "top-apron-pink",
    title: "Blossom Pink Apron",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Tops",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/tops/Apron (Pink).svg",
    tag: "Top",
    description: "A pastel pink baking apron dusted with celestial sweetness."
  },

  // --- BOTTOMS: PANTS & JEANS ---
  {
    id: "bot-astro-pants",
    title: "Galactic AstroPants",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 0,
    imageUrl: "/assets/global/shop/avatar/bottoms/AstroPants.svg",
    tag: "Bottom",
    description: "Reinforced pressure trousers matching the legendary AstroSuit. Default astronaut attire.",
    isDefaultOutfit: true,
  },
  {
    id: "bot-black-pants",
    title: "Formal Black Slacks",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Black Pants.svg",
    tag: "Bottom",
    description: "Crisply pressed dark trousers perfect for any smart occasion."
  },
  {
    id: "bot-jeans",
    title: "Stonewash Blue Jeans",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Jeans.svg",
    tag: "Bottom",
    description: "Rugged and dependable denim jeans that never go out of style."
  },
  {
    id: "bot-sporty-pants",
    title: "Athletic Track Pants",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Sporty Pants.svg",
    tag: "Bottom",
    description: "Lightweight, breathable track pants equipped with flexible stretch panels."
  },

  // --- BOTTOMS: CARGO PANTS & SHORTS ---
  {
    id: "bot-cargo-shorts",
    title: "Utility Khaki Shorts",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Cargo Shorts.svg",
    tag: "Bottom",
    description: "Roomy multi-pocket cargo shorts built for hot planetary days."
  },
  {
    id: "bot-cargo-pants-black",
    title: "Stealth Cargo Pants (Black)",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Cargo Pants (Black).png",
    tag: "Bottom",
    description: "Heavy-duty tactical cargo pants engineered for covert operations."
  },
  {
    id: "bot-cargo-pants-brown",
    title: "Ranger Cargo Pants (Brown)",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Cargo Pants (Brown).png",
    tag: "Bottom",
    description: "Sturdy earth-toned cargo trousers designed for rough wilderness trails."
  },
  {
    id: "bot-cargo-pants-red",
    title: "Crimson Cargo Pants (Red)",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Cargo Pants (Red).png",
    tag: "Bottom",
    description: "Vibrant red utility trousers with reinforced knee pads."
  },
  {
    id: "bot-cargo-pants-white",
    title: "Arctic Cargo Pants (White)",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Cargo Pants (White).png",
    tag: "Bottom",
    description: "Insulated white tactical pants made for freezing polar expeditions."
  },

  // --- BOTTOMS: SKIRTS ---
  {
    id: "bot-pink-skirt",
    title: "Pastel Pink Skirt",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Pink Skirt.svg",
    tag: "Bottom",
    description: "A sweet pleated pink skirt that twirls gracefully in low gravity."
  },
  {
    id: "bot-skirt-blue",
    title: "Royal Azure Skirt",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Skirt (Blue).png",
    tag: "Bottom",
    description: "A classic blue A-line skirt radiating calm composure."
  },
  {
    id: "bot-skirt-red",
    title: "Ruby Flared Skirt",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Skirt (Red).png",
    tag: "Bottom",
    description: "A fiery red flared skirt that brightens up any setting."
  },
  {
    id: "bot-skirt-white",
    title: "Ivory Pleated Skirt",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Skirt (White).png",
    tag: "Bottom",
    description: "An immaculate white skirt matching almost every top in your wardrobe."
  },
  {
    id: "bot-skirt-yellow",
    title: "Sunbeam Yellow Skirt",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Skirt (Yellow).png",
    tag: "Bottom",
    description: "A cheerful yellow skirt bursting with bright positivity."
  },
  {
    id: "bot-plaid-skirt",
    title: "Highland Plaid Skirt",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Plaid Skirt.svg",
    tag: "Bottom",
    description: "A classic tartan skirt combining heritage tradition with modern school charm."
  },
  {
    id: "bot-plaid-skirt-blue",
    title: "Academy Plaid Skirt (Blue)",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Plaid Skirt (Blue).png",
    tag: "Bottom",
    description: "A smart blue plaid pleated skirt standard in naval academies."
  },
  {
    id: "bot-plaid-skirt-pink",
    title: "Pastel Plaid Skirt (Pink)",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Plaid Skirt (Pink).png",
    tag: "Bottom",
    description: "A cute pink plaid skirt adding colorful charm to your outfit."
  },
  {
    id: "bot-plaid-skirt-purple",
    title: "Twilight Plaid Skirt (Purple)",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Plaid Skirt (Purple).png",
    tag: "Bottom",
    description: "A mystical purple plaid skirt inspired by evening horizon skies."
  },
  {
    id: "bot-plaid-skirt-white",
    title: "Snow Plaid Skirt (White)",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Plaid Skirt (White).png",
    tag: "Bottom",
    description: "A clean monochromatic plaid skirt with silver undertones."
  },

  // --- BOTTOMS: KILTS ---
  {
    id: "bot-kilt",
    title: "Traditional Clan Kilt",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Kilt.svg",
    tag: "Bottom",
    description: "A proud tartan kilt honoring the bold heritage of ancient warrior clans."
  },
  {
    id: "bot-kilt-blue",
    title: "Cerulean Clan Kilt (Blue)",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Kilt (Blue).png",
    tag: "Bottom",
    description: "A majestic blue tartan kilt tailored for royal festivities."
  },
  {
    id: "bot-kilt-brown",
    title: "Highland Earth Kilt (Brown)",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Kilt (Brown).png",
    tag: "Bottom",
    description: "A rustic wool kilt echoing the rolling hills of the Scottish highlands."
  },
  {
    id: "bot-kilt-green",
    title: "Emerald Heather Kilt (Green)",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Kilt (Green).png",
    tag: "Bottom",
    description: "A deep green tartan kilt rich with forest foliage heritage."
  },
  {
    id: "bot-kilt-pink",
    title: "Candy Tartan Kilt (Pink)",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Kilt (Pink).png",
    tag: "Bottom",
    description: "A playful pastel pink kilt offering a fun twist on classic attire."
  },

  // --- BOTTOMS: PAJAMAS ---
  {
    id: "bot-pajamas",
    title: "Cozy Striped Pajama Pants",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Pajamas.svg",
    tag: "Bottom",
    description: "Silky soft loungewear trousers crafted for peaceful interstellar sleep."
  },
  {
    id: "bot-pajamas-black",
    title: "Midnight Pajama Bottoms (Black)",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Pajamas (Black).png",
    tag: "Bottom",
    description: "Sleek black lounge pants designed for midnight stargazing."
  },
  {
    id: "bot-pajamas-blue",
    title: "Dreamy Blue Pajama Bottoms",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Pajamas (Blue).png",
    tag: "Bottom",
    description: "Soothing sky-blue sleepwear pants for recharging after long journeys."
  },
  {
    id: "bot-pajamas-green",
    title: "Minty Slumber Pajamas (Green)",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Pajamas (Green).png",
    tag: "Bottom",
    description: "Relaxing mint-green sleep pants soft as lunar morning mist."
  },
  {
    id: "bot-pajamas-pink",
    title: "Sweet Dreams Pajamas (Pink)",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Pajamas (Pink).png",
    tag: "Bottom",
    description: "Candy-pink thermal sleep bottoms keeping you toasty in sleep pods."
  },
  {
    id: "bot-pajamas-white",
    title: "Cloud White Pajama Bottoms",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Pajamas (White).png",
    tag: "Bottom",
    description: "Pure white cotton pajama pants as gentle as a nebula cloud."
  },

  // --- BOTTOMS: SWIMWEAR ---
  {
    id: "bot-swim-trunks",
    title: "Tropical Blue Swim Trunks",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/Swim Trunks.svg",
    tag: "Bottom",
    description: "Quick-drying blue board shorts made for aquatic recreation."
  },
  {
    id: "bot-swim-trunks-black",
    title: "Obsidian Board Shorts (Black)",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/SwimTrunks (Black).png",
    tag: "Bottom",
    description: "Sleek black swim shorts resistant to chlorine and saltwater."
  },
  {
    id: "bot-swim-trunks-blue",
    title: "Ocean Wave Swim Trunks (Blue)",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/SwimTrunks (Blue).png",
    tag: "Bottom",
    description: "Deep blue swim shorts inspired by crystal ocean tide pools."
  },
  {
    id: "bot-swim-trunks-purple",
    title: "Neon Violet Swim Trunks",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/SwimTrunks (Purple).png",
    tag: "Bottom",
    description: "Eye-catching purple trunks ready for resort hydro-domes."
  },
  {
    id: "bot-swim-trunks-red",
    title: "Solar Flare Swim Trunks (Red)",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Bottoms",
    price: 60,
    imageUrl: "/assets/global/shop/avatar/bottoms/SwimTrunks (Red).png",
    tag: "Bottom",
    description: "Bright red swim trunks crafted for sun-drenched beach worlds."
  },
  {
    id: "shoe-astro-boots",
    title: "Galactic AstroBoots",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Shoes",
    price: 0,
    imageUrl: "/assets/global/shop/avatar/shoes/AstroBoots.svg",
    tag: "Shoes",
    description: "Magnetic traction boots engineered for zero-G spacewalks. Default astronaut attire.",
    isDefaultOutfit: true,
  },
  {
    id: "shoe-sneakers",
    title: "Street Runner Sneakers",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Shoes",
    price: 40,
    imageUrl: "/assets/global/shop/avatar/shoes/Sneakers.svg",
    tag: "Shoes",
    description: "Lightweight cushioned sneakers offering effortless all-day agility."
  },
  {
    id: "shoe-boots",
    title: "Sturdy Explorer Boots",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Shoes",
    price: 40,
    imageUrl: "/assets/global/shop/avatar/shoes/Boots.svg",
    tag: "Shoes",
    description: "Durable leather combat boots built to conquer rough extraterrestrial soil."
  },
  {
    id: "shoe-sandals",
    title: "Beachcomber Sandals",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Shoes",
    price: 40,
    imageUrl: "/assets/global/shop/avatar/shoes/Sandals.svg",
    tag: "Shoes",
    description: "Casual open-toe strap sandals meant for warm planet beaches."
  },
  {
    id: "shoe-brogues",
    title: "Classic Tan Brogues",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Shoes",
    price: 40,
    imageUrl: "/assets/global/shop/avatar/shoes/Brogues.svg",
    tag: "Shoes",
    description: "Handcrafted leather dress shoes with decorative perforations."
  },
  {
    id: "shoe-brogues-blue",
    title: "Royal Blue Brogues",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Shoes",
    price: 40,
    imageUrl: "/assets/global/shop/avatar/shoes/Brogues (Blue).svg",
    tag: "Shoes",
    description: "Striking blue leather brogues making a dapper fashion statement."
  },
  {
    id: "shoe-brogues-green",
    title: "Forest Green Brogues",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Shoes",
    price: 40,
    imageUrl: "/assets/global/shop/avatar/shoes/Brogues (Green).svg",
    tag: "Shoes",
    description: "Unique moss-green dress shoes for distinguished commanders."
  },
  {
    id: "shoe-brogues-purple",
    title: "Velvet Purple Brogues",
    type: "AVATAR",
    category: "AVATAR",
    subCategory: "Shoes",
    price: 40,
    imageUrl: "/assets/global/shop/avatar/shoes/Brogues (Purple).svg",
    tag: "Shoes",
    description: "Rich purple brogues tailored for the most extravagant celebrations."
  }
];

export function getCatalogItemById(id: string): ShopCatalogItem | undefined {
  return SHOP_CATALOG.find(item => item.id === id);
}

/**
 * Custom scale and offset transform for avatar customization items so
 * garments, hair, accessories, and shoes are centered and enlarged prominently.
 */
export function getAvatarItemStyle(subCategory?: string): { transform: string; transformOrigin: string } {
  switch (subCategory) {
    case 'Hair':
    case 'Hairstyles':
      return { transform: 'scale(2.35) translateY(18%)', transformOrigin: 'center center' };
    case 'Accessories':
      return { transform: 'scale(2.3) translateY(17%)', transformOrigin: 'center center' };
    case 'Tops':
      return { transform: 'scale(1.8) translateY(-6%)', transformOrigin: 'center center' };
    case 'Bottoms':
      return { transform: 'scale(2.35) translateY(-25%)', transformOrigin: 'center center' };
    case 'Shoes':
      return { transform: 'scale(2.7) translateY(-34%)', transformOrigin: 'center center' };
    default:
      return { transform: 'scale(1)', transformOrigin: 'center center' };
  }
}

/**
 * Returns the logical sub-group name for Tops, Bottoms, and Hairstyles
 */
export function getItemSubGroup(item: { id: string; title: string; subCategory: string }): string {
  if (item.subCategory === 'Tops') {
    if (item.id.includes('hoodie')) return 'Hoodies';
    if (item.id.includes('sweater')) return 'Sweaters';
    if (item.id.includes('dress') || item.title.includes('Dress') || item.title.includes('Gown')) return 'Dresses & Gowns';
    if (item.id.includes('apron')) return 'Aprons';
    if (item.id.includes('suit') || item.id.includes('jacket')) return 'Jackets & Suits';
    return 'Shirts & Tops';
  }
  if (item.subCategory === 'Bottoms') {
    if (item.id.includes('cargo') || item.title.includes('Cargo') || item.title.includes('Khaki Shorts')) return 'Cargo Pants & Shorts';
    if (item.id.includes('skirt') || item.title.includes('Skirt')) return 'Skirts';
    if (item.id.includes('kilt') || item.title.includes('Kilt')) return 'Kilts';
    if (item.id.includes('pajama') || item.title.includes('Pajama')) return 'Pajamas';
    if (item.id.includes('swim') || item.title.includes('Swim') || item.title.includes('Shorts')) return 'Swimwear';
    return 'Pants & Jeans';
  }
  if (item.subCategory === 'Hair' || item.subCategory === 'Hairstyles') {
    if (item.id.includes('spiky')) return 'Spiky';
    if (item.id.includes('wavy')) return 'Wavy';
    if (item.id.includes('curly')) return 'Curly';
    if (item.id.includes('pigtails')) return 'Pigtails';
    if (item.id.includes('messy')) return 'Messy';
    if (item.id.includes('formal')) return 'Formal';
    if (item.id.includes('bangs')) return 'Bangs';
    if (item.id.includes('bowl-cut') || item.title.includes('Bowl Cut')) return 'Bowl Cut';
    return 'Other';
  }
  return '';
}

/**
 * Returns the color name for hairstyles
 */
export function getHairColor(item: { id: string; title: string }): string {
  if (item.id.includes('-black-') || item.title.includes('Raven')) return 'Black';
  if (item.id.includes('-blonde-') || item.title.includes('Golden')) return 'Blonde';
  if (item.id.includes('-brown-') || item.title.includes('Chestnut')) return 'Brown';
  if (item.id.includes('-ginger-') || item.title.includes('Amber')) return 'Ginger';
  if (item.id.includes('-red-') || item.title.includes('Crimson')) return 'Red';
  if (item.id.includes('-white-') || item.title.includes('Starlight')) return 'White';
  return '';
}

