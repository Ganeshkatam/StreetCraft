import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChannelCard } from '../components/ChannelCard';
import { ArrowRight, Store, Layers, Clock, ShieldCheck, Check, Database, MapPin, Sparkles, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'google' | 'instagram' | 'whatsapp' | 'poster'>('google');
  const [activeScenario, setActiveScenario] = useState<'afternoon' | 'weekend' | 'festival'>('afternoon');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const scenarioData = {
    afternoon: {
      tag: 'SCENARIO 01 &bull; SLOW HOURS',
      title: 'Weekday Afternoon Slump (3:00 PM – 6:00 PM)',
      store: 'The Roasted Bean &bull; Indiranagar, Bengaluru',
      problem: '12 empty tables between lunch and dinner. Baristas and staff are on shift regardless.',
      solution: 'Drop an "Afternoon Focus Hours" campaign with a 20% discount on single-origin pour-overs paired with warm pastries.',
      proofs: {
        google: {
          headline: 'Beat the 3:30 PM Slump in Indiranagar | The Roasted Bean',
          body: 'Need an afternoon energy boost? Enjoy 20% off all single-origin pour-overs paired with warm sourdough pastries between 3:00 PM and 6:00 PM (Mon–Thu) at 12th Main, Indiranagar.',
          ctaType: 'Visit Us',
          offerSummary: '20% Off Pour-Overs & Pastries (3–6 PM)',
        },
        instagram: {
          reelHook: 'POV: Finding the quietest coffee corner in Indiranagar at 3:30 PM',
          storyFrames: [
            '3:30 PM slump hitting hard?',
            'Fresh single-origin roast just brewed at 12th Main',
            '20% off pour-overs + sourdough bakes today (3–6 PM)',
          ],
          caption: 'The afternoon slump is real, but so is our fresh single-origin brew. Drop by between 3–6 PM for 20% off your pour-over when paired with any artisanal bake. Table by the window is ready for you.',
          localTags: ['#IndiranagarEats', '#BangaloreCafes', '#IndiranagarCoffee', '#BangaloreFoodies', '#BengaluruAfternoon'],
        },
        whatsapp: {
          broadcastMessage: `*Afternoon Perk at The Roasted Bean, Indiranagar*\n\nHey neighbor! Beat the 3:30 PM slump with *20% off* all single-origin pour-overs and artisanal sourdough bakes today between *3:00 PM – 6:00 PM*.\n\n📍 12th Main, Indiranagar (near Defence Colony Playground)\n⚡ Flash this message at counter to redeem!`,
          cta: 'Show message at counter',
        },
        poster: {
          headline: 'AFTERNOON FOCUS HOURS',
          subheading: '20% Off Specialty Pour-Overs & Bakes',
          body: 'Recharge your afternoon with freshly roasted single-origin coffees and warm sourdough pastries.',
          cta: 'Scan to view today’s single-origin origins',
        },
      },
    },
    weekend: {
      tag: 'SCENARIO 02 &bull; HIGH-DEMAND RUSH',
      title: 'Weekend Brunch Rush & Table Bookings',
      store: 'Artisan Table &bull; Bandra West, Mumbai',
      problem: 'Weekend rush is unpredictable with uneven footfalls across Saturday and Sunday mornings.',
      solution: 'Drop a curated Chef’s Weekend Tasting drop on Thursday evening to secure advance brunch reservations.',
      proofs: {
        google: {
          headline: 'Weekend Artisan Brunch Menu at Bandra West | Artisan Table',
          body: 'Reserve your weekend table for our limited Chef’s Tasting Brunch. Fresh brioche French toast, artisanal flat whites, and slow-fermented savory tartines at Pali Hill, Bandra West.',
          ctaType: 'Book Table',
          offerSummary: 'Weekend Tasting Menu (Sat & Sun 9 AM–2 PM)',
        },
        instagram: {
          reelHook: 'What our Saturday morning bakery prep looks like in Bandra',
          storyFrames: [
            'Weekend dough is fermenting...',
            'Chef’s Saturday brunch tasting drops this weekend',
            'Tables fill quickly &bull; Link in bio to reserve',
          ],
          caption: 'Weekends are meant for slow mornings and fresh brioche. Join us this Saturday and Sunday for our limited seasonal brunch menu. Link in bio to reserve your spot.',
          localTags: ['#BandraEats', '#MumbaiFoodies', '#BandraBrunch', '#MumbaiCafes', '#PaliHillBandra'],
        },
        whatsapp: {
          broadcastMessage: `*Weekend Brunch Reservations at Artisan Table, Bandra*\n\nHey foodie! Our limited Chef’s Weekend Tasting Menu is ready for this Saturday & Sunday (9:00 AM – 2:00 PM).\n\n📍 Pali Hill, Bandra West\n⚡ Reserve your table early to avoid the rush.`,
          cta: 'Reply to reserve your table',
        },
        poster: {
          headline: 'WEEKEND ARTISAN BRUNCH',
          subheading: 'Chef’s Limited Seasonal Tasting',
          body: 'Fresh artisanal bakes, hand-brewed specialty coffees, and unhurried brunch dishes.',
          cta: 'Scan to reserve your weekend table',
        },
      },
    },
    festival: {
      tag: 'SCENARIO 03 &bull; SEASONAL EVENT',
      title: 'Festival Celebration & Gift Box Drops',
      store: 'Heritage Sweets & Savouries &bull; T. Nagar, Chennai',
      problem: 'Festive demand is huge, but customers often buy generic packaged sweets from supermarket shelves.',
      solution: 'Drop a pre-order campaign for handcrafted festive gift hampers with a time-limited booking window.',
      proofs: {
        google: {
          headline: 'Handcrafted Festive Hampers in T. Nagar | Heritage Sweets',
          body: 'Celebrate this festive season with authentic pure ghee sweets and artisanal savory hampers. Pre-order by Friday for guaranteed festival eve delivery or counter pickup at Usman Road, T. Nagar.',
          ctaType: 'Pre-order Now',
          offerSummary: 'Festive Sweet Hampers with Custom Packaging',
        },
        instagram: {
          reelHook: 'Behind the scenes: Crafting pure ghee Mysore Pak in T. Nagar',
          storyFrames: [
            'Fresh festive batch in making...',
            'Limited handcrafted festival gift boxes',
            'Pre-orders close this Friday',
          ],
          caption: 'Celebrate traditions with authentic taste. Our pure ghee sweets and artisanal festive hampers are crafted in small daily batches. Pre-order today to reserve your gift box.',
          localTags: ['#ChennaiFoodies', '#TNagarChennai', '#FestiveSweets', '#ChennaiEats', '#MadrasFood'],
        },
        whatsapp: {
          broadcastMessage: `*Festive Hampers Pre-order at Heritage Sweets, T. Nagar*\n\nCelebrate with authentic handcrafted sweets! Pre-order your festive gift boxes before Friday for guaranteed counter pickup.\n\n📍 Usman Road, T. Nagar\n⚡ Click link below to view hamper catalog.`,
          cta: 'View Hamper Catalog & Pre-order',
        },
        poster: {
          headline: 'FESTIVE HANDCRAFTED HAMPERS',
          subheading: 'Authentic Pure Ghee Sweets & Savouries',
          body: 'Pre-order your bespoke gift hampers today for guaranteed festive counter pickup.',
          cta: 'Scan to view the festive catalog',
        },
      },
    },
  };

  const currentScenario = scenarioData[activeScenario];
  const activeProof = currentScenario.proofs[activeTab];

  const faqs = [
    {
      q: 'How does the Store Memory Engine actually work?',
      a: 'During setup, you enter your store location, closest neighborhood landmarks, signature items, and slow-hour windows. StreetCraft permanently retains this context. Every single generated promotion automatically incorporates these specific anchors without needing repetitive prompt writing.',
    },
    {
      q: 'What channels does StreetCraft support?',
      a: 'Every campaign generates 4 simultaneous, character-compliant proofs: Google Business Profile Updates (for Google Search & Maps Local Pack), Instagram (Reel hook + 3 Story frames + caption + local hashtags), WhatsApp Broadcasts (with bold formatting and counter flash redemption instructions), and printable In-Store Posters / Table Tent Cards.',
    },
    {
      q: 'Do I need design skills or marketing experience?',
      a: 'No. StreetCraft is engineered specifically for store owners and operators. You only need to pick an opportunity or enter your counter offer. StreetCraft structures the copy, formats character limits, and provides 1-click clipboard copy or text downloads.',
    },
    {
      q: 'How does StreetCraft differ from food delivery aggregator apps?',
      a: 'Delivery aggregator apps charge 25% to 30% commission on every order, and you never own your customer data. StreetCraft drives direct, in-person foot traffic to your physical counter. You keep 100% of your walk-in sales with zero commission fees.',
    },
    {
      q: 'What is included in the Free tier?',
      a: 'The Free tier gives you 3 complete 4-channel campaign packs every month, full access to Store Memory, and the Daily Opportunity Radar. No credit card is required to start.',
    },
  ];

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px 100px' }}>
      
      {/* Editorial Hero Section */}
      <section style={{ padding: '64px 0 56px', textAlign: 'center' }}>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: '14px', fontWeight: 600 }}>
          STREETCRAFT &bull; LOCAL BUSINESS MARKETING INSTRUMENT
        </span>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '48px', color: 'var(--color-ink)', lineHeight: '1.15', maxWidth: '860px', margin: '0 auto 20px', letterSpacing: '-0.02em' }}>
          Turn a quiet Tuesday into a reason to visit.
        </h1>

        <p style={{ fontSize: '16.5px', color: 'var(--color-ink-muted)', lineHeight: '1.65', maxWidth: '660px', margin: '0 auto 32px' }}>
          Your afternoon is slow. Your regulars are two blocks away. StreetCraft turns counter specials and neighborhood moments into coordinated campaign proofs across Google, Instagram, WhatsApp, and in-store displays.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ padding: '12px 28px', fontSize: '14.5px' }} onClick={() => navigate('/free-tool')}>
            Try free campaign tool &rarr;
          </button>
          <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: '14.5px' }} onClick={() => navigate('/login')}>
            Sign in to store
          </button>
        </div>
      </section>

      {/* The Local Marketing Reality Table */}
      <section style={{ margin: '0 auto 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="section-eyebrow">THE LOCAL MARKETING REALITY</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--color-ink)' }}>
            Why Neighborhood Stores Need Their Own Marketing Instrument
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="card" style={{ background: 'var(--color-surface-raised)' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-danger)', fontWeight: 600, textTransform: 'uppercase' }}>
              FOOD DELIVERY APPS
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', margin: '8px 0 6px' }}>
              30% commission on regulars
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: '1.6', marginBottom: '14px' }}>
              Delivery aggregators lock your customers behind algorithms and take 25–30% of every order, eroding your food and beverage margins.
            </p>
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-danger)' }}>
              Outcome: High volume, low profit.
            </div>
          </div>

          <div className="card" style={{ background: 'var(--color-surface-raised)' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              MARKETING AGENCIES
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', margin: '8px 0 6px' }}>
              ₹40,000/month retainers
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: '1.6', marginBottom: '14px' }}>
              Agencies produce generic stock graphics with multi-day approval delays that fail to respond to immediate slow hours or excess bakery prep.
            </p>
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>
              Outcome: Disconnected content, slow execution.
            </div>
          </div>

          <div className="card" style={{ border: '2px solid var(--color-primary)', background: 'var(--color-surface)' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase' }}>
              STREETCRAFT
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', margin: '8px 0 6px' }}>
              100% of walk-in sales kept
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: '1.6', marginBottom: '14px' }}>
              Generate synchronized 4-channel campaign drops in 60 seconds. Direct customers to your counter with zero commissions and zero retainers.
            </p>
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
              Outcome: Direct foot traffic, full margins.
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Scenario Walkthrough */}
      <section style={{ margin: '0 auto 88px' }}>
        <div className="card" style={{ padding: '36px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="section-eyebrow">INTERACTIVE DEMONSTRATION &bull; REAL STORE SCENARIOS</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--color-ink)', marginTop: '2px' }}>
                See How StreetCraft Handles Real Store Moments
              </h2>
            </div>

            {/* Scenario Buttons */}
            <div style={{ display: 'flex', gap: '8px', background: 'var(--color-surface-raised)', padding: '4px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
              {[
                { id: 'afternoon', label: '1. Weekday Afternoon' },
                { id: 'weekend', label: '2. Weekend Brunch' },
                { id: 'festival', label: '3. Festival Pre-orders' },
              ].map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => setActiveScenario(sc.id as any)}
                  style={{
                    padding: '7px 14px',
                    fontSize: '12.5px',
                    fontWeight: activeScenario === sc.id ? 600 : 400,
                    color: activeScenario === sc.id ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                    background: activeScenario === sc.id ? 'var(--color-surface)' : 'transparent',
                    border: activeScenario === sc.id ? '1px solid var(--color-border)' : '1px solid transparent',
                    borderRadius: 'var(--radius-xs)',
                    boxShadow: activeScenario === sc.id ? 'var(--shadow-subtle)' : 'none',
                    transition: 'var(--motion-fast)',
                  }}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Context Bar */}
          <div style={{ background: 'var(--color-surface-raised)', padding: '16px 20px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600 }}>
                {currentScenario.tag}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-ink-muted)', fontFamily: 'var(--font-mono)' }}>
                {currentScenario.store}
              </span>
            </div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)', margin: '6px 0 4px' }}>
              {currentScenario.title}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px', marginTop: '10px', fontSize: '12.5px' }}>
              <div><strong style={{ color: 'var(--color-danger)' }}>The Moment:</strong> <span style={{ color: 'var(--color-ink-muted)' }}>{currentScenario.problem}</span></div>
              <div><strong style={{ color: 'var(--color-primary)' }}>The StreetCraft Drop:</strong> <span style={{ color: 'var(--color-ink)' }}>{currentScenario.solution}</span></div>
            </div>
          </div>

          {/* Channel Selector Tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>
              SYNCHRONIZED OUTPUTS ACROSS 4 CHANNELS:
            </span>

            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'google', label: 'Google Business' },
                { id: 'instagram', label: 'Instagram' },
                { id: 'whatsapp', label: 'WhatsApp' },
                { id: 'poster', label: 'Counter Poster' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '12px',
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    color: activeTab === tab.id ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                    background: activeTab === tab.id ? 'var(--color-surface-raised)' : 'transparent',
                    border: activeTab === tab.id ? '1px solid var(--color-border)' : '1px solid transparent',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Proof Card */}
          <ChannelCard
            channel={
              activeTab === 'google'
                ? 'GOOGLE_BUSINESS'
                : activeTab === 'instagram'
                ? 'INSTAGRAM'
                : activeTab === 'whatsapp'
                ? 'WHATSAPP'
                : 'IN_STORE_POSTER'
            }
            status="ready"
            content={activeProof as unknown as Record<string, unknown>}
          />
        </div>
      </section>

      {/* The 4 Architectural Modules */}
      <section style={{ margin: '0 auto 88px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="section-eyebrow">SYSTEM ARCHITECTURE</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', color: 'var(--color-ink)' }}>
            The Four Core Engines of StreetCraft
          </h2>
          <p style={{ fontSize: '14.5px', color: 'var(--color-ink-muted)', maxWidth: '580px', margin: '8px auto 0' }}>
            Built specifically to solve the real operational challenges of brick-and-mortar storefronts.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {/* Module 1 */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Store size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>Store Memory</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
              Stores your neighborhood landmarks, signature best-sellers, average ticket size, and slow-hour windows so you never need to re-type store details.
            </p>
          </div>

          {/* Module 2 */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Layers size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>4-Channel Sync</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
              Simultaneously crafts Google Business updates, Instagram hooks and frames, WhatsApp broadcasts, and printable QR counter cards in 60 seconds.
            </p>
          </div>

          {/* Module 3 */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Sparkles size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>Opportunity Radar</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
              Daily morning briefing engine tracks weekday slow hours, upcoming regional festivals, and inactive regulars to propose high-impact promotions.
            </p>
          </div>

          {/* Module 4 */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Database size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>Campaign Vault</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
              Persistent ledger of all created campaigns with status workflows (Ready &rarr; Published &rarr; Completed) and walk-in result logging.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (Informative & Concrete) */}
      <section style={{ maxWidth: '800px', margin: '0 auto 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="section-eyebrow">COMMON QUESTIONS</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--color-ink)' }}>
            Everything You Need to Know
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="card"
                style={{ padding: '20px 24px', cursor: 'pointer' }}
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

      {/* Bottom Quiet Call to Action */}
      <section style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--color-ink)', marginBottom: '10px' }}>
          Ready to turn slow hours into walk-in foot traffic?
        </h2>
        <p style={{ fontSize: '14.5px', color: 'var(--color-ink-muted)', maxWidth: '520px', margin: '0 auto 24px', lineHeight: '1.5' }}>
          Try the free tool without creating an account, or sign up to begin building your store memory.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }} onClick={() => navigate('/free-tool')}>
            Generate Free Campaign Pack &rarr;
          </button>
          <button className="btn-secondary" style={{ padding: '12px 20px', fontSize: '14px' }} onClick={() => navigate('/login')}>
            Sign In to Store
          </button>
        </div>
      </section>

    </div>
  );
};
