# StreetCraft V1 Architecture & Implementation Plan

This plan details the transition of StreetCraft into a production-grade, multi-tenant V1 architecture based on the 15 architectural corrections. It addresses data modeling, TypeScript + Zod migration, server-side transactional campaign generation, append-only usage metering, deterministic briefing, and the complete user journey.

---

## Architectural Principles & Hard Corrections

1. **Decoupled API Boundary & Persistence**
   - Eliminate heavy client-side faux database logic from `src/store/db.js`.
   - Introduce `src/lib/supabase.ts`, `src/lib/api.ts`, and typed domain models in `src/types/`.
   - Provide clean PostgreSQL schema with Row Level Security (RLS) for tenant isolation (`businesses` -> `business_members` -> `campaigns` -> `campaign_outputs`).

2. **Periodic & Append-Only Usage Metering**
   - Replace 1-to-1 usage records with `usage_periods` (billing cycles) and an append-only ledger `usage_events` (`id`, `business_id`, `user_id`, `event_type`, `units`, `campaign_id`, `created_at`).
   - Enables verifiable audit trails for campaign generation quotas.

3. **Role-Based Tenant Access Control**
   - Define `business_members` roles: `owner`, `admin`, `member`.
   - Authorization enforced via PostgreSQL RLS policies and server-side validation.

4. **Centralized Plan Entitlements**
   - Single entitlement configuration (`PLAN_ENTITLEMENTS`):
     - Free: 5 campaign packs / month
     - Pro (INR 799/mo): 100 campaign packs / month
     - Growth (INR 1,499/mo): 300 campaign packs / month
   - Helper function `getEntitlement(plan, key)` prevents fragmented conditional logic.

5. **Transactional Generation Lifecycle**
   - Workflow: Verify Membership -> Check Entitlement/Quota -> Reserve Usage -> Create Campaign Record -> Generate Channel Outputs -> Validate against Zod Schema -> Persist Outputs & Commit Usage (Rollback/revert reservation if generation fails).

6. **Server-Side AI Boundary & Security**
   - Client never accesses LLM provider secrets.
   - Generation endpoint coordinates deterministic context enrichment, AI phrasing adapter, and strict schema validation.

7. **Structured Campaign & Normalized Output Schemas**
   - Campaign: structured `offer` (`title`, `description`, `value`, `terms`), `schedule` (`starts_at`, `ends_at`), `objective`, `audience`, and `status` (`DRAFT`, `PUBLISHED`, `COMPLETED`, `ARCHIVED`).
   - `campaign_outputs`: one row per channel (`GOOGLE_BUSINESS`, `INSTAGRAM`, `WHATSAPP`, `IN_STORE_POSTER`) with typed content JSON, metadata, and validation status.

8. **Strict Zod Runtime Validation**
   - Channel-specific Zod schemas (`GoogleBusinessOutput`, `InstagramOutput`, `WhatsAppOutput`, `PosterOutput`).
   - Repair and fallback to deterministic templates if AI response fails validation.

9. **Deterministic Daily Briefing**
   - Fast, zero-cost, rule-based opportunity engine analyzing active campaign coverage, expiring promotions, and unpromoted offers.

10. **Campaign Vault & Manual Performance Notes**
    - Clean status management (`DRAFT`, `PUBLISHED`, `COMPLETED`, `ARCHIVED`) with qualitative operator notes, avoiding premature claims of automated analytics.

11. **TypeScript Migration**
    - Full TypeScript setup with Vite, strict typing across business, campaign, billing, and API layers.

---

## Proposed Changes & File Architecture

```
d:/ai-web/
├── package.json                                (Add TypeScript, Zod, Supabase JS, Lucide icons)
├── tsconfig.json                               (TypeScript configuration)
├── index.html                                  (Updated metadata & entry point)
├── supabase/
│   └── migrations/
│       └── 20260816000000_streetcraft_core.sql (Full PostgreSQL schema, RLS, triggers, indexes)
├── src/
│   ├── main.tsx                                (App bootstrap & routing)
│   ├── styles.css                              (Refined modern design system)
│   ├── types/
│   │   ├── common.ts                           (Core identifiers, timestamps, pagination)
│   │   ├── business.ts                         (Business, Profile, Members, Roles)
│   │   ├── campaign.ts                         (Campaigns, Channels, Zod Output Schemas)
│   │   └── billing.ts                          (Plans, Entitlements, Usage Periods, Usage Events)
│   ├── lib/
│   │   ├── supabase.ts                         (Supabase client initialization & types)
│   │   ├── entitlements.ts                     (Plan entitlement resolution & checks)
│   │   └── api.ts                              (Typed API client: Auth, Business, Campaign, Usage)
│   ├── engine/
│   │   ├── rules.ts                            (Deterministic channel rules & vocabulary)
│   │   ├── dailyBriefing.ts                    (Rule-based opportunity generator)
│   │   ├── validator.ts                        (Zod runtime validators & repairs)
│   │   └── campaignEngine.ts                   (Hybrid deterministic + AI generation pipeline)
│   └── components/
│       ├── Header.tsx                          (Global header with navigation & tenant selector)
│       ├── Footer.tsx                          (Global footer)
│       ├── LandingPage.tsx                     (High-conversion marketing landing page)
│       ├── FreeRefinerTool.tsx                 (Interactive free public campaign pack generator)
│       ├── PricingPage.tsx                     (Transparent pricing with plan feature comparison)
│       ├── AuthModal.tsx                       (Sign up & sign in modal / flow)
│       ├── Dashboard.tsx                       (App home: daily briefing, readiness score, metrics)
│       ├── BusinessProfileView.tsx             (Business memory & marketing context editor)
│       ├── CreateCampaignView.tsx              (4-channel campaign generation & copy tool)
│       ├── CampaignVaultView.tsx               (Campaign lifecycle management & performance notes)
│       └── UpgradeModal.tsx                    (Razorpay checkout & subscription upgrade simulation)
```

---

## Detailed Component Specifications

### 1. Database Schema (`supabase/migrations/20260816000000_streetcraft_core.sql`)
- `users`: Managed by Supabase Auth (`auth.users`).
- `businesses`: `id (uuid)`, `name (text)`, `category (text)`, `created_at (timestamptz)`.
- `business_profiles`: `business_id (uuid pk fk)`, `neighborhood`, `city`, `landmarks`, `target_customer`, `style_voice`, `signature_items`, `default_offer`, `slow_hours`, `peak_hours`, `avg_ticket_inr`, `phone_whatsapp`, `updated_at`.
- `business_members`: `id (uuid)`, `business_id (uuid fk)`, `user_id (uuid fk)`, `role ('owner' | 'admin' | 'member')`, `created_at`.
- `usage_periods`: `id (uuid)`, `business_id (uuid fk)`, `period_start (date)`, `period_end (date)`, `plan ('FREE' | 'PRO' | 'GROWTH')`, `pack_limit (int)`, `packs_used (int)`, `created_at`.
- `usage_events`: `id (uuid)`, `business_id (uuid fk)`, `user_id (uuid fk)`, `event_type ('CAMPAIGN_PACK_GENERATION')`, `units (int default 1)`, `campaign_id (uuid fk)`, `created_at`.
- `campaigns`: `id (uuid)`, `business_id (uuid fk)`, `type (text)`, `objective (text)`, `audience (text)`, `offer (jsonb: title, description, value, terms)`, `schedule (jsonb: starts_at, ends_at, timing_label)`, `status ('DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'ARCHIVED')`, `performance_notes (text)`, `created_at`, `updated_at`.
- `campaign_outputs`: `id (uuid)`, `campaign_id (uuid fk)`, `channel ('GOOGLE_BUSINESS' | 'INSTAGRAM' | 'WHATSAPP' | 'IN_STORE_POSTER')`, `content (jsonb)`, `metadata (jsonb)`, `validation_status ('VALID' | 'WARNING' | 'REPAIRED')`, `created_at`.
- Row Level Security (RLS): Enabled on all tables, granting access only to authenticated users who are members of the associated `business_id`.

### 2. TypeScript & Zod Definitions (`src/types/`)
- `src/types/campaign.ts`:
  - `CampaignType`: `WEEKDAY_BOOST`, `WEEKEND_MAGNET`, `MENU_LAUNCH`, `FESTIVAL_SPECIAL`, `REVIEW_SPOTLIGHT`, `WIN_BACK_REGULARS`.
  - `ChannelType`: `GOOGLE_BUSINESS`, `INSTAGRAM`, `WHATSAPP`, `IN_STORE_POSTER`.
  - Zod schemas for all 4 channels to guarantee runtime output validity.
- `src/types/billing.ts`:
  - `PlanId`: `FREE`, `PRO`, `GROWTH`.
  - `PlanEntitlements`: configuration constants and typed getters.

### 3. Campaign Generation & Validation Engine (`src/engine/`)
- Deterministic campaign generator providing guaranteed valid fallbacks.
- Zod output validation with detailed validation reporting.
- Rule-based daily briefing providing 3 prioritized opportunities based on store memory.

### 4. Application Frontend & Interactive Flows
- **Landing Page & Free Refiner**: Immediate value demonstration allowing visitors to test 4-channel copy generation before signup.
- **Dashboard**: Displays Morning Briefing cards, Marketing Readiness Score (out of 100), active campaign counters, and quota status.
- **Create Campaign Wizard**: Step-by-step or single-page generation with instant 4-channel previews (Google Post preview, Instagram mock preview with hashtags, WhatsApp chat preview, and printable Poster view). One-click clipboard copy for each.
- **Campaign Vault**: Filter by status (`Draft`, `Published`, `Completed`, `Archived`), view generated channels, edit qualitative performance notes.
- **Business Profile / Memory**: Persistent store of neighborhood, signature items, target customers, and slow-hour windows.
- **Usage & Upgrade Flow**: Live quota tracking against current monthly limit with simulated Razorpay checkout workflow.

---

## Verification Plan

### Automated Verification
1. Install TypeScript and dependencies (`npm install`).
2. Run TypeScript compiler (`npx tsc --noEmit`) to verify zero type errors.
3. Validate Vite development build (`npm run build` / `npx vite build`).

### Acceptance Test Walkthrough ("The Roasted Bean" Story)
1. Initialize a new business: "The Roasted Bean" (Indiranagar, Bangalore, Artisanal Cafe).
2. Configure profile memory (slow hours: 3 PM - 6 PM, signature items: Cinnamon Cold Brew, sourdough toast).
3. Check Dashboard: verify daily briefing flags weekday afternoon opportunity.
4. Launch "Slow Weekday Boost" campaign: offer "Rs 299 coffee & toast combo (3 PM - 6 PM)".
5. Generate 4 channels: verify Google Business, Instagram, WhatsApp, and Poster outputs meet character and format requirements.
6. Verify Campaign Vault records the campaign as `PUBLISHED`.
7. Generate additional campaigns to exhaust the 5-pack Free tier limit.
8. Verify entitlement guard blocks generation when limit is reached.
9. Upgrade to Pro via the Billing Modal and confirm the quota expands to 100 packs.
