import type { Metadata } from 'next';
import { ComingSoonView } from '../../components/ComingSoonView';

export const metadata: Metadata = {
  title: 'In-Store Physical Prints & Counter Cards — StreetCraft',
  description: 'Design print-ready A5 flyers, table tents, and counter cards formatted for standard desk printers.',
};

export default function InStorePrintTouchpointPage() {
  return (
    <ComingSoonView
      category="CUSTOMER TOUCHPOINT"
      title="In-Store Physical Prints"
      subtitle="Close the loop where transactions happen: right at the register and customer tables."
      description="StreetCraft generates clean, high-contrast, print-ready layouts formatted for standard A4 and A5 desk printers—turning passing walk-ins into repeat buyers with zero design agency overhead."
      highlights={[
        {
          title: 'High-Contrast Typography',
          desc: 'Large headline sizing, crisp secondary copy, and clear pricing terms readable from 6 feet away.',
        },
        {
          title: 'Direct Counter QR Integration',
          desc: 'Prominent QR frame placeholders connecting physical visitors directly to your WhatsApp list or Google review page.',
        },
        {
          title: 'Standard Paper Formats',
          desc: 'Formatted to print cleanly in black-and-white or color on standard home/store inkjet and laser printers.',
        },
      ]}
    />
  );
}
