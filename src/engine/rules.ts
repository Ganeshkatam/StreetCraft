/**
 * StreetCraft Deterministic Rules & Local Relevance Enrichment Engine
 * Enforces channel schemas, character limits, category vocabulary, and Indian market calendar moments.
 */

export interface ChannelConstraints {
  maxChars?: number;
  idealWordsMin?: number;
  idealWordsMax?: number;
  maxCaptionChars?: number;
  maxStoryWords?: number;
  maxHashtags?: number;
  maxHeadlineWords?: number;
  maxSubheadingWords?: number;
  maxCTAWords?: number;
  allowedCTAs?: string[];
}

export const CHANNEL_RULES: Record<string, ChannelConstraints> = {
  GOOGLE_BUSINESS: {
    maxChars: 1500,
    idealWordsMin: 40,
    idealWordsMax: 120,
    allowedCTAs: ['Visit Us', 'Call Now', 'Order Takeaway', 'Reserve Table', 'Learn More', 'Get Offer'],
  },
  INSTAGRAM: {
    maxCaptionChars: 2200,
    idealWordsMin: 40,
    idealWordsMax: 100,
    maxStoryWords: 24,
    maxHashtags: 6,
  },
  WHATSAPP: {
    maxChars: 500,
    idealWordsMin: 20,
    idealWordsMax: 70,
  },
  IN_STORE_POSTER: {
    maxHeadlineWords: 7,
    maxSubheadingWords: 18,
    maxCTAWords: 10,
  },
};

export interface LocalMoment {
  id: string;
  name: string;
  months: number[];
  themes: string[];
  defaultHook: string;
}

export const LOCAL_INDIAN_MOMENTS: LocalMoment[] = [
  {
    id: 'monsoon_season',
    name: 'Monsoon Chai & Bakes Season',
    months: [6, 7, 8, 9],
    themes: ['Rainy day coffee & chai specials', 'Warm bakes & savory pairings', 'Cozy indoor seating & acoustic playlists'],
    defaultHook: 'Rainy afternoons in the neighborhood call for warm bakes and freshly brewed coffee.',
  },
  {
    id: 'diwali_festive',
    name: 'Diwali Festive Gatherings & Hampers',
    months: [10, 11],
    themes: ['Festive dessert boxes & artisan hampers', 'Group dining & family celebration combos', 'Pre-Diwali catch-ups'],
    defaultHook: 'Celebrate the festive season with handcrafted artisanal treats in the neighborhood.',
  },
  {
    id: 'weekend_brunch',
    name: 'Weekend Brunch & Slow Mornings',
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    themes: ['All-day breakfast specials', 'Fresh pour-overs & fresh bakes', 'Pet-friendly patio catchups'],
    defaultHook: 'Saturday mornings are meant to be unhurried.',
  },
  {
    id: 'new_year_winter',
    name: 'Winter Warmers & Holiday Season',
    months: [12, 1],
    themes: ['Hot chocolate & spiced lattes', 'Year-end team lunches & friend reunions', 'Holiday dessert specials'],
    defaultHook: 'Warm up your winter evenings with signature specials.',
  },
];

export const CATEGORY_VOCABULARY = {
  CAFE_RESTAURANT: {
    verbs: ['brew', 'craft', 'roast', 'bake', 'plate', 'pour', 'serve', 'steep', 'caramelize'],
    spaces: ['quiet corners', 'sunlit window tables', 'outdoor patio', 'cozy booth', 'communal work table'],
    vibes: ['calm workspace', 'unhurried catchups', 'freshly ground aromas', 'handcrafted perfection', 'warm atmosphere'],
    callToActions: [
      'Show this post at the counter for your discount.',
      'Drop by our outlet this afternoon or call to reserve.',
      'Ask your barista for today’s roast recommendation.',
    ],
  },
};

/**
 * Builds authentic, human local hashtag bundles without spamming.
 */
export function generateLocalTags(neighborhood: string, city: string, category: string = 'Cafe'): string[] {
  const cleanHood = (neighborhood || '').replace(/[^a-zA-Z0-9]/g, '');
  const cleanCity = (city || '').replace(/[^a-zA-Z0-9]/g, '');
  const cleanCat = (category || 'Cafe').replace(/[^a-zA-Z0-9]/g, '');

  const tags: string[] = [];
  if (cleanHood) tags.push(`#${cleanHood}Eats`);
  if (cleanCity) tags.push(`#${cleanCity}Foodies`);
  if (cleanHood && cleanCity) tags.push(`#${cleanHood}${cleanCity}`);
  if (cleanCat) tags.push(`#${cleanCat}Lovers`);
  tags.push('#LocalCafe');
  tags.push('#SpecialtyCoffee');
  if (cleanCity) tags.push(`#${cleanCity}Cafes`);

  return Array.from(new Set(tags)).slice(0, 5);
}
