import type { TouchpointEditorialContent } from '../types';

export const whatsappContent: TouchpointEditorialContent = {
  category: 'CUSTOMER TOUCHPOINT',
  metadata: {
    title: 'WhatsApp Marketing for Physical Storefronts — StreetCraft',
    description:
      'High-conversion direct messages for VIP customer lists, neighborhood broadcasts, and instant counter flash redemptions.',
    ogTitle: 'WhatsApp Marketing for Physical Stores — StreetCraft',
    ogDescription:
      'Direct, formatted WhatsApp messages with bold headers, urgency windows, and clean counter redemption codes.',
  },
  eyebrow: 'DIRECT VIP MESSAGING',
  title: 'WhatsApp Storefront Broadcasts',
  tagline: 'Reach your best regular customers directly with high-conversion broadcast drops.',
  description:
    'WhatsApp has near 100% open rates, but spammy text blocks get muted. StreetCraft structures formatted broadcast drops with bold headlines, bulleted details, limited-time windows, and one-click redemption triggers.',
  metrics: [
    {
      value: 'Direct Channel',
      label: 'High Open Rates',
      sublabel: 'Reaches customers immediately on their primary messaging app.',
    },
    {
      value: 'Flash Windows',
      label: 'Time-Sensitive Urgency',
      sublabel: 'Engineered for same-day quiet hours and fresh batch drops.',
    },
    {
      value: 'Bold Formatting',
      label: 'Clean Text Hierarchy',
      sublabel: 'Formatted with native WhatsApp bolding, lists, and spacing.',
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
    title: 'Deconstructing a StreetCraft WhatsApp Broadcast',
    description:
      'Formatted natively for WhatsApp with clear scannability, urgent timing, and frictionless redemption.',
    previewTitle: 'WhatsApp Broadcast Message Format',
    previewType: 'whatsapp',
    items: [
      {
        badge: 'HOOK & SALUTATION',
        label: 'VIP Community Greeting',
        text: '*[VIP ALERT: Fresh Batch Just Pulled]* 🥐\nHey Indiranagar neighbors!',
        note: 'Bolds the core announcement for instant reading in message notifications.',
      },
      {
        badge: 'OFFER MECHANICS',
        label: 'Bullet Points & Savings',
        text: '• Specialty Sourdough Loaves: Pulled fresh at 3:00 PM\n• Secret Regular Perk: Free espresso with any loaf today\n• Valid: Today only, 3:00 PM – 6:00 PM',
        note: 'Bullet points ensure key details and time limits are understood in under 5 seconds.',
      },
      {
        badge: 'REDEMPTION CODE',
        label: 'Counter Verification',
        text: 'Show this message at the counter or reply *"HOLD ONE"* to reserve your loaf.',
        note: 'Removes friction and allows customers to reserve directly.',
      },
    ],
  },
  capabilities: [
    {
      tag: 'FLASH DROPS',
      title: 'Time-Bound Urgency Messaging',
      description:
        'Ideal for filling slow 3 PM afternoons or moving fresh evening batches. WhatsApp broadcasts create instantaneous local response when time is limited.',
      bulletPoints: [
        'Strict expiration hours to drive immediate visits',
        'Direct "Reply to Reserve" options for premium stock',
        'Concise formatting that avoids wall-of-text fatigue',
      ],
    },
    {
      tag: 'COMMUNITY FORMATS',
      title: 'Broadcast & Community Group Ready',
      description:
        'Crafted for your VIP broadcast lists, WhatsApp Business channels, and neighborhood housing society groups without feeling like generic marketing spam.',
      bulletPoints: [
        'Friendly neighborhood tone matching your store personality',
        'Native formatting using WhatsApp markdown (bolding, lists)',
        'Zero emoji clutter or broken formatting',
      ],
    },
    {
      tag: 'ZERO OVERHEAD',
      title: 'One-Click Direct Copy',
      description:
        'StreetCraft copies directly to your clipboard with exact WhatsApp markdown formatting intact, ready to paste into WhatsApp Web or Business App in 5 seconds.',
      bulletPoints: [
        'Preserves all bolding (*text*) and list linebreaks',
        'Tested across iOS and Android WhatsApp clients',
        'Includes store address and landmark directions',
      ],
    },
  ],
  synergy: {
    eyebrow: 'THE 4-TOUCHPOINT ENGINE',
    title: 'How WhatsApp Coordinates With Other Channels',
    subtitle:
      'WhatsApp delivers rapid response from existing regulars while public channels attract new faces.',
    channels: [
      {
        channel: 'WhatsApp',
        role: 'VIP Loyalty',
        outputDescription: 'Activates existing regulars and VIP list members with exclusive perks.',
      },
      {
        channel: 'Google Business',
        role: 'Search Intent',
        outputDescription: 'Picks up non-subscribers searching for nearby stores on Google Maps.',
      },
      {
        channel: 'Instagram',
        role: 'Visual Proof',
        outputDescription: 'Shares behind-the-scenes video proof of the batch being prepared.',
      },
      {
        channel: 'In-Store Print',
        role: 'Counter Match',
        outputDescription: 'Ensures counter staff recognize the WhatsApp secret code instantly.',
      },
    ],
  },
  playbook: [
    {
      step: 1,
      trigger: 'Surplus Bakes or Open Salon Slots',
      action: 'Generate a WhatsApp broadcast focused on immediate reservation.',
      outcome: 'Receive formatted message with bold time limit in 10 seconds.',
    },
    {
      step: 2,
      trigger: 'Dispatch to VIP List',
      action: 'Paste and send to your store’s WhatsApp broadcast list or community group.',
      outcome: 'Delivered directly to the phones of your most loyal patrons.',
    },
    {
      step: 3,
      trigger: 'Reserve & Walk In',
      action: 'Customers reply to reserve items or walk in within the hour.',
      outcome: 'Fills the quiet afternoon window with verified paying customers.',
    },
    {
      step: 4,
      trigger: 'Redemption at Register',
      action: 'Counter staff checks the message and applies the synchronized perk.',
      outcome: 'Zero confusion or staff training friction.',
    },
  ],
  closingCta: {
    eyebrow: 'START LOCAL MARKETING',
    title: 'Mobilize Your Regulars in Minutes',
    description:
      'Generate your first coordinated WhatsApp, Instagram, Google Business, and print campaign pack in under 60 seconds.',
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
