import { CreatePresetSchema } from './createSchemas';
import { CreatePreset } from './createTypes';

export function parseCreatePresetFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): CreatePreset | null {
  const raw = {
    type: typeof searchParams.type === 'string' ? searchParams.type : undefined,
    objective: typeof searchParams.objective === 'string' ? searchParams.objective : undefined,
    offer_title: typeof searchParams.offer_title === 'string' ? searchParams.offer_title : undefined,
    offer_desc: typeof searchParams.offer_desc === 'string' ? searchParams.offer_desc : undefined,
    offer_value: typeof searchParams.offer_value === 'string' ? searchParams.offer_value : undefined,
    offer_terms: typeof searchParams.offer_terms === 'string' ? searchParams.offer_terms : undefined,
    timing_label: typeof searchParams.timing_label === 'string' ? searchParams.timing_label : undefined,
    custom_notes: typeof searchParams.custom_notes === 'string' ? searchParams.custom_notes : undefined,
  };

  const parsed = CreatePresetSchema.safeParse(raw);
  if (!parsed.success) {
    return null;
  }

  const d = parsed.data;
  if (!d.type && !d.objective && !d.offer_title && !d.offer_desc) {
    return null;
  }

  return {
    type: d.type,
    objective: d.objective,
    offerTitle: d.offer_title,
    offerDescription: d.offer_desc,
    offerValue: d.offer_value,
    offerTerms: d.offer_terms,
    timingLabel: d.timing_label,
    customNotes: d.custom_notes,
  };
}
