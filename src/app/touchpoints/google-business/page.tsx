import type { Metadata } from 'next';
import { googleBusinessContent } from '../../../content/touchpoints/googleBusiness';
import { GoogleBusinessView } from './GoogleBusinessView';

export const metadata: Metadata = {
  title: googleBusinessContent.metadata.title,
  description: googleBusinessContent.metadata.description,
  openGraph: {
    title: googleBusinessContent.metadata.ogTitle,
    description: googleBusinessContent.metadata.ogDescription,
  },
};

export default function GoogleBusinessTouchpointPage() {
  return <GoogleBusinessView content={googleBusinessContent} />;
}
