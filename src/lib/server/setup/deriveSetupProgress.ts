import { BusinessProfile } from '../business/getBusinessProfile';

export type DomainKey =
  | 'identity'
  | 'location'
  | 'products'
  | 'customers'
  | 'offer'
  | 'brand'
  | 'operations'
  | 'contact'
  | 'review';

export type DomainStatus = 'EMPTY' | 'PARTIAL' | 'COMPLETE' | 'OPTIONAL';
export type DomainClassification = 'Required' | 'Recommended' | 'Enrichment' | 'Completion';

export interface DomainProgressItem {
  key: DomainKey;
  label: string;
  route: string;
  stepNumber: string;
  classification: DomainClassification;
  status: DomainStatus;
}

export interface SetupProgressSummary {
  domains: Record<DomainKey, DomainProgressItem>;
  domainList: DomainProgressItem[];
  requiredComplete: boolean;
  recommendedComplete: boolean;
  totalCompletedCount: number;
  nextIncompleteDomain: DomainKey;
}

export function deriveSetupProgress(profile: BusinessProfile | null): SetupProgressSummary {
  // 01 Identity: Required (name & category)
  const hasName = Boolean(profile?.name && profile.name.trim().length > 0);
  const hasCategory = Boolean(profile?.category && profile.category.trim().length > 0);
  const identityStatus: DomainStatus = hasName && hasCategory ? 'COMPLETE' : hasName || hasCategory ? 'PARTIAL' : 'EMPTY';

  // 02 Location: Required (neighborhood & city)
  const hasNeighborhood = Boolean(profile?.neighborhood && profile.neighborhood.trim().length > 0);
  const hasCity = Boolean(profile?.city && profile.city.trim().length > 0);
  const locationStatus: DomainStatus = hasNeighborhood && hasCity ? 'COMPLETE' : hasNeighborhood || hasCity ? 'PARTIAL' : 'EMPTY';

  // 03 Products: Recommended (signature_items)
  const hasSignatureItems = Boolean(profile?.signature_items && profile.signature_items.trim().length > 0);
  const productsStatus: DomainStatus = hasSignatureItems ? 'COMPLETE' : 'EMPTY';

  // 04 Customers: Recommended (target_customer)
  const hasCustomer = Boolean(profile?.target_customer && profile.target_customer.trim().length > 0);
  const customersStatus: DomainStatus = hasCustomer ? 'COMPLETE' : 'EMPTY';

  // 05 Offer: Recommended (default_offer)
  const hasOffer = Boolean(profile?.default_offer && profile.default_offer.trim().length > 0);
  const offerStatus: DomainStatus = hasOffer ? 'COMPLETE' : 'EMPTY';

  // 06 Brand: Enrichment (style_voice)
  const hasBrand = Boolean(profile?.style_voice && profile.style_voice.trim().length > 0);
  const brandStatus: DomainStatus = hasBrand ? 'COMPLETE' : 'OPTIONAL';

  // 07 Operations: Recommended (peak_hours or slow_hours)
  const hasSlowHours = Boolean(profile?.slow_hours && profile.slow_hours.trim().length > 0);
  const hasPeakHours = Boolean(profile?.peak_hours && profile.peak_hours.trim().length > 0);
  const operationsStatus: DomainStatus = hasSlowHours || hasPeakHours ? 'COMPLETE' : 'EMPTY';

  // 08 Contact: Enrichment (phone_whatsapp)
  const hasContact = Boolean(profile?.phone_whatsapp && profile.phone_whatsapp.trim().length > 0);
  const contactStatus: DomainStatus = hasContact ? 'COMPLETE' : 'OPTIONAL';

  const requiredComplete = identityStatus === 'COMPLETE' && locationStatus === 'COMPLETE';
  const recommendedComplete = productsStatus === 'COMPLETE' && customersStatus === 'COMPLETE' && offerStatus === 'COMPLETE' && operationsStatus === 'COMPLETE';

  // 09 Review: Completion
  const reviewStatus: DomainStatus = requiredComplete ? 'COMPLETE' : 'EMPTY';

  const domainMap: Record<DomainKey, DomainProgressItem> = {
    identity: {
      key: 'identity',
      label: 'Identity',
      route: '/setup/identity',
      stepNumber: '01',
      classification: 'Required',
      status: identityStatus,
    },
    location: {
      key: 'location',
      label: 'Location',
      route: '/setup/location',
      stepNumber: '02',
      classification: 'Required',
      status: locationStatus,
    },
    products: {
      key: 'products',
      label: 'Products',
      route: '/setup/products',
      stepNumber: '03',
      classification: 'Recommended',
      status: productsStatus,
    },
    customers: {
      key: 'customers',
      label: 'Customers',
      route: '/setup/customers',
      stepNumber: '04',
      classification: 'Recommended',
      status: customersStatus,
    },
    offer: {
      key: 'offer',
      label: 'Offer',
      route: '/setup/offer',
      stepNumber: '05',
      classification: 'Recommended',
      status: offerStatus,
    },
    brand: {
      key: 'brand',
      label: 'Brand',
      route: '/setup/brand',
      stepNumber: '06',
      classification: 'Enrichment',
      status: brandStatus,
    },
    operations: {
      key: 'operations',
      label: 'Operations',
      route: '/setup/operations',
      stepNumber: '07',
      classification: 'Recommended',
      status: operationsStatus,
    },
    contact: {
      key: 'contact',
      label: 'Contact',
      route: '/setup/contact',
      stepNumber: '08',
      classification: 'Enrichment',
      status: contactStatus,
    },
    review: {
      key: 'review',
      label: 'Review & Launch',
      route: '/setup/review',
      stepNumber: '09',
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

  const totalCompletedCount = domainList.filter(
    (d) => d.key !== 'review' && (d.status === 'COMPLETE' || d.status === 'OPTIONAL')
  ).length;

  // Determine next incomplete domain for the setup resolver
  let nextIncomplete: DomainKey = 'review';
  if (identityStatus !== 'COMPLETE') {
    nextIncomplete = 'identity';
  } else if (locationStatus !== 'COMPLETE') {
    nextIncomplete = 'location';
  } else if (productsStatus !== 'COMPLETE') {
    nextIncomplete = 'products';
  } else if (customersStatus !== 'COMPLETE') {
    nextIncomplete = 'customers';
  } else if (offerStatus !== 'COMPLETE') {
    nextIncomplete = 'offer';
  } else if (operationsStatus !== 'COMPLETE') {
    nextIncomplete = 'operations';
  } else {
    nextIncomplete = 'review';
  }

  return {
    domains: domainMap,
    domainList,
    requiredComplete,
    recommendedComplete,
    totalCompletedCount,
    nextIncompleteDomain: nextIncomplete,
  };
}
