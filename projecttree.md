# StreetCraft Project Directory Structure

Generated automatically on: 2026-08-16T21:16:06.070Z

Total Directories: 20  
Total Files: 91

```text
streetcraft/
├── .vscode/
│   └── settings.json
├── docs/
│   ├── arch-001-streetcraft-v1-refactor-plan.md
│   ├── streetcraft-ai-content-studio-plan.md
│   ├── streetcraft-growth-engine-v1-plan.md
│   └── streetcraft-local-growth-engine-plan.md
├── public/
│   ├── login_full.jpg
│   ├── onboarding_sketch.jpg
│   ├── reset_full.jpg
│   ├── reset_sketch.jpg
│   ├── setup_full.jpg
│   ├── signup_full.jpg
│   ├── signup_sketch.jpg
│   └── street_sketch.jpg
├── scripts/
│   ├── generate-project-tree.js
│   ├── test-content-generation-quality.js
│   ├── test-content-generation-quality.ts
│   └── test-v1-vertical-slice.js
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
│   │   ├── supabase.ts
│   │   └── telemetry.ts
│   ├── pages/
│   │   ├── app/
│   │   │   ├── BusinessPage.tsx
│   │   │   ├── CampaignVaultPage.tsx
│   │   │   ├── CreateCampaignPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── FreeToolPage.tsx
│   │   ├── HowItWorksPage.tsx
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── OnboardingPage.tsx
│   │   ├── PricingPage.tsx
│   │   └── SignupPage.tsx
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
│   │   ├── 20260816000001_streetcraft_realtime_saas.sql
│   │   ├── 20260817000000_streetcraft_v1_database_hardening.sql
│   │   ├── 20260817000001_streetcraft_commercial_limits_and_founder_rpc.sql
│   │   └── 20260817000002_streetcraft_payment_confirmation_rpc.sql
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
