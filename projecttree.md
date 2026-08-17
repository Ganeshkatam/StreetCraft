# StreetCraft Project Directory Structure

Generated automatically on: 2026-08-17T22:46:23.170Z

Total Directories: 161  
Total Files: 449

```text
streetcraft/
├── .next/
│   ├── cache/
│   │   ├── swc/
│   │   │   └── plugins/
│   │   │       └── v7_windows_x86_64_4.0.0/
│   │   ├── webpack/
│   │   │   ├── client-development/
│   │   │   │   ├── 0.pack.gz
│   │   │   │   ├── 1.pack.gz
│   │   │   │   ├── 10.pack.gz
│   │   │   │   ├── 11.pack.gz
│   │   │   │   ├── 12.pack.gz
│   │   │   │   ├── 2.pack.gz
│   │   │   │   ├── 3.pack.gz
│   │   │   │   ├── 4.pack.gz
│   │   │   │   ├── 5.pack.gz
│   │   │   │   ├── 6.pack.gz
│   │   │   │   ├── 7.pack.gz
│   │   │   │   ├── 8.pack.gz
│   │   │   │   ├── 9.pack.gz
│   │   │   │   ├── index.pack.gz
│   │   │   │   └── index.pack.gz.old
│   │   │   ├── client-development-fallback/
│   │   │   │   ├── 0.pack.gz
│   │   │   │   └── index.pack.gz.old
│   │   │   ├── client-production/
│   │   │   │   ├── 0.pack
│   │   │   │   ├── 1.pack
│   │   │   │   ├── 2.pack
│   │   │   │   ├── 3.pack
│   │   │   │   ├── 4.pack
│   │   │   │   ├── index.pack
│   │   │   │   └── index.pack.old
│   │   │   ├── edge-server-production/
│   │   │   │   ├── 0.pack
│   │   │   │   ├── index.pack
│   │   │   │   └── index.pack.old
│   │   │   ├── server-development/
│   │   │   │   ├── 0.pack.gz
│   │   │   │   ├── 1.pack.gz
│   │   │   │   ├── 10.pack.gz
│   │   │   │   ├── 11.pack.gz
│   │   │   │   ├── 12.pack.gz
│   │   │   │   ├── 13.pack.gz
│   │   │   │   ├── 14.pack.gz
│   │   │   │   ├── 2.pack.gz
│   │   │   │   ├── 3.pack.gz
│   │   │   │   ├── 4.pack.gz
│   │   │   │   ├── 5.pack.gz
│   │   │   │   ├── 6.pack.gz
│   │   │   │   ├── 7.pack.gz
│   │   │   │   ├── 8.pack.gz
│   │   │   │   ├── 9.pack.gz
│   │   │   │   ├── index.pack.gz
│   │   │   │   └── index.pack.gz.old
│   │   │   └── server-production/
│   │   │       ├── 0.pack
│   │   │       ├── 1.pack
│   │   │       ├── 2.pack
│   │   │       ├── 3.pack
│   │   │       ├── index.pack
│   │   │       └── index.pack.old
│   │   ├── .rscinfo
│   │   └── .tsbuildinfo
│   ├── diagnostics/
│   │   ├── build-diagnostics.json
│   │   └── framework.json
│   ├── server/
│   │   ├── app/
│   │   │   ├── _not-found/
│   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   ├── page.js
│   │   │   │   └── page.js.nft.json
│   │   │   ├── app/
│   │   │   │   ├── account/
│   │   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   │   ├── page.js
│   │   │   │   │   └── page.js.nft.json
│   │   │   │   ├── auth-proof/
│   │   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   │   ├── page.js
│   │   │   │   │   └── page.js.nft.json
│   │   │   │   ├── billing/
│   │   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   │   ├── page.js
│   │   │   │   │   └── page.js.nft.json
│   │   │   │   ├── business/
│   │   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   │   ├── page.js
│   │   │   │   │   └── page.js.nft.json
│   │   │   │   ├── campaigns/
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   │   │   ├── page.js
│   │   │   │   │   │   └── page.js.nft.json
│   │   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   │   ├── page.js
│   │   │   │   │   └── page.js.nft.json
│   │   │   │   ├── create/
│   │   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   │   ├── page.js
│   │   │   │   │   └── page.js.nft.json
│   │   │   │   └── today/
│   │   │   │       ├── page_client-reference-manifest.js
│   │   │   │       ├── page.js
│   │   │   │       └── page.js.nft.json
│   │   │   ├── auth/
│   │   │   │   ├── callback/
│   │   │   │   │   ├── route_client-reference-manifest.js
│   │   │   │   │   ├── route.js
│   │   │   │   │   └── route.js.nft.json
│   │   │   │   ├── confirm/
│   │   │   │   │   ├── route_client-reference-manifest.js
│   │   │   │   │   ├── route.js
│   │   │   │   │   └── route.js.nft.json
│   │   │   │   └── signout/
│   │   │   │       ├── route_client-reference-manifest.js
│   │   │   │       ├── route.js
│   │   │   │       └── route.js.nft.json
│   │   │   ├── contact/
│   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   ├── page.js
│   │   │   │   └── page.js.nft.json
│   │   │   ├── forgot-password/
│   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   ├── page.js
│   │   │   │   └── page.js.nft.json
│   │   │   ├── free-tool/
│   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   ├── page.js
│   │   │   │   └── page.js.nft.json
│   │   │   ├── how-it-works/
│   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   ├── page.js
│   │   │   │   └── page.js.nft.json
│   │   │   ├── login/
│   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   ├── page.js
│   │   │   │   └── page.js.nft.json
│   │   │   ├── onboarding/
│   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   ├── page.js
│   │   │   │   └── page.js.nft.json
│   │   │   ├── pricing/
│   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   ├── page.js
│   │   │   │   └── page.js.nft.json
│   │   │   ├── privacy/
│   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   ├── page.js
│   │   │   │   └── page.js.nft.json
│   │   │   ├── reset-password/
│   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   ├── page.js
│   │   │   │   └── page.js.nft.json
│   │   │   ├── setup/
│   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   ├── page.js
│   │   │   │   └── page.js.nft.json
│   │   │   ├── signup/
│   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   ├── page.js
│   │   │   │   └── page.js.nft.json
│   │   │   ├── terms/
│   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   ├── page.js
│   │   │   │   └── page.js.nft.json
│   │   │   ├── verify-email/
│   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   ├── page.js
│   │   │   │   └── page.js.nft.json
│   │   │   ├── _not-found.html
│   │   │   ├── _not-found.meta
│   │   │   ├── _not-found.rsc
│   │   │   ├── contact.html
│   │   │   ├── contact.meta
│   │   │   ├── contact.rsc
│   │   │   ├── forgot-password.html
│   │   │   ├── forgot-password.meta
│   │   │   ├── forgot-password.rsc
│   │   │   ├── free-tool.html
│   │   │   ├── free-tool.meta
│   │   │   ├── free-tool.rsc
│   │   │   ├── how-it-works.html
│   │   │   ├── how-it-works.meta
│   │   │   ├── how-it-works.rsc
│   │   │   ├── index.html
│   │   │   ├── index.meta
│   │   │   ├── index.rsc
│   │   │   ├── login.html
│   │   │   ├── login.meta
│   │   │   ├── login.rsc
│   │   │   ├── onboarding.html
│   │   │   ├── onboarding.meta
│   │   │   ├── onboarding.rsc
│   │   │   ├── page_client-reference-manifest.js
│   │   │   ├── page.js
│   │   │   ├── page.js.nft.json
│   │   │   ├── pricing.html
│   │   │   ├── pricing.meta
│   │   │   ├── pricing.rsc
│   │   │   ├── privacy.html
│   │   │   ├── privacy.meta
│   │   │   ├── privacy.rsc
│   │   │   ├── reset-password.html
│   │   │   ├── reset-password.meta
│   │   │   ├── reset-password.rsc
│   │   │   ├── setup.html
│   │   │   ├── setup.meta
│   │   │   ├── setup.rsc
│   │   │   ├── signup.html
│   │   │   ├── signup.meta
│   │   │   ├── signup.rsc
│   │   │   ├── terms.html
│   │   │   ├── terms.meta
│   │   │   ├── terms.rsc
│   │   │   ├── verify-email.html
│   │   │   ├── verify-email.meta
│   │   │   └── verify-email.rsc
│   │   ├── chunks/
│   │   │   ├── 10.js
│   │   │   ├── 171.js
│   │   │   ├── 195.js
│   │   │   ├── 237.js
│   │   │   ├── 252.js
│   │   │   ├── 278.js
│   │   │   ├── 334.js
│   │   │   ├── 434.js
│   │   │   ├── 452.js
│   │   │   ├── 545.js
│   │   │   ├── 582.js
│   │   │   ├── 627.js
│   │   │   ├── 81.js
│   │   │   ├── 849.js
│   │   │   └── 9.js
│   │   ├── pages/
│   │   │   ├── _app.js
│   │   │   ├── _app.js.nft.json
│   │   │   ├── _document.js
│   │   │   ├── _document.js.nft.json
│   │   │   ├── _error.js
│   │   │   ├── _error.js.nft.json
│   │   │   ├── 404.html
│   │   │   └── 500.html
│   │   ├── app-paths-manifest.json
│   │   ├── functions-config-manifest.json
│   │   ├── interception-route-rewrite-manifest.js
│   │   ├── middleware-build-manifest.js
│   │   ├── middleware-manifest.json
│   │   ├── middleware-react-loadable-manifest.js
│   │   ├── next-font-manifest.js
│   │   ├── next-font-manifest.json
│   │   ├── pages-manifest.json
│   │   ├── server-reference-manifest.js
│   │   ├── server-reference-manifest.json
│   │   └── webpack-runtime.js
│   ├── static/
│   │   ├── chunks/
│   │   │   ├── app/
│   │   │   │   ├── _not-found/
│   │   │   │   │   └── page-c2ad5e76d5e4b179.js
│   │   │   │   ├── app/
│   │   │   │   │   ├── account/
│   │   │   │   │   │   └── page-cbdbeffad02e0dd6.js
│   │   │   │   │   ├── auth-proof/
│   │   │   │   │   │   └── page-7f356462019e2a95.js
│   │   │   │   │   ├── billing/
│   │   │   │   │   │   └── page-78d0725303b9d4fb.js
│   │   │   │   │   ├── business/
│   │   │   │   │   │   └── page-2768ffeea0fbde33.js
│   │   │   │   │   ├── campaigns/
│   │   │   │   │   │   ├── [id]/
│   │   │   │   │   │   │   └── page-de5687dd15766d5f.js
│   │   │   │   │   │   └── page-3ea3bed2bb3934f1.js
│   │   │   │   │   ├── create/
│   │   │   │   │   │   └── page-89c631f929aa345a.js
│   │   │   │   │   ├── today/
│   │   │   │   │   │   └── page-91797ae2180bdaf3.js
│   │   │   │   │   └── layout-504ca187bad783a3.js
│   │   │   │   ├── auth/
│   │   │   │   │   ├── callback/
│   │   │   │   │   │   └── route-50a8b115d5370f79.js
│   │   │   │   │   ├── confirm/
│   │   │   │   │   │   └── route-449320aee208fae5.js
│   │   │   │   │   └── signout/
│   │   │   │   │       └── route-5ad5999c81b79712.js
│   │   │   │   ├── contact/
│   │   │   │   │   └── page-566696314488fa3e.js
│   │   │   │   ├── forgot-password/
│   │   │   │   │   └── page-3e9d3c100f2a0436.js
│   │   │   │   ├── free-tool/
│   │   │   │   │   └── page-cc0055e5f29580c3.js
│   │   │   │   ├── how-it-works/
│   │   │   │   │   └── page-d6eaef968bd611d1.js
│   │   │   │   ├── login/
│   │   │   │   │   └── page-020ba641b37a1e32.js
│   │   │   │   ├── onboarding/
│   │   │   │   │   └── page-aa303fb820ce987f.js
│   │   │   │   ├── pricing/
│   │   │   │   │   └── page-e346e66c2cc61480.js
│   │   │   │   ├── privacy/
│   │   │   │   │   └── page-578030fd5c448b55.js
│   │   │   │   ├── reset-password/
│   │   │   │   │   └── page-220369a6d6e3b9f3.js
│   │   │   │   ├── setup/
│   │   │   │   │   └── page-bdddfdfaeb649226.js
│   │   │   │   ├── signup/
│   │   │   │   │   └── page-af1967d5147e59cc.js
│   │   │   │   ├── terms/
│   │   │   │   │   └── page-aa9f4faa51249db9.js
│   │   │   │   ├── verify-email/
│   │   │   │   │   └── page-bb9a103ebd3e2a6b.js
│   │   │   │   ├── error-bf93abefd13acab1.js
│   │   │   │   ├── layout-6ad913af0f78dcc7.js
│   │   │   │   ├── not-found-2c6ace1bdfe11f19.js
│   │   │   │   └── page-265d598e60ef987b.js
│   │   │   ├── pages/
│   │   │   │   ├── _app-0c238c2f06f7f88f.js
│   │   │   │   └── _error-5cfb257555e5fc2f.js
│   │   │   ├── 1487-771a8f761a48e48e.js
│   │   │   ├── 1517-9995401c045d1865.js
│   │   │   ├── 44530001-9859e7e976351652.js
│   │   │   ├── 4563-6db94a5f1a72f048.js
│   │   │   ├── 4953-6934aae531a4c85a.js
│   │   │   ├── 4bd1b696-a565e1bd5a2acb69.js
│   │   │   ├── 5203.f4b97ab553880bca.js
│   │   │   ├── 5534-e6eb8210a513a7b7.js
│   │   │   ├── 6218.ba8ff6176d4fd6f6.js
│   │   │   ├── 7182-404d7072b14c8c46.js
│   │   │   ├── 7519-b1912e14a37264e2.js
│   │   │   ├── 755-1af62cc7eca786d1.js
│   │   │   ├── 814-95c5c932e8779ca4.js
│   │   │   ├── 8173-4bda8112a6f83bf1.js
│   │   │   ├── 9-d8bae48ae924260e.js
│   │   │   ├── framework-a08059d19b5ea91c.js
│   │   │   ├── main-045aa72fad6b40db.js
│   │   │   ├── main-app-232bf1eb82a34458.js
│   │   │   ├── polyfills-42372ed130431b0a.js
│   │   │   └── webpack-7d3281cf3928a567.js
│   │   ├── css/
│   │   │   └── 10062036efbe5723.css
│   │   └── EOtttFJQ39fMlNnzM7CTf/
│   │       ├── _buildManifest.js
│   │       └── _ssgManifest.js
│   ├── types/
│   │   ├── app/
│   │   │   ├── app/
│   │   │   │   ├── account/
│   │   │   │   │   └── page.ts
│   │   │   │   ├── auth-proof/
│   │   │   │   │   └── page.ts
│   │   │   │   ├── billing/
│   │   │   │   │   └── page.ts
│   │   │   │   ├── business/
│   │   │   │   │   └── page.ts
│   │   │   │   ├── campaigns/
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.ts
│   │   │   │   │   └── page.ts
│   │   │   │   ├── create/
│   │   │   │   │   └── page.ts
│   │   │   │   └── today/
│   │   │   │       └── page.ts
│   │   │   ├── auth/
│   │   │   │   ├── callback/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── confirm/
│   │   │   │   │   └── route.ts
│   │   │   │   └── signout/
│   │   │   │       └── route.ts
│   │   │   ├── contact/
│   │   │   │   └── page.ts
│   │   │   ├── forgot-password/
│   │   │   │   └── page.ts
│   │   │   ├── free-tool/
│   │   │   │   └── page.ts
│   │   │   ├── how-it-works/
│   │   │   │   └── page.ts
│   │   │   ├── login/
│   │   │   │   └── page.ts
│   │   │   ├── onboarding/
│   │   │   │   └── page.ts
│   │   │   ├── pricing/
│   │   │   │   └── page.ts
│   │   │   ├── privacy/
│   │   │   │   └── page.ts
│   │   │   ├── reset-password/
│   │   │   │   └── page.ts
│   │   │   ├── signup/
│   │   │   │   └── page.ts
│   │   │   ├── terms/
│   │   │   │   └── page.ts
│   │   │   ├── verify-email/
│   │   │   │   └── page.ts
│   │   │   ├── layout.ts
│   │   │   └── page.ts
│   │   ├── cache-life.d.ts
│   │   └── package.json
│   ├── app-build-manifest.json
│   ├── app-path-routes-manifest.json
│   ├── BUILD_ID
│   ├── build-manifest.json
│   ├── export-marker.json
│   ├── images-manifest.json
│   ├── next-minimal-server.js.nft.json
│   ├── next-server.js.nft.json
│   ├── package.json
│   ├── prerender-manifest.json
│   ├── react-loadable-manifest.json
│   ├── required-server-files.json
│   ├── routes-manifest.json
│   └── trace
├── .vscode/
│   └── settings.json
├── docs/
├── public/
│   ├── ChatGPT Image Aug 17, 2026, 03_19_39 AM.png
│   ├── google_business_proof.txt
│   ├── illustration_counter_card.jpg
│   ├── illustration_opportunity.jpg
│   ├── illustration_storefront.jpg
│   ├── instagram_proof.md
│   ├── instagram_proof.txt
│   ├── login_full.jpg
│   ├── reset_full.jpg
│   ├── setup_full.jpg
│   └── signup_full.jpg
├── scripts/
│   ├── generate-project-tree.js
│   ├── test-legacy-spa-audit.ts
│   ├── test-mpa-parity-audit.ts
│   └── test-today-read-contract.ts
├── src/
│   ├── app/
│   │   ├── app/
│   │   │   ├── account/
│   │   │   │   ├── AccountSettingsView.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── auth-proof/
│   │   │   │   └── page.tsx
│   │   │   ├── billing/
│   │   │   │   ├── BillingSettingsView.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── business/
│   │   │   │   ├── BusinessView.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── campaigns/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── CampaignDetailView.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── CampaignVaultView.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── components/
│   │   │   │   └── WorkspaceNavigation.tsx
│   │   │   ├── create/
│   │   │   │   ├── CreateCampaignView.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── today/
│   │   │   │   ├── page.tsx
│   │   │   │   └── TodayView.tsx
│   │   │   └── layout.tsx
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
│   │   ├── onboarding/
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
│   │   │   ├── page.tsx
│   │   │   └── SetupView.tsx
│   │   ├── signup/
│   │   │   ├── page.tsx
│   │   │   └── SignupView.tsx
│   │   ├── terms/
│   │   │   └── page.tsx
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
│   │   ├── campaignTypes.ts
│   │   ├── categories.ts
│   │   ├── channels.ts
│   │   ├── plans.ts
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
│   │   ├── server/
│   │   │   ├── auth/
│   │   │   │   └── requireAuthenticatedClaims.ts
│   │   │   ├── business/
│   │   │   │   ├── getAccessibleBusinesses.ts
│   │   │   │   ├── getBusinessProfile.ts
│   │   │   │   └── resolveAuthorizedBusiness.ts
│   │   │   ├── campaigns/
│   │   │   │   └── getRecentCampaigns.ts
│   │   │   ├── opportunities/
│   │   │   │   └── getFestivalMoments.ts
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
│   └── styles.css
├── supabase/
│   ├── migrations/
│   ├── seed/
│   └── schema.sql
├── .env
├── .env.example
├── .gitignore
├── LICENSE
├── middleware.ts
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

- `src/app/` - Next.js App Router (Public routes, marketing, authenticated workspace, auth handlers)
- `src/components/` - Shared UI components (CustomSelect, CalendarPicker, UpgradeModal, UsageMeter)
- `src/lib/` - Supabase client, API abstractions, error handling, telemetry, and entitlements
- `src/config/` - Immutable plan configurations, channel definitions, and category schemas
- `src/types/` - TypeScript database, campaign, and domain interface definitions
- `supabase/` - SQL migrations and reference data seeds
- `docs/` - Architectural specifications, strategy plans, and audit manifests
- `scripts/` - Maintenance, migration, and automation utilities
