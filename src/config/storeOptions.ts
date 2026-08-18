import { EditFieldOption } from '../app/user/components/EditFieldModal';

// Category classification helper
export type BusinessCategoryGroup =
  | 'cafe_bakery'
  | 'dining_restaurant'
  | 'salon_spa'
  | 'boutique_retail'
  | 'fitness_gym'
  | 'general';

export function getCategoryGroup(category?: string | null): BusinessCategoryGroup {
  if (!category) return 'general';
  const c = category.toLowerCase();
  if (c.includes('cafe') || c.includes('coffee') || c.includes('bakery') || c.includes('patisserie') || c.includes('dessert') || c.includes('tea') || c.includes('sweets')) {
    return 'cafe_bakery';
  }
  if (c.includes('restaurant') || c.includes('dining') || c.includes('pizzeria') || c.includes('bites') || c.includes('bar') || c.includes('pub') || c.includes('taproom') || c.includes('fast casual')) {
    return 'dining_restaurant';
  }
  if (c.includes('salon') || c.includes('spa') || c.includes('grooming') || c.includes('barber') || c.includes('beauty')) {
    return 'salon_spa';
  }
  if (c.includes('boutique') || c.includes('retail') || c.includes('clothing') || c.includes('apparel') || c.includes('jewelry') || c.includes('jewellery') || c.includes('fashion') || c.includes('lifestyle')) {
    return 'boutique_retail';
  }
  if (c.includes('fitness') || c.includes('gym') || c.includes('yoga') || c.includes('movement') || c.includes('studio') || c.includes('sports')) {
    return 'fitness_gym';
  }
  return 'general';
}

// ----------------------------------------------------------------------------
// 1. DEFAULT PROMOTIONAL OFFERS (Category-Based)
// ----------------------------------------------------------------------------
const CAFE_OFFER_OPTIONS: EditFieldOption[] = [
  {
    value: 'Complimentary Beverage with any Dessert or Main',
    label: 'Complimentary Beverage with any Dessert or Main',
    description: 'Free artisan coffee, tea, or refreshing cooler with qualifying orders',
  },
  {
    value: 'Flat 20% Off During Weekday Afternoon Slump (2 PM – 5 PM)',
    label: 'Flat 20% Off During Weekday Afternoon Slump (2 PM – 5 PM)',
    description: 'Special afternoon discount to boost laptop workers and quiet hours',
  },
  {
    value: 'Buy 1 Get 1 (BOGO) on Signature Coffees & Brews',
    label: 'Buy 1 Get 1 (BOGO) on Signature Coffees & Brews',
    description: 'Double the value on cold brews, signature roasts, and seasonal coolers',
  },
  {
    value: 'Free Artisanal Cookie or Pastry with Any Coffee Order',
    label: 'Free Artisanal Cookie or Pastry with Any Coffee Order',
    description: 'Delight walk-in patrons with a fresh morning or evening sweet bake',
  },
  {
    value: 'Flat ₹100 Off on Minimum Bill of ₹499',
    label: 'Flat ₹100 Off on Minimum Bill of ₹499',
    description: 'Incentivize higher ticket sizes and multi-item group orders',
  },
  {
    value: 'Weekend Brunch Combo: Coffee + Meal at Special Price',
    label: 'Weekend Brunch Combo: Coffee + Meal at Special Price',
    description: 'Curated morning bundle combining hero food dishes and fresh brew',
  },
  {
    value: '10% Loyalty Credit / Cashback on Next Visit',
    label: '10% Loyalty Credit / Cashback on Next Visit',
    description: 'Drive repeat visits and build loyal neighborhood regulars',
  },
];

const DINING_OFFER_OPTIONS: EditFieldOption[] = [
  {
    value: 'Complimentary Chef Starter with Main Course Order',
    label: 'Complimentary Chef Starter with Main Course Order',
    description: 'Free signature appetizer with dine-in entrees above a threshold',
  },
  {
    value: 'Happy Hours: 1+1 on Craft Mocktails & Beverages',
    label: 'Happy Hours: 1+1 on Craft Mocktails & Beverages',
    description: 'Boost evening drink and starter orders before dinner rush',
  },
  {
    value: '15% Early Bird Discount on Table Bookings before 8 PM',
    label: '15% Early Bird Discount on Table Bookings before 8 PM',
    description: 'Fill early evening tables and reduce peak 9 PM waiting queues',
  },
  {
    value: 'Flat ₹200 Off on Family Dine-In Bill above ₹1,199',
    label: 'Flat ₹200 Off on Family Dine-In Bill above ₹1,199',
    description: 'High-value promotion designed for family tables and group dinners',
  },
  {
    value: 'Free Dessert Platter for Group Reservations (4+ Guests)',
    label: 'Free Dessert Platter for Group Reservations (4+ Guests)',
    description: 'Incentivize birthday parties, celebrations, and team outings',
  },
  {
    value: 'Weekend Family Feast Combo at Fixed Bundle Price',
    label: 'Weekend Family Feast Combo at Fixed Bundle Price',
    description: 'Curated 3-course tasting menu offering unbeatable value',
  },
];

const SALON_OFFER_OPTIONS: EditFieldOption[] = [
  {
    value: 'Free Hair Spa / Scalp Treatment with Haircut & Styling',
    label: 'Free Hair Spa / Scalp Treatment with Haircut & Styling',
    description: 'High-perceived value add-on that elevates standard haircuts',
  },
  {
    value: 'Flat 25% Off on Weekday Midday Slots (12 PM – 4 PM)',
    label: 'Flat 25% Off on Weekday Midday Slots (12 PM – 4 PM)',
    description: 'Fill quiet daytime salon chairs between morning and evening rush',
  },
  {
    value: 'Complimentary Express Manicure with Facial or Color',
    label: 'Complimentary Express Manicure with Facial or Color',
    description: 'Delight self-care clients with bonus hands & nails pampering',
  },
  {
    value: 'Pre-book Weekend Grooming & Get 15% Off',
    label: 'Pre-book Weekend Grooming & Get 15% Off',
    description: 'Secure advance Saturday and Sunday appointments via WhatsApp',
  },
  {
    value: 'Couple / Duo Grooming Package at Special Price',
    label: 'Couple / Duo Grooming Package at Special Price',
    description: 'Complete makeover or styling package for two people',
  },
  {
    value: 'First-Time Client Welcome Voucher: ₹300 Off',
    label: 'First-Time Client Welcome Voucher: ₹300 Off',
    description: 'Lower friction for neighborhood new walk-ins and local trials',
  },
];

const RETAIL_OFFER_OPTIONS: EditFieldOption[] = [
  {
    value: 'Flat ₹500 Off on Purchases above ₹2,499',
    label: 'Flat ₹500 Off on Purchases above ₹2,499',
    description: 'Accelerate basket size and incentivise shoppers to cross bill thresholds',
  },
  {
    value: 'Buy 2 Get 1 Free on New Seasonal Arrivals',
    label: 'Buy 2 Get 1 Free on New Seasonal Arrivals',
    description: 'Move fresh inventory rapidly and boost total items per customer',
  },
  {
    value: 'Free Styling Consultation + 10% First Order Voucher',
    label: 'Free Styling Consultation + 10% First Order Voucher',
    description: 'Personalized service to convert casual browsers into lifetime clients',
  },
  {
    value: 'Mid-Season Flash Sale: Flat 30% Off on Selected Racks',
    label: 'Mid-Season Flash Sale: Flat 30% Off on Selected Racks',
    description: 'Limited-time weekend sale to drive urgent in-store footfall',
  },
  {
    value: 'Complimentary Accessory or Gift on Minimum Spend',
    label: 'Complimentary Accessory or Gift on Minimum Spend',
    description: 'Delight premium buyers with an artisan keepsake or matching item',
  },
];

const FITNESS_OFFER_OPTIONS: EditFieldOption[] = [
  {
    value: 'Free 3-Day Workout Pass + Fitness Assessment',
    label: 'Free 3-Day Workout Pass + Fitness Assessment',
    description: 'Zero-risk trial pass with personal trainer consultation',
  },
  {
    value: 'Flat 30% Off on 6-Month or Annual Memberships',
    label: 'Flat 30% Off on 6-Month or Annual Memberships',
    description: 'Lock in long-term recurring revenue with seasonal tier discounts',
  },
  {
    value: 'Bring a Friend Free for Weekend Yoga / HIIT Classes',
    label: 'Bring a Friend Free for Weekend Yoga / HIIT Classes',
    description: 'Leverage member word-of-mouth to bring fresh neighborhood trials',
  },
  {
    value: 'Free 1-on-1 Personal Training Session with Any Plan',
    label: 'Free 1-on-1 Personal Training Session with Any Plan',
    description: 'Kickstart new member onboarding with personalized form coaching',
  },
  {
    value: 'Student & Corporate Group Discount: Flat 20% Off',
    label: 'Student & Corporate Group Discount: Flat 20% Off',
    description: 'Attract local tech parks and college groups in batches',
  },
];

const GENERAL_OFFER_OPTIONS: EditFieldOption[] = [
  {
    value: 'Flat 15% Off on First-Time Neighborhood Orders',
    label: 'Flat 15% Off on First-Time Neighborhood Orders',
    description: 'Welcome new local residents with an attractive trial incentive',
  },
  {
    value: 'Flat ₹150 Off on Purchases above ₹999',
    label: 'Flat ₹150 Off on Purchases above ₹999',
    description: 'Encourage customers to add complementary products to cart',
  },
  {
    value: 'Free Gift / Sample Pack with Store Visit',
    label: 'Free Gift / Sample Pack with Store Visit',
    description: 'Build goodwill and memorable local brand connection',
  },
  {
    value: 'Weekend Special: Buy One Get One 50% Off',
    label: 'Weekend Special: Buy One Get One 50% Off',
    description: 'High-conversion retail promotion for weekend walk-in traffic',
  },
  {
    value: '10% Cashback / Loyalty Points for WhatsApp Members',
    label: '10% Cashback / Loyalty Points for WhatsApp Members',
    description: 'Grow your direct VIP community and recurring customer list',
  },
];

export function getOfferOptionsForCategory(category?: string | null): EditFieldOption[] {
  const group = getCategoryGroup(category);
  switch (group) {
    case 'cafe_bakery':
      return CAFE_OFFER_OPTIONS;
    case 'dining_restaurant':
      return DINING_OFFER_OPTIONS;
    case 'salon_spa':
      return SALON_OFFER_OPTIONS;
    case 'boutique_retail':
      return RETAIL_OFFER_OPTIONS;
    case 'fitness_gym':
      return FITNESS_OFFER_OPTIONS;
    default:
      return GENERAL_OFFER_OPTIONS;
  }
}

// ----------------------------------------------------------------------------
// 2. PRIMARY BUSINESS GOALS (Category-Based)
// ----------------------------------------------------------------------------
const CAFE_GOAL_OPTIONS: EditFieldOption[] = [
  {
    value: 'Fill Slow Afternoon Slump Tables (2 PM – 5 PM)',
    label: 'Fill Slow Afternoon Slump Tables (2 PM – 5 PM)',
    description: 'Boost footfall, laptop workers, and quiet afternoon pastry/coffee sales',
  },
  {
    value: 'Drive Repeat Regulars & Daily Coffee Habits',
    label: 'Drive Repeat Regulars & Daily Coffee Habits',
    description: 'Turn one-time walk-ins into predictable daily or weekly regulars',
  },
  {
    value: 'Promote High-Margin Signature Specialty Brews & Bakes',
    label: 'Promote High-Margin Signature Specialty Brews & Bakes',
    description: 'Highlight artisan pour-overs, croissants, and signature dessert pairings',
  },
  {
    value: 'Boost Weekend Brunch & Group Footfall',
    label: 'Boost Weekend Brunch & Group Footfall',
    description: 'Maximize table turnover and high-margin group bills on Saturdays & Sundays',
  },
  {
    value: 'Expand Direct WhatsApp Takeaway & Bean Orders',
    label: 'Expand Direct WhatsApp Takeaway & Bean Orders',
    description: 'Build a direct ordering channel without marketplace aggregator commissions',
  },
];

const DINING_GOAL_OPTIONS: EditFieldOption[] = [
  {
    value: 'Fill Early Week Dinner Tables (Mon – Wed)',
    label: 'Fill Early Week Dinner Tables (Mon – Wed)',
    description: 'Boost table occupancy and beverage revenue on slower weekday evenings',
  },
  {
    value: 'Drive Advance Table Bookings & Weekend Reservations',
    label: 'Drive Advance Table Bookings & Weekend Reservations',
    description: 'Secure predictable covers and minimize walk-in wait times',
  },
  {
    value: 'Increase Average Bill Size with Pairings & Starters',
    label: 'Increase Average Bill Size with Pairings & Starters',
    description: 'Upsell chef specials, beverage pairings, and dessert platters',
  },
  {
    value: 'Promote Private Parties & Celebration Bookings',
    label: 'Promote Private Parties & Celebration Bookings',
    description: 'Attract birthday dinners, corporate gatherings, and anniversary feasts',
  },
  {
    value: 'Expand Direct WhatsApp Orders & Local Delivery',
    label: 'Expand Direct WhatsApp Orders & Local Delivery',
    description: 'Grow direct customer delivery relationships in the neighborhood radius',
  },
];

const SALON_GOAL_OPTIONS: EditFieldOption[] = [
  {
    value: 'Fill Empty Weekday Appointment Slots (Mon – Thu)',
    label: 'Fill Empty Weekday Appointment Slots (Mon – Thu)',
    description: 'Maximize staff and chair utilization during quiet weekday daytime hours',
  },
  {
    value: 'Turn One-Time Clients into Monthly Package Members',
    label: 'Turn One-Time Clients into Monthly Package Members',
    description: 'Build reliable monthly recurring revenue through grooming subscriptions',
  },
  {
    value: 'Upsell Premium Hair Treatments, Color & Spa Services',
    label: 'Upsell Premium Hair Treatments, Color & Spa Services',
    description: 'Convert standard haircuts into comprehensive premium service tickets',
  },
  {
    value: 'Drive Advance WhatsApp Appointment Bookings',
    label: 'Drive Advance WhatsApp Appointment Bookings',
    description: 'Automate booking confirmations and minimize last-minute cancellations',
  },
];

const RETAIL_GOAL_OPTIONS: EditFieldOption[] = [
  {
    value: 'Accelerate Seasonal Stock & Inventory Turnover',
    label: 'Accelerate Seasonal Stock & Inventory Turnover',
    description: 'Clear previous collection racks quickly to make space for fresh arrivals',
  },
  {
    value: 'Increase Average Basket Size & Multi-Item Purchases',
    label: 'Increase Average Basket Size & Multi-Item Purchases',
    description: 'Cross-sell matching accessories, pairings, and bundle promotions',
  },
  {
    value: 'Drive In-Store Weekend Footfall via WhatsApp Drops',
    label: 'Drive In-Store Weekend Footfall via WhatsApp Drops',
    description: 'Notify neighborhood VIPs about new arrivals and weekend exclusives',
  },
  {
    value: 'Build VIP Customer Loyalty & Repeat Wardrobe Buyers',
    label: 'Build VIP Customer Loyalty & Repeat Wardrobe Buyers',
    description: 'Keep local shoppers coming back every season for lifestyle needs',
  },
];

const FITNESS_GOAL_OPTIONS: EditFieldOption[] = [
  {
    value: 'Convert Drop-in Trials into 6-Month / Annual Members',
    label: 'Convert Drop-in Trials into 6-Month / Annual Members',
    description: 'Maximize conversion rate from first workout session to long-term plan',
  },
  {
    value: 'Fill Off-Peak Midday Class Batches (11 AM – 4 PM)',
    label: 'Fill Off-Peak Midday Class Batches (11 AM – 4 PM)',
    description: 'Utilize studio space efficiently throughout the entire workday',
  },
  {
    value: 'Promote Personal Training & Nutrition Add-ons',
    label: 'Promote Personal Training & Nutrition Add-ons',
    description: 'Increase average revenue per member with high-touch coaching',
  },
  {
    value: 'Reduce Member Churn with Community Challenges',
    label: 'Reduce Member Churn with Community Challenges',
    description: 'Keep members motivated and consistent through monthly fitness goals',
  },
];

const GENERAL_GOAL_OPTIONS: EditFieldOption[] = [
  {
    value: 'Drive Predictable Neighborhood Footfall',
    label: 'Drive Predictable Neighborhood Footfall',
    description: 'Establish strong local awareness and steady weekly customer flow',
  },
  {
    value: 'Build Loyal Repeat Customer Community',
    label: 'Build Loyal Repeat Customer Community',
    description: 'Turn first-time walk-ins into trusted neighborhood regulars',
  },
  {
    value: 'Boost Weekend Sales & Promotional Spikes',
    label: 'Boost Weekend Sales & Promotional Spikes',
    description: 'Capitalize on peak leisure hours and holiday purchasing periods',
  },
  {
    value: 'Expand Direct WhatsApp Customer Channel',
    label: 'Expand Direct WhatsApp Customer Channel',
    description: 'Engage customers directly with announcements, drops, and orders',
  },
];

export function getGoalOptionsForCategory(category?: string | null): EditFieldOption[] {
  const group = getCategoryGroup(category);
  switch (group) {
    case 'cafe_bakery':
      return CAFE_GOAL_OPTIONS;
    case 'dining_restaurant':
      return DINING_GOAL_OPTIONS;
    case 'salon_spa':
      return SALON_GOAL_OPTIONS;
    case 'boutique_retail':
      return RETAIL_GOAL_OPTIONS;
    case 'fitness_gym':
      return FITNESS_GOAL_OPTIONS;
    default:
      return GENERAL_GOAL_OPTIONS;
  }
}

// ----------------------------------------------------------------------------
// 3. TARGET CUSTOMER DEMOGRAPHICS (Category-Based)
// ----------------------------------------------------------------------------
const CAFE_CUSTOMER_OPTIONS: EditFieldOption[] = [
  {
    value: 'Young Professionals & Remote Laptop Workers',
    label: 'Young Professionals & Remote Laptop Workers',
    description: 'Remote workers, coffee meetings, weekday lunch breaks, and evening work sessions',
  },
  {
    value: 'College Students & Gen-Z Social Groups',
    label: 'College Students & Gen-Z Social Groups',
    description: 'Trendy cafe aesthetic seekers, group study sessions, and casual afternoon hangouts',
  },
  {
    value: 'Neighborhood Families & Morning Walkers',
    label: 'Neighborhood Families & Morning Walkers',
    description: 'Morning espresso regulars, breakfast seekers, and weekend family sweet treats',
  },
  {
    value: 'Couples & Casual Date Catchups',
    label: 'Couples & Casual Date Catchups',
    description: 'Cozy ambiance, dessert dates, artisan pairings, and relaxing evening vibes',
  },
];

const DINING_CUSTOMER_OPTIONS: EditFieldOption[] = [
  {
    value: 'Neighborhood Families & Multi-Gen Diners',
    label: 'Neighborhood Families & Multi-Gen Diners',
    description: 'Weekend dinners, festive family lunches, birthdays, and celebrations',
  },
  {
    value: 'Corporate Teams & Working Professionals',
    label: 'Corporate Teams & Working Professionals',
    description: 'Weekday executive lunches, team dinners, and after-work client meals',
  },
  {
    value: 'Couples & Weekend Date-Night Diners',
    label: 'Couples & Weekend Date-Night Diners',
    description: 'Intimate dining experience, crafted cocktails, and weekend date reservations',
  },
  {
    value: 'Foodies & Culinary Experience Seekers',
    label: 'Foodies & Culinary Experience Seekers',
    description: 'Chef tasting menus, authentic flavors, seasonal specials, and viral dishes',
  },
];

const SALON_CUSTOMER_OPTIONS: EditFieldOption[] = [
  {
    value: 'Busy Working Professionals (Quick Grooming)',
    label: 'Busy Working Professionals (Quick Grooming)',
    description: 'Precision haircuts, express styling, beard trims, and lunchtime grooming',
  },
  {
    value: 'Bridal, Groom & Special Event Clients',
    label: 'Bridal, Groom & Special Event Clients',
    description: 'High-ticket makeover packages, hair treatments, and party-ready styling',
  },
  {
    value: 'Self-Care & Wellness Enthusiasts',
    label: 'Self-Care & Wellness Enthusiasts',
    description: 'Regular hair spas, luxury facials, pedicures, and rejuvenating treatments',
  },
  {
    value: 'Neighborhood Regulars & Family Grooming',
    label: 'Neighborhood Regulars & Family Grooming',
    description: 'Dependable monthly haircut schedules for adults, teens, and children',
  },
];

const RETAIL_CUSTOMER_OPTIONS: EditFieldOption[] = [
  {
    value: 'Fashion-Forward Shoppers & Trendsetters',
    label: 'Fashion-Forward Shoppers & Trendsetters',
    description: 'Looking for unique statement pieces, boutique curation, and new arrivals',
  },
  {
    value: 'Festive, Wedding & Occasion Buyers',
    label: 'Festive, Wedding & Occasion Buyers',
    description: 'High-spend customers shopping for celebrations, festivals, and gifts',
  },
  {
    value: 'Everyday Quality & Comfort Shoppers',
    label: 'Everyday Quality & Comfort Shoppers',
    description: 'Seeking durable, comfortable, stylish daily essentials and wardrobe staples',
  },
  {
    value: 'Neighborhood Gift & Lifestyle Browsers',
    label: 'Neighborhood Gift & Lifestyle Browsers',
    description: 'Looking for curated home decor, bespoke gifts, and artisan treasures',
  },
];

const FITNESS_CUSTOMER_OPTIONS: EditFieldOption[] = [
  {
    value: 'Daily Working Professionals Seeking Fitness',
    label: 'Daily Working Professionals Seeking Fitness',
    description: 'Early morning or evening workouts to stay energized and fit alongside busy careers',
  },
  {
    value: 'Fitness Beginners & Transformation Seekers',
    label: 'Fitness Beginners & Transformation Seekers',
    description: 'Looking for structured guidance, personal training, and encouraging community',
  },
  {
    value: 'Yoga, Pilates & Mindful Movement Seekers',
    label: 'Yoga, Pilates & Mindful Movement Seekers',
    description: 'Focusing on flexibility, stress relief, posture correction, and breathwork',
  },
  {
    value: 'Athletes & Heavy Strength Enthusiasts',
    label: 'Athletes & Heavy Strength Enthusiasts',
    description: 'Dedicated weightlifting, functional training, and progressive overload goals',
  },
];

const GENERAL_CUSTOMER_OPTIONS: EditFieldOption[] = [
  {
    value: 'Neighborhood Residents & Local Community',
    label: 'Neighborhood Residents & Local Community',
    description: 'Local residents within 3–5 km radius seeking reliable nearby services',
  },
  {
    value: 'Working Professionals & Commuters',
    label: 'Working Professionals & Commuters',
    description: 'Daily office commuters and remote professionals in the neighborhood',
  },
  {
    value: 'Students & Young Adult Groups',
    label: 'Students & Young Adult Groups',
    description: 'Value-conscious young shoppers and social groups seeking engaging spaces',
  },
  {
    value: 'Families & Weekend Shoppers',
    label: 'Families & Weekend Shoppers',
    description: 'Multi-person households looking for convenient, trustworthy local businesses',
  },
];

export function getTargetCustomerOptionsForCategory(category?: string | null): EditFieldOption[] {
  const group = getCategoryGroup(category);
  switch (group) {
    case 'cafe_bakery':
      return CAFE_CUSTOMER_OPTIONS;
    case 'dining_restaurant':
      return DINING_CUSTOMER_OPTIONS;
    case 'salon_spa':
      return SALON_CUSTOMER_OPTIONS;
    case 'boutique_retail':
      return RETAIL_CUSTOMER_OPTIONS;
    case 'fitness_gym':
      return FITNESS_CUSTOMER_OPTIONS;
    default:
      return GENERAL_CUSTOMER_OPTIONS;
  }
}

// ----------------------------------------------------------------------------
// 4. PEAK OPERATING HOURS (Category-Based)
// ----------------------------------------------------------------------------
const CAFE_PEAK_OPTIONS: EditFieldOption[] = [
  {
    value: 'Morning Coffee Rush (8 AM – 11 AM)',
    label: 'Morning Coffee Rush (8 AM – 11 AM)',
    description: 'Breakfast orders, morning espresso kick, and early work sessions',
  },
  {
    value: 'Evening Teatime & Catchups (4 PM – 7:30 PM)',
    label: 'Evening Teatime & Catchups (4 PM – 7:30 PM)',
    description: 'Post-work coffee breaks, casual friend meetups, and snacks',
  },
  {
    value: 'Weekend Brunch Rush (Sat – Sun 10 AM – 3 PM)',
    label: 'Weekend Brunch Rush (Sat – Sun 10 AM – 3 PM)',
    description: 'Peak leisure hours with high table occupancy and brunch bakes',
  },
  {
    value: 'Late-Night Coffee & Desserts (8 PM – 11 PM)',
    label: 'Late-Night Coffee & Desserts (8 PM – 11 PM)',
    description: 'Post-dinner dessert crowds and late-night social conversations',
  },
];

const DINING_PEAK_OPTIONS: EditFieldOption[] = [
  {
    value: 'Dinner Prime Rush (8 PM – 11 PM)',
    label: 'Dinner Prime Rush (8 PM – 11 PM)',
    description: 'Busiest dining covers of the day with high food and beverage turnover',
  },
  {
    value: 'Weekday Lunch Rush (12:30 PM – 3:30 PM)',
    label: 'Weekday Lunch Rush (12:30 PM – 3:30 PM)',
    description: 'Corporate lunches, quick executive plates, and takeaway orders',
  },
  {
    value: 'Weekend Family Lunch (Sat – Sun 1 PM – 4 PM)',
    label: 'Weekend Family Lunch (Sat – Sun 1 PM – 4 PM)',
    description: 'High-margin family dining tables and celebration bookings',
  },
  {
    value: 'Friday & Saturday Late-Night Rush (8 PM – Midnight)',
    label: 'Friday & Saturday Late-Night Rush (8 PM – Midnight)',
    description: 'Weekend social energy, bar orders, appetizers, and large groups',
  },
];

const SALON_PEAK_OPTIONS: EditFieldOption[] = [
  {
    value: 'Weekend Full Grooming Rush (Sat – Sun 10 AM – 8 PM)',
    label: 'Weekend Full Grooming Rush (Sat – Sun 10 AM – 8 PM)',
    description: 'Continuous back-to-back appointments across all salon stations',
  },
  {
    value: 'Friday Evening Pre-Weekend Slots (4 PM – 8 PM)',
    label: 'Friday Evening Pre-Weekend Slots (4 PM – 8 PM)',
    description: 'Pre-party styling, quick touchups, and weekend prep appointments',
  },
  {
    value: 'Festive & Wedding Season Rush',
    label: 'Festive & Wedding Season Rush',
    description: 'High-demand seasonal weeks with full bridal and makeover bookings',
  },
];

const RETAIL_PEAK_OPTIONS: EditFieldOption[] = [
  {
    value: 'Weekend Shopping Evenings (Sat – Sun 4 PM – 9:30 PM)',
    label: 'Weekend Shopping Evenings (Sat – Sun 4 PM – 9:30 PM)',
    description: 'Prime retail walk-in hours with maximum store browsing and trial room use',
  },
  {
    value: 'Weekday Evening Footfall (6 PM – 9 PM)',
    label: 'Weekday Evening Footfall (6 PM – 9 PM)',
    description: 'Commuters and local residents browsing after work hours',
  },
  {
    value: 'First Payday Weekend of the Month',
    label: 'First Payday Weekend of the Month',
    description: 'Spike in customer purchasing power and high-ticket sales',
  },
];

const FITNESS_PEAK_OPTIONS: EditFieldOption[] = [
  {
    value: 'Early Morning Fitness Rush (6 AM – 9 AM)',
    label: 'Early Morning Fitness Rush (6 AM – 9 AM)',
    description: 'High-intensity morning workout batches before office hours begin',
  },
  {
    value: 'Post-Work Evening Batch (6 PM – 9 PM)',
    label: 'Post-Work Evening Batch (6 PM – 9 PM)',
    description: 'Peak gym floor and group class occupancy after workday wrap-up',
  },
  {
    value: 'Weekend Morning Workshops (8 AM – 11 AM)',
    label: 'Weekend Morning Workshops (8 AM – 11 AM)',
    description: 'Special weekend yoga, spinning, and boot camp community classes',
  },
];

const GENERAL_PEAK_OPTIONS: EditFieldOption[] = [
  {
    value: 'Evening Rush Hours (5 PM – 9 PM)',
    label: 'Evening Rush Hours (5 PM – 9 PM)',
    description: 'Peak neighborhood footfall and walk-in customer volume',
  },
  {
    value: 'Weekend All-Day Rush (11 AM – 9 PM)',
    label: 'Weekend All-Day Rush (11 AM – 9 PM)',
    description: 'Steady leisure and shopping traffic across Saturday and Sunday',
  },
  {
    value: 'Midday Lunch Window (12 PM – 3 PM)',
    label: 'Midday Lunch Window (12 PM – 3 PM)',
    description: 'Midday office and neighborhood shopping peak',
  },
];

export function getPeakHoursOptionsForCategory(category?: string | null): EditFieldOption[] {
  const group = getCategoryGroup(category);
  switch (group) {
    case 'cafe_bakery':
      return CAFE_PEAK_OPTIONS;
    case 'dining_restaurant':
      return DINING_PEAK_OPTIONS;
    case 'salon_spa':
      return SALON_PEAK_OPTIONS;
    case 'boutique_retail':
      return RETAIL_PEAK_OPTIONS;
    case 'fitness_gym':
      return FITNESS_PEAK_OPTIONS;
    default:
      return GENERAL_PEAK_OPTIONS;
  }
}

// ----------------------------------------------------------------------------
// 5. SLOW / QUIET HOURS (Category-Based)
// ----------------------------------------------------------------------------
const CAFE_SLOW_OPTIONS: EditFieldOption[] = [
  {
    value: 'Weekday Afternoons Slump (2 PM – 4:30 PM)',
    label: 'Weekday Afternoons Slump (2 PM – 4:30 PM)',
    description: 'Quiet gap between lunch wrap-up and evening coffee catchups',
  },
  {
    value: 'Early Morning Opening (7 AM – 8:30 AM)',
    label: 'Early Morning Opening (7 AM – 8:30 AM)',
    description: 'Slow initial hour before commuter coffee orders begin',
  },
  {
    value: 'Monday & Tuesday Evenings (6 PM – 8 PM)',
    label: 'Monday & Tuesday Evenings (6 PM – 8 PM)',
    description: 'Slower early-week social outings compared to Thu-Sun',
  },
];

const DINING_SLOW_OPTIONS: EditFieldOption[] = [
  {
    value: 'Late Afternoon Prep Window (3:30 PM – 6:30 PM)',
    label: 'Late Afternoon Prep Window (3:30 PM – 6:30 PM)',
    description: 'Gap between lunch service closing and evening dinner setup',
  },
  {
    value: 'Monday & Tuesday Dinners (7 PM – 9 PM)',
    label: 'Monday & Tuesday Dinners (7 PM – 9 PM)',
    description: 'Quietest dinner nights of the week with lower walk-in covers',
  },
  {
    value: 'Mid-Week Early Lunch (11:30 AM – 12:30 PM)',
    label: 'Mid-Week Early Lunch (11:30 AM – 12:30 PM)',
    description: 'Pre-lunch lull before office workers arrive',
  },
];

const SALON_SLOW_OPTIONS: EditFieldOption[] = [
  {
    value: 'Tuesday & Wednesday Afternoons (1 PM – 4 PM)',
    label: 'Tuesday & Wednesday Afternoons (1 PM – 4 PM)',
    description: 'Lowest footfall window with available staff and empty chairs',
  },
  {
    value: 'Weekday Morning Opening (10 AM – 12 PM)',
    label: 'Weekday Morning Opening (10 AM – 12 PM)',
    description: 'Quiet opening hours before afternoon appointment bookings',
  },
  {
    value: 'Monday Post-Weekend Lull',
    label: 'Monday Post-Weekend Lull',
    description: 'Slow day following intensive weekend grooming volume',
  },
];

const RETAIL_SLOW_OPTIONS: EditFieldOption[] = [
  {
    value: 'Weekday Mornings (11 AM – 2 PM)',
    label: 'Weekday Mornings (11 AM – 2 PM)',
    description: 'Low shopper traffic while customers are working or in school',
  },
  {
    value: 'Midweek Afternoons (2 PM – 5 PM)',
    label: 'Midweek Afternoons (2 PM – 5 PM)',
    description: 'Quiet retail browsing hours before evening footfall starts',
  },
  {
    value: 'Monday Early Week Lull',
    label: 'Monday Early Week Lull',
    description: 'Post-weekend sales dip before weekly inventory restock',
  },
];

const FITNESS_SLOW_OPTIONS: EditFieldOption[] = [
  {
    value: 'Midday Work Hours (11 AM – 4 PM)',
    label: 'Midday Work Hours (11 AM – 4 PM)',
    description: 'Empty gym floor while members are occupied at work',
  },
  {
    value: 'Late Night (9 PM – 10:30 PM)',
    label: 'Late Night (9 PM – 10:30 PM)',
    description: 'Winding down after prime evening workout batches',
  },
  {
    value: 'Sunday Afternoons & Evenings',
    label: 'Sunday Afternoons & Evenings',
    description: 'Rest day for most athletes and gym members',
  },
];

const GENERAL_SLOW_OPTIONS: EditFieldOption[] = [
  {
    value: 'Weekday Afternoons (2 PM – 5 PM)',
    label: 'Weekday Afternoons (2 PM – 5 PM)',
    description: 'Post-lunch quiet period before evening neighborhood traffic',
  },
  {
    value: 'Early Morning Opening Hours (8 AM – 10 AM)',
    label: 'Early Morning Opening Hours (8 AM – 10 AM)',
    description: 'Low initial walk-in volume during store opening',
  },
  {
    value: 'Monday & Tuesday Early Week Lull',
    label: 'Monday & Tuesday Early Week Lull',
    description: 'Quietest days compared to Thursday through Sunday',
  },
];

export function getSlowHoursOptionsForCategory(category?: string | null): EditFieldOption[] {
  const group = getCategoryGroup(category);
  switch (group) {
    case 'cafe_bakery':
      return CAFE_SLOW_OPTIONS;
    case 'dining_restaurant':
      return DINING_SLOW_OPTIONS;
    case 'salon_spa':
      return SALON_SLOW_OPTIONS;
    case 'boutique_retail':
      return RETAIL_SLOW_OPTIONS;
    case 'fitness_gym':
      return FITNESS_SLOW_OPTIONS;
    default:
      return GENERAL_SLOW_OPTIONS;
  }
}

// ----------------------------------------------------------------------------
// 6. PLACEHOLDERS (Category-Based)
// ----------------------------------------------------------------------------
export function getSignatureItemsPlaceholder(category?: string | null): string {
  const group = getCategoryGroup(category);
  switch (group) {
    case 'cafe_bakery':
      return 'e.g. Sourdough Croissant, Iced Sea Salt Latte, Burnt Basque Cheesecake';
    case 'dining_restaurant':
      return 'e.g. Truffle Butter Pasta, Wood-fired Margherita, Smoked Chicken Platter';
    case 'salon_spa':
      return 'e.g. Keratin Hair Spa, Precision Fade, Hydrating Glow Facial';
    case 'boutique_retail':
      return 'e.g. Handcrafted Linen Shirts, Raw Silk Sarees, Minimalist Silver Rings';
    case 'fitness_gym':
      return 'e.g. 1-on-1 Strength Coaching, Weekend Ashtanga Yoga, HIIT Bootcamp';
    default:
      return 'e.g. Signature Products, Bestselling Services & Offerings';
  }
}

// Compatibility exports for backwards compatibility
export const PRIMARY_GOAL_OPTIONS = GENERAL_GOAL_OPTIONS;
export const TARGET_CUSTOMER_OPTIONS = GENERAL_CUSTOMER_OPTIONS;
export const PEAK_HOURS_OPTIONS = GENERAL_PEAK_OPTIONS;
export const SLOW_HOURS_OPTIONS = GENERAL_SLOW_OPTIONS;
export const DEFAULT_OFFER_OPTIONS = GENERAL_OFFER_OPTIONS;
