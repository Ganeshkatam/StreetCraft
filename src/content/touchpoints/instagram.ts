import type { TouchpointEditorialContent } from '../types';

export const instagramContent: TouchpointEditorialContent = {
  category: 'CUSTOMER TOUCHPOINT',
  metadata: {
    title: 'Instagram Marketing for Physical Storefronts — StreetCraft',
    description:
      'Turn social scrolls into physical foot traffic. Structured 3-second Reel hooks, 3-frame Story sequencing, and localized neighborhood hashtags for local stores.',
    ogTitle: 'Instagram Marketing for Physical Stores — StreetCraft',
    ogDescription:
      'Stop posting generic social captions. Generate 3-second video hooks, 3-frame Story plans, and hyper-local hashtags engineered for store walk-ins.',
  },
  eyebrow: 'LOCAL SOCIAL DISCOVERY',
  title: 'Instagram Storefront Marketing',
  tagline: 'Turn casual neighborhood scrollers into paying customers through your front door.',
  description:
    'Most local store Instagram accounts post beautiful photos with weak captions that fail to drive real footfall. StreetCraft generates 3-second Reel hooks, 3-frame Story sequences, and neighborhood-specific hashtags designed to trigger physical store visits.',
  metrics: [
    {
      value: '3-Frame',
      label: 'Story Sequence Plan',
      sublabel: 'Context frame, offer frame, and location frame pre-structured.',
    },
    {
      value: '3-Second',
      label: 'Reel Hook Formulas',
      sublabel: 'Stopping local users before they scroll past your store special.',
    },
    {
      value: 'Hyper-Local',
      label: 'Hashtag Curation',
      sublabel: 'Curated by neighborhood anchor rather than bloated global tags.',
    },
  ],
  heroCta: {
    primary: {
      label: 'Try Free Campaign Tool',
      href: '/free-tool',
    },
    secondary: {
      label: 'Explore Pricing',
      href: '/pricing',
    },
  },
  anatomy: {
    eyebrow: 'OUTPUT ANATOMY',
    title: 'Deconstructing a StreetCraft Instagram Pack',
    description:
      'Every Instagram asset delivers structured narrative blocks: video hook, feed caption, 3-frame Story sequence, and neighborhood discovery tags.',
    previewTitle: 'Instagram 4-Part Campaign Asset Pack',
    previewType: 'instagram',
    items: [
      {
        badge: 'REEL HOOK (0–3s)',
        label: 'Scroll-Stopping Hook',
        text: '"If you work from home near Indiranagar, here is why your 3 PM coffee break just got upgraded..."',
        note: 'Instantly identifies the local audience and problem within the first 3 seconds.',
      },
      {
        badge: 'FEED CAPTION',
        label: 'Sensory Narrative & Details',
        text: 'Pour-overs brewed fresh on single-origin Ethiopian beans paired with warm cinnamon rolls right out of the oven. Available today until 6 PM.',
        note: 'Combines sensory detail with clear hours and pricing anchors.',
      },
      {
        badge: 'STORY TRIPTYCH',
        label: '3-Frame Sequence Plan',
        text: 'Frame 1: Steam rising from pour-over | Frame 2: Counter offer card | Frame 3: Map sticker & "Visit Indiranagar"',
        note: 'Guides your staff on exactly what photos/videos to snap in 60 seconds.',
      },
      {
        badge: 'LOCAL HASHTAGS',
        label: 'Neighborhood Discovery Tags',
        text: '#IndiranagarEats #BangaloreCoffee #100ftRoad #BangaloreCafes #WorkFromCafeBLR',
        note: 'Pulls hyper-local search volume from people exploring nearby.',
      },
    ],
  },
  capabilities: [
    {
      tag: 'STORY SEQUENCING',
      title: 'Story Frameworks Built for High Retention',
      description:
        'Single stories are easily skipped. StreetCraft creates structured 3-part Story sequences that build curiosity, present the store offer, and display clear location stickers.',
      bulletPoints: [
        'Frame 1: Hook and sensory detail of the product',
        'Frame 2: Clear promotion mechanics and price anchor',
        'Frame 3: Location sticker and "Tap for Directions" callout',
      ],
    },
    {
      tag: 'REEL HOOK FORMULAS',
      title: 'Short-Form Video Directives for Floor Staff',
      description:
        'You don’t need an agency. Our generated Reel prompts give your baristas, stylists, or retail staff exact 15-second filming instructions.',
      bulletPoints: [
        'Clear on-screen text overlay prompts',
        'Audio pacing and voiceover script suggestions',
        'Direct link to in-store counter presentation',
      ],
    },
    {
      tag: 'GEO HASHTAGS',
      title: 'Hyper-Local Tag Curation',
      description:
        'Generic tags like #food or #fashion attract spam bots. StreetCraft curates neighborhood-level discovery tags that reach actual nearby residents.',
      bulletPoints: [
        'Curated neighborhood and city tags',
        'Category-specific sub-community tags',
        'Strictly budgeted tag count to avoid shadow-banning',
      ],
    },
  ],
  synergy: {
    eyebrow: 'THE 4-TOUCHPOINT ENGINE',
    title: 'How Instagram Coordinates With Other Channels',
    subtitle:
      'Instagram drives visual discovery, while Google, WhatsApp, and print capture the conversion.',
    channels: [
      {
        channel: 'Instagram',
        role: 'Visual Discovery',
        outputDescription: 'Generates neighborhood interest and showcases fresh bakes or new arrivals.',
      },
      {
        channel: 'Google Business',
        role: 'Search Capture',
        outputDescription: 'Reinforces the same deal for customers searching nearby map listings.',
      },
      {
        channel: 'WhatsApp',
        role: 'Direct Conversion',
        outputDescription: 'Sends direct invitation message to VIP customers who missed the social feed.',
      },
      {
        channel: 'In-Store Print',
        role: 'Counter Confirmation',
        outputDescription: 'Greets walk-ins with table tents verifying the exact Instagram special.',
      },
    ],
  },
  playbook: [
    {
      step: 1,
      trigger: 'New Batch or Item Arrives',
      action: 'Enter the item details into StreetCraft and choose Instagram focus.',
      outcome: 'Receive Reel hook, feed caption, and 3-frame Story prompt in 15 seconds.',
    },
    {
      step: 2,
      trigger: 'Quick Staff Capture',
      action: 'Staff films 3 quick clips following the Story framework and posts to Instagram.',
      outcome: 'Followers and local explorer feeds see the update within minutes.',
    },
    {
      step: 3,
      trigger: 'Customer Arrives',
      action: 'Customer mentions the Instagram Reel at the billing counter.',
      outcome: 'Redeems the offer shown on the synchronized counter card.',
    },
    {
      step: 4,
      trigger: 'Log Campaign Performance',
      action: 'Save the asset set to your store campaign history for future seasonal replays.',
      outcome: 'Builds a permanent library of high-performing visual hooks.',
    },
  ],
  closingCta: {
    eyebrow: 'START LOCAL MARKETING',
    title: 'Turn Social Views Into Counter Walk-Ins',
    description:
      'Generate your first coordinated Instagram, Google Business, WhatsApp, and print campaign pack in under 60 seconds.',
    primaryCta: {
      label: 'Try Free Campaign Tool',
      href: '/free-tool',
    },
    secondaryCta: {
      label: 'View Subscription Pricing',
      href: '/pricing',
    },
  },
};
