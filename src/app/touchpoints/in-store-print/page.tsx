import type { Metadata } from 'next';
import { inStorePrintContent } from '../../../content/touchpoints/inStorePrint';
import { InStorePrintView } from './InStorePrintView';

export const metadata: Metadata = {
  title: inStorePrintContent.metadata.title,
  description: inStorePrintContent.metadata.description,
  openGraph: {
    title: inStorePrintContent.metadata.ogTitle,
    description: inStorePrintContent.metadata.ogDescription,
  },
};

export default function InStorePrintTouchpointPage() {
  return <InStorePrintView content={inStorePrintContent} />;
}
