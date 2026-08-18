import type { Metadata } from 'next';
import { instagramContent } from '../../../content/touchpoints/instagram';
import { InstagramTouchpointView } from './InstagramTouchpointView';

export const metadata: Metadata = {
  title: instagramContent.metadata.title,
  description: instagramContent.metadata.description,
  openGraph: {
    title: instagramContent.metadata.ogTitle,
    description: instagramContent.metadata.ogDescription,
  },
};

export default function InstagramTouchpointPage() {
  return <InstagramTouchpointView content={instagramContent} />;
}
