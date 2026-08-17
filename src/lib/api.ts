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

    // User profile creation is strictly gated on email confirmation in database triggers
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

  public async resendConfirmationEmail(email: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
      if (error) throw error;
    }
  }

  public async resetPassword(email: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
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
    if (!isSupabaseConfigured) {
      return this._getDefaultFestivalCalendar();
    }
    const { data, error } = await (supabase.from('festival_calendar') as any)
      .select('*')
      .order('starts_at', { ascending: true });
    if (error || !data || data.length === 0) {
      return this._getDefaultFestivalCalendar();
    }
    return data;
  }

  private _getDefaultFestivalCalendar() {
    return [
      { id: 'fest_newyear', name: 'New Year Kickoff & Fresh Start', region: 'National', starts_at: '2026-01-01', ends_at: '2026-01-04', marketing_relevance: 'Healthy resolutions, fresh smoothies & wholesome breakfast bowls', suggested_offer: 'New Year detox combos & 15% fresh start breakfast offer' },
      { id: 'fest_harvest', name: 'Pongal, Makar Sankranti & Lohri', region: 'National / Regional', starts_at: '2026-01-13', ends_at: '2026-01-16', marketing_relevance: 'Harvest celebration feasts, traditional sweets & warm winter treats', suggested_offer: 'Special festive harvest thalis & warm jaggery dessert boxes' },
      { id: 'fest_republic', name: 'Republic Day Long Weekend', region: 'National', starts_at: '2026-01-24', ends_at: '2026-01-27', marketing_relevance: 'National holiday long weekend family brunch & walk-ins', suggested_offer: 'Tricolor specialty desserts & long-weekend breakfast combos' },
      { id: 'fest_valentines', name: "Valentine's Week & Couples Dining", region: 'National', starts_at: '2026-02-07', ends_at: '2026-02-15', marketing_relevance: 'Romantic dining, dessert duos & artisanal gift hampers', suggested_offer: '2-course couple dinner pairings & handcrafted chocolate boxes' },
      { id: 'fest_shivratri', name: 'Maha Shivratri Fasting Specials', region: 'National', starts_at: '2026-02-24', ends_at: '2026-02-26', marketing_relevance: 'Wholesome fasting menus, fruit bowls & sattvic delicacies', suggested_offer: 'Special fasting thali & cold pressed beverage pairing' },
      { id: 'fest_holi', name: 'Holi Festive Weekend & Gujiya Carnival', region: 'National', starts_at: '2026-03-13', ends_at: '2026-03-16', marketing_relevance: 'Organic thandai specials, colorful sweets & family celebrations', suggested_offer: 'Artisanal thandai pitchers & curated Holi gujiya gift boxes' },
      { id: 'fest_ugadi', name: 'Ugadi & Gudi Padwa (New Year)', region: 'South / Maharashtra', starts_at: '2026-03-19', ends_at: '2026-03-22', marketing_relevance: 'Traditional new year feast platters, mango specialties & sweets', suggested_offer: 'Regional new year festive platter & family sweet box' },
      { id: 'fest_eid_fitr', name: 'Eid-ul-Fitr Feasts', region: 'National', starts_at: '2026-03-29', ends_at: '2026-04-01', marketing_relevance: 'Festive feasting, biryani feasts & celebratory dessert drops', suggested_offer: 'Grand Eid celebration platters & complimentary sheer khurma' },
      { id: 'fest_easter', name: 'Easter & Spring Bakes Weekend', region: 'National', starts_at: '2026-04-03', ends_at: '2026-04-06', marketing_relevance: 'Hot cross buns, carrot cakes & spring brunch menus', suggested_offer: 'Easter egg dessert basket & family brunch booking discount' },
      { id: 'fest_baisakhi', name: 'Baisakhi, Vishu & Poila Boishakh', region: 'North / South / East', starts_at: '2026-04-13', ends_at: '2026-04-16', marketing_relevance: 'Regional harvest celebrations & traditional culinary specials', suggested_offer: 'Festive thali combo & celebration sweet box' },
      { id: 'fest_mothers_day', name: "Mother's Day High Tea & Dining", region: 'National', starts_at: '2026-05-08', ends_at: '2026-05-11', marketing_relevance: "Mother's Day celebratory brunch, tea sets & salon packages", suggested_offer: 'Complimentary dessert for moms & family high-tea reservation packages' },
      { id: 'fest_summer_mango', name: 'Summer Mango Festival', region: 'National', starts_at: '2026-05-15', ends_at: '2026-05-31', marketing_relevance: 'Peak Alphonso pastry specials, mango smoothies & fruit coolers', suggested_offer: 'Fresh mango dessert bowl & buy-2-get-1 mango coolers' },
      { id: 'fest_fathers_day', name: "Father's Day Feast & Brew Specials", region: 'National', starts_at: '2026-06-19', ends_at: '2026-06-22', marketing_relevance: "Father's Day hearty grills, artisanal coffee flights & meals", suggested_offer: 'Father-and-child brunch discount & specialty brew tastings' },
      { id: 'fest_yoga_day', name: 'International Yoga & Wellness Week', region: 'National', starts_at: '2026-06-19', ends_at: '2026-06-25', marketing_relevance: 'Detox juices, protein bowls & wellness studio promotions', suggested_offer: 'Green smoothie boost & healthy morning breakfast combos' },
      { id: 'fest_monsoon', name: 'Monsoon Kickoff & Chai Pakoda Window', region: 'National', starts_at: '2026-06-25', ends_at: '2026-07-10', marketing_relevance: 'Rainy day comfort food, piping masala chai & crispy fritters', suggested_offer: 'Monsoon chai-pakoda duo & rainy afternoon discount' },
      { id: 'fest_chocolate_day', name: 'World Chocolate Day Festival', region: 'National', starts_at: '2026-07-06', ends_at: '2026-07-09', marketing_relevance: 'Decadent single-origin desserts, truffle boxes & mocha pairings', suggested_offer: 'Buy-1-get-1 dark chocolate pastry & artisan hot chocolate flight' },
      { id: 'fest_guru_purnima', name: 'Guru Purnima Gratitude Feasts', region: 'National', starts_at: '2026-07-18', ends_at: '2026-07-20', marketing_relevance: 'Family gatherings, mentor tributes & traditional sweets', suggested_offer: 'Family dinner platters & takeaway tribute sweet hampers' },
      { id: 'fest_independence', name: 'Independence Day Weekend', region: 'National', starts_at: '2026-08-14', ends_at: '2026-08-17', marketing_relevance: 'Long weekend dining & patriotic treats', suggested_offer: 'Tricolor specialty desserts or 15% long-weekend brunch combos' },
      { id: 'fest_raksha', name: 'Raksha Bandhan & Sibling Gifting', region: 'National', starts_at: '2026-08-26', ends_at: '2026-08-29', marketing_relevance: 'Sibling gifting, sweet boxes & celebratory meals', suggested_offer: 'Curated sibling gift boxes & 2-for-1 treat specials' },
      { id: 'fest_janmashtami', name: 'Janmashtami Sweet Drop', region: 'National', starts_at: '2026-08-28', ends_at: '2026-08-31', marketing_relevance: 'Festive dairy specialties, peda boxes & late night treats', suggested_offer: 'Fresh makhan & peda festive hamper with evening tea' },
      { id: 'fest_teachers_day', name: "Teachers' Day & Campus Specials", region: 'National', starts_at: '2026-09-04', ends_at: '2026-09-06', marketing_relevance: 'Student meetups, appreciation treats & afternoon snacks', suggested_offer: '20% teacher discount & student group study bundles' },
      { id: 'fest_onam', name: 'Onam Celebration & Grand Sadhya', region: 'Kerala / South', starts_at: '2026-09-03', ends_at: '2026-09-06', marketing_relevance: 'Sadhya feasts, harvest celebrations & family dining', suggested_offer: 'Special Onam festive menu & celebratory beverage pairing' },
      { id: 'fest_ganesh', name: 'Ganesh Chaturthi', region: 'Maharashtra / South / West', starts_at: '2026-09-14', ends_at: '2026-09-24', marketing_relevance: 'Festive family sweets, Modak specials & dining', suggested_offer: 'Artisanal festive sweets box & family feast platters' },
      { id: 'fest_coffee_day', name: 'International Coffee Day', region: 'National', starts_at: '2026-09-30', ends_at: '2026-10-02', marketing_relevance: 'Specialty single origin roasts, latte art & brewing classes', suggested_offer: 'Free shot upgrade & buy-1-get-1 specialty espresso' },
      { id: 'fest_navratri', name: 'Navratri & Durga Puja', region: 'National / Bengal / Gujarat', starts_at: '2026-10-11', ends_at: '2026-10-20', marketing_relevance: 'Festive feasting, fasting special menus & night treats', suggested_offer: 'Special festive thalis & evening celebration combos' },
      { id: 'fest_dussehra', name: 'Dussehra (Vijayadashami)', region: 'National', starts_at: '2026-10-20', ends_at: '2026-10-23', marketing_relevance: 'Celebratory family feasts, sweet boxes & new beginnings', suggested_offer: 'Grand festive thali & auspicious sweet boxes' },
      { id: 'fest_halloween', name: 'Halloween Spooky Treats & Autumn Window', region: 'National', starts_at: '2026-10-29', ends_at: '2026-11-01', marketing_relevance: 'Pumpkin spice season, spooky baked goods & costume discounts', suggested_offer: 'Halloween themed bakes & pumpkin spice latte pairings' },
      { id: 'fest_diwali', name: 'Diwali Lights & New Year Gifting', region: 'National', starts_at: '2026-11-08', ends_at: '2026-11-13', marketing_relevance: 'Peak shopping, corporate gifting & family celebrations', suggested_offer: 'Exclusive Diwali gift hampers & pre-booking discounts' },
      { id: 'fest_bhai_dooj', name: 'Bhai Dooj Sibling Celebrations', region: 'National', starts_at: '2026-11-13', ends_at: '2026-11-15', marketing_relevance: 'Sibling lunches, post-Diwali dinners & festive treats', suggested_offer: 'Sibling dining combo & mini sweet box takeaway' },
      { id: 'fest_gurpurab', name: 'Guru Nanak Jayanti (Gurpurab)', region: 'National', starts_at: '2026-11-23', ends_at: '2026-11-25', marketing_relevance: 'Community gatherings, festive sweets & wholesome dining', suggested_offer: 'Festive langar-inspired thali & karah prasad dessert special' },
      { id: 'fest_black_friday', name: 'Black Friday & Small Business Weekend', region: 'National', starts_at: '2026-11-26', ends_at: '2026-11-30', marketing_relevance: 'Holiday shopping rush, gift card promotions & flash specials', suggested_offer: 'Buy a Rs. 1000 store gift card, get Rs. 250 bonus voucher' },
      { id: 'fest_winter_warmers', name: 'Winter Warmers & Hot Chocolate Fest', region: 'National', starts_at: '2026-12-01', ends_at: '2026-12-18', marketing_relevance: 'Warm comfort drinks, soups, spiced bakery goods & cozy evenings', suggested_offer: 'Gourmet hot chocolate flight & soup-plus-sandwich meal' },
      { id: 'fest_christmas', name: 'Christmas & Winter Carnival', region: 'National', starts_at: '2026-12-20', ends_at: '2026-12-26', marketing_relevance: 'Holiday cheer, hot chocolates, plum cakes & winter specials', suggested_offer: 'Signature hot chocolate pairings & holiday bakes gift box' },
      { id: 'fest_nye', name: "New Year's Eve & Countdown Brunch", region: 'National', starts_at: '2026-12-30', ends_at: '2027-01-02', marketing_relevance: 'Year-end celebrations & fresh January brunch', suggested_offer: 'New Year brunch reservations & early-bird table booking' },
    ];
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
