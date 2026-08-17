'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { FullCampaignPack, CampaignType } from '../types/campaign';
import { BusinessProfile } from '../types/business';
import { DatabasePlan } from '../types/billing';
import { ChannelCard } from '../components/ChannelCard';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { generateCampaignPack } from '../engine/campaignEngine';

export const LandingView: React.FC = () => {
  const router = useRouter();

  // Database-backed State
  const [, setPlans] = useState<DatabasePlan[]>([]);
  const [festivals, setFestivals] = useState<any[]>([]);
  const [founderAllocation, setFounderAllocation] = useState<{ total_slots: number; claimed_slots: number } | null>(null);

  // Interactive Product Demo State
  const [selectedCategory, setSelectedCategory] = useState('Specialty Cafe & Bakery');
  const [storeName, setStoreName] = useState('The Roasted Bean');
  const [neighborhood, setNeighborhood] = useState('Indiranagar');
  const [city] = useState('Bengaluru');
  const [landmarks] = useState('Near 12th Main & Defence Colony Park');
  const [campaignType, setCampaignType] = useState<CampaignType>('WEEKDAY_BOOST');
  const [offerTitle, setOfferTitle] = useState('20% off single-origin pour-overs & fresh bakes');
  const [timingLabel, setTimingLabel] = useState('Monday–Thursday, 3:00 PM – 6:00 PM');

  const [isGenerating, setIsGenerating] = useState(false);
  const [livePack, setLivePack] = useState<FullCampaignPack | null>(null);
  const [claimToken, setClaimToken] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState<'GOOGLE_BUSINESS' | 'INSTAGRAM' | 'WHATSAPP' | 'IN_STORE_POSTER'>('GOOGLE_BUSINESS');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // 1. Fetch Real Database Assets (Plans, Festivals, Founder Allocation)
  useEffect(() => {
    let isMounted = true;

    Promise.all([
      api.getPlans(),
      api.getFestivalCalendar(),
      api.getFounderAllocation(),
    ]).then(([plansData, festivalData, founderData]) => {
      if (isMounted) {
        setPlans(plansData);
        setFestivals(festivalData || []);
        setFounderAllocation(founderData);
      }
    }).catch(() => {
      // Graceful fallback without hardcoded fake data
    });

    if (isSupabaseConfigured) {
      const channel = supabase.channel('landing_founder_changes')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'founder_allocation' }, (payload) => {
          if (payload.new && isMounted) {
            setFounderAllocation(payload.new as any);
          }
        })
        .subscribe();

      return () => {
        isMounted = false;
        supabase.removeChannel(channel);
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Demo Generation Execution
  const executeDemoGeneration = (
    customType?: CampaignType,
    customOffer?: string,
    customStore?: string,
    customNeighborhood?: string
  ) => {
    setIsGenerating(true);
    try {
      const targetType = customType || campaignType;
      const targetOffer = customOffer || offerTitle;
      const targetStore = customStore || storeName;
      const targetNeighborhood = customNeighborhood || neighborhood;

      const liveProfile: BusinessProfile = {
        businessId: '00000000-0000-0000-0000-000000000000',
        name: targetStore,
        category: selectedCategory,
        neighborhood: targetNeighborhood,
        city: city,
        landmarks: landmarks,
        targetCustomer: 'Neighborhood residents, nearby office workers, and visitors',
        styleVoice: 'Warm, artisan, welcoming',
        signatureItems: 'Single-Origin Pour Overs, Almond Croissants, Handmade Sourdough',
        primaryGoal: 'Drive quiet hour walk-ins',
        peakHours: '08:00 - 11:00',
        slowHours: '15:00 - 18:00',
        defaultOffer: '20% off pour-overs',
        avgTicketINR: 200,
        targetMonthlyCustomers: 500,
        phoneWhatsApp: '+91 98765 43210',
        updatedAt: new Date().toISOString(),
      };

      const input = {
        type: targetType,
        objective: 'MORE_WALK_INS' as const,
        audience: 'Neighborhood residents, nearby office workers, and visitors',
        offer: {
          title: targetOffer,
          description: targetOffer,
          value: 'Special Promotional Perk',
          terms: 'Flash message at counter to redeem.',
        },
        schedule: {
          startsAt: new Date().toISOString(),
          endsAt: new Date(Date.now() + 5 * 86400000).toISOString(),
          timingLabel,
        },
      };

      const packResult = generateCampaignPack(liveProfile, input);
      const campaignId = 'cmp_demo_' + Date.now();
      const demoFullPack: FullCampaignPack = {
        campaign: {
          id: campaignId,
          businessId: null,
          claimToken: 'demo_claim_token',
          type: targetType,
          objective: 'MORE_WALK_INS',
          audience: 'Neighborhood residents, nearby office workers, and visitors',
          offer: input.offer,
          schedule: input.schedule,
          status: 'ready',
          performanceNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        outputs: packResult.outputs,
        validationStatus: packResult.validationStatus,
      };

      setLivePack(demoFullPack);
      setClaimToken('demo_token_' + Date.now());
    } finally {
      setIsGenerating(false);
    }
  };

  // Run initial demo preview on mount
  useEffect(() => {
    executeDemoGeneration();
  }, []);

  const handlePresetSelect = (preset: {
    category: string;
    store: string;
    neighborhood: string;
    type: CampaignType;
    offer: string;
    timing: string;
  }) => {
    setSelectedCategory(preset.category);
    setStoreName(preset.store);
    setNeighborhood(preset.neighborhood);
    setCampaignType(preset.type);
    setOfferTitle(preset.offer);
    setTimingLabel(preset.timing);
    executeDemoGeneration(preset.type, preset.offer, preset.store, preset.neighborhood);
  };

  const faqs = [
    {
      q: 'What kind of businesses is StreetCraft for?',
      a: 'StreetCraft is built for physical, walk-in businesses — cafes, bakeries, bistros, salons, retail boutiques, and specialty stores that benefit from direct foot traffic.',
    },
    {
      q: 'What does a campaign include?',
      a: 'Every campaign generates 4 coordinated outputs simultaneously: Google Business profile updates, an Instagram Reel hook with 3 Story frames and hashtags, WhatsApp broadcast copy, and a printable in-store counter card.',
    },
    {
      q: 'Do I need marketing experience?',
      a: 'Zero. StreetCraft writes customer-ready copy and provides exact formats formatted for each platform so you can publish immediately.',
    },
    {
      q: 'Can I manage multiple businesses?',
      a: 'Yes. The Free plan includes up to 2 businesses, Pro includes 5, and Growth includes 10. Each business has its own isolated profile, preferences, campaigns, and usage tracking.',
    },
    {
      q: 'What happens on the Free plan?',
      a: 'The Free plan gives you 3 complete campaigns every month, store preferences, and access to regional calendar triggers. No payment card is required.',
    },
    {
      q: 'How does Founder pricing work?',
      a: 'The first 100 members can lock in 30% off Pro (₹837/quarter or ₹2,790/year). Available once per account on quarterly or annual billing while slots remain.',
    },
    {
      q: 'Can I cancel?',
      a: 'Yes, you can upgrade, downgrade, or cancel your subscription at any time directly from your workspace settings with 1 click.',
    },
  ];

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 var(--space-gutter) 96px' }}>

      {/* =========================================================================
          01 — HERO (Outcome + Immediate Tangible Proofs)
          ========================================================================= */}
      <section style={{ padding: '64px 0 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '48px', alignItems: 'center' }}>

          {/* Left: Outcome Framing */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-subtle)', flexShrink: 0, background: '#FAF8F5' }}>
                <img src="/illustration_storefront.jpg" alt="Storefront sketch" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                STREETCRAFT &bull; GROWTH ENGINE FOR PHYSICAL BUSINESSES
              </span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--type-display-xl-size)', color: 'var(--color-ink)', lineHeight: 'var(--type-display-xl-leading)', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
              Turn quiet afternoons into packed storefront tables.
            </h1>

            <p style={{ fontSize: '17px', color: 'var(--color-ink-muted)', lineHeight: '1.65', margin: '0 0 32px', maxWidth: '620px' }}>
              Your slow hours are predictable. Your regulars are two blocks away. StreetCraft turns business opportunities into coordinated customer promotions across Google, Instagram, WhatsApp, and your counter.
            </p>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '36px' }}>
              <button className="btn-primary" style={{ padding: '13px 28px', fontSize: '14.5px' }} onClick={() => router.push('/free-tool')}>
                Try Free Campaign Tool
              </button>
              <button className="btn-secondary" style={{ padding: '13px 24px', fontSize: '14.5px' }} onClick={() => router.push('/login')}>
                Sign in to store
              </button>
            </div>

            {/* Quiet Outcome Indicators */}
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', paddingTop: '22px', borderTop: '1px solid var(--color-border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '15px', color: 'var(--color-ink)' }}>0% Commission</strong>
                <span style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)' }}>Keep 100% walk-in revenue</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '15px', color: 'var(--color-ink)' }}>4 Touchpoints</strong>
                <span style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)' }}>Google, IG, WhatsApp, Counter</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '15px', color: 'var(--color-ink)' }}>Store Preferences</strong>
                <span style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)' }}>Remembers your parameters</span>
              </div>
            </div>
          </div>

          {/* Right: Tangible Multi-Touchpoint Physical Artifact Stage */}
          <div className="card" style={{ padding: '28px 30px', background: 'var(--color-surface)', border: '2px solid var(--color-border)', boxShadow: 'var(--shadow-paper)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.08em' }}>
                ONE CAMPAIGN &bull; FOUR COORDINATED TOUCHPOINTS
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

              {/* Artifact 1: Google */}
              <div style={{ background: 'var(--color-surface-raised)', padding: '14px 16px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  GOOGLE BUSINESS
                </span>
                <strong style={{ fontSize: '13px', color: 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
                  Slow-Hour Coffee Special
                </strong>
                <p style={{ fontSize: '11.5px', color: 'var(--color-ink-soft)', lineHeight: '1.45', margin: 0 }}>
                  20% off single-origin pour-overs near 12th Main, Indiranagar.
                </p>
              </div>

              {/* Artifact 2: Instagram */}
              <div style={{ background: 'var(--color-surface-raised)', padding: '14px 16px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  INSTAGRAM REEL &amp; STORY
                </span>
                <strong style={{ fontSize: '13px', color: 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
                  &quot;Your 3 PM coffee reset.&quot;
                </strong>
                <p style={{ fontSize: '11.5px', color: 'var(--color-ink-soft)', lineHeight: '1.45', margin: 0 }}>
                  Reel hook + 3 Story frames + area hashtags.
                </p>
              </div>

              {/* Artifact 3: WhatsApp */}
              <div style={{ background: 'var(--color-surface-raised)', padding: '14px 16px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  WHATSAPP BROADCAST
                </span>
                <strong style={{ fontSize: '13px', color: 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
                  Neighborhood VIP Drop
                </strong>
                <p style={{ fontSize: '11.5px', color: 'var(--color-ink-soft)', lineHeight: '1.45', margin: 0 }}>
                  Formatted message with instant counter flash redemption.
                </p>
              </div>

              {/* Artifact 4: Counter Card */}
              <div style={{ background: 'var(--color-surface-raised)', padding: '14px 16px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  PRINTED COUNTER CARD
                </span>
                <strong style={{ fontSize: '13px', color: 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
                  Table Tent / A5 Print
                </strong>
                <p style={{ fontSize: '11.5px', color: 'var(--color-ink-soft)', lineHeight: '1.45', margin: 0 }}>
                  High-contrast QR display ready for physical tables and counter.
                </p>
              </div>

            </div>

            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12.5px', color: 'var(--color-ink-muted)' }}>
              All 4 formats generated together in one coordinated campaign.
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          02 — THE PROBLEM & WORKFLOW CONTRAST
          ========================================================================= */}
      <section style={{ margin: '0 auto 72px' }}>
        <div className="card" style={{ padding: '44px 48px', background: 'var(--color-surface)' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span className="section-eyebrow">THE STORE MARKETING REALITY</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--color-ink)', marginTop: '4px' }}>
              Physical businesses don&apos;t need more marketing work.
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-ink-muted)', maxWidth: '640px', margin: '8px auto 0', lineHeight: '1.6' }}>
              You don&apos;t need another generic text box. You need a simple way to turn an opportunity into walk-in foot traffic.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>

            {/* Doing it yourself */}
            <div style={{ background: 'var(--color-surface-raised)', padding: '28px 30px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '14px' }}>
                DOING IT YOURSELF
              </span>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: 'var(--color-ink-soft)' }}>
                <li style={{ paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>1. Spot a slow Tuesday afternoon</li>
                <li style={{ paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>2. Write Instagram caption and search for hashtags</li>
                <li style={{ paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>3. Reformat message for WhatsApp regulars</li>
                <li style={{ paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>4. Design a poster in external design tools</li>
                <li style={{ paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>5. Log into Google Business to post store update</li>
                <li style={{ color: 'var(--color-accent)', fontWeight: 600, paddingTop: '4px' }}>&rarr; Hours spent, inconsistent messaging</li>
              </ul>
            </div>

            {/* With StreetCraft */}
            <div style={{ background: 'var(--color-surface-raised)', padding: '28px 30px', borderRadius: 'var(--radius-xs)', border: '2px solid var(--color-primary)' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '14px', fontWeight: 600 }}>
                WITH STREETCRAFT
              </span>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: 'var(--color-ink)' }}>
                <li style={{ paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}><strong>1. Select the Opportunity:</strong> Tuesday 3–6 PM Slump</li>
                <li style={{ paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}><strong>2. Instant Coordination:</strong> StreetCraft applies Store Preferences</li>
                <li style={{ paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}><strong>3. Complete Formats:</strong> Google + IG + WhatsApp + Poster</li>
                <li style={{ paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}><strong>4. Ready to Publish:</strong> Clean, character-compliant formats</li>
                <li style={{ color: 'var(--color-primary)', fontWeight: 700, paddingTop: '4px' }}>&rarr; 10 seconds total, 100% walk-in margin retained</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          03 — ENGINE ARCHITECTURE
          ========================================================================= */}
      <section style={{ margin: '0 auto 72px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="section-eyebrow">ENGINE ARCHITECTURE</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--color-ink)', marginTop: '4px' }}>
            From raw opportunity to live multi-touchpoint reach.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

          <div className="card" style={{ padding: '28px 26px', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '100%', height: '140px', borderRadius: 'var(--radius-xs)', overflow: 'hidden', marginBottom: '20px', border: '1px solid var(--color-border)', background: '#FAF8F5' }}>
              <img src="/illustration_storefront.jpg" alt="Storefront sketch" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 700, display: 'block', marginBottom: '10px' }}>
              01 &mdash; TELL US ABOUT YOUR BUSINESS
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '21px', color: 'var(--color-ink)', marginBottom: '10px' }}>
              Store Preferences
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', lineHeight: '1.65' }}>
              StreetCraft permanently saves your business category, neighborhood landmarks, signature items, and slow-hour windows. Enter them once.
            </p>
          </div>

          <div className="card" style={{ padding: '28px 26px', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '100%', height: '140px', borderRadius: 'var(--radius-xs)', overflow: 'hidden', marginBottom: '20px', border: '1px solid var(--color-border)', background: '#FAF8F5' }}>
              <img src="/illustration_opportunity.jpg" alt="Opportunity sketch" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 700, display: 'block', marginBottom: '10px' }}>
              02 &mdash; FIND THE OPPORTUNITY
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '21px', color: 'var(--color-ink)', marginBottom: '10px' }}>
              Opportunity Radar
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', lineHeight: '1.65' }}>
              StreetCraft turns a quiet weekday afternoon, a signature dish, a weekend rush, or an upcoming regional festival into a timely promotion.
            </p>
          </div>

          <div className="card" style={{ padding: '28px 26px', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '100%', height: '140px', borderRadius: 'var(--radius-xs)', overflow: 'hidden', marginBottom: '20px', border: '1px solid var(--color-border)', background: '#FAF8F5' }}>
              <img src="/illustration_counter_card.jpg" alt="Counter card sketch" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 700, display: 'block', marginBottom: '10px' }}>
              03 &mdash; CREATE EVERYTHING AT ONCE
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '21px', color: 'var(--color-ink)', marginBottom: '10px' }}>
              Coordinated Campaign
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', lineHeight: '1.65' }}>
              One idea becomes coordinated, character-compliant marketing for Google Search &amp; Maps, Instagram, WhatsApp, and physical in-store counter cards.
            </p>
          </div>

        </div>
      </section>

      {/* =========================================================================
          04 — ONE OPPORTUNITY, EVERYWHERE (Physical Output Evidence)
          ========================================================================= */}
      <section style={{ margin: '0 auto 72px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="section-eyebrow">PHYSICAL EVIDENCE</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--color-ink)', marginTop: '4px' }}>
            One Opportunity, Everywhere
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--color-ink-muted)', maxWidth: '600px', margin: '8px auto 0', lineHeight: '1.6' }}>
            Every storefront format receives content specifically structured for its context and customers.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '20px' }}>

          <div className="card" style={{ padding: '28px 26px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              GOOGLE
            </span>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '19px', color: 'var(--color-ink)', marginBottom: '10px' }}>
              Google Business Profile
            </h4>
            <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.55' }}>
              Clear store updates built for Google Maps and Search cards with neighborhood anchors.
            </p>
          </div>

          <div className="card" style={{ padding: '28px 26px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              INSTAGRAM
            </span>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '19px', color: 'var(--color-ink)', marginBottom: '10px' }}>
              Reels &amp; Story Frames
            </h4>
            <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.55' }}>
              3-second video hook, 3 sequential story frames, caption, and discovery tags.
            </p>
          </div>

          <div className="card" style={{ padding: '28px 26px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              WHATSAPP
            </span>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '19px', color: 'var(--color-ink)', marginBottom: '10px' }}>
              Broadcast Messaging
            </h4>
            <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.55' }}>
              Bold anchors, concise timing details, and counter flash redemption terms for customer lists.
            </p>
          </div>

          <div className="card" style={{ padding: '28px 26px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              IN STORE
            </span>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '19px', color: 'var(--color-ink)', marginBottom: '10px' }}>
              Printable Counter Cards
            </h4>
            <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.55' }}>
              High-contrast table tent and counter card layouts with designated QR code scan zones.
            </p>
          </div>

        </div>
      </section>

      {/* =========================================================================
          05 — INTERACTIVE PRODUCT DEMONSTRATION
          ========================================================================= */}
      <section id="engine-demo" style={{ margin: '0 auto 72px', scrollMarginTop: '80px' }}>
        <div className="card" style={{ padding: '36px 40px', background: 'var(--color-surface)' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span className="section-eyebrow">INTERACTIVE PRODUCT DEMONSTRATION</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', color: 'var(--color-ink)', marginTop: '4px' }}>
                See how the engine works
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginTop: '6px' }}>
                Select a sample business scenario or customize parameters to preview generation.
              </p>
            </div>

            {/* Quick Scenario Preset Selectors */}
            <div style={{ display: 'flex', gap: '8px', background: 'var(--color-surface-raised)', padding: '5px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
              {[
                {
                  label: 'Indiranagar Cafe (Slow 3–6 PM)',
                  category: 'Specialty Cafe & Bakery',
                  store: 'The Roasted Bean',
                  neighborhood: 'Indiranagar',
                  type: 'WEEKDAY_BOOST' as CampaignType,
                  offer: '20% off single-origin pour-overs & fresh sourdough bakes',
                  timing: 'Monday–Thursday, 3:00 PM – 6:00 PM',
                },
                {
                  label: 'Bandra Bistro (Weekend Brunch)',
                  category: 'Artisanal Bistro & Dining',
                  store: 'Artisan Table',
                  neighborhood: 'Bandra West',
                  type: 'WEEKEND_MAGNET' as CampaignType,
                  offer: 'Limited Chef’s Weekend Tasting Menu & flat white pairing',
                  timing: 'Saturday & Sunday, 9:00 AM – 2:00 PM',
                },
                {
                  label: 'Chennai Sweets (Festival Hampers)',
                  category: 'Heritage Sweets & Savouries',
                  store: 'Heritage Sweets',
                  neighborhood: 'T. Nagar',
                  type: 'FESTIVAL_SPECIAL' as CampaignType,
                  offer: 'Handcrafted pure ghee festive gift hampers with advance booking',
                  timing: 'Festival Week Special Window',
                },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetSelect(p)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    fontWeight: storeName === p.store ? 600 : 400,
                    color: storeName === p.store ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                    background: storeName === p.store ? 'var(--color-surface)' : 'transparent',
                    border: storeName === p.store ? '1px solid var(--color-border)' : '1px solid transparent',
                    borderRadius: 'var(--radius-xs)',
                    boxShadow: storeName === p.store ? 'var(--shadow-subtle)' : 'none',
                    transition: 'var(--motion-fast)',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2-Column Workstation */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px', alignItems: 'start' }}>

            {/* Left Column: Parameter Inputs & Controls */}
            <div style={{ background: 'var(--color-surface-raised)', padding: '26px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
                Sample Store Parameters
              </div>

              <div>
                <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', display: 'block', marginBottom: '5px' }}>STORE NAME</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '9px 12px', fontSize: '13.5px', width: '100%' }}
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', display: 'block', marginBottom: '5px' }}>NEIGHBORHOOD</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '9px 12px', fontSize: '13.5px', width: '100%' }}
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', display: 'block', marginBottom: '5px' }}>PROMOTION OFFER</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '9px 12px', fontSize: '13.5px', width: '100%' }}
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                />
              </div>

              <button
                className="btn-primary"
                style={{ width: '100%', padding: '12px 18px', fontSize: '14px', justifyContent: 'center', marginTop: '6px' }}
                disabled={isGenerating}
                onClick={() => executeDemoGeneration()}
              >
                {isGenerating ? <RefreshCw size={14} className="spin" /> : <RefreshCw size={14} />}
                {isGenerating ? 'Generating Campaign...' : 'Generate Demo Campaign'}
              </button>
            </div>

            {/* Right Column: Channel Tabs & Output Display */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ fontSize: '13px', color: 'var(--color-ink)' }}>
                  <strong>Output Preview:</strong> <span style={{ color: 'var(--color-ink-muted)' }}>{storeName} &bull; {neighborhood}</span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { id: 'GOOGLE_BUSINESS', label: 'Google' },
                    { id: 'INSTAGRAM', label: 'Instagram' },
                    { id: 'WHATSAPP', label: 'WhatsApp' },
                    { id: 'IN_STORE_POSTER', label: 'In-Store' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveChannel(tab.id as any)}
                      style={{
                        padding: '7px 16px',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '12.5px',
                        fontWeight: activeChannel === tab.id ? 600 : 400,
                        color: activeChannel === tab.id ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                        background: activeChannel === tab.id ? 'var(--color-surface-raised)' : 'transparent',
                        border: activeChannel === tab.id ? '1px solid var(--color-border)' : '1px solid transparent',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {livePack && (
                <div>
                  <ChannelCard
                    channel={activeChannel}
                    status="ready"
                    content={
                      activeChannel === 'GOOGLE_BUSINESS'
                        ? (livePack.outputs.googleBusiness as unknown as Record<string, unknown>)
                        : activeChannel === 'INSTAGRAM'
                          ? (livePack.outputs.instagram as unknown as Record<string, unknown>)
                          : activeChannel === 'WHATSAPP'
                            ? (livePack.outputs.whatsapp as unknown as Record<string, unknown>)
                            : ((livePack.outputs.poster || {}) as unknown as Record<string, unknown>)
                    }
                  />

                  {claimToken && (
                    <div style={{ marginTop: '20px', padding: '16px 20px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                      <div style={{ fontSize: '13.5px', color: 'var(--color-ink)' }}>
                        <CheckCircle2 size={16} color="var(--color-primary)" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
                        That is what StreetCraft does. Try it with your own business.
                      </div>
                      <button
                        className="btn-primary"
                        style={{ fontSize: '13px', padding: '7px 16px' }}
                        onClick={() => router.push('/free-tool')}
                      >
                        Create your first campaign
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          06 — REALTIME REGIONAL FESTIVAL RADAR
          ========================================================================= */}
      {festivals.length > 0 && (
        <section style={{ margin: '0 auto 72px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span className="section-eyebrow">UPCOMING OPPORTUNITIES</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', color: 'var(--color-ink)', marginTop: '4px' }}>
              Regional Calendar Triggers
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginTop: '6px' }}>
              Live upcoming occasions to help your store prepare advance promotions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {festivals.slice(0, 3).map((f) => (
              <div key={f.id} className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600 }}>
                    {new Date(f.starts_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
                    CALENDAR
                  </span>
                </div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '19px', color: 'var(--color-ink)', marginBottom: '8px' }}>
                  {f.name}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: '1.55', marginBottom: '14px' }}>
                  {f.marketing_relevance}
                </p>
                <div style={{ fontSize: '12.5px', background: 'var(--color-surface-raised)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', color: 'var(--color-ink)' }}>
                  <strong>Opportunity Idea:</strong> {f.suggested_offer}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          07 — PRICING & REAL FOUNDER AVAILABILITY
          ========================================================================= */}
      <section style={{ margin: '0 auto 72px' }}>
        <div
          className="card"
          style={{
            padding: '44px 48px',
            background: 'var(--color-surface)',
            border: '2px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-paper)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px', alignItems: 'center' }}>

            {/* Left: Proposition */}
            <div>
              <span className="section-eyebrow" style={{ letterSpacing: '0.08em' }}>TRANSPARENT RATES</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--color-ink)', margin: '8px 0 14px', lineHeight: '1.2' }}>
                Keep 100% of your walk-in revenue.
              </h2>
              <p style={{ fontSize: '14.5px', color: 'var(--color-ink-muted)', lineHeight: '1.65', marginBottom: '24px' }}>
                StreetCraft operates on flat, predictable pricing. No sales commissions, no agency retainers, and no hidden ad fees.
              </p>

              {/* Real Founder Availability Indicator */}
              {founderAllocation && founderAllocation.claimed_slots < founderAllocation.total_slots && (
                <div style={{ padding: '12px 16px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', marginBottom: '24px', display: 'inline-block' }}>
                  <span style={{ fontSize: '12.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600 }}>
                    Founder Offer: {founderAllocation.total_slots - founderAllocation.claimed_slots} of {founderAllocation.total_slots} places remaining (30% off Pro)
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  className="btn-primary"
                  style={{ padding: '12px 24px', fontSize: '14px' }}
                  onClick={() => router.push('/pricing')}
                >
                  View Full Rates &amp; Founder Offer
                </button>
                <button
                  className="btn-secondary"
                  style={{ padding: '12px 20px', fontSize: '14px' }}
                  onClick={() => router.push('/free-tool')}
                >
                  Start Free
                </button>
              </div>
            </div>

            {/* Right: Comparative Cost Breakdown */}
            <div style={{ background: 'var(--color-surface-raised)', padding: '24px 28px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
                Marketing Cost Comparison
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--color-ink-soft)' }}>Delivery Aggregator Apps</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink)', fontWeight: 600 }}>25% &ndash; 30% cut of sales</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--color-ink-soft)' }}>Marketing Agency Retainers</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink)', fontWeight: 600 }}>High monthly fees</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                  <div>
                    <strong style={{ color: 'var(--color-primary)', display: 'block' }}>StreetCraft Growth Engine</strong>
                    <span style={{ fontSize: '12px', color: 'var(--color-ink-muted)' }}>Free starter or flat subscription</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 700, fontSize: '14.5px' }}>
                    0% Commission
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          08 — FAQ
          ========================================================================= */}
      <section style={{ margin: '0 auto 72px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="section-eyebrow">COMMON QUESTIONS</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', color: 'var(--color-ink)', marginTop: '4px' }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '14px' }}>
          {faqs.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="card"
                style={{ padding: '18px 22px', cursor: 'pointer' }}
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)' }}>
                    {item.q}
                  </h3>
                  {isOpen ? <ChevronUp size={16} color="var(--color-primary)" /> : <ChevronDown size={16} color="var(--color-ink-muted)" />}
                </div>
                {isOpen && (
                  <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', marginTop: '12px', lineHeight: '1.6', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Action Frame */}
      <section style={{ textAlign: 'center', padding: '52px 32px', background: 'var(--color-surface)', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-paper)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '34px', color: 'var(--color-ink)', marginBottom: '10px' }}>
          Create your first campaign.
        </h2>
        <p style={{ fontSize: '15.5px', color: 'var(--color-ink-muted)', maxWidth: '540px', margin: '0 auto 28px', lineHeight: '1.6' }}>
          Test the tool with your store name and neighborhood in 10 seconds. No credit card required.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ padding: '13px 30px', fontSize: '15px' }} onClick={() => router.push('/free-tool')}>
            Try Free Campaign Tool
          </button>
          <button className="btn-secondary" style={{ padding: '13px 24px', fontSize: '15px' }} onClick={() => router.push('/login')}>
            Sign In to Store
          </button>
        </div>
      </section>

    </div>
  );
};
