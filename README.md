# StreetCraft

> **Turn one business opportunity into everything customers need to see.**  
> A growth engine for physical businesses across Google, Instagram, WhatsApp, and counter print — prepared together.

---

## Overview

StreetCraft is a specialized growth platform built for physical retail, food, salon, and hospitality businesses (cafés, bakeries, bistros, salons, boutiques, wellness studios). Instead of requiring store operators to manually write separate marketing copy for every channel, StreetCraft takes a single store moment or opportunity (such as slow weekday afternoons, a newly roasted bean, or a festive weekend special) and transforms it into four coordinated, publication-ready touchpoints:

1. **Google Business Updates**: Local SEO-optimized updates with clear calls-to-action and store operating terms.
2. **Instagram Visual Proofs & Captions**: 3-second Reel hooks, body narratives, 3-frame Story sequencing, and neighborhood discovery tags.
3. **WhatsApp VIP Broadcasts**: High-conversion direct messages structured with urgency, bold formatting, and counter redemption codes.
4. **In-Store Print Proofs & Tent Cards**: High-contrast, clean typography posters for counter displays and sidewalk chalkboards.

---

## Key Architecture & Design Principles

- **Physical Business Focus**: Designed specifically for physical storefronts, walk-ins, and local customer dynamics.
- **Outcome-First Workflow**: From daily briefing to one-click campaign generation without marketing friction.
- **Relational Data Integrity**: Backed by PostgreSQL on Supabase with zero client-side mock data fallbacks in production.
- **Multi-Tenant Security**: Every business record is isolated through PostgreSQL Row Level Security (RLS) and atomic `SECURITY DEFINER` procedures.
- **Strict Email Verification Gating**: Operator profiles (`public.profiles`) are strictly prevented from being created until email confirmation (`email_confirmed_at IS NOT NULL`).
- **Automated Unconfirmed Users Cleanup**: A Postgres `pg_cron` schedule automatically purges unverified signups older than 1 hour.
- **Date-Aware Marketing Calendar**: Dynamic proximity engine that evaluates upcoming national and regional festivals relative to current time rather than static array order.
- **Data-Driven Public Editorial System**: Public marketing and solution pages are powered by typed content models (`src/content/`) and shared editorial UI primitives (`src/components/public/`) with zero tenant/auth dependencies.
- **Canonical Storefront Lifecycle**: Strict Domain-Driven separation between entity creation (`/new/store`), entity configuration (`/setup/[businessId]/*`), and entity operation (`/user/business/[businessId]/*`).
- **Zero Data Brokering**: Strict platform pledge that store operational data and customer lists are never sold, rented, or monetized through third parties.
- **Transactional Email Infrastructure**: Verified Brevo delivery with DKIM/SPF verification.
- **Modern Notification System**: Uses Sonner toasts for consistent, accessible notifications across the application.
- **Unobstructed Workspace Layout**: Dedicated workspace navigation with multi-store switcher and operator profile menu.

---

## Application Route Topology

### Public Discovery & Marketing (Static Server Components)
- `/` — Platform landing page and value proposition
- `/how-it-works` — Visual explanation of the 4-touchpoint engine
- `/pricing` — Transparent billing tiers, business limits, and Founder slots
- `/free-tool` — Instant anonymous campaign generator with lead-claim handover
- `/contact` — Operator support and direct founder channels
- `/privacy` — Modular 2-column data privacy policy and zero-data-brokering standards
- `/terms` — 18-section commercial operating terms and asset ownership agreement

### Customer Touchpoint Deep Dives
- `/touchpoints/google-business` — Local SEO map rankings, search intent capture, and landmark anchor injection
- `/touchpoints/instagram` — 3-second Reel hooks, 3-frame Story sequencing, and neighborhood discovery tags
- `/touchpoints/whatsapp` — VIP broadcast drop formulas, flash counter redemptions, and community alerts
- `/touchpoints/in-store-print` — High-contrast A4/A5 counter cards, table tents, and chalkboard layouts

### Business Solution Deep Dives
- `/solutions/cafes-and-bakeries` — 3 PM afternoon slowdowns, oven batch drops, and rainy day coffee specials
- `/solutions/restaurants-and-food` — Midweek table packing, chef tasting menus, and festival pre-orders
- `/solutions/salons-and-studios` — Midweek chair utilization, client reactivation, and treatment packages
- `/solutions/retail-and-boutiques` — Inventory unboxing drops, VIP shopping previews, and weekend clearance blitzes

### Authentication & Account Access
- `/login` — Secure email/password authentication with error query-param capture
- `/signup` — Operator registration with automated redirect to verification
- `/verify-email` — Dedicated verification screen with 60-second cooldown resend trigger
- `/auth/callback` — Supabase PKCE and OTP token handler with open-redirect protection
- `/auth/confirm` — Email confirmation handler matching standard Supabase templates
- `/forgot-password` — Password reset trigger
- `/reset-password` — Password update confirmation

### Storefront Creation & Setup Lifecycle
- `/new/store` — Phase A: Storefront entity creation (minimal name and category input)
- `/setup/[businessId]/identity` — Phase B: Store name, concept, and core identity
- `/setup/[businessId]/location` — Location, neighborhood landmark anchors, and city
- `/setup/[businessId]/products` — Signature items, hero offerings, and price anchors
- `/setup/[businessId]/customers` — Target customer profiles and demographics
- `/setup/[businessId]/offer` — Default promotional style and discount mechanics
- `/setup/[businessId]/brand` — Brand voice, tone presets, and personality
- `/setup/[businessId]/operations` — Operating hours, quiet periods, and peak rush windows
- `/setup/[businessId]/contact` — Phone, WhatsApp, and social handles
- `/setup/[businessId]/review` — Final setup validation and launch to workspace

### Authenticated Workspace (Protected — Requires Authenticated Session)
- `/user/today` — Daily briefing, live opportunity radar, and quota status
- `/user/create` — 4-touchpoint campaign generator and composer wizard
- `/user/campaigns` — Persistent campaign vault and historical exports
- `/user/campaigns/:id` — Individual campaign details, print export, and walk-in notes
- `/user/business/[businessId]/*` — Storefront profile, operations, and settings
- `/user/business/[businessId]/plan` — Subscription tier, monthly quotas, and payment verification
- `/user/account/profile` — Operator personal credentials and name
- `/user/account/storefronts` — Multi-storefront directory and management
- `/user/account/preferences` — Email digest and notification settings
- `/user/account/security` — Password updates and active session controls

### System & Recovery
- `/unauthorized` — Permission denied recovery
- `/not-found` — 404 page recovery
- `/error` — Runtime error boundary

---

## Database Security & Relational Model

StreetCraft enforces all business invariants directly at the database layer:

- `businesses`: Store entities with strict owner/admin/member relationships.
- `business_members`: Multi-tenant authorization matrix.
- `business_profiles`: Domain context (neighborhood, landmarks, style voice, signature offerings).
- `profiles`: Strictly verified operator profiles linked to `auth.users`.
- `campaigns` & `campaign_outputs`: Atomic campaign storage and audit trails.
- `festival_calendar`: 35-event full-year annual commercial and cultural festival database.
- `usage_periods` & `usage_events`: Real-time quota tracking and period enforcement.
- `subscriptions` & `founder_allocation`: Idempotent payment verification and slot allocation.
- `cron.job`: Automated `pg_cron` background maintenance jobs (e.g. `cleanup_unconfirmed_users_hourly`).

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase project instance

### Environment Configuration
Copy `.env.example` to `.env` and configure your credentials:

```bash
cp .env.example .env
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH=false
```

### Installation & Verification

```bash
# Install dependencies
npm install

# Run TypeScript strict typecheck
npm run typecheck

# Run domain and architecture unit tests
npm test

# Build production bundle
npm run build
```

---

## License

Commercial rights reserved. StreetCraft Platform.
