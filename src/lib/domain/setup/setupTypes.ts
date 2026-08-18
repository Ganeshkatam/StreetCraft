import { BusinessProfile } from '../../server/business/getBusinessProfile';

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
  stepIndex: number;
  classification: DomainClassification;
  status: DomainStatus;
}

export interface SetupProgressSummary {
  domains: Record<DomainKey, DomainProgressItem>;
  domainList: DomainProgressItem[];
  requiredComplete: boolean;
  recommendedComplete: boolean;
  totalCompletedCount: number;
  completionPercentage: number;
  nextIncompleteDomain: DomainKey;
}
