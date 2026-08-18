import type { Metadata } from 'next';
import { cafesAndBakeriesContent } from '../../../content/solutions/cafesAndBakeries';
import { CafesBakeriesView } from './CafesBakeriesView';

export const metadata: Metadata = {
  title: cafesAndBakeriesContent.metadata.title,
  description: cafesAndBakeriesContent.metadata.description,
  openGraph: {
    title: cafesAndBakeriesContent.metadata.ogTitle,
    description: cafesAndBakeriesContent.metadata.ogDescription,
  },
};

export default function CafesAndBakeriesSolutionPage() {
  return <CafesBakeriesView content={cafesAndBakeriesContent} />;
}
