# StreetCraft: Local Business Growth Engine

**Positioning**: *Turn one offer or moment into everything your local customers need to see.*

StreetCraft replaces commoditized "AI content generation" with an automated local marketing execution engine. It converts a single business event, offer, or slow day into a coordinated, multi-channel campaign pack (Google Business, Instagram, WhatsApp, In-store poster copy, and review follow-ups) grounded in permanent Business Memory.

---

## User Review Required

> [!IMPORTANT]
> **Key Refinements Based on Strategy:**
> 1. **Trimmed SaaS Routing**:
>    - Public: `/` (Landing Page), `/free-tool` (Acquisition Machine), `/pricing` (Free, Pro ₹799, Growth ₹1,499), `/login` (Authentication/Access).
>    - App Workspace (`/app`):
>      - `/app/dashboard`: Assistant-style morning brief ("Here is what I would do this week") with proactive traffic opportunities and review follow-ups.
>      - `/app/business`: Permanent Business Profile & Marketing Context store.
>      - `/app/create`: Outcome-driven Campaign Engine (Slow day boost, Weekend offer, New dish, Review spotlight, Festival).
>      - `/app/campaigns`: Campaign History, Saved Packs, and Performance Notes.
>      - `/app/visibility`: Local Presence Score & Google Review Reply Assistant.
>      - `/app/settings`: Subscription tier, billing, and account data.
> 2. **Initial Niche Focus**: Cafes and Restaurants (highest promotion frequency, foot-traffic sensitivity, review dependency, and WhatsApp customer reach).
> 3. **Hybrid Engine Architecture**:
>    - Deterministic Engine: Formatting rules, character limits, Google Business call-to-action schemas, WhatsApp broadcast formatting, Indian festival context, and fallback generation.
>    - Generative Layer: Context-aware variations, creative hooks, tone adaptation, and localized copy.
> 4. **No Emojis Rule**: Enforced across all interface copy, generated campaign copy, and code symbols.

---

## Proposed Changes

Grouped by component layer:

### 1. Configuration & HTML Wrapper
- [MODIFY] [`package.json`](file:///d:/ai-web/package.json): Update app metadata and scripts.
- [MODIFY] [`index.html`](file:///d:/ai-web/index.html): Update page title to "StreetCraft — Local Business Growth Engine", meta tags for local marketing outcomes, and typography links (`Plus Jakarta Sans`, `DM Mono`, `Space Grotesk`).

### 2. Design System & Modern Workspace Styling
- [MODIFY] [`src/styles.css`](file:///d:/ai-web/src/styles.css):
  - Ultra-modern SaaS styling: Deep slate background (`#0b0d11`), elevated cards (`#141820`, `#1a202c`), crisp high-contrast text, electric accents (`#10b981` emerald for growth, `#f59e0b` amber for opportunities, `#6366f1` indigo for brand highlights).
  - Modern assistant layout: "Morning Briefing" card layout with actionable opportunity chips, interactive campaign pack preview panes, multi-tab channel outputs (Google Business, Instagram, WhatsApp, In-Store Poster), and clean modal overlays.
  - Zero bloated old-school dashboard tables; focus on clean cards, step builders, and instant-copy drawers.

### 3. Business Logic, Engines & Data
- [NEW] `src/engine/businessMemory.js`:
  - Persistent business context storage (Name, Category, Neighborhood/City, Target Customer, Brand Voice, Peak/Slow Hours, Active Offers, Review Status).
  - Default preset: "Brew & Bean" (Cafe, Bandra West, Mumbai).
- [NEW] `src/engine/campaignEngine.js`:
  - Multi-channel campaign pack generator.
  - Promotion types: Weekday Slow-Hours Boost, Weekend Crowd Magnet, New Dish/Menu Launch, Festival/Holiday Drop, Customer Review Spotlight, Win-Back Inactive Regulars.
  - Output pack: Google Business Post, Instagram Caption & Reel Hook, Instagram Story Frame, WhatsApp Broadcast Script, In-Store Counter Poster Headline, Call-to-Action.
- [NEW] `src/engine/visibilityEngine.js`:
  - Local Presence Score calculator (Google profile completeness, review reply rate, offer freshness, local keyword coverage).
  - Review reply generator with sentiment analysis and local SEO keyword injection.
- [NEW] `src/data/festivals.js`:
  - Local and Indian festival marketing calendar data with pre-built promotion themes.

### 4. Application Views & Routing
- [MODIFY] [`src/main.jsx`](file:///d:/ai-web/src/main.jsx):
  - Client-side router supporting `/` (Landing), `/free-tool`, `/pricing`, `/login`, and `/app/*` (`/app/dashboard`, `/app/business`, `/app/create`, `/app/campaigns`, `/app/visibility`, `/app/settings`).
  - Landing page positioned around "Local Business Growth Engine" (Turn one offer into everything customers need to see).
  - Free acquisition tool ("Create my local promotion" with instant campaign pack and Pro upgrade trigger).
  - Assistant-driven SaaS workspace with reactive opportunity cards.

---

## Verification Plan

### Automated Build
- Run `npm run build` or `npx vite build` to ensure error-free compilation.

### Manual Functional Testing
1. **Public Marketing & Acquisition**:
   - Test Landing Page value proposition, outcome metrics, and pricing page tier toggles (Free ₹0, Pro ₹799/mo, Growth ₹1,499/mo).
   - Test `/free-tool`: enter a local cafe offer and generate instant multi-channel pack (Google, Instagram, WhatsApp, Poster).
2. **Business Memory & Context**:
   - Navigate to `/app/business`, update shop details, and verify all subsequent campaign generations reflect the updated location, vibe, and target audience.
3. **Campaign Generation Workflow**:
   - Navigate to `/app/create`, choose "Slow Day / Weekday Boost", select 3-6 PM offer, and generate complete campaign pack.
   - Verify one-click copy for all channels, character counters, and save to campaign vault.
4. **Local Visibility & Review Assistant**:
   - Test `/app/visibility` presence score and test generating replies to pending reviews with injected neighborhood keywords.
5. **Dashboard Assistant Experience**:
   - Verify the "Good morning" briefing displays real-time actionable opportunities that deep-link directly into pre-filled campaign creators.
