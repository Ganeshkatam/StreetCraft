/**
 * StreetCraft Edge-Case Verification Suite
 * Tests campaign generation across non-cafe categories, missing profile fields, and edge-case offers.
 */

import { generateCampaignPack } from '../src/engine/campaignEngine';
import { generateLocalTags } from '../src/engine/rules';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

console.log('================================================================');
console.log('STREETCRAFT EDGE-CASE & NON-CAFE TEST SUITE');
console.log('================================================================\n');

// Test 1: Category-aware Local Tags
console.log('--- TEST 1: Category-Aware Local Tags ---');
const salonTags = generateLocalTags('Indiranagar', 'Bengaluru', 'Salon & Wellness Studio');
assert(salonTags.includes('#Indiranagar'), 'Salon tags include neighborhood');
assert(salonTags.includes('#BengaluruSalon') || salonTags.includes('#SelfCare'), 'Salon tags include salon-specific tag');
assert(!salonTags.some(t => t.toLowerCase().includes('cafe') || t.toLowerCase().includes('coffee')), 'Salon tags contain zero cafe/coffee tags');

const bakeryTags = generateLocalTags('Bandra', 'Mumbai', 'Bakery & Patisserie');
assert(bakeryTags.includes('#FreshBakes') || bakeryTags.includes('#MumbaiBakes'), 'Bakery tags include bakery-specific tags');
assert(!bakeryTags.some(t => t.toLowerCase().includes('cafe')), 'Bakery tags contain zero generic cafe tags');

const boutiqueTags = generateLocalTags('JubileeHills', 'Hyderabad', 'Retail Boutique');
assert(boutiqueTags.includes('#StoreFinds') || boutiqueTags.includes('#HyderabadShopping'), 'Boutique tags include shopping tags');

// Test 2: Non-Cafe Business (Salon with no discount offer)
console.log('\n--- TEST 2: Salon & Wellness Studio (Event / No Discount) ---');
const salonPack = generateCampaignPack(
  {
    businessId: 'biz_salon',
    name: 'Aura Hair & Skin Studio',
    category: 'Salon & Wellness Studio',
    neighborhood: 'Koramangala',
    city: 'Bengaluru',
    landmarks: 'Near Sony World Signal',
    targetCustomer: 'Working professionals and neighborhood residents',
    signatureItems: 'Keratin hair therapy and organic facials',
    styleVoice: 'Relaxing and professional',
    slowHours: 'Tuesdays & Wednesdays, 11 AM - 3 PM',
    defaultOffer: 'Midweek Scalp Massage Perk',
    avgTicketINR: 1200,
    phoneWhatsApp: '+91 98765 43210',
    updatedAt: new Date().toISOString(),
  },
  {
    type: 'WEEKDAY_BOOST',
    objective: 'MORE_WALK_INS',
    audience: 'Working professionals and residents',
    offer: {
      title: 'Midweek Glow Session',
      description: 'Complimentary scalp massage with any hair therapy service',
      value: '',
      terms: 'Prior booking recommended. One per customer.',
    },
    schedule: {
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 5 * 86400000).toISOString(),
      timingLabel: 'Tue–Wed, 11:00 AM – 3:00 PM',
    },
  }
);

assert(salonPack.validationStatus === 'VALID', 'Salon pack is valid');
assert(!salonPack.outputs.googleBusiness.body.toLowerCase().includes('coffee'), 'Salon Google update does not invent coffee');
assert(!salonPack.outputs.googleBusiness.body.toLowerCase().includes('wi-fi'), 'Salon Google update does not invent Wi-Fi');
assert(salonPack.outputs.googleBusiness.body.includes('Keratin hair therapy and organic facials'), 'Salon Google update includes exact signature services');
assert(salonPack.outputs.googleBusiness.body.includes('Terms: Prior booking recommended'), 'Salon Google update preserves exact terms');
assert(salonPack.outputs.whatsapp.broadcastMessage.includes('Aura Hair & Skin Studio'), 'Salon WhatsApp broadcast preserves business name');

// Test 3: Retail Boutique with No Signature Items & No Quiet Hours
console.log('\n--- TEST 3: Retail Boutique (Missing Signature Items & No Quiet Hours) ---');
const boutiquePack = generateCampaignPack(
  {
    businessId: 'biz_boutique',
    name: 'Silk & Thread Boutique',
    category: 'Retail Boutique',
    neighborhood: 'Indiranagar',
    city: 'Bengaluru',
    landmarks: '',
    targetCustomer: 'Fashion enthusiasts and shoppers',
    signatureItems: '',
    styleVoice: 'Artisanal and refined',
    slowHours: '',
    defaultOffer: '',
    avgTicketINR: 2500,
    phoneWhatsApp: '',
    updatedAt: new Date().toISOString(),
  },
  {
    type: 'WEEKEND_MAGNET',
    objective: 'WEEKEND_CROWD',
    audience: 'Shoppers and fashion enthusiasts',
    offer: {
      title: 'Handloom Weekend Showcase',
      description: 'Exclusive preview of our new handwoven summer collection',
      value: 'Summer Preview',
      terms: 'While stocks last',
    },
    schedule: {
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 3 * 86400000).toISOString(),
      timingLabel: 'Saturday & Sunday',
    },
  }
);

assert(boutiquePack.validationStatus === 'VALID', 'Boutique pack is valid');
assert(!boutiquePack.outputs.googleBusiness.body.includes('Featuring our signature .'), 'Missing signature items handles grammar cleanly without dangling dots');
assert(boutiquePack.outputs.googleBusiness.headline.includes('Silk & Thread Boutique in Indiranagar'), 'Headline formats cleanly');
assert(boutiquePack.outputs.instagram.storyFrames[0].includes('WEEKEND SPECIAL'), 'Story frame formats cleanly');

// Test 4: Business with Missing Neighborhood and City
console.log('\n--- TEST 4: Missing Neighborhood and City ---');
const unlocatedPack = generateCampaignPack(
  {
    businessId: 'biz_unlocated',
    name: 'Corner Crust Bakery',
    category: 'Bakery',
    neighborhood: '',
    city: '',
    landmarks: '',
    targetCustomer: '',
    signatureItems: 'Sourdough loaves and croissants',
    styleVoice: '',
    slowHours: '',
    defaultOffer: '',
    avgTicketINR: 300,
    phoneWhatsApp: '',
    updatedAt: new Date().toISOString(),
  },
  {
    type: 'MENU_LAUNCH',
    objective: 'MORE_WALK_INS',
    audience: 'Local foodies',
    offer: {
      title: 'Cardamom Cruffin Drop',
      description: 'Fresh cardamom cruffins baked every morning at 8 AM',
      value: 'Fresh Drop',
      terms: '',
    },
    schedule: {
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 5 * 86400000).toISOString(),
      timingLabel: 'Daily from 8 AM',
    },
  }
);

assert(unlocatedPack.validationStatus === 'VALID', 'Unlocated pack is valid');
assert(!unlocatedPack.outputs.googleBusiness.headline.includes(' at Corner Crust Bakery in '), 'Headline avoids trailing "in" when neighborhood is missing');
assert(unlocatedPack.outputs.googleBusiness.body.includes('our store'), 'Falls back to "our store" cleanly');

// Test 5: Offer with Long Terms and Conditions
console.log('\n--- TEST 5: Long Terms and Conditions ---');
const longTermsPack = generateCampaignPack(
  {
    businessId: 'biz_bistro',
    name: 'The Bistro Table',
    category: 'Restaurant',
    neighborhood: 'Fort',
    city: 'Mumbai',
    landmarks: 'Opposite Kala Ghoda Cafe',
    targetCustomer: 'Food lovers and dining groups',
    signatureItems: 'Wood-fired pizzas and fresh pastas',
    styleVoice: 'Warm and Italian-inspired',
    slowHours: 'Mon-Thu, 3-6 PM',
    defaultOffer: 'Complimentary Dessert',
    avgTicketINR: 900,
    phoneWhatsApp: '+91 98200 12345',
    updatedAt: new Date().toISOString(),
  },
  {
    type: 'WEEKDAY_BOOST',
    objective: 'MORE_WALK_INS',
    audience: 'Office professionals and dining groups',
    offer: {
      title: 'Afternoon Pasta Pairing',
      description: 'Buy one pasta, get a complimentary dessert',
      value: 'Complimentary Dessert',
      terms: 'Dine-in only. Maximum one redemption per table. Not combinable with any other discount or ongoing promotion.',
    },
    schedule: {
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 4 * 86400000).toISOString(),
      timingLabel: 'Mon–Thu, 3 PM – 6 PM',
    },
  }
);

assert(longTermsPack.validationStatus === 'VALID', 'Long terms pack is valid');
assert(longTermsPack.outputs.googleBusiness.body.includes('Dine-in only. Maximum one redemption per table.'), 'Exact terms preserved');
assert(longTermsPack.outputs.googleBusiness.body.length <= 1500, 'Google Business output conforms to max character limits');

console.log('\n================================================================');
console.log(`EDGE-CASE SUITE COMPLETED: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
}
