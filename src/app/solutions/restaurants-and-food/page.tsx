import type { Metadata } from 'next';
import { ComingSoonView } from '../../components/ComingSoonView';

export const metadata: Metadata = {
  title: 'Marketing for Restaurants, Bistros & Quick-Service Eateries — StreetCraft',
  description: 'Drive mid-week dinner bookings, promote regional festival feasts, and pack weekend dining rooms.',
};

export default function RestaurantsAndFoodSolutionPage() {
  return (
    <ComingSoonView
      category="BUSINESS SOLUTION"
      title="Restaurants &amp; Dining Rooms"
      subtitle="Turn Tuesday night quiet tables into buzzing family dining rooms."
      description="StreetCraft helps restaurants, bistros, and regional culinary kitchens eliminate table downtime with multi-channel festival platters, chef specials, and weekend booking campaigns."
      highlights={[
        {
          title: 'Mid-Week Dining Boosters',
          desc: '2-course dinner pairings, complimentary dessert promotions, and family feast platters that activate neighborhood diners on slow Tuesdays & Wednesdays.',
        },
        {
          title: 'Festival Feast & Thali Menus',
          desc: 'Automated campaigns for national and regional Indian festivals (Pongal, Diwali, Eid, Onam, Holi) aligned with local culinary traditions.',
        },
        {
          title: 'Weekend Group Table Promos',
          desc: 'Coordinated Google updates and counter cards designed to drive advance table reservations for Saturday & Sunday lunches.',
        },
      ]}
    />
  );
}
