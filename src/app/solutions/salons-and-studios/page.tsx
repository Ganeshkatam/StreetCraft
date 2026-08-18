import type { Metadata } from 'next';
import { ComingSoonView } from '../../components/ComingSoonView';

export const metadata: Metadata = {
  title: 'Marketing for Salons, Spas & Wellness Studios — StreetCraft',
  description: 'Fill open chair slots on weekday mornings and launch seasonal grooming packages.',
};

export default function SalonsAndStudiosSolutionPage() {
  return (
    <ComingSoonView
      category="BUSINESS SOLUTION"
      title="Salons, Spas &amp; Wellness Studios"
      subtitle="Fill empty weekday appointment chairs and package seasonal treatments."
      description="StreetCraft helps salon and spa owners convert idle mid-day hours into high-margin service bookings with targeted weekday pamper packages, bridal season previews, and festive grooming alerts."
      highlights={[
        {
          title: 'Weekday Chair Fillers',
          desc: '11:00 AM – 3:00 PM haircut, manicure, and facial combo promotions targeted at neighborhood residents and flexible workers.',
        },
        {
          title: 'Festival & Wedding Grooming Drops',
          desc: 'Timely festive glow-up packages timed precisely with major holiday calendars and wedding seasons.',
        },
        {
          title: 'VIP Re-Booking Prompts',
          desc: 'WhatsApp scripts encouraging loyal clients to lock in appointments before busy weekend rushes.',
        },
      ]}
    />
  );
}
