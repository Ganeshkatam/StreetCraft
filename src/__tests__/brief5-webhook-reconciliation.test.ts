import { describe, it } from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { POST } from '../app/api/webhooks/razorpay/route';

describe('Brief 5: Webhook Dual Compatibility & Resilience', () => {
  const secret = 'webhook_secret_test_dual_compat_key';
  process.env.RAZORPAY_WEBHOOK_SECRET = secret;
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock_service_role_key';

  function signPayload(body: string, webhookSecret: string = secret): string {
    return crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
  }

  function makeRequest(body: string, signature?: string, eventIdHeader?: string): NextRequest {
    const headers = new Headers();
    headers.set('content-type', 'application/json');
    if (signature) {
      headers.set('x-razorpay-signature', signature);
    }
    if (eventIdHeader) {
      headers.set('x-razorpay-event-id', eventIdHeader);
    }

    return new NextRequest('http://localhost:3000/api/webhooks/razorpay', {
      method: 'POST',
      headers,
      body,
    });
  }

  it('rejects invalid signature with 400 and does not invoke database', async () => {
    const payload = JSON.stringify({ event: 'payment.captured', event_id: 'evt_1' });
    const req = makeRequest(payload, 'invalid_signature_hex_12345');
    const res = await POST(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'INVALID_SIGNATURE');
  });

  it('rejects missing signature with 400', async () => {
    const payload = JSON.stringify({ event: 'payment.captured', event_id: 'evt_1' });
    const req = makeRequest(payload);
    const res = await POST(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'MISSING_SIGNATURE');
  });

  it('rejects missing event id with 400', async () => {
    const payload = JSON.stringify({ event: 'payment.captured' });
    const sig = signPayload(payload);
    const req = makeRequest(payload, sig);
    const res = await POST(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'MISSING_EVENT_ID');
  });
});
