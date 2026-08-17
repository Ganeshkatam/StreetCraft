-- StreetCraft Real Reference Data Seed (Plans & Festival Calendar)
-- Seed: reference-data.sql

-- 1. Plans Reference Data
INSERT INTO public.plans (id, name, monthly_pack_limit, price_inr, channels, features, active)
VALUES 
  ('FREE', 'Neighborhood Starter', 3, 0, '{"GOOGLE_BUSINESS","INSTAGRAM","WHATSAPP"}', '{"3 Coordinated Campaigns / mo","Google Business Profile Updates","Instagram Post & Reels Generator","WhatsApp Broadcast Copy","Realtime Campaign Vault","Daily Opportunity Briefing"}', true),
  ('PRO', 'High-Street Pro', 100, 399, '{"GOOGLE_BUSINESS","INSTAGRAM","WHATSAPP","IN_STORE_POSTER"}', '{"100 Coordinated Campaigns / mo","All Storefront Marketing Formats Included","Print-Ready In-Store Poster Layouts","Advanced Festival & Holiday Strategy","Permanent Business Preferences Studio","Priority Generation Latency"}', true),
  ('GROWTH', 'Multi-Store Growth', 300, 799, '{"GOOGLE_BUSINESS","INSTAGRAM","WHATSAPP","IN_STORE_POSTER"}', '{"300 Coordinated Campaigns / mo","Full Multi-Touchpoint Distribution Engine","Dedicated Fast Lane Generation","Custom Brand Tone & Voice Presets","Role-Based Team Collaboration","Audit Log & Usage Metering"}', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  monthly_pack_limit = EXCLUDED.monthly_pack_limit,
  price_inr = EXCLUDED.price_inr,
  channels = EXCLUDED.channels,
  features = EXCLUDED.features,
  active = EXCLUDED.active;

-- 2. Festival & Calendar Moments Reference Data
INSERT INTO public.festival_calendar (id, name, region, starts_at, ends_at, marketing_relevance, suggested_offer)
VALUES
  ('fest_independence', 'Independence Day Weekend', 'National', '2026-08-14', '2026-08-17', 'Long weekend dining & patriotic treats', 'Tricolor specialty desserts or 15% long-weekend brunch combos'),
  ('fest_raksha', 'Raksha Bandhan', 'National', '2026-08-28', '2026-08-29', 'Sibling gifting, sweet boxes & celebratory meals', 'Curated sibling gift boxes & 2-for-1 treat specials'),
  ('fest_ganesh', 'Ganesh Chaturthi', 'Maharashtra / South / West', '2026-09-14', '2026-09-24', 'Festive family sweets, Modak specials & dining', 'Artisanal festive sweets box & family feast platters'),
  ('fest_onam', 'Onam Celebration', 'Kerala / South', '2026-09-03', '2026-09-06', 'Sadhya feasts, harvest celebrations & family dining', 'Special Onam festive menu & celebratory beverage pairing'),
  ('fest_navratri', 'Navratri & Durga Puja', 'National / Bengal / Gujarat', '2026-10-11', '2026-10-20', 'Festive feasting, fasting special menus & night treats', 'Special festive thalis & evening celebration combos'),
  ('fest_diwali', 'Diwali & New Year', 'National', '2026-11-08', '2026-11-13', 'Peak shopping, corporate gifting & family celebrations', 'Exclusive Diwali gift hampers & pre-booking discounts'),
  ('fest_christmas', 'Christmas & Winter Carnival', 'National', '2026-12-20', '2026-12-26', 'Holiday cheer, hot chocolates, plum cakes & winter specials', 'Signature hot chocolate pairings & holiday bakes gift box'),
  ('fest_newyear', 'New Year Kickoff', 'National', '2026-12-30', '2027-01-02', 'Year-end celebrations & fresh January brunch', 'New Year brunch reservations & early-bird table booking'),
  ('fest_republic', 'Republic Day Weekend', 'National', '2027-01-24', '2027-01-27', 'National holiday long weekend brunch & walk-ins', 'Long-weekend breakfast combos & family platters')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  region = EXCLUDED.region,
  starts_at = EXCLUDED.starts_at,
  ends_at = EXCLUDED.ends_at,
  marketing_relevance = EXCLUDED.marketing_relevance,
  suggested_offer = EXCLUDED.suggested_offer;
