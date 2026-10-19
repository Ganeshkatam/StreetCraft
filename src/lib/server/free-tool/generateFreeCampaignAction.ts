'use server';

import { cookies, headers } from 'next/headers';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { generateCampaignPack } from '../../../engine/campaignEngine';
import { CampaignType, FullCampaignPack } from '../../../types/campaign';
import { BusinessProfile } from '../../../types/business';
import { z } from 'zod';

const FreeToolInputSchema = z.object({
  name: z.string().min(1, 'Store name is required').max(100, 'Store name cannot exceed 100 characters'),
  category: z.string().min(1, 'Category is required').max(100, 'Category cannot exceed 100 characters'),
  neighborhood: z.string().max(100, 'Neighborhood cannot exceed 100 characters').optional().default(''),
  city: z.string().max(100, 'City cannot exceed 100 characters').optional().default(''),
  type: z.enum(['WEEKDAY_BOOST', 'WEEKEND_MAGNET', 'MENU_LAUNCH', 'FESTIVAL_SPECIAL', 'REVIEW_SPOTLIGHT', 'WIN_BACK_REGULARS']),
  offerTitle: z.string().min(1, 'Offer title is required').max(200, 'Offer title cannot exceed 200 characters'),
  timing: z.string().max(100, 'Timing cannot exceed 100 characters').optional().default(''),
  turnstileToken: z.string().optional(),
});

export type FreeToolInput = z.infer<typeof FreeToolInputSchema>;

export type GenerateFreeCampaignResult = {
  success: boolean;
  message?: string;
  campaignId?: string;
  claimToken?: string;
  pack?: FullCampaignPack;
};

async function verifyTurnstileToken(token?: string, clientIp?: string): Promise<{ valid: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[FreeTool] TURNSTILE_SECRET_KEY is missing in production environment.');
      return { valid: false, error: 'CAPTCHA service is unavailable. Please try again later.' };
    }
    // In development / non-production, allow bypass for testing if secret key is not set
    return { valid: true };
  }

  if (!token) {
    return { valid: false, error: 'CAPTCHA verification is required.' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (clientIp) {
      formData.append('remoteip', clientIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await res.json();
    if (data.success) {
      return { valid: true };
    }
    return { valid: false, error: 'CAPTCHA verification failed. Please try again.' };
  } catch (err) {
    console.error('[FreeTool] Turnstile verification error:', err);
    return { valid: false, error: 'CAPTCHA service unreachable. Please try again.' };
  }
}

function normalizeClientIp(rawIp: string): string {
  const ip = rawIp.trim();
  if (ip.includes(':')) {
    if (ip.toLowerCase().startsWith('::ffff:')) {
      return ip.slice(7);
    }
    const blocks = ip.split(':');
    return blocks.slice(0, 4).join(':') + '::/64';
  }
  return ip;
}

async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    // On Vercel and standard reverse proxies, the first entry in x-forwarded-for is the connecting client
    const forwarded = headerList.get('x-forwarded-for');
    if (forwarded) {
      const first = forwarded.split(',')[0];
      if (first) return normalizeClientIp(first);
    }
    const realIp = headerList.get('x-real-ip');
    if (realIp) return normalizeClientIp(realIp);
  } catch {
    // Headers unavailable outside request context
  }
  return '127.0.0.1';
}

export async function generateFreeCampaignAction(
  rawInput: unknown
): Promise<GenerateFreeCampaignResult> {
  // 1. Validate payload schema
  const parsed = FreeToolInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const firstErr = parsed.error.issues[0]?.message || 'Invalid input parameters.';
    return { success: false, message: firstErr };
  }

  const input = parsed.data;
  const clientIp = await getClientIp();

  // 2. Verify Turnstile token if configured
  const captcha = await verifyTurnstileToken(input.turnstileToken, clientIp);
  if (!captcha.valid) {
    return { success: false, message: captcha.error || 'CAPTCHA validation failed.' };
  }

  // 3. Supabase admin client for rate limiting and service_role RPC
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let adminClient: any = null;
  if (supabaseUrl && serviceKey) {
    adminClient = createAdminClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
  }

  // 4. IP rate limit check
  if (adminClient) {
    try {
      const { data: allowed, error: rlError } = await adminClient.rpc('check_and_record_rate_limit', {
        p_identifier: clientIp,
        p_action: 'free_tool_generate',
        p_hourly_limit: 5,
        p_daily_limit: 20,
      });

      if (!rlError && allowed === false) {
        return {
          success: false,
          message: 'Rate limit exceeded: You can generate up to 5 free campaign proofs per hour. Please try again later or sign in to continue.',
        };
      }
    } catch (rlErr) {
      console.warn('[FreeTool] Rate limit check skipped due to RPC error:', rlErr);
    }
  }

  // 5. Generate campaign pack deterministically on the server
  const ephemeralProfile: BusinessProfile = {
    businessId: '00000000-0000-0000-0000-000000000000',
    name: input.name,
    category: input.category,
    neighborhood: input.neighborhood,
    city: input.city,
    landmarks: '',
    targetCustomer: '',
    styleVoice: '',
    signatureItems: '',
    primaryGoal: '',
    peakHours: '',
    slowHours: input.timing,
    defaultOffer: input.offerTitle,
    avgTicketINR: 0,
    targetMonthlyCustomers: 0,
    phoneWhatsApp: '',
    updatedAt: new Date().toISOString(),
  };

  const campaignInput = {
    type: input.type,
    objective: 'MORE_WALK_INS' as const,
    audience: input.neighborhood ? `Nearby customers in ${input.neighborhood}` : 'Local neighborhood customers',
    offer: {
      title: input.offerTitle,
      description: input.offerTitle,
      value: input.offerTitle,
      terms: 'Show message at counter to redeem.',
    },
    schedule: {
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 5 * 86400000).toISOString(),
      timingLabel: input.timing || 'Valid this week',
    },
  };

  const generated = generateCampaignPack(ephemeralProfile, campaignInput);

  let campaignId = 'cmp_anon_' + Date.now();
  let claimToken: string | null = null;

  // 6. Persist to DB via create_anonymous_campaign RPC (service_role only)
  if (adminClient) {
    try {
      const { data: rpcData, error: rpcError } = await adminClient.rpc('create_anonymous_campaign', {
        p_type: input.type,
        p_objective: 'MORE_WALK_INS',
        p_audience: campaignInput.audience,
        p_offer: campaignInput.offer,
        p_schedule: campaignInput.schedule,
        p_google_content: generated.outputs.googleBusiness,
        p_instagram_content: generated.outputs.instagram,
        p_whatsapp_content: generated.outputs.whatsapp,
        p_poster_content: generated.outputs.poster || {},
      });

      if (!rpcError && rpcData?.campaign_id && rpcData?.claim_token) {
        campaignId = rpcData.campaign_id;
        const resolvedToken = String(rpcData.claim_token);
        claimToken = resolvedToken;

        // Set httpOnly cookie with 7 days maxAge
        try {
          const cookieStore = await cookies();
          cookieStore.set('streetcraft_claim_token', resolvedToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
          });
        } catch (cookieErr) {
          console.warn('[FreeTool] Could not set claim cookie:', cookieErr);
        }
      } else if (rpcError) {
        console.error('[FreeTool] create_anonymous_campaign RPC error:', rpcError);
        if (rpcError.message?.includes('PAYLOAD_OVERSIZED')) {
          return { success: false, message: 'Campaign content exceeded size limits.' };
        }
      }
    } catch (err) {
      console.warn('[FreeTool] Failed to record anonymous campaign via RPC:', err);
    }
  }

  const now = new Date().toISOString();
  const pack: FullCampaignPack = {
    campaign: {
      id: campaignId,
      businessId: null,
      claimToken: claimToken as any,
      type: input.type,
      objective: 'MORE_WALK_INS',
      audience: campaignInput.audience,
      offer: campaignInput.offer,
      schedule: campaignInput.schedule,
      status: 'ready',
      performanceNotes: '',
      createdAt: now,
      updatedAt: now,
    },
    outputs: generated.outputs,
    validationStatus: generated.validationStatus,
  };

  return {
    success: true,
    campaignId,
    claimToken: claimToken || undefined,
    pack,
  };
}
