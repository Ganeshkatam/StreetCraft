# StreetCraft Project Directory Structure

Generated automatically on: 2026-08-18T12:24:16.633Z

Total Directories: 94  
Total Files: 223

```text
streetcraft/
├── .vscode/
│   └── settings.json
├── docs/
├── public/
│   ├── ChatGPT Image Aug 17, 2026, 03_19_39 AM.png
│   ├── illustration_counter_card.jpg
│   ├── illustration_opportunity.jpg
│   ├── illustration_storefront.jpg
│   ├── login_full.jpg
│   ├── reset_full.jpg
│   ├── setup_full.jpg
│   └── signup_full.jpg
├── scripts/
│   ├── generate-project-tree.js
│   ├── test-business-mutation-contract.ts
│   ├── test-legacy-spa-audit.ts
│   ├── test-mpa-parity-audit.ts
│   └── test-today-read-contract.ts
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── webhooks/
│   │   │       └── razorpay/
│   │   │           └── route.ts
│   │   ├── auth/
│   │   │   ├── callback/
│   │   │   │   └── route.ts
│   │   │   ├── confirm/
│   │   │   │   └── route.ts
│   │   │   └── signout/
│   │   │       └── route.ts
│   │   ├── components/
│   │   │   ├── ComingSoonView.tsx
│   │   │   ├── PublicHeader.tsx
│   │   │   └── ServerFooter.tsx
│   │   ├── contact/
│   │   │   ├── ContactView.tsx
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   ├── ForgotPasswordView.tsx
│   │   │   └── page.tsx
│   │   ├── free-tool/
│   │   │   ├── FreeToolView.tsx
│   │   │   └── page.tsx
│   │   ├── how-it-works/
│   │   │   ├── HowItWorksView.tsx
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   ├── LoginView.tsx
│   │   │   └── page.tsx
│   │   ├── pricing/
│   │   │   ├── page.tsx
│   │   │   └── PricingView.tsx
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   ├── page.tsx
│   │   │   └── ResetPasswordView.tsx
│   │   ├── setup/
│   │   │   ├── brand/
│   │   │   │   ├── BrandDomainView.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── components/
│   │   │   │   ├── SetupDomainHeader.tsx
│   │   │   │   ├── SetupFooterNav.tsx
│   │   │   │   └── SetupRail.tsx
│   │   │   ├── contact/
│   │   │   │   ├── ContactDomainView.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── customers/
│   │   │   │   ├── CustomersDomainView.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── identity/
│   │   │   │   ├── IdentityDomainView.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── location/
│   │   │   │   ├── LocationDomainView.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── offer/
│   │   │   │   ├── OfferDomainView.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── operations/
│   │   │   │   ├── OperationsDomainView.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   └── ProductsDomainView.tsx
│   │   │   ├── review/
│   │   │   │   ├── page.tsx
│   │   │   │   └── ReviewDomainView.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   ├── page.tsx
│   │   │   └── SignupView.tsx
│   │   ├── solutions/
│   │   │   ├── cafes-and-bakeries/
│   │   │   │   └── page.tsx
│   │   │   ├── restaurants-and-food/
│   │   │   │   └── page.tsx
│   │   │   ├── retail-and-boutiques/
│   │   │   │   └── page.tsx
│   │   │   └── salons-and-studios/
│   │   │       └── page.tsx
│   │   ├── terms/
│   │   │   └── page.tsx
│   │   ├── touchpoints/
│   │   │   ├── google-business/
│   │   │   │   └── page.tsx
│   │   │   ├── in-store-print/
│   │   │   │   └── page.tsx
│   │   │   ├── instagram/
│   │   │   │   └── page.tsx
│   │   │   └── whatsapp/
│   │   │       └── page.tsx
│   │   ├── user/
│   │   │   ├── account/
│   │   │   │   ├── components/
│   │   │   │   │   ├── AccountProfileHeader.tsx
│   │   │   │   │   ├── AccountRail.tsx
│   │   │   │   │   ├── AccountSaveIndicator.tsx
│   │   │   │   │   └── AccountSecurityFooter.tsx
│   │   │   │   ├── identity/
│   │   │   │   │   ├── IdentityPanelView.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── notifications/
│   │   │   │   │   ├── NotificationsPanelView.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── plan/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── PlanPanelView.tsx
│   │   │   │   ├── security/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── SecurityPanelView.tsx
│   │   │   │   ├── storefronts/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── StorefrontsPanelView.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── auth-proof/
│   │   │   │   └── page.tsx
│   │   │   ├── business/
│   │   │   │   ├── components/
│   │   │   │   │   ├── StorePhotoManager.tsx
│   │   │   │   │   ├── StoreProfileHeader.tsx
│   │   │   │   │   └── StoreRail.tsx
│   │   │   │   ├── panels/
│   │   │   │   │   ├── StoreContactPanel.tsx
│   │   │   │   │   ├── StoreIdentityPanel.tsx
│   │   │   │   │   ├── StoreOfferPanel.tsx
│   │   │   │   │   └── StoreRhythmPanel.tsx
│   │   │   │   ├── BusinessView.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── campaigns/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── CampaignDetailView.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── CampaignArchiveButton.tsx
│   │   │   │   ├── CampaignNotesEditor.tsx
│   │   │   │   ├── CampaignRegenerateButton.tsx
│   │   │   │   ├── CampaignStatusDropdown.tsx
│   │   │   │   ├── CampaignVaultView.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── components/
│   │   │   │   ├── EditableField.tsx
│   │   │   │   ├── EditFieldModal.tsx
│   │   │   │   └── WorkspaceNavigation.tsx
│   │   │   ├── create/
│   │   │   │   ├── CreateCampaignView.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── myplan/
│   │   │   │   ├── MyPlanView.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── today/
│   │   │   │   ├── page.tsx
│   │   │   │   └── TodayView.tsx
│   │   │   └── layout.tsx
│   │   ├── verify-email/
│   │   │   ├── page.tsx
│   │   │   └── VerifyEmailView.tsx
│   │   ├── error.tsx
│   │   ├── LandingView.tsx
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── AppDialog.tsx
│   │   ├── CalendarPicker.tsx
│   │   ├── CampaignStatusBadge.tsx
│   │   ├── ChannelCard.tsx
│   │   ├── CustomSelect.tsx
│   │   ├── ErrorStateCard.tsx
│   │   ├── Logo.tsx
│   │   ├── Toaster.tsx
│   │   ├── UpgradeModal.tsx
│   │   └── UsageMeter.tsx
│   ├── config/
│   │   ├── brandTones.ts
│   │   ├── campaignTypes.ts
│   │   ├── categories.ts
│   │   ├── channels.ts
│   │   ├── plans.ts
│   │   ├── storeOptions.ts
│   │   └── validationRules.ts
│   ├── context/
│   │   └── DialogContext.tsx
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
│   │   ├── domain/
│   │   │   ├── business/
│   │   │   │   └── storeProgress.ts
│   │   │   └── campaigns/
│   │   │       └── campaignTransitions.ts
│   │   ├── server/
│   │   │   ├── account/
│   │   │   │   ├── getAccountNotifications.ts
│   │   │   │   ├── getAccountPlan.ts
│   │   │   │   ├── getAccountProfile.ts
│   │   │   │   ├── getAccountSecurity.ts
│   │   │   │   ├── getAccountStorefronts.ts
│   │   │   │   ├── updateAccountPasswordAction.ts
│   │   │   │   ├── updateAccountPreferencesAction.ts
│   │   │   │   ├── updateAccountProfileAction.ts
│   │   │   │   └── uploadAccountAvatarAction.ts
│   │   │   ├── auth/
│   │   │   │   └── requireAuthenticatedClaims.ts
│   │   │   ├── business/
│   │   │   │   ├── getAccessibleBusinesses.ts
│   │   │   │   ├── getBusinessProfile.ts
│   │   │   │   ├── resolveAuthorizedBusiness.ts
│   │   │   │   └── updateBusinessProfile.ts
│   │   │   ├── campaigns/
│   │   │   │   ├── archiveCampaignAction.ts
│   │   │   │   ├── getCampaignDetail.ts
│   │   │   │   ├── getCampaignVault.ts
│   │   │   │   ├── getRecentCampaigns.ts
│   │   │   │   ├── regenerateCampaignAction.ts
│   │   │   │   ├── updateCampaignNotesAction.ts
│   │   │   │   └── updateCampaignStatusAction.ts
│   │   │   ├── create/
│   │   │   │   ├── createCampaignAction.ts
│   │   │   │   └── getCreateContext.ts
│   │   │   ├── myplan/
│   │   │   │   ├── cancelSubscriptionAction.ts
│   │   │   │   └── getMyPlanData.ts
│   │   │   ├── opportunities/
│   │   │   │   └── getFestivalMoments.ts
│   │   │   ├── setup/
│   │   │   │   ├── createBusinessSetupAction.ts
│   │   │   │   ├── deriveSetupProgress.ts
│   │   │   │   ├── getSetupContext.ts
│   │   │   │   └── saveSetupDomainAction.ts
│   │   │   ├── usage/
│   │   │   │   └── getCurrentUsagePeriod.ts
│   │   │   └── workspace/
│   │   │       └── getWorkspaceTodayData.ts
│   │   ├── supabase/
│   │   │   ├── auth.ts
│   │   │   ├── middleware.ts
│   │   │   └── server.ts
│   │   ├── api.ts
│   │   ├── entitlements.ts
│   │   ├── supabase.ts
│   │   ├── telemetry.ts
│   │   └── userFacingError.ts
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
│   │   ├── database.ts
│   │   └── database.types.ts
│   ├── utils/
│   │   └── exportUtils.ts
│   ├── middleware.ts
│   └── styles.css
├── supabase/
│   ├── migrations/
│   └── seed/
├── .env
├── .env.example
├── .gitignore
├── LICENSE
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
└── tsconfig.tsbuildinfo
```

---

## Directory Overview

- `src/user/` - Next.js App Router (Public routes, marketing, authenticated workspace, auth handlers)
- `src/components/` - Shared UI components (CustomSelect, CalendarPicker, UpgradeModal, UsageMeter)
- `src/lib/` - Supabase client, API abstractions, error handling, telemetry, and entitlements
- `src/config/` - Immutable plan configurations, channel definitions, and category schemas
- `src/types/` - TypeScript database, campaign, and domain interface definitions
- `supabase/` - SQL migrations and reference data seeds
- `docs/` - Architectural specifications, strategy plans, and audit manifests
- `scripts/` - Maintenance, migration, and automation utilities
