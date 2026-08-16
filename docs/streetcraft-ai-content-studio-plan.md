# StreetCraft AI: Modern Local Business Content Studio & SaaS Platform

StreetCraft AI is an AI Content Studio and campaign engine built specifically for brick-and-mortar and independent local businesses (cafes, salons, gyms, boutique retailers, dental/medical practices, bakeries, and neighborhood services).

This plan outlines the architecture, visual design system, routing, components, and interactive engines required to rebuild the repository into a multi-page web platform and modern SaaS studio.

---

## User Review Required

> [!IMPORTANT]
> **Key Architectural and Design Decisions:**
> 1. **Brand Identity & Name**: **StreetCraft AI** (The AI Content Engine for Neighborhood Businesses).
> 2. **Multi-Page Website Structure**: Implements a dedicated multi-page routing system (`/`, `/free-tool`, `/studio`, `/pricing`, `/templates`, `/festivals`, `/onboarding`, `/about`, `/contact`) with sticky navigation, deep linking, and smooth view transitions.
> 3. **Design Aesthetic (No Old-School Dashboards)**:
>    - Clean, modern SaaS aesthetic inspired by Linear, Raycast, and modern editorial design.
>    - Modern typography (Plus Jakarta Sans, DM Mono, Playfair Display), subtle glassmorphic panels, dark mode workstation, micro-animations, interactive sliders, and live preview cards.
> 4. **No External API Blockers**: High-speed, in-browser localized AI generation algorithms with custom prompt templates for 10+ business categories, local tone modifiers, and multi-format outputs (Google Business posts, Instagram reels/captions, WhatsApp promos, and festival drops).

---

## Website Structure & Route Map

```
StreetCraft AI (Web Platform)
├── Navigation Header (Brand, Navigation Links, Free Tool Badge, Studio CTA)
├── Pages:
│   ├── 1. Home / Landing Page (/)
│   │   ├── Modern Hero with Dynamic Prompt Demonstration
│   │   ├── Interactive Category Switcher (Cafe, Salon, Gym, Retail, Clinic, Bakery)
│   │   ├── Live Content Comparison (Generic ChatGPT vs StreetCraft Localized Post)
│   │   ├── ROI & Time Saved Calculator
│   │   ├── Feature Showcase Cards (Google Business SEO, Social Hooks, Offers, Templates)
│   │   ├── Customer Case Studies & Metrics
│   │   └── Conversion CTA Section
│   │
│   ├── 2. Free Tool / Interactive Playground (/free-tool)
│   │   ├── Instant Post & Promo Generator (No sign-up required)
│   │   ├── Niche, Location, and Goal selector
│   │   ├── Real-time output tabs: Google Business, Instagram, WhatsApp
│   │   └── One-click copy, character count, and Lead Upgrade gate
│   │
│   ├── 3. StreetCraft Studio / SaaS Dashboard (/studio)
│   │   ├── Modern Workstation Layout (Sidebar navigation, Command bar, Live Workspace)
│   │   ├── Business Profile Config (Shop Name, Niche, City/Neighbourhood, Vibe/Voice)
│   │   ├── Generator 1: Google Business Profile Studio (What's New, Offers, Events, Review Replies)
│   │   ├── Generator 2: Instagram & Social Hub (Captions, Reels Scripts, Carousel Outlines, Local Hashtags)
│   │   ├── Generator 3: Offer & Promo Crafter (Flash Sale, BOGO, Rainy Day Specials, Regulars Loyalty)
│   │   ├── Generator 4: Festival & Seasonal Campaign Builder (12-Month Drops, Holiday Special Kits)
│   │   ├── Generator 5: Downloadable Asset Library (Canva Briefs, Printable Signage, Table Tents)
│   │   └── Campaign Vault: Saved Campaigns, History, Export to CSV/JSON/Clipboard
│   │
│   ├── 4. Pricing & Plans (/pricing)
│   │   ├── Monthly / Annual Billing Toggle with Savings Badge
│   │   ├── 3 Tier Cards: Starter Solo (₹799/mo / $19/mo), Pro Local (₹1,499/mo / $39/mo), Agency/Multi-Location (₹3,999/mo / $99/mo)
│   │   ├── Detailed Feature Comparison Matrix
│   │   └── FAQ Accordion
│   │
│   ├── 5. Template Library (/templates)
│   │   ├── Category Filters (Window Signs, Table Tents, WhatsApp Blasts, Instagram Stories, Loyalty Cards)
│   │   ├── Interactive Preview Modals with Copyable Design Prompts and Copy
│   │   └── Direct Export options
│   │
│   ├── 6. Festival & Seasonal Hub (/festivals)
│   │   ├── Interactive 12-Month Calendar of Local & Global Holidays
│   │   ├── One-Click Campaign Drop for upcoming events (Diwali, New Year, Spring Drop, Black Friday, etc.)
│   │   └── Ready-to-use Promo Copy
│   │
│   ├── 7. Onboarding & Lead Capture Wizard (/onboarding)
│   │   ├── 3-Step Guided Shop Setup
│   │   ├── Personalized 14-Day Content Schedule Generator
│   │   └── Lead capture storage into browser storage with instant dashboard unlock
│   │
│   ├── 8. About & Method (/about)
│   │   ├── The StreetCraft AI Localization Methodology
│   │   └── How local intent beats generic broadcast marketing
│   │
│   └── 9. Contact & Support (/contact)
│       ├── Direct Inquiries Form
│       ├── Custom Strategy Consultation Request
│       └── FAQ Knowledge Base
│
└── SaaS Footer (Multi-column links, System Status, Legal, Newsletter)
```

---

## Proposed Technical Implementation

Grouped by component layer:

### 1. Core Framework & Engine
- [MODIFY] [`package.json`](file:///d:/ai-web/package.json): Ensure modern Lucide icons or lightweight SVG icons are integrated for a clean interface without bloat.
- [MODIFY] [`index.html`](file:///d:/ai-web/index.html): Update title, meta tags, Google Fonts (`Plus Jakarta Sans`, `DM Mono`, `Space Grotesk`, `Outfit`), and OpenGraph descriptions for **StreetCraft AI**.

### 2. Design System & CSS Architecture
- [MODIFY] [`src/styles.css`](file:///d:/ai-web/src/styles.css):
  - Comprehensive CSS custom property system: Deep ink `#0d0f12`, modern slate `#181c24`, elevated card surfaces, vibrant electric accents (`#10b981` emerald, `#6366f1` indigo, `#f59e0b` amber, `#f43f5e` rose, and neon lime/violet highlights).
  - Modern card glassmorphism with subtle borders (`rgba(255,255,255,0.08)` and `rgba(0,0,0,0.06)`).
  - Modern studio layout with collapsible sidebar, command palette style top bar, output tabs, copy notifications, and responsive drawer navigation.

### 3. Application Components & Logic
- [NEW] `src/data/categories.js`: Rich preset databases for 10+ local business niches, sample prompts, hashtags, and seasonal festival schedules.
- [NEW] `src/data/templates.js`: Curated marketing templates, printable formats, and social briefs.
- [NEW] `src/engine/generator.js`: Localized generative engine producing tailored copy based on business name, neighborhood, tone, and campaign goals.
- [MODIFY] [`src/main.jsx`](file:///d:/ai-web/src/main.jsx): Rebuild into a clean modular multi-page application with router, state persistence for business profile, saved campaigns, and views for all 9 pages.

---

## Verification Plan

### Automated Build Verification
- Run `npm run build` or `npx vite build` to verify clean compilation with zero bundle or syntax errors.

### Manual Verification
1. **Multi-Page Navigation**: Test navigating between Home, Free Tool, Studio, Pricing, Templates, Festivals, Onboarding, About, and Contact pages via both header navigation, hash links, and direct buttons.
2. **Interactive Free Tool**: Generate a Google Business post, Instagram caption, and WhatsApp promo for different niches (Cafe, Salon, Gym) and verify one-click copy and character counters.
3. **Studio Dashboard**:
   - Update Business Profile (e.g. "Brew & Bean", "Bandra West", "Artisanal Cafe").
   - Test generating all 5 formats: Google Business, Instagram, Promo Offers, Festival Drops, and Templates.
   - Save campaigns to the Campaign Vault and verify persistence in `localStorage`.
   - Test exporting saved campaigns to clipboard and CSV.
4. **Responsive Layout**: Test desktop, tablet, and mobile screen widths.
