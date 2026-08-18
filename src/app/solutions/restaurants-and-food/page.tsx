import type { Metadata } from 'next';
import { restaurantsAndFoodContent } from '../../../content/solutions/restaurantsAndFood';
import { RestaurantsFoodView } from './RestaurantsFoodView';

export const metadata: Metadata = {
  title: restaurantsAndFoodContent.metadata.title,
  description: restaurantsAndFoodContent.metadata.description,
  openGraph: {
    title: restaurantsAndFoodContent.metadata.ogTitle,
    description: restaurantsAndFoodContent.metadata.ogDescription,
  },
};

export default function RestaurantsAndFoodSolutionPage() {
  return <RestaurantsFoodView content={restaurantsAndFoodContent} />;
}
