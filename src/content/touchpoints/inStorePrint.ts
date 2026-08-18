import type { TouchpointEditorialContent } from '../types';

export const inStorePrintContent: TouchpointEditorialContent = {
  category: 'CUSTOMER TOUCHPOINT',
  metadata: {
    title: 'In-Store Print & Counter Signage — StreetCraft',
    description:
      'High-contrast printable table tents, A4 counter signs, and QR redemption posters generated automatically for walk-in stores.',
    ogTitle: 'In-Store Print & Counter Signage — StreetCraft',
    ogDescription:
      'Print-ready counter cards, table tents, and QR display copy formatted for immediate in-store conversion.',
  },
  eyebrow: 'PHYSICAL POINT-OF-SALE',
  title: 'In-Store Print & Counter Proofs',
  tagline: 'Connect online marketing directly to your physical counter with print-ready signage.',
  description:
    'A campaign fails if walk-in customers cannot see the offer at your register. StreetCraft automatically formats high-contrast printable table tents, A4 counter cards, and chalkboard text matching your digital campaigns.',
  metrics: [
    {
      value: 'Print-Ready',
      label: 'Standard Paper Formats',
      sublabel: 'Formatted cleanly for A4, A5, and table tent acrylic stands.',
    },
    {
      value: 'High-Contrast',
      label: 'Readable at 6 Feet',
      sublabel: 'Structured typography for fast counter reading and order upselling.',
    },
    {
      value: 'Zero Friction',
      label: 'Immediate Staff Alignment',
      sublabel: 'Staff sees the exact rules and redemption terms printed right on the stand.',
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
    title: 'Deconstructing a StreetCraft In-Store Print Card',
    description:
      'Designed with stark visual hierarchy, legible typography, and clear terms for counter displays and chalkboard menus.',
    previewTitle: 'A5 Counter Card / Table Tent Layout',
    previewType: 'print',
    items: [
      {
        badge: 'HEADLINE (DISPLAY)',
        label: 'Promotional Header',
        text: 'TODAY’S AFTERNOON SPECIAL (3 PM – 6 PM)',
        note: 'Bold uppercase display font readable from across the register.',
      },
      {
        badge: 'COMBO DETAILS',
        label: 'Offer Breakdown & Pricing',
        text: 'Order Any Single-Origin Pour-Over & Enjoy A Warm Cinnamon Roll On Us',
        note: 'Clear, concise product pairings with zero ambiguous discount asterisks.',
      },
      {
        badge: 'STAFF & QR NOTE',
        label: 'Verification & Terms',
        text: 'Scan QR at counter or mention "AFTERNOON RESET" to barista. Valid for dine-in & takeaway.',
        note: 'Provides direct instructions for both customer and billing cashier.',
      },
    ],
  },
  capabilities: [
    {
      tag: 'STANDARD SIZES',
      title: 'A4, A5 & Table Tent Presets',
      description:
        'StreetCraft formats copy specifically to fit standard counter display acrylic stands, table talkers, and clipboard registers without awkward line wrapping.',
      bulletPoints: [
        'Formatted for standard desk and counter acrylic stands',
        'Clean hierarchy that works on black-and-white office printers',
        'Chalkboard-ready bulleted scripts for floor staff',
      ],
    },
    {
      tag: 'STAFF ALIGNMENT',
      title: 'Eliminates Cashier Confusion',
      description:
        'When customers walk in asking about a social media post, counter staff shouldn’t be caught unaware. In-store print cards keep the whole shift aligned.',
      bulletPoints: [
        'Clear terms of redemption printed on the back/bottom',
        'Specific validity hours clearly stated',
        'Zero ambiguity regarding items included in the promo',
      ],
    },
    {
      tag: 'UP-SELL ENGINE',
      title: 'Countertop Upselling at Checkout',
      description:
        'Place table tents on dining tables or checkout counters to turn a single coffee into a high-margin pastry pairing before the customer pays.',
      bulletPoints: [
        'Sensory descriptions that stimulate impulse add-ons',
        'Seasonal specials displayed right at point of decision',
        'Fast one-click export to printable text format',
      ],
    },
  ],
  synergy: {
    eyebrow: 'THE 4-TOUCHPOINT ENGINE',
    title: 'How In-Store Print Coordinates With Other Channels',
    subtitle:
      'Physical print is the anchor that guarantees your digital promotions actually convert at the register.',
    channels: [
      {
        channel: 'In-Store Print',
        role: 'Point of Sale',
        outputDescription: 'Greets walk-ins at the door and counter with the verified promotion.',
      },
      {
        channel: 'Google Business',
        role: 'Map Intent',
        outputDescription: 'Brings new searchers from the street into your physical premises.',
      },
      {
        channel: 'Instagram',
        role: 'Social Awareness',
        outputDescription: 'Shows followers the visual imagery of the same counter item.',
      },
      {
        channel: 'WhatsApp',
        role: 'Direct VIPs',
        outputDescription: 'Invites regulars to redeem the printed special during target hours.',
      },
    ],
  },
  playbook: [
    {
      step: 1,
      trigger: 'Campaign Pack Created',
      action: 'Generate campaign pack in StreetCraft and select In-Store Print format.',
      outcome: 'Receive formatted A4/A5 layout script with clear display hierarchy.',
    },
    {
      step: 2,
      trigger: 'Print or Chalkboard',
      action: 'Print on standard office paper or write onto the entry chalkboard.',
      outcome: 'Position on counter stand or table display in 2 minutes.',
    },
    {
      step: 3,
      trigger: 'Customer Orders',
      action: 'Customer spots the table tent while seated or waiting in line.',
      outcome: 'Orders the featured combo before paying at the register.',
    },
    {
      step: 4,
      trigger: 'Shift Wrap-Up',
      action: 'Remove or swap card when promotion window concludes.',
      outcome: 'Clean operational discipline with zero expired offers left out.',
    },
  ],
  closingCta: {
    eyebrow: 'START LOCAL MARKETING',
    title: 'Complete Your Storefront Marketing Loop',
    description:
      'Generate your first coordinated In-Store Print, Google Business, Instagram, and WhatsApp campaign pack in under 60 seconds.',
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
