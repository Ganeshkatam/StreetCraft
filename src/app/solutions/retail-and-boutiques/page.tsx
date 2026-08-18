import type { Metadata } from 'next';
import { retailAndBoutiquesContent } from '../../../content/solutions/retailAndBoutiques';
import { RetailBoutiquesView } from './RetailBoutiquesView';

export const metadata: Metadata = {
  title: retailAndBoutiquesContent.metadata.title,
  description: retailAndBoutiquesContent.metadata.description,
  openGraph: {
    title: retailAndBoutiquesContent.metadata.ogTitle,
    description: retailAndBoutiquesContent.metadata.ogDescription,
  },
};

export default function RetailAndBoutiquesSolutionPage() {
  return <RetailBoutiquesView content={retailAndBoutiquesContent} />;
}
