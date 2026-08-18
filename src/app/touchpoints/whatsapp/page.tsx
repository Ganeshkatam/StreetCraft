import type { Metadata } from 'next';
import { whatsappContent } from '../../../content/touchpoints/whatsapp';
import { WhatsAppTouchpointView } from './WhatsAppTouchpointView';

export const metadata: Metadata = {
  title: whatsappContent.metadata.title,
  description: whatsappContent.metadata.description,
  openGraph: {
    title: whatsappContent.metadata.ogTitle,
    description: whatsappContent.metadata.ogDescription,
  },
};

export default function WhatsAppTouchpointPage() {
  return <WhatsAppTouchpointView content={whatsappContent} />;
}
