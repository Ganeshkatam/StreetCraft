import type { Metadata } from 'next';
import { salonsAndStudiosContent } from '../../../content/solutions/salonsAndStudios';
import { SalonsStudiosView } from './SalonsStudiosView';

export const metadata: Metadata = {
  title: salonsAndStudiosContent.metadata.title,
  description: salonsAndStudiosContent.metadata.description,
  openGraph: {
    title: salonsAndStudiosContent.metadata.ogTitle,
    description: salonsAndStudiosContent.metadata.ogDescription,
  },
};

export default function SalonsAndStudiosSolutionPage() {
  return <SalonsStudiosView content={salonsAndStudiosContent} />;
}
