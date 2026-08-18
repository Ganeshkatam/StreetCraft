import { BusinessProfile } from '../../server/business/getBusinessProfile';
import {
  DomainKey,
  DomainStatus,
  DomainProgressItem,
  SetupProgressSummary,
} from './setupTypes';

export * from './setupTypes';

export function deriveSetupProgress(
  profile: BusinessProfile | null,
  businessId?: string
): SetupProgressSummary {
  // 01 Identity: Required (name & category)
  const hasName = Boolean(profile?.name && profile.name.trim().length > 0);
  const hasCategory = Boolean(profile?.category && profile.category.trim().length > 0);
  const identityStatus: DomainStatus =
    hasName && hasCategory ? 'COMPLETE' : hasName || hasCategory ? 'PARTIAL' : 'EMPTY';

  // 02 Location: Required (neighborhood & city)
  const hasNeighborhood = Boolean(profile?.neighborhood && profile.neighborhood.trim().length > 0);
  const hasCity = Boolean(profile?.city && profile.city.trim().length > 0);
  const locationStatus: DomainStatus =
    hasNeighborhood && hasCity ? 'COMPLETE' : hasNeighborhood || hasCity ? 'PARTIAL' : 'EMPTY';

  // 03 Products: Recommended (signature_items)
  const hasSignatureItems = Boolean(profile?.signature_items && profile.signature_items.trim().length > 0);
  const productsStatus: DomainStatus = hasSignatureItems ? 'COMPLETE' : 'EMPTY';

  // 04 Customers: Recommended (target_customer)
  const hasCustomer = Boolean(profile?.target_customer && profile.target_customer.trim().length > 0);
  const customersStatus: DomainStatus = hasCustomer ? 'COMPLETE' : 'EMPTY';

  // 05 Offer: Recommended (default_offer)
  const hasOffer = Boolean(profile?.default_offer && profile.default_offer.trim().length > 0);
  const offerStatus: DomainStatus = hasOffer ? 'COMPLETE' : 'EMPTY';

  // 06 Brand: Optional (style_voice)
  const hasBrand = Boolean(profile?.style_voice && profile.style_voice.trim().length > 0);
  const brandStatus: DomainStatus = hasBrand ? 'COMPLETE' : 'OPTIONAL';

  // 07 Operations: Recommended (peak_hours or slow_hours)
  const hasSlowHours = Boolean(profile?.slow_hours && profile.slow_hours.trim().length > 0);
  const hasPeakHours = Boolean(profile?.peak_hours && profile.peak_hours.trim().length > 0);
  const operationsStatus: DomainStatus = hasSlowHours || hasPeakHours ? 'COMPLETE' : 'EMPTY';

  // 08 Contact: Optional (phone_whatsapp)
  const hasContact = Boolean(profile?.phone_whatsapp && profile.phone_whatsapp.trim().length > 0);
  const contactStatus: DomainStatus = hasContact ? 'COMPLETE' : 'OPTIONAL';

  const requiredComplete = identityStatus === 'COMPLETE' && locationStatus === 'COMPLETE';
  const recommendedComplete =
    productsStatus === 'COMPLETE' &&
    customersStatus === 'COMPLETE' &&
    offerStatus === 'COMPLETE' &&
    operationsStatus === 'COMPLETE';

  // 09 Review: Completion
  const reviewStatus: DomainStatus = requiredComplete ? 'COMPLETE' : 'EMPTY';

  const getRoute = (domain: string) =>
    businessId ? `/setup/${encodeURIComponent(businessId)}/${domain}` : `/setup/${domain}`;

  const domainMap: Record<DomainKey, DomainProgressItem> = {
    identity: {
      key: 'identity',
      label: 'Identity',
      route: getRoute('identity'),
      stepNumber: '01',
      stepIndex: 1,
      classification: 'Required',
      status: identityStatus,
    },
    location: {
      key: 'location',
      label: 'Location',
      route: getRoute('location'),
      stepNumber: '02',
      stepIndex: 2,
      classification: 'Required',
      status: locationStatus,
    },
    products: {
      key: 'products',
      label: 'Products',
      route: getRoute('products'),
      stepNumber: '03',
      stepIndex: 3,
      classification: 'Recommended',
      status: productsStatus,
    },
    customers: {
      key: 'customers',
      label: 'Customers',
      route: getRoute('customers'),
      stepNumber: '04',
      stepIndex: 4,
      classification: 'Recommended',
      status: customersStatus,
    },
    offer: {
      key: 'offer',
      label: 'Offer',
      route: getRoute('offer'),
      stepNumber: '05',
      stepIndex: 5,
      classification: 'Recommended',
      status: offerStatus,
    },
    brand: {
      key: 'brand',
      label: 'Brand',
      route: getRoute('brand'),
      stepNumber: '06',
      stepIndex: 6,
      classification: 'Enrichment',
      status: brandStatus,
    },
    operations: {
      key: 'operations',
      label: 'Operations',
      route: getRoute('operations'),
      stepNumber: '07',
      stepIndex: 7,
      classification: 'Recommended',
      status: operationsStatus,
    },
    contact: {
      key: 'contact',
      label: 'Contact',
      route: getRoute('contact'),
      stepNumber: '08',
      stepIndex: 8,
      classification: 'Enrichment',
      status: contactStatus,
    },
    review: {
      key: 'review',
      label: 'Review',
      route: getRoute('review'),
      stepNumber: '09',
      stepIndex: 9,
      classification: 'Completion',
      status: reviewStatus,
    },
  };

  const domainList: DomainProgressItem[] = [
    domainMap.identity,
    domainMap.location,
    domainMap.products,
    domainMap.customers,
    domainMap.offer,
    domainMap.brand,
    domainMap.operations,
    domainMap.contact,
    domainMap.review,
  ];

  const totalCompletedCount = domainList.filter((d) => d.status === 'COMPLETE').length;

  // Compute weighted completeness percentage
  let score = 0;
  if (identityStatus === 'COMPLETE') score += 25;
  if (locationStatus === 'COMPLETE') score += 25;
  if (productsStatus === 'COMPLETE') score += 10;
  if (customersStatus === 'COMPLETE') score += 10;
  if (offerStatus === 'COMPLETE') score += 10;
  if (operationsStatus === 'COMPLETE') score += 10;
  if (brandStatus === 'COMPLETE') score += 5;
  if (contactStatus === 'COMPLETE') score += 5;
  const completionPercentage = Math.min(100, score);

  let nextIncompleteDomain: DomainKey = 'review';
  if (identityStatus !== 'COMPLETE') nextIncompleteDomain = 'identity';
  else if (locationStatus !== 'COMPLETE') nextIncompleteDomain = 'location';
  else if (productsStatus !== 'COMPLETE') nextIncompleteDomain = 'products';
  else if (customersStatus !== 'COMPLETE') nextIncompleteDomain = 'customers';
  else if (offerStatus !== 'COMPLETE') nextIncompleteDomain = 'offer';
  else if (operationsStatus !== 'COMPLETE') nextIncompleteDomain = 'operations';

  return {
    domains: domainMap,
    domainList,
    requiredComplete,
    recommendedComplete,
    totalCompletedCount,
    completionPercentage,
    nextIncompleteDomain,
  };
}
