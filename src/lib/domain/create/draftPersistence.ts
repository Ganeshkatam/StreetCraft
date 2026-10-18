import { CampaignType, CampaignObjective } from '../../../types/campaign';

export interface CampaignDraftData {
  step: number;
  type: CampaignType;
  objective: CampaignObjective;
  offerTitle: string;
  offerDesc: string;
  offerValue: string;
  offerTerms: string;
  timingLabel: string;
  audience: string;
  customNotes: string;
  savedAt: string;
}

const DRAFT_PREFIX = 'sc_draft_campaign_';

export function getDraftStorageKey(businessId: string): string {
  return `${DRAFT_PREFIX}${businessId}`;
}

/**
 * Sanitizes and serializes campaign draft state without including any
 * sensitive authentication credentials, tokens, or PII.
 */
export function sanitizeCampaignDraft(data: Partial<CampaignDraftData>): CampaignDraftData {
  return {
    step: typeof data.step === 'number' && data.step >= 1 && data.step <= 3 ? data.step : 1,
    type: (data.type || 'WEEKDAY_BOOST') as CampaignType,
    objective: (data.objective || 'MORE_WALK_INS') as CampaignObjective,
    offerTitle: typeof data.offerTitle === 'string' ? data.offerTitle.slice(0, 120) : '',
    offerDesc: typeof data.offerDesc === 'string' ? data.offerDesc.slice(0, 400) : '',
    offerValue: typeof data.offerValue === 'string' ? data.offerValue.slice(0, 120) : '',
    offerTerms: typeof data.offerTerms === 'string' ? data.offerTerms.slice(0, 250) : '',
    timingLabel: typeof data.timingLabel === 'string' ? data.timingLabel.slice(0, 100) : '',
    audience: typeof data.audience === 'string' ? data.audience.slice(0, 200) : '',
    customNotes: typeof data.customNotes === 'string' ? data.customNotes.slice(0, 600) : '',
    savedAt: data.savedAt || new Date().toISOString(),
  };
}

/**
 * Saves sanitized draft to storage. Safe against browser storage quotas and private mode exceptions.
 */
export function saveCampaignDraftToStorage(
  storage: Storage | null | undefined,
  businessId: string,
  draft: Partial<CampaignDraftData>
): boolean {
  if (!storage || !businessId) return false;
  try {
    const sanitized = sanitizeCampaignDraft(draft);
    // Don't save empty defaults
    if (!sanitized.offerTitle && !sanitized.offerDesc && sanitized.step === 1) {
      return false;
    }
    storage.setItem(getDraftStorageKey(businessId), JSON.stringify(sanitized));
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads and validates draft from storage. Returns null if missing or corrupted.
 */
export function loadCampaignDraftFromStorage(
  storage: Storage | null | undefined,
  businessId: string
): CampaignDraftData | null {
  if (!storage || !businessId) return null;
  try {
    const raw = storage.getItem(getDraftStorageKey(businessId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return sanitizeCampaignDraft(parsed);
  } catch {
    return null;
  }
}

/**
 * Clears draft from storage upon successful generation or explicit user reset.
 */
export function clearCampaignDraftFromStorage(
  storage: Storage | null | undefined,
  businessId: string
): void {
  if (!storage || !businessId) return;
  try {
    storage.removeItem(getDraftStorageKey(businessId));
  } catch {
    // Ignore storage errors on cleanup
  }
}
