# StreetCraft Project Directory Structure

Generated automatically on: 2026-08-18T20:53:54.309Z

Total Directories: 137  
Total Files: 333

```text
streetcraft/
├── .vscode/
│   └── settings.json
├── docs/
├── public/
│   ├── images/
│   │   └── setup/
│   │       ├── bg_brand.jpg
│   │       ├── bg_contact.jpg
│   │       ├── bg_customers.jpg
│   │       ├── bg_identity.jpg
│   │       ├── bg_location.jpg
│   │       ├── bg_new_store.jpg
│   │       ├── bg_offer.jpg
│   │       ├── bg_operations.jpg
│   │       ├── bg_products.jpg
│   │       └── bg_review.jpg
│   ├── illustration_counter_card.jpg
│   ├── illustration_opportunity.jpg
│   ├── illustration_storefront.jpg
│   ├── login_full.jpg
│   ├── reset_full.jpg
│   ├── setup_full.jpg
│   └── signup_full.jpg
├── scripts/
│   ├── generate-project-tree.js
│   ├── run-tests.js
│   ├── test-business-mutation-contract.ts
│   ├── test-legacy-spa-audit.ts
│   ├── test-mpa-parity-audit.ts
│   └── test-today-read-contract.ts
├── src/
│   ├── __tests__/
│   │   ├── accountDomain.test.ts
│   │   ├── createDomain.test.ts
│   │   ├── planDomain.test.ts
│   │   ├── setupDomain.test.ts
│   │   └── todayDomain.test.ts
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
│   │   │   ├── PublicHeader.tsx
│   │   │   └── ServerFooter.tsx
│   │   ├── contact/
│   │   │   ├── components/
│   │   │   │   ├── ContactChannels.tsx
│   │   │   │   ├── ContactExpectations.tsx
│   │   │   │   ├── ContactFooter.tsx
│   │   │   │   ├── ContactForm.tsx
│   │   │   │   └── ContactHero.tsx
│   │   │   ├── ContactPage.tsx
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
│   │   ├── new/
│   │   │   └── store/
│   │   │       ├── NewStoreView.tsx
│   │   │       └── page.tsx
│   │   ├── pricing/
│   │   │   ├── page.tsx
│   │   │   └── PricingView.tsx
│   │   ├── privacy/
│   │   │   ├── components/
│   │   │   │   ├── PrivacyContents.tsx
│   │   │   │   ├── PrivacyFooter.tsx
│   │   │   │   ├── PrivacyHeader.tsx
│   │   │   │   └── PrivacySection.tsx
│   │   │   ├── page.tsx
│   │   │   └── PrivacyPage.tsx
│   │   ├── reset-password/
│   │   │   ├── page.tsx
│   │   │   └── ResetPasswordView.tsx
│   │   ├── setup/
│   │   │   ├── [businessId]/
│   │   │   │   ├── brand/
│   │   │   │   │   ├── BrandDomainView.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── SetupAmbientBackground.tsx
│   │   │   │   │   ├── SetupDomainHeader.tsx
│   │   │   │   │   ├── SetupFooterNav.tsx
│   │   │   │   │   └── SetupProgress.tsx
│   │   │   │   ├── contact/
│   │   │   │   │   ├── ContactDomainView.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── customers/
│   │   │   │   │   ├── CustomersDomainView.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── identity/
│   │   │   │   │   ├── IdentityDomainView.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── location/
│   │   │   │   │   ├── LocationDomainView.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── offer/
│   │   │   │   │   ├── OfferDomainView.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── operations/
│   │   │   │   │   ├── OperationsDomainView.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── ProductsDomainView.tsx
│   │   │   │   ├── review/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── ReviewDomainView.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── brand/
│   │   │   │   └── page.tsx
│   │   │   ├── contact/
│   │   │   │   └── page.tsx
│   │   │   ├── customers/
│   │   │   │   └── page.tsx
│   │   │   ├── identity/
│   │   │   │   └── page.tsx
│   │   │   ├── location/
│   │   │   │   └── page.tsx
│   │   │   ├── offer/
│   │   │   │   └── page.tsx
│   │   │   ├── operations/
│   │   │   │   └── page.tsx
│   │   │   ├── products/
│   │   │   │   └── page.tsx
│   │   │   ├── review/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   ├── page.tsx
│   │   │   └── SignupView.tsx
│   │   ├── solutions/
│   │   │   ├── cafes-and-bakeries/
│   │   │   │   ├── CafesBakeriesView.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── restaurants-and-food/
│   │   │   │   ├── page.tsx
│   │   │   │   └── RestaurantsFoodView.tsx
│   │   │   ├── retail-and-boutiques/
│   │   │   │   ├── page.tsx
│   │   │   │   └── RetailBoutiquesView.tsx
│   │   │   └── salons-and-studios/
│   │   │       ├── page.tsx
│   │   │       └── SalonsStudiosView.tsx
│   │   ├── terms/
│   │   │   ├── components/
│   │   │   │   ├── TermsContents.tsx
│   │   │   │   ├── TermsFooter.tsx
│   │   │   │   └── TermsSection.tsx
│   │   │   ├── page.tsx
│   │   │   └── TermsPage.tsx
│   │   ├── touchpoints/
│   │   │   ├── google-business/
│   │   │   │   ├── GoogleBusinessView.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── in-store-print/
│   │   │   │   ├── InStorePrintView.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── instagram/
│   │   │   │   ├── InstagramTouchpointView.tsx
│   │   │   │   └── page.tsx
│   │   │   └── whatsapp/
│   │   │       ├── page.tsx
│   │   │       └── WhatsAppTouchpointView.tsx
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
│   │   │   │   ├── [businessId]/
│   │   │   │   │   ├── campaigns/
│   │   │   │   │   │   ├── [campaignId]/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── create/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── plan/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── PlanView.tsx
│   │   │   │   │   ├── settings/
│   │   │   │   │   │   ├── components/
│   │   │   │   │   │   │   ├── StorePhotoManager.tsx
│   │   │   │   │   │   │   └── StoreSettingsRail.tsx
│   │   │   │   │   │   ├── contact/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── identity/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── offer/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── panels/
│   │   │   │   │   │   │   ├── StoreContactPanel.tsx
│   │   │   │   │   │   │   ├── StoreIdentityPanel.tsx
│   │   │   │   │   │   │   ├── StoreOfferPanel.tsx
│   │   │   │   │   │   │   └── StoreRhythmPanel.tsx
│   │   │   │   │   │   ├── rhythm/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── layout.tsx
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── today/
│   │   │   │   │   │   ├── components/
│   │   │   │   │   │   │   ├── CampaignVaultSnippet.tsx
│   │   │   │   │   │   │   ├── OpportunitiesPanel.tsx
│   │   │   │   │   │   │   ├── StorefrontContextPanel.tsx
│   │   │   │   │   │   │   ├── StoreQuotaPanel.tsx
│   │   │   │   │   │   │   ├── TodayHeader.tsx
│   │   │   │   │   │   │   └── UpcomingFestivalsPanel.tsx
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── TodayView.tsx
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   └── page.tsx
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
│   │   │   │   ├── components/
│   │   │   │   │   ├── CreateErrorState.tsx
│   │   │   │   │   ├── CreateHeader.tsx
│   │   │   │   │   ├── CreateStepIndicator.tsx
│   │   │   │   │   ├── GoalStep.tsx
│   │   │   │   │   ├── MomentStep.tsx
│   │   │   │   │   ├── OfferTimingStep.tsx
│   │   │   │   │   └── ProofsReviewStep.tsx
│   │   │   │   ├── CreateCampaignView.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── myplan/
│   │   │   │   └── page.tsx
│   │   │   ├── today/
│   │   │   │   └── page.tsx
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
│   │   ├── public/
│   │   │   ├── ConversionLaunchpad.tsx
│   │   │   ├── CopyAnatomy.tsx
│   │   │   ├── EditorialHero.tsx
│   │   │   ├── FeatureGrid.tsx
│   │   │   ├── MetricStrip.tsx
│   │   │   ├── PublicPageShell.tsx
│   │   │   ├── StorePlaybook.tsx
│   │   │   └── TouchpointSystem.tsx
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
│   ├── content/
│   │   ├── solutions/
│   │   │   ├── cafesAndBakeries.ts
│   │   │   ├── restaurantsAndFood.ts
│   │   │   ├── retailAndBoutiques.ts
│   │   │   └── salonsAndStudios.ts
│   │   ├── touchpoints/
│   │   │   ├── googleBusiness.ts
│   │   │   ├── instagram.ts
│   │   │   ├── inStorePrint.ts
│   │   │   └── whatsapp.ts
│   │   └── types.ts
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
│   │   │   ├── account/
│   │   │   │   ├── accountSchemas.ts
│   │   │   │   ├── accountTypes.ts
│   │   │   │   ├── notificationPreferences.ts
│   │   │   │   └── storefrontContext.ts
│   │   │   ├── business/
│   │   │   │   └── storeProgress.ts
│   │   │   ├── campaigns/
│   │   │   │   └── campaignTransitions.ts
│   │   │   ├── contact/
│   │   │   │   └── contactSchema.ts
│   │   │   ├── create/
│   │   │   │   ├── campaignPackSchema.ts
│   │   │   │   ├── createPreset.ts
│   │   │   │   ├── createSchemas.ts
│   │   │   │   ├── createTypes.ts
│   │   │   │   └── generationErrors.ts
│   │   │   ├── plan/
│   │   │   │   ├── entitlementState.ts
│   │   │   │   ├── planSchemas.ts
│   │   │   │   └── planTypes.ts
│   │   │   ├── setup/
│   │   │   │   ├── deriveSetupProgress.ts
│   │   │   │   ├── setupSchemas.ts
│   │   │   │   └── setupTypes.ts
│   │   │   └── today/
│   │   │       ├── todayBriefing.ts
│   │   │       └── todayTypes.ts
│   │   ├── server/
│   │   │   ├── account/
│   │   │   │   ├── getAccountNotifications.ts
│   │   │   │   ├── getAccountPlan.ts
│   │   │   │   ├── getAccountProfile.ts
│   │   │   │   ├── getAccountSecurity.ts
│   │   │   │   ├── getAccountStorefronts.ts
│   │   │   │   ├── switchStorefrontAction.ts
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
│   │   │   ├── contact/
│   │   │   │   └── submitContactAction.ts
│   │   │   ├── create/
│   │   │   │   ├── createCampaignAction.ts
│   │   │   │   └── getCreateContext.ts
│   │   │   ├── new-store/
│   │   │   │   └── createStoreAction.ts
│   │   │   ├── opportunities/
│   │   │   │   └── getFestivalMoments.ts
│   │   │   ├── plan/
│   │   │   │   ├── getStorePlan.ts
│   │   │   │   └── requestSubscriptionCancellationAction.ts
│   │   │   ├── setup/
│   │   │   │   ├── deriveSetupProgress.ts
│   │   │   │   ├── getSetupContext.ts
│   │   │   │   └── saveSetupDomainAction.ts
│   │   │   ├── today/
│   │   │   │   └── getTodayWorkspace.ts
│   │   │   └── usage/
│   │   │       └── getCurrentUsagePeriod.ts
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
