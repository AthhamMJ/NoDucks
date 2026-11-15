/**
 * Story Catalogue
 * Predefined story settings for visual comic explanations mapped to student interests.
 * Allows safe reuse across students and fallback to a neutral default story.
 */

export const STORIES = {
  neutral_workshop: {
    id: "neutral_workshop",
    title: "The Wonder Workshop",
    visualContext: "An inquisitive inventor's workshop filled with modular brass gears, holographic diagrams, and test benches",
    interestTags: ["general", "science", "invention", "curiosity", "experiment"],
    compatibleWith: ["neutral_workshop", "science_lab", "inventor_shed"],
  },
  racing_circuit: {
    id: "racing_circuit",
    title: "Apex High-Speed Speedway",
    visualContext: "A futuristic racing paddock with pit crews, aerodynamic chassis sensors, and telemetry monitors",
    interestTags: ["racing", "cars", "formula", "speed", "motorsport", "automotive"],
    compatibleWith: ["racing_circuit", "speedway", "aerodynamics_lab"],
  },
  space_station: {
    id: "space_station",
    title: "Starlight Orbital Outpost",
    visualContext: "A deep-space research platform with hydroponic observation domes, zero-g chambers, and star trackers",
    interestTags: ["space", "astronomy", "planets", "rockets", "cosmos", "astronaut"],
    compatibleWith: ["space_station", "orbital_deck", "observatory"],
  },
  culinary_kitchen: {
    id: "culinary_kitchen",
    title: "The Molecular Kitchen",
    visualContext: "A lively restaurant kitchen with bubbling emulsion flasks, convection ovens, and precise chef scales",
    interestTags: ["cooking", "baking", "food", "culinary", "chef", "recipes"],
    compatibleWith: ["culinary_kitchen", "bakery", "flavor_lab"],
  },
  gaming_quest: {
    id: "gaming_quest",
    title: "The Pixel Guild Quest",
    visualContext: "A fantasy adventure guildhall with mana crystal meters, health HUD bars, and crafting workbenches",
    interestTags: ["gaming", "esports", "games", "rpg", "arcade", "video games"],
    compatibleWith: ["gaming_quest", "arcade_zone", "fantasy_forge"],
  },
  music_studio: {
    id: "music_studio",
    title: "The Resonance Sound Lab",
    visualContext: "A high-tech audio studio with waveform equalizers, synthesizers, acoustic baffles, and vibrating guitar strings",
    interestTags: ["music", "sound", "audio", "instruments", "songs", "dj"],
    compatibleWith: ["music_studio", "sound_lab", "acoustic_hall"],
  },
  sports_arena: {
    id: "sports_arena",
    title: "The Champion Training Ground",
    visualContext: "A modern athletic gymnasium with kinetic force plates, trajectory tracking cams, and jump mats",
    interestTags: ["sports", "athletics", "basketball", "football", "fitness", "training"],
    compatibleWith: ["sports_arena", "stadium", "training_ground"],
  },
};

export function getDefaultStory() {
  return STORIES.neutral_workshop;
}

/**
 * Maps student interests to a catalogue story.
 * If no interest or no match, returns neutral default story.
 */
export function resolveStoryForInterest(interest) {
  if (!interest || typeof interest !== "string") {
    return getDefaultStory();
  }

  const query = interest.toLowerCase().trim();
  if (!query) return getDefaultStory();

  for (const story of Object.values(STORIES)) {
    for (const tag of story.interestTags) {
      if (query.includes(tag) || tag.includes(query)) {
        return story;
      }
    }
  }

  return getDefaultStory();
}

/**
 * Checks if two story IDs are compatible.
 */
export function areStoriesCompatible(storyAId, storyBId) {
  if (!storyAId || !storyBId) return false;
  if (storyAId === storyBId) return true;

  const storyA = STORIES[storyAId];
  const storyB = STORIES[storyBId];

  if (storyA && storyA.compatibleWith?.includes(storyBId)) return true;
  if (storyB && storyB.compatibleWith?.includes(storyAId)) return true;

  return false;
}

