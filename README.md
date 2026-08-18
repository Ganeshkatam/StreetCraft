# StreetCraft

> **Turn one business opportunity into everything customers need to see.**  
> A growth engine for physical businesses across Google, Instagram, WhatsApp, and counter print — prepared together.

---

## Overview

StreetCraft is a specialized growth platform built for physical retail, food, salon, and hospitality businesses (cafes, bakeries, bistros, salons, boutiques, studios). Instead of requiring store operators to manually write separate marketing copy for every channel, StreetCraft takes a single store moment or opportunity (such as slow weekday afternoons, a newly roasted bean, or a festive weekend special) and transforms it into four coordinated, publication-ready touchpoints:

1. **Google Business Updates**: Local SEO-optimized updates with clear calls-to-action and store operating terms.
2. **Instagram Visual Proofs & Captions**: Scroll-stopping hook, body narrative, offer mechanics, and neighborhood tags.
3. **WhatsApp VIP Broadcasts**: High-conversion direct messages structured with urgency and bold formatting.
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
- **Modern Notification System**: Uses Sonner toasts for consistent, accessible notifications across the application.
- **Clean Button Typography**: Modern, distraction-free button styling without directional arrows or glyphs.
- **Unobstructed Workspace Layout**: Dedicated workspace navigation with multi-store switcher and operator profile menu, with footers removed from all `/user/*` routes.

---

## Application Route Topology

### Public Discovery & Marketing
- `/` — Platform landing page and value proposition
- `/how-it-works` — Visual explanation of the 4-touchpoint engine
- `/pricing` — Transparent billing tiers, business limits, and Founder slots
- `/free-tool` — Instant anonymous campaign generator with lead-claim handover
- `/contact` — Operator support and direct founder channels
- `/privacy` — Privacy policy and data handling terms
- `/terms` — Commercial terms of service

### Authentication & Account Access
- `/login` — Secure email/password authentication with error query-param capture
- `/signup` — Operator registration with automated redirect to verification
- `/verify-email` — Dedicated verification screen with 60-second cooldown resend trigger
- `/auth/callback` — Supabase PKCE and OTP token handler with open-redirect protection
- `/auth/confirm` — Email confirmation handler matching standard Supabase templates
- `/forgot-password` — Password reset trigger
- `/reset-password` — Password update confirmation
- `/setup` — Storefront onboarding wizard

### Workspace (Protected — Requires Authenticated Session & Active Business)
- `/user/today` — Daily briefing, live opportunity radar, and quota status
- `/user/create` — 4-touchpoint campaign generator and composer wizard
- `/user/campaigns` — Persistent campaign vault and historical exports
- `/user/campaigns/:id` — Individual campaign details, print export, and walk-in notes
- `/user/business` — Storefront profile, operating hours, and neighborhood context
- `/user/billing` — Subscription tier, monthly quotas, and payment verification
- `/user/account` — Operator profile, multi-store ownership, credentials, and session controls

### System & Recovery
- `/unauthorized` — Permission denied recovery
- `/not-found` — 404 page recovery
- `/error` — Runtime error boundary

---

## Database Security Model

StreetCraft enforces all business invariants directly at the database layer:

- `businesses`: Store entities with strict owner/admin/member relationships.
- `business_members`: Multi-tenant authorization matrix.
- `business_profiles`: Domain context (neighborhood, landmarks, style voice, signature offerings).
- `profiles`: Strictly verified operator profiles linked to `auth.users`.
- `campaigns` & `campaign_outputs`: Atomic campaign storage and audit trails.
- `festival_calendar`: 35-event full-year annual commercial and cultural festival database.
- `usage_periods` & `usage_events`: Real-time quota tracking.
- `subscriptions` & `founder_allocation`: Idempotent payment verification and slot allocation.
- `cron.job`: Automated `pg_cron` background jobs (e.g. `cleanup_unconfirmed_users_hourly`).

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

### Installation & Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run TypeScript typecheck
npm run typecheck

# Run production build
npm run build
```

---

## License

MIT License. See [LICENSE](LICENSE) for details.
