# StreetCraft Project Directory Structure

Generated automatically on: 2026-08-16T18:00:05.147Z

Total Directories: 19  
Total Files: 73

```text
streetcraft/
├── .vscode/
│   └── settings.json
├── docs/
│   ├── arch-001-streetcraft-v1-refactor-plan.md
│   ├── streetcraft-ai-content-studio-plan.md
│   ├── streetcraft-growth-engine-v1-plan.md
│   └── streetcraft-local-growth-engine-plan.md
├── scripts/
│   └── generate-project-tree.js
├── src/
│   ├── components/
│   │   ├── CalendarPicker.tsx
│   │   ├── CampaignStatusBadge.tsx
│   │   ├── ChannelCard.tsx
│   │   ├── CustomSelect.tsx
│   │   ├── Footer.tsx
│   │   ├── Logo.tsx
│   │   ├── Navigation.tsx
│   │   ├── UpgradeModal.tsx
│   │   └── UsageMeter.tsx
│   ├── config/
│   │   ├── campaignTypes.ts
│   │   ├── channels.ts
│   │   ├── plans.ts
│   │   └── validationRules.ts
│   ├── engine/
│   │   ├── briefing/
│   │   │   └── opportunityEngine.ts
│   │   ├── campaignEngine.ts
│   │   ├── dailyBriefing.ts
│   │   ├── rules.ts
│   │   └── validator.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useBusiness.ts
│   │   ├── useCampaign.ts
│   │   ├── useCampaignRealtime.ts
│   │   └── useUsage.ts
│   ├── lib/
│   │   ├── api.ts
│   │   ├── entitlements.ts
│   │   └── supabase.ts
│   ├── pages/
│   │   ├── app/
│   │   │   ├── BusinessPage.tsx
│   │   │   ├── CampaignVaultPage.tsx
│   │   │   ├── CreateCampaignPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── FreeToolPage.tsx
│   │   ├── HowItWorksPage.tsx
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── PricingPage.tsx
│   ├── theme/
│   │   ├── themes/
│   │   │   ├── high-contrast.css
│   │   │   ├── paper-dark.css
│   │   │   └── paper.css
│   │   ├── tokens/
│   │   │   ├── colors.css
│   │   │   ├── motion.css
│   │   │   ├── radius.css
│   │   │   ├── shadows.css
│   │   │   ├── spacing.css
│   │   │   └── typography.css
│   │   ├── theme.ts
│   │   ├── ThemeProvider.tsx
│   │   └── useTheme.ts
│   ├── types/
│   │   ├── billing.ts
│   │   ├── business.ts
│   │   ├── campaign.ts
│   │   ├── common.ts
│   │   └── database.ts
│   ├── main.tsx
│   └── styles.css
├── supabase/
│   ├── migrations/
│   │   ├── 20260816000000_streetcraft_core.sql
│   │   └── 20260816000001_streetcraft_realtime_saas.sql
│   └── seed/
│       └── reference-data.sql
├── .env
├── .env.example
├── .gitignore
├── index.html
├── LICENSE
├── package-lock.json
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Directory Overview

- `src/components/` - Reusable UI components (CustomSelect, CalendarPicker, FormatCard, Navigation)
- `src/pages/` - Public marketing and acquisition routes (Landing, FreeTool, Pricing, HowItWorks)
- `src/pages/app/` - Authenticated SaaS dashboard, Campaign Composer, Preferences, and Vault
- `src/lib/` - Supabase client, campaign compilation engine, and entitlements
- `src/config/` - Immutable plan configurations, platform schemas, and constants
- `src/types/` - TypeScript database and campaign interface definitions
- `supabase/` - SQL migrations and reference data seeds
- `docs/` - Architectural specifications, strategy plans, and audit manifests
- `scripts/` - Maintenance, migration, and automation utilities
