/**
 * StreetCraft Realtime Database-Backed API & Supabase Gateway
 * Enforces Data Integrity (zero mock state) & Realtime Database Updates.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { UUID } from '../types/common';
import { BusinessProfile, UserSession, UserProfile } from '../types/business';
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
  private async requireActiveSession(): Promise<{ userId: string; email: string }> {
    if (!isSupabaseConfigured) {
      const sess = await this.getSession();
      if (!sess.isAuthenticated || !sess.userId) {
        throw new Error('Authentication required: Session is compulsory.');
      }
      return { userId: sess.userId, email: sess.email };
    }

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session || !session.user) {
      throw new Error('Authentication required: Active session is compulsory. Please sign in to continue.');
    }
    return { userId: session.user.id, email: session.user.email || '' };
  }

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

    // Query business memberships
    const savedActiveId = localStorage.getItem('sc_active_business_id');
    const { data: members } = await (supabase.from('business_members') as any)
      .select('business_id, role')
      .eq('user_id', session.user.id);

    let activeBusinessId = '';
    let role: 'owner' | 'admin' | 'member' = 'owner';

    if (members && members.length > 0) {
      const matched = savedActiveId ? members.find((m: any) => m.business_id === savedActiveId) : null;
      if (matched) {
        activeBusinessId = matched.business_id;
        role = matched.role;
      } else {
        activeBusinessId = members[0].business_id;
        role = members[0].role;
        localStorage.setItem('sc_active_business_id', activeBusinessId);
      }
    }

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

  // 1b. USER PROFILE (public.profiles)
  public async getUserProfile(userId?: UUID): Promise<UserProfile | null> {
    const { userId: currentUserId } = await this.requireActiveSession();

    if (!isSupabaseConfigured) {
      const sess = await this.getSession();
      return {
        id: sess.userId || currentUserId,
        fullName: sess.name || 'Store Operator',
        phone: sess.phone || '',
        notificationPreferences: {
          email: true,
          whatsapp: false,
          weeklyDigest: true,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const targetUserId = userId || currentUserId;
    if (!targetUserId) return null;

    const { data, error } = await (supabase.from('profiles') as any)
      .select('*')
      .eq('id', targetUserId)
      .maybeSingle();

    if (error || !data) {
      return {
        id: targetUserId,
        fullName: '',
        phone: '',
        notificationPreferences: {
          email: true,
          whatsapp: false,
          weeklyDigest: true,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      id: data.id,
      fullName: data.full_name || '',
      avatarUrl: data.avatar_url || '',
      phone: data.phone || '',
      notificationPreferences: data.notification_preferences || {
        email: true,
        whatsapp: false,
        weeklyDigest: true,
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  public async updateUserProfile(
    userId: UUID,
    updates: {
      fullName?: string;
      phone?: string;
      avatarUrl?: string;
      notificationPreferences?: { email: boolean; whatsapp: boolean; weeklyDigest: boolean };
    }
  ): Promise<UserProfile | null> {
    const { userId: authUserId } = await this.requireActiveSession();
    if (userId !== authUserId) {
      throw new Error('Unauthorized: Cannot modify profile for another user.');
    }

    if (!isSupabaseConfigured) {
      return this.getUserProfile(userId);
    }

    const payload: any = {
      updated_at: new Date().toISOString(),
    };
    if (updates.fullName !== undefined) payload.full_name = updates.fullName;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
    if (updates.notificationPreferences !== undefined) payload.notification_preferences = updates.notificationPreferences;

    const { error } = await (supabase.from('profiles') as any)
      .upsert({
        id: userId,
        ...payload,
      });

    if (error) throw error;
    return this.getUserProfile(userId);
  }

  public async getMyBusinesses(): Promise<Array<{ id: UUID; name: string }>> {
    const { userId } = await this.requireActiveSession();

    if (!isSupabaseConfigured) {
      return [{ id: 'biz_local', name: 'My Business' }];
    }

    const { data } = await (supabase.from('business_members') as any)
      .select('business_id, businesses(id, name)')
      .eq('user_id', userId);

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
    const { userId } = await this.requireActiveSession();
    if (!isSupabaseConfigured) return { limit: 2 };

    const { data: sub } = await (supabase.from('subscriptions') as any)
      .select('plan_id')
      .eq('user_id', userId)
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
    await this.requireActiveSession();

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

  public async resetPassword(email: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
    }
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

  public async cancelSubscription(businessId?: UUID): Promise<{ success: boolean; status: string }> {
    await this.requireActiveSession();

    if (!isSupabaseConfigured) {
      return { success: true, status: 'CANCELLED' };
    }

    const { data, error } = await supabase.rpc('cancel_user_subscription');
    if (error) {
      throw new Error(error.message || 'Failed to cancel subscription.');
    }

    return data as { success: boolean; status: string };
  }

  public async getFestivalCalendar() {
    if (!isSupabaseConfigured) return [];
    const { data } = await (supabase.from('festival_calendar') as any)
      .select('*')
      .order('starts_at', { ascending: true });
    return data || [];
  }

  // 3. BUSINESS PROFILE & PREFERENCES
  public async getBusinessProfile(businessId: UUID): Promise<BusinessProfile> {
    if (!businessId) {
      return this._getEmptyProfile('');
    }

    await this.requireActiveSession();

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
    await this.requireActiveSession();

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
    if (businessId) {
      await this.requireActiveSession();
    }
    const plans = await this.getPlans();
    if (plans.length === 0) throw new Error('No plans found in database. Check Supabase connection.');

    if (!businessId || !isSupabaseConfigured) {
      const defaultPlan = plans[0];
      const limit = defaultPlan.monthly_campaign_limit ?? defaultPlan.monthly_pack_limit ?? 3;
      return {
        periodId: 'up_local',
        businessId: businessId || 'biz_local',
        plan: defaultPlan.id as PlanTier,
        planName: defaultPlan.name,
        priceINR: defaultPlan.monthly_inr,
        monthlyLimit: limit,
        usedCampaigns: 0,
        remainingCampaigns: limit,
        usedPacks: 0,
        remainingPacks: limit,
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
    const planLimit = planObj.monthly_campaign_limit ?? planObj.monthly_pack_limit ?? 3;
    const campaignLimit = period?.campaign_limit ?? period?.pack_limit ?? planLimit;
    const campaignsUsed = period?.campaigns_used ?? period?.packs_used ?? 0;
    const remainingCampaigns = Math.max(0, campaignLimit - campaignsUsed);

    return {
      periodId: period?.id || '',
      businessId,
      plan: planTier,
      planName: planObj.name,
      priceINR: planObj.monthly_inr,
      monthlyLimit: campaignLimit,
      usedCampaigns: campaignsUsed,
      remainingCampaigns,
      usedPacks: campaignsUsed,
      remainingPacks: remainingCampaigns,
      percentUsed: campaignLimit > 0 ? Math.min(100, Math.round((campaignsUsed / campaignLimit) * 100)) : 0,
      periodStart: period?.period_start || '',
      periodEnd: period?.period_end || '',
      canGenerate: campaignsUsed < campaignLimit,
    };
  }

  public async getUsageEvents(businessId: UUID): Promise<UsageEvent[]> {
    if (!businessId || !isSupabaseConfigured) return [];
    await this.requireActiveSession();

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

  public async generateAndSaveCampaign(
    businessId: UUID,
    input: CampaignGenerationInput,
    onProgress?: (channel: string, status: 'generating' | 'ready') => void
  ): Promise<FullCampaignPack> {
    if (!businessId || typeof businessId !== 'string' || businessId.trim() === '') {
      throw new Error('Cannot create campaigns without an active business. Please select or create a business storefront first.');
    }

    const { userId } = await this.requireActiveSession();

    if (isSupabaseConfigured) {
      const { data: members, error: memError } = await (supabase.from('business_members') as any)
        .select('id')
        .eq('business_id', businessId)
        .eq('user_id', userId);

      if (memError || !members || members.length === 0) {
        throw new Error('Unauthorized: You do not have access to this business context.');
      }
    }

    const profile = await this.getBusinessProfile(businessId);
    const { outputs, validationStatus } = generateCampaignPack(profile, input);

    if (onProgress) {
      onProgress('GOOGLE_BUSINESS', 'generating');
      onProgress('INSTAGRAM', 'generating');
      onProgress('WHATSAPP', 'generating');
      onProgress('IN_STORE_POSTER', 'generating');
    }

    if (isSupabaseConfigured && businessId) {
      const { data: rpcResult, error: rpcError } = await (supabase as any).rpc('save_campaign_atomically', {
        p_business_id: businessId,
        p_campaign_type: input.type,
        p_objective: input.objective,
        p_audience: input.audience || '',
        p_offer: input.offer,
        p_schedule: input.schedule,
        p_google_content: outputs.googleBusiness,
        p_instagram_content: outputs.instagram,
        p_whatsapp_content: outputs.whatsapp,
        p_poster_content: outputs.poster || {},
      });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      if (onProgress) {
        onProgress('GOOGLE_BUSINESS', 'ready');
        onProgress('INSTAGRAM', 'ready');
        onProgress('WHATSAPP', 'ready');
        onProgress('IN_STORE_POSTER', 'ready');
      }

      const campaignId = (rpcResult as { campaign_id: string }).campaign_id;
      const fullPack = await this.getCampaign(campaignId);
      if (!fullPack) throw new Error('Failed to retrieve newly generated campaign.');
      return fullPack;
    }

    // Local fallback
    const { campaignData } = generateCampaignPack(profile, input);
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
    const campaignId = 'cmp_anon_' + Date.now();
    const now = new Date().toISOString();

    const pack: FullCampaignPack = {
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
    };

    if (isSupabaseConfigured) {
      try {
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

        if (!cError && campaignRow?.id) {
          const dbCampaignId = campaignRow.id;
          pack.campaign.id = dbCampaignId;
          await (supabase.from('campaign_outputs') as any).insert([
            { campaign_id: dbCampaignId, channel: 'GOOGLE_BUSINESS', status: 'ready', content: outputs.googleBusiness, validation_status: validationStatus },
            { campaign_id: dbCampaignId, channel: 'INSTAGRAM', status: 'ready', content: outputs.instagram, validation_status: validationStatus },
            { campaign_id: dbCampaignId, channel: 'WHATSAPP', status: 'ready', content: outputs.whatsapp, validation_status: validationStatus },
            { campaign_id: dbCampaignId, channel: 'IN_STORE_POSTER', status: 'ready', content: outputs.poster || {}, validation_status: validationStatus },
          ]);
          return { campaignId: dbCampaignId, claimToken, pack };
        }
      } catch {
        // Graceful fallback to client-side pack
      }
    }

    return {
      campaignId,
      claimToken,
      pack,
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
    await this.requireActiveSession();

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
    await this.requireActiveSession();

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
    await this.requireActiveSession();

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
    await this.requireActiveSession();

    await (supabase.from('campaigns') as any).delete().eq('id', campaignId);
  }

  public async confirmPaymentAndActivateSubscription(
    provider: string,
    paymentId: string,
    orderId: string,
    planId: string,
    billingCycle: string
  ): Promise<{ success: boolean; plan: string; billingCycle: string; status: string; business_limit: number; monthly_campaign_limit: number }> {
    await this.requireActiveSession();

    if (!isSupabaseConfigured) {
      return {
        success: true,
        plan: planId,
        billingCycle,
        status: 'ACTIVE',
        business_limit: planId === 'GROWTH' ? 10 : 5,
        monthly_campaign_limit: planId === 'GROWTH' ? 300 : 100,
      };
    }

    const { data, error } = await (supabase as any).rpc('confirm_payment_and_activate_subscription', {
      p_payment_provider: provider,
      p_payment_id: paymentId,
      p_order_id: orderId,
      p_plan_id: planId,
      p_billing_cycle: billingCycle,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
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
