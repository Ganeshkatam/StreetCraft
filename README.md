# StreetCraft

> **Turn one business opportunity into everything customers need to see.**  
> A growth engine for physical businesses across Google, Instagram, WhatsApp, and your counter — prepared together.

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
- **Context-Aware Navigation & Layout**:
  - Full editorial footer on public discovery pages (`/`, `/how-it-works`, `/pricing`).
  - Compact footer on utility pages (`/free-tool`, `/contact`).
  - Minimal legal footer on compliance pages (`/privacy`, `/terms`).
  - Zero marketing footer or navigation clutter on auth, onboarding, and workspace routes.

---

## Application Route Topology

### Public Discovery & Acquisition
- `/` — Platform landing page and value proposition
- `/how-it-works` — Visual explanation of the 4-touchpoint engine
- `/pricing` — Transparent billing tiers, business limits, and Founder slots
- `/free-tool` — Instant anonymous campaign generator with lead-claim handover
- `/contact` — Operator support and pilot inquiries
- `/privacy` — Privacy policy and data handling terms
- `/terms` — Commercial terms of service

### Authentication & Account Access
- `/login` — Secure email/password authentication
- `/signup` — Operator registration
- `/forgot-password` — Password reset trigger
- `/reset-password` — Password update confirmation
- `/setup` — Storefront onboarding wizard

### Workspace (Protected — Requires Authenticated Session & Active Business)
- `/app/today` — Daily briefing, local opportunity triggers, and quota status
- `/app/create` — 4-touchpoint campaign generator and composer
- `/app/campaigns` — Persistent campaign vault and historical exports
- `/app/campaigns/:id` — Individual campaign details, print export, and walk-in notes
- `/app/business` — Storefront profile, operating hours, and neighborhood context
- `/app/settings/billing` — Subscription tier, monthly quotas, and payment verification
- `/app/settings/account` — Operator security and session management

### System & Recovery
- `/unauthorized` — Permission denied recovery
- `/not-found` — 404 page recovery
- `/error` — Runtime error boundary

---

## Database Security Model

StreetCraft enforces all business invariants at the database level:

- `businesses`: Store entities with strict owner/admin/member relationships.
- `business_members`: Multi-tenant authorization matrix.
- `business_profiles`: Domain context (neighborhood, landmarks, style voice, signature offerings).
- `campaigns` & `campaign_outputs`: Atomic campaign storage.
- `usage_periods` & `usage_events`: Real-time quota tracking.
- `subscriptions` & `founder_allocation`: Idempotent payment verification and slot allocation.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase project instance

### Environment Configuration
Copy `.env.example` to `.env` and provide your Supabase credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ENABLE_GOOGLE_OAUTH=false
```

### Installation & Development
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run TypeScript typecheck and production build
npm run build
```

---

## License

MIT License. See [LICENSE](LICENSE) for details.
