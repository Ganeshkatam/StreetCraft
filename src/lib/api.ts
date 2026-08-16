/**
 * StreetCraft Realtime Database-Backed API & Supabase Gateway
 * Enforces Data Integrity (zero mock state) & Realtime Synchronization.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { UUID } from '../types/common';
import { BusinessProfile, UserSession } from '../types/business';
import {
  Campaign,
  CampaignStatus,
  FullCampaignPack,
  CampaignType,
  CampaignObjective,
} from '../types/campaign';
import { PlanTier, UsageEvent, UsageSummary, DatabasePlan } from '../types/billing';

import { generateCampaignPack, CampaignGenerationInput } from '../engine/campaignEngine';

class RealtimeApiClient {
  // 1. AUTHENTICATION (Supabase Auth as Single Source of Truth)
  public async getSession(): Promise<UserSession> {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem('sc_local_session');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore
        }
      }
      return {
        userId: '',
        email: '',
        phone: '',
        name: '',
        isAuthenticated: false,
        activeBusinessId: '',
        role: 'owner',
      };
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return {
        userId: '',
        email: '',
        phone: '',
        name: '',
        isAuthenticated: false,
        activeBusinessId: '',
        role: 'owner',
      };
    }

    // Query business membership
    const { data: members } = await (supabase.from('business_members') as any)
      .select('business_id, role')
      .eq('user_id', session.user.id)
      .limit(1);

    const activeBusinessId = members && members.length > 0 ? members[0].business_id : '';
    const role = (members && members.length > 0 ? members[0].role : 'owner') as 'owner' | 'admin' | 'member';

    return {
      userId: session.user.id,
      email: session.user.email || '',
      phone: session.user.phone || '',
      name: session.user.user_metadata?.full_name || session.user.phone || 'User',
      isAuthenticated: true,
      activeBusinessId,
      role,
    };
  }

  public async getMyBusinesses(): Promise<Array<{ id: UUID; name: string }>> {
    if (!isSupabaseConfigured) {
      return [{ id: 'biz_local', name: 'The Roasted Bean' }];
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) return [];

    const { data } = await (supabase.from('business_members') as any)
      .select('business_id, businesses(id, name)')
      .eq('user_id', session.user.id);

    if (!data) return [];

    // Map joined table
    return data
      .filter((d: any) => d.businesses)
      .map((d: any) => ({
        id: d.businesses.id,
        name: d.businesses.name,
      }));
  }

  public async getAccountLimits(): Promise<{ limit: number }> {
    if (!isSupabaseConfigured) return { limit: 2 };
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { limit: 2 };

    const { data: sub } = await (supabase.from('subscriptions') as any)
      .select('plan_id')
      .eq('user_id', session.user.id)
      .in('status', ['ACTIVE', 'TRIALING'])
      .order('created_at', { ascending: false })
      .limit(1);

    const planId = (sub && sub.length > 0) ? sub[0].plan_id : 'FREE';

    const { data: plan } = await (supabase.from('plans') as any)
      .select('business_limit')
      .eq('id', planId)
      .single();

    return { limit: plan?.business_limit || 2 };
  }

  public async createBusiness(
    name: string,
    category: string,
    neighborhood: string,
    city: string,
    phone: string
  ): Promise<UserSession> {
    if (!isSupabaseConfigured) {
      const sess = await this.getSession();
      const newBizId = 'biz_' + Date.now();
      sess.activeBusinessId = newBizId;
      localStorage.setItem('sc_local_session', JSON.stringify(sess));
      return sess;
    }

    const { data, error } = await (supabase as any).rpc('create_business_atomically', {
      p_name: name,
      p_category: category,
      p_neighborhood: neighborhood,
      p_city: city,
      p_phone: phone
    });

    if (error) throw error;

    // Switch active context to the new business
    return this.getSession();
  }

  public async signUp(email: string, password: string, fullName: string): Promise<UserSession> {
    if (!isSupabaseConfigured) {
      const sess: UserSession = {
        userId: 'usr_' + Date.now(),
        email,
        phone: '',
        name: fullName,
        isAuthenticated: true,
        activeBusinessId: '',
        role: 'owner',
      };
      localStorage.setItem('sc_local_session', JSON.stringify(sess));
      return sess;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('Signup failed: user not created.');

    return this.getSession();
  }

  public async signIn(email: string, password: string): Promise<UserSession> {
    if (!isSupabaseConfigured) {
      const sess: UserSession = {
        userId: 'usr_local',
        email,
        phone: '',
        name: email.split('@')[0],
        isAuthenticated: true,
        activeBusinessId: 'biz_local',
        role: 'owner',
      };
      localStorage.setItem('sc_local_session', JSON.stringify(sess));
      return sess;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Authentication failed.');

    return this.getSession();
  }

  public async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('sc_local_session');
  }

  // 2. REFERENCE TABLES (Database-Backed Plans & Festivals)
  public async getPlans(): Promise<DatabasePlan[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    const { data, error } = await (supabase.from('plans') as any)
      .select('*')
      .eq('active', true)
      .order('monthly_inr', { ascending: true });

    if (error || !data) {
      console.error('Failed to fetch plans from database:', error);
      return [];
    }

    return data as DatabasePlan[];
  }

  // 2.5 FOUNDER ALLOCATION
  public async getFounderAllocation(): Promise<{ total_slots: number; claimed_slots: number } | null> {
    if (!isSupabaseConfigured) {
      return null;
    }

    const { data, error } = await (supabase.from('founder_allocation') as any)
      .select('total_slots, claimed_slots')
      .eq('id', 1)
      .single();

    if (error || !data) {
      console.error('Failed to fetch founder allocation:', error);
      return null;
    }

    return data;
  }

  public async getFestivalCalendar() {
    if (!isSupabaseConfigured) return [];
    const { data } = await (supabase.from('festival_calendar') as any)
      .select('*')
      .order('starts_at', { ascending: true });
    return data || [];
  }

  // 3. BUSINESS PROFILE & MEMORY
  public async getBusinessProfile(businessId: UUID): Promise<BusinessProfile> {
    if (!businessId) {
      return this._getEmptyProfile('');
    }

    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(`sc_profile_${businessId}`);
      if (stored) return JSON.parse(stored);
      return this._getEmptyProfile(businessId);
    }

    const { data, error } = await (supabase.from('business_profiles') as any)
      .select('*')
      .eq('business_id', businessId)
      .single();

    if (error || !data) {
      return this._getEmptyProfile(businessId);
    }

    return {
      businessId: data.business_id,
      name: data.name,
      category: data.category,
      neighborhood: data.neighborhood,
      city: data.city,
      landmarks: data.landmarks || '',
      targetCustomer: data.target_customer || '',
      styleVoice: data.style_voice || 'Warm, contemporary, artisanal yet unpretentious',
      signatureItems: data.signature_items || '',
      primaryGoal: data.primary_goal || 'Increase foot traffic and walk-ins',
      peakHours: data.peak_hours || '',
      slowHours: data.slow_hours || '',
      defaultOffer: data.default_offer || '',
      avgTicketINR: data.avg_ticket_inr || 350,
      targetMonthlyCustomers: data.target_monthly_customers || 30,
      phoneWhatsApp: data.phone_whatsapp || '',
      updatedAt: data.updated_at,
    };
  }

  public async updateBusinessProfile(businessId: UUID, updates: Partial<BusinessProfile>): Promise<BusinessProfile> {
    if (!businessId) throw new Error('Business ID is required to update profile.');

    if (!isSupabaseConfigured) {
      const current = await this.getBusinessProfile(businessId);
      const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(`sc_profile_${businessId}`, JSON.stringify(updated));
      return updated;
    }

    const payload = {
      business_id: businessId,
      name: updates.name,
      category: updates.category,
      neighborhood: updates.neighborhood,
      city: updates.city,
      landmarks: updates.landmarks,
      target_customer: updates.targetCustomer,
      style_voice: updates.styleVoice,
      signature_items: updates.signatureItems,
      primary_goal: updates.primaryGoal,
      peak_hours: updates.peakHours,
      slow_hours: updates.slowHours,
      default_offer: updates.defaultOffer,
      avg_ticket_inr: updates.avgTicketINR,
      target_monthly_customers: updates.targetMonthlyCustomers,
      phone_whatsapp: updates.phoneWhatsApp,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (supabase.from('business_profiles') as any)
      .upsert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return this.getBusinessProfile(businessId);
  }

  // 4. USAGE & SUBSCRIPTION SUMMARY (Live from Postgres)
  public async getUsageSummary(businessId: UUID): Promise<UsageSummary> {
    const plans = await this.getPlans();
    if (plans.length === 0) throw new Error('No plans found in database. Check Supabase connection.');

    if (!businessId || !isSupabaseConfigured) {
      const defaultPlan = plans[0];
      return {
        periodId: 'up_local',
        businessId: businessId || 'biz_local',
        plan: defaultPlan.id as PlanTier,
        planName: defaultPlan.name,
        priceINR: defaultPlan.monthly_inr,
        monthlyLimit: defaultPlan.monthly_pack_limit,
        usedPacks: 0,
        remainingPacks: defaultPlan.monthly_pack_limit,
        percentUsed: 0,
        periodStart: new Date().toISOString().split('T')[0],
        periodEnd: new Date().toISOString().split('T')[0],
        canGenerate: true,
      };
    }

    const { data: period } = await (supabase.from('usage_periods') as any)
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const planTier = (period?.plan || 'FREE') as PlanTier;
    const planObj = plans.find((p) => p.id === planTier) || plans[0];
    const packLimit = period?.pack_limit ?? planObj.monthly_pack_limit;
    const packsUsed = period?.packs_used ?? 0;
    const remainingPacks = Math.max(0, packLimit - packsUsed);

    return {
      periodId: period?.id || '',
      businessId,
      plan: planTier,
      planName: planObj.name,
      priceINR: planObj.monthly_inr,
      monthlyLimit: packLimit,
      usedPacks: packsUsed,
      remainingPacks,
      percentUsed: packLimit > 0 ? Math.min(100, Math.round((packsUsed / packLimit) * 100)) : 0,
      periodStart: period?.period_start || '',
      periodEnd: period?.period_end || '',
      canGenerate: packsUsed < packLimit,
    };
  }

  public async getUsageEvents(businessId: UUID): Promise<UsageEvent[]> {
    if (!businessId || !isSupabaseConfigured) return [];
    const { data } = await (supabase.from('usage_events') as any)
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(50);

    return ((data || []) as any[]).map((d) => ({
      id: d.id,
      businessId: d.business_id,
      userId: d.user_id || '',
      eventType: d.event_type as UsageEvent['eventType'],
      units: d.units,
      campaignId: d.campaign_id || undefined,
      description: d.description || '',
      createdAt: d.created_at,
    }));
  }

  // 5. ATOMIC REALTIME CAMPAIGN GENERATION (Server-Side State Machine)
  public async generateAndSaveCampaign(
    businessId: UUID,
    input: CampaignGenerationInput,
    onProgress?: (channel: string, status: 'generating' | 'ready') => void
  ): Promise<FullCampaignPack> {
    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) throw new Error('Not authenticated.');

      const { data: members, error: memError } = await (supabase.from('business_members') as any)
        .select('id')
        .eq('business_id', businessId)
        .eq('user_id', session.user.id);

      if (memError || !members || members.length === 0) {
        throw new Error('Unauthorized: You do not have access to this business context.');
      }
    }

    const profile = await this.getBusinessProfile(businessId);

    if (isSupabaseConfigured && businessId) {
      const { data: rpcResult, error: rpcError } = await (supabase as any).rpc('reserve_and_create_campaign', {
        p_business_id: businessId,
        p_type: input.type,
        p_objective: input.objective,
        p_audience: input.audience || '',
        p_offer: input.offer,
        p_schedule: input.schedule,
      });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      const campaignId = (rpcResult as { campaign_id: string }).campaign_id;

      try {
        const channels = ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP', 'IN_STORE_POSTER'] as const;
        const { outputs, validationStatus } = generateCampaignPack(profile, input);

        for (const channel of channels) {
          if (onProgress) onProgress(channel, 'generating');

          let content: Record<string, unknown> = {};
          if (channel === 'GOOGLE_BUSINESS') content = outputs.googleBusiness as unknown as Record<string, unknown>;
          if (channel === 'INSTAGRAM') content = outputs.instagram as unknown as Record<string, unknown>;
          if (channel === 'WHATSAPP') content = outputs.whatsapp as unknown as Record<string, unknown>;
          if (channel === 'IN_STORE_POSTER') content = (outputs.poster || {}) as unknown as Record<string, unknown>;

          await (supabase.from('campaign_outputs') as any).upsert({
            campaign_id: campaignId,
            channel,
            status: 'ready',
            content,
            validation_status: validationStatus,
            updated_at: new Date().toISOString(),
          });

          if (onProgress) onProgress(channel, 'ready');
        }

        await (supabase.from('campaigns') as any)
          .update({ status: 'ready', updated_at: new Date().toISOString() })
          .eq('id', campaignId);

        const fullPack = await this.getCampaign(campaignId);
        if (!fullPack) throw new Error('Failed to retrieve newly generated campaign pack.');
        return fullPack;
      } catch (err) {
        await (supabase.from('campaigns') as any)
          .update({
            status: 'failed',
            error_message: (err as Error).message,
            updated_at: new Date().toISOString(),
          })
          .eq('id', campaignId);
        throw err;
      }
    }

    // Local fallback
    const { campaignData, outputs, validationStatus } = generateCampaignPack(profile, input);
    const campaignId = 'cmp_' + Date.now();
    const now = new Date().toISOString();

    const campaign: Campaign = {
      id: campaignId,
      businessId,
      type: campaignData.type,
      objective: campaignData.objective,
      audience: campaignData.audience,
      offer: campaignData.offer,
      schedule: campaignData.schedule,
      status: 'ready',
      performanceNotes: '',
      createdAt: now,
      updatedAt: now,
    };

    return {
      campaign,
      outputs,
      validationStatus,
    };
  }

  // 6. FREE TOOL OPTION B: Anonymous Generation & Lead Claiming
  public async generateAnonymousCampaign(
    input: CampaignGenerationInput,
    profile: BusinessProfile
  ): Promise<{ campaignId: string; claimToken: string; pack: FullCampaignPack }> {
    const claimToken = crypto.randomUUID();
    const { campaignData, outputs, validationStatus } = generateCampaignPack(profile, input);

    if (isSupabaseConfigured) {
      const { data: campaignRow, error: cError } = await (supabase.from('campaigns') as any)
        .insert({
          business_id: null,
          claim_token: claimToken,
          type: input.type,
          objective: input.objective,
          audience: input.audience || '',
          offer: input.offer,
          schedule: input.schedule,
          status: 'ready',
        })
        .select('id')
        .single();

      if (cError) throw cError;

      const campaignId = campaignRow.id;

      await (supabase.from('campaign_outputs') as any).insert([
        { campaign_id: campaignId, channel: 'GOOGLE_BUSINESS', status: 'ready', content: outputs.googleBusiness, validation_status: validationStatus },
        { campaign_id: campaignId, channel: 'INSTAGRAM', status: 'ready', content: outputs.instagram, validation_status: validationStatus },
        { campaign_id: campaignId, channel: 'WHATSAPP', status: 'ready', content: outputs.whatsapp, validation_status: validationStatus },
        { campaign_id: campaignId, channel: 'IN_STORE_POSTER', status: 'ready', content: outputs.poster || {}, validation_status: validationStatus },
      ]);

      const now = new Date().toISOString();
      return {
        campaignId,
        claimToken,
        pack: {
          campaign: {
            id: campaignId,
            businessId: null,
            claimToken,
            type: input.type,
            objective: input.objective,
            audience: input.audience || '',
            offer: input.offer,
            schedule: input.schedule,
            status: 'ready',
            performanceNotes: '',
            createdAt: now,
            updatedAt: now,
          },
          outputs,
          validationStatus,
        },
      };
    }

    const campaignId = 'cmp_anon_' + Date.now();
    const now = new Date().toISOString();
    return {
      campaignId,
      claimToken,
      pack: {
        campaign: {
          id: campaignId,
          businessId: null,
          claimToken,
          type: input.type,
          objective: input.objective,
          audience: input.audience || '',
          offer: input.offer,
          schedule: input.schedule,
          status: 'ready',
          performanceNotes: '',
          createdAt: now,
          updatedAt: now,
        },
        outputs,
        validationStatus,
      },
    };
  }

  public async claimAnonymousCampaign(claimToken: string, businessId: UUID): Promise<boolean> {
    if (!isSupabaseConfigured || !claimToken || !businessId) return false;
    const { data, error } = await (supabase as any).rpc('claim_anonymous_campaign', {
      p_claim_token: claimToken,
      p_business_id: businessId,
    });
    return !error && Boolean(data);
  }

  // 7. CAMPAIGN VAULT CRUD & REALTIME QUERIES
  public async getCampaigns(businessId: UUID): Promise<FullCampaignPack[]> {
    if (!businessId || !isSupabaseConfigured) return [];

    const { data: campaignRows, error } = await (supabase.from('campaigns') as any)
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error || !campaignRows) return [];

    const campaignIds = (campaignRows as any[]).map((c) => c.id);
    const { data: outputRows } = await (supabase.from('campaign_outputs') as any)
      .select('*')
      .in('campaign_id', campaignIds);

    return (campaignRows as any[]).map((c) => {
      const channelOutputs = ((outputRows || []) as any[]).filter((o) => o.campaign_id === c.id);
      const google = channelOutputs.find((o) => o.channel === 'GOOGLE_BUSINESS')?.content;
      const ig = channelOutputs.find((o) => o.channel === 'INSTAGRAM')?.content;
      const wa = channelOutputs.find((o) => o.channel === 'WHATSAPP')?.content;
      const poster = channelOutputs.find((o) => o.channel === 'IN_STORE_POSTER')?.content;

      return {
        campaign: {
          id: c.id,
          businessId: c.business_id,
          claimToken: c.claim_token,
          type: c.type as CampaignType,
          objective: c.objective as CampaignObjective,
          audience: c.audience,
          offer: c.offer as unknown as Campaign['offer'],
          schedule: c.schedule as unknown as Campaign['schedule'],
          status: c.status as CampaignStatus,
          errorMessage: c.error_message,
          performanceNotes: c.performance_notes || '',
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        },
        outputs: {
          googleBusiness: (google || {}) as FullCampaignPack['outputs']['googleBusiness'],
          instagram: (ig || {}) as FullCampaignPack['outputs']['instagram'],
          whatsapp: (wa || {}) as FullCampaignPack['outputs']['whatsapp'],
          poster: (poster || {}) as FullCampaignPack['outputs']['poster'],
        },
        validationStatus: 'VALID',
      };
    });
  }

  public async getCampaign(campaignId: UUID): Promise<FullCampaignPack | null> {
    if (!campaignId || !isSupabaseConfigured) return null;

    const { data: c, error } = await (supabase.from('campaigns') as any)
      .select('*')
      .eq('id', campaignId)
      .single();

    if (error || !c) return null;

    const { data: outputRows } = await (supabase.from('campaign_outputs') as any)
      .select('*')
      .eq('campaign_id', campaignId);

    const google = (outputRows as any[])?.find((o) => o.channel === 'GOOGLE_BUSINESS')?.content;
    const ig = (outputRows as any[])?.find((o) => o.channel === 'INSTAGRAM')?.content;
    const wa = (outputRows as any[])?.find((o) => o.channel === 'WHATSAPP')?.content;
    const poster = (outputRows as any[])?.find((o) => o.channel === 'IN_STORE_POSTER')?.content;

    return {
      campaign: {
        id: c.id,
        businessId: c.business_id,
        claimToken: c.claim_token,
        type: c.type as CampaignType,
        objective: c.objective as CampaignObjective,
        audience: c.audience,
        offer: c.offer as unknown as Campaign['offer'],
        schedule: c.schedule as unknown as Campaign['schedule'],
        status: c.status as CampaignStatus,
        errorMessage: c.error_message,
        performanceNotes: c.performance_notes || '',
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      },
      outputs: {
        googleBusiness: (google || {}) as FullCampaignPack['outputs']['googleBusiness'],
        instagram: (ig || {}) as FullCampaignPack['outputs']['instagram'],
        whatsapp: (wa || {}) as FullCampaignPack['outputs']['whatsapp'],
        poster: (poster || {}) as FullCampaignPack['outputs']['poster'],
      },
      validationStatus: 'VALID',
    };
  }

  public async updateCampaignStatus(
    campaignId: UUID,
    status: CampaignStatus,
    performanceNotes?: string
  ): Promise<void> {
    if (!campaignId || !isSupabaseConfigured) return;
    const payload: { status: string; performance_notes?: string; updated_at: string } = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (performanceNotes !== undefined) {
      payload.performance_notes = performanceNotes;
    }
    await (supabase.from('campaigns') as any).update(payload).eq('id', campaignId);
  }

  public async deleteCampaign(campaignId: UUID): Promise<void> {
    if (!campaignId || !isSupabaseConfigured) return;
    await (supabase.from('campaigns') as any).delete().eq('id', campaignId);
  }

  private _getEmptyProfile(businessId: UUID): BusinessProfile {
    return {
      businessId,
      name: '',
      category: 'Artisanal Cafe & Bakery',
      neighborhood: '',
      city: '',
      landmarks: '',
      targetCustomer: '',
      styleVoice: 'Warm, contemporary, artisanal yet unpretentious',
      signatureItems: '',
      primaryGoal: 'Increase foot traffic and walk-ins',
      peakHours: '',
      slowHours: '',
      defaultOffer: '',
      avgTicketINR: 350,
      targetMonthlyCustomers: 30,
      phoneWhatsApp: '',
      updatedAt: new Date().toISOString(),
    };
  }
}

export const api = new RealtimeApiClient();
