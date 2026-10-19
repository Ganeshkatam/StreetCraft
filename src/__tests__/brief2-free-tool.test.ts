import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { generateCampaignPack } from '../engine/campaignEngine';
import { generateFreeCampaignAction } from '../lib/server/free-tool/generateFreeCampaignAction';

describe('Brief 2: Free Tool Server Action & Validation', () => {
  it('rejects missing or empty store name', async () => {
    const res = await generateFreeCampaignAction({
      name: '',
      category: 'Cafe',
      type: 'WEEKDAY_BOOST',
      offerTitle: '20% off pour-overs',
    });
    assert.strictEqual(res.success, false);
    assert.ok(res.message?.includes('Store name is required'));
  });

  it('rejects oversized store name exceeding 100 characters', async () => {
    const res = await generateFreeCampaignAction({
      name: 'A'.repeat(101),
      category: 'Cafe',
      type: 'WEEKDAY_BOOST',
      offerTitle: '20% off pour-overs',
    });
    assert.strictEqual(res.success, false);
    assert.ok(res.message?.includes('100 characters'));
  });

  it('rejects invalid campaign type', async () => {
    const res = await generateFreeCampaignAction({
      name: 'My Store',
      category: 'Cafe',
      type: 'INVALID_TYPE' as any,
      offerTitle: '20% off pour-overs',
    });
    assert.strictEqual(res.success, false);
    assert.ok(res.message?.includes('Invalid'));
  });

  it('rejects empty promotional offer title', async () => {
    const res = await generateFreeCampaignAction({
      name: 'My Store',
      category: 'Cafe',
      type: 'WEEKDAY_BOOST',
      offerTitle: '',
    });
    assert.strictEqual(res.success, false);
    assert.ok(res.message?.includes('Offer title is required'));
  });

  it('rejects oversized offer headline exceeding 200 characters', async () => {
    const res = await generateFreeCampaignAction({
      name: 'My Store',
      category: 'Cafe',
      type: 'WEEKDAY_BOOST',
      offerTitle: 'Special '.repeat(35),
    });
    assert.strictEqual(res.success, false);
    assert.ok(res.message?.includes('200 characters'));
  });

  it('generates compliant campaign pack within 20 KB per channel payload limit', async () => {
    const res = await generateFreeCampaignAction({
      name: 'The Roasted Bean',
      category: 'Specialty Cafe & Bakery',
      neighborhood: 'Indiranagar',
      city: 'Bengaluru',
      type: 'WEEKDAY_BOOST',
      offerTitle: '20% off single-origin pour-overs & fresh sourdough bakes',
      timing: 'Monday-Thursday, 3:00 PM - 6:00 PM',
    });

    assert.strictEqual(res.success, true);
    assert.ok(res.pack);
    assert.strictEqual(res.pack.campaign.type, 'WEEKDAY_BOOST');
    assert.strictEqual(res.pack.campaign.businessId, null);

    const maxBytes = 20480;
    const googleBytes = Buffer.byteLength(JSON.stringify(res.pack.outputs.googleBusiness), 'utf8');
    const instaBytes = Buffer.byteLength(JSON.stringify(res.pack.outputs.instagram), 'utf8');
    const waBytes = Buffer.byteLength(JSON.stringify(res.pack.outputs.whatsapp), 'utf8');
    const posterBytes = Buffer.byteLength(JSON.stringify(res.pack.outputs.poster || {}), 'utf8');

    assert.ok(googleBytes < maxBytes, `Google output payload (${googleBytes} bytes) exceeded ${maxBytes}`);
    assert.ok(instaBytes < maxBytes, `Instagram output payload (${instaBytes} bytes) exceeded ${maxBytes}`);
    assert.ok(waBytes < maxBytes, `WhatsApp output payload (${waBytes} bytes) exceeded ${maxBytes}`);
    assert.ok(posterBytes < maxBytes, `Poster output payload (${posterBytes} bytes) exceeded ${maxBytes}`);
  });
  it('fails closed when NODE_ENV is production and TURNSTILE_SECRET_KEY is missing', async () => {
    const origEnv = process.env.NODE_ENV;
    const origSecret = process.env.TURNSTILE_SECRET_KEY;
    try {
      (process.env as any).NODE_ENV = 'production';
      delete process.env.TURNSTILE_SECRET_KEY;

      const res = await generateFreeCampaignAction({
        name: 'The Roasted Bean',
        category: 'Cafe',
        type: 'WEEKDAY_BOOST',
        offerTitle: '20% off',
      });
      assert.strictEqual(res.success, false);
      assert.ok(res.message?.includes('CAPTCHA service is unavailable'));
    } finally {
      (process.env as any).NODE_ENV = origEnv;
      if (origSecret) process.env.TURNSTILE_SECRET_KEY = origSecret;
    }
  });
});

describe('Brief 2: Migration SQL & Policy Verification', () => {
  const partAPath = path.join(process.cwd(), 'supabase', 'migrations', '20261019050000_brief2_part_a_additive_anonymous_campaign.sql');
  const partCPath = path.join(process.cwd(), 'supabase', 'migrations', '20261019050100_brief2_part_c_lock_down_campaigns.sql');

  it('Part A migration defines create_anonymous_campaign with least-privilege permissions', () => {
    const sql = fs.readFileSync(partAPath, 'utf8');
    assert.ok(sql.includes('CREATE OR REPLACE FUNCTION public.create_anonymous_campaign'), 'Missing create_anonymous_campaign RPC');
    
    const createAnonStart = sql.indexOf('CREATE OR REPLACE FUNCTION public.create_anonymous_campaign');
    const claimAnonStart = sql.indexOf('CREATE OR REPLACE FUNCTION public.claim_anonymous_campaign');
    const createAnonBlock = sql.slice(createAnonStart, claimAnonStart);

    assert.ok(createAnonBlock.includes('REVOKE ALL ON FUNCTION public.create_anonymous_campaign'), 'Missing revoke all on create_anonymous_campaign');
    assert.ok(createAnonBlock.includes('TO service_role'), 'create_anonymous_campaign not granted to service_role');
    assert.ok(!createAnonBlock.includes('TO anon'), 'create_anonymous_campaign must not be granted to anon');
    assert.ok(!createAnonBlock.includes('TO authenticated'), 'create_anonymous_campaign must not be granted to authenticated');
    assert.ok(sql.includes('check_claim_token_length'), 'Missing check_claim_token_length constraint');
    assert.ok(sql.includes('claim_expires_at'), 'Missing claim_expires_at column definition');
  });

  it('Part A migration defines check_and_record_rate_limit with service_role permissions only', () => {
    const sql = fs.readFileSync(partAPath, 'utf8');
    assert.ok(sql.includes('CREATE OR REPLACE FUNCTION public.check_and_record_rate_limit'), 'Missing check_and_record_rate_limit RPC');
    assert.ok(sql.includes('REVOKE ALL ON FUNCTION public.check_and_record_rate_limit'), 'Missing revoke on check_and_record_rate_limit');
    assert.ok(sql.includes('GRANT EXECUTE ON FUNCTION public.check_and_record_rate_limit'), 'Missing grant to service_role on rate limit RPC');
  });

  it('Part A migration uses extensions.gen_random_bytes and enables RLS on request_rate_limits', () => {
    const sql = fs.readFileSync(partAPath, 'utf8');
    assert.ok(sql.includes('extensions.gen_random_bytes'), 'Must qualify gen_random_bytes with extensions schema');
    assert.ok(sql.includes('ALTER TABLE public.request_rate_limits ENABLE ROW LEVEL SECURITY;'), 'Must enable RLS on request_rate_limits');
  });

  it('Part A migration preserves Brief 1 IST dates and ensure_usage_period in claim_anonymous_campaign', () => {
    const sql = fs.readFileSync(partAPath, 'utf8');
    const claimStart = sql.indexOf('CREATE OR REPLACE FUNCTION public.claim_anonymous_campaign');
    const claimBlock = sql.slice(claimStart);
    assert.ok(claimBlock.includes("ensure_usage_period(p_business_id)"), 'Must call ensure_usage_period');
    assert.ok(claimBlock.includes("(now() at time zone 'Asia/Kolkata')::date"), 'Must use Asia/Kolkata date');
  });

  it('Part C migration strictly restricts deletion to business_id IS NULL only', () => {
    const sql = fs.readFileSync(partCPath, 'utf8');
    assert.ok(sql.includes('DELETE FROM public.campaigns\nWHERE business_id IS NULL;'), 'Delete must be strictly WHERE business_id IS NULL');
    assert.ok(!sql.includes('OR claim_token IS NOT NULL'), 'Delete must never include OR claim_token IS NOT NULL');
    assert.ok(sql.includes('REVOKE SELECT, INSERT ON public.campaigns FROM anon;'), 'Must revoke anon SELECT and INSERT on campaigns');
    assert.ok(sql.includes('REVOKE SELECT, INSERT ON public.campaign_outputs FROM anon;'), 'Must revoke anon SELECT and INSERT on campaign_outputs');
  });
});
