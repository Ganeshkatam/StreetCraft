import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { reconcileRazorpayWebhookPayload } from '../../../../lib/domain/plan/paymentReconciliation';

/**
 * POST handler for Razorpay webhook endpoint.
 * Verifies webhook signature, parses the event payload, and triggers
 * reconciliation via RPC to maintain payment state.
 */
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[Razorpay Webhook] Configuration error: RAZORPAY_WEBHOOK_SECRET is not set.');
      return NextResponse.json({ error: 'SERVER_CONFIGURATION_ERROR' }, { status: 500 });
    }

    const signature = req.headers.get('x-razorpay-signature');
    if (!signature) {
      return NextResponse.json({ error: 'MISSING_SIGNATURE' }, { status: 400 });
    }

    const rawBody = await req.text();

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const signatureBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      console.error('[Razorpay Webhook] Invalid webhook signature detected.');
      return NextResponse.json({ error: 'INVALID_SIGNATURE' }, { status: 400 });
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'INVALID_JSON_PAYLOAD' }, { status: 400 });
    }

    const eventType = typeof payload.event === 'string' ? payload.event : 'unknown';
    const providerEventId =
      (typeof payload.event_id === 'string' && payload.event_id) ||
      req.headers.get('x-razorpay-event-id');

    if (!providerEventId) {
      return NextResponse.json({ error: 'MISSING_EVENT_ID' }, { status: 400 });
    }

    // Defense-in-depth: Reconcile payload invariants before privileged database activation
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const reconResult = reconcileRazorpayWebhookPayload({ eventType, payload });
      if (!reconResult.valid) {
        console.error('[Razorpay Webhook] Purchase reconciliation rejected:', reconResult.error);
        return NextResponse.json({
          error: 'RECONCILIATION_FAILED',
          message: reconResult.error,
        }, { status: 400 });
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Razorpay Webhook] Configuration error: Missing Supabase credentials.');
      return NextResponse.json({ received: false }, { status: 500 });
    }

    // Instantiate service-role client for privileged reconciliation RPC
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data: reconcileResult, error: reconcileError } = await supabaseAdmin.rpc('reconcile_provider_event', {
      p_provider: 'razorpay',
      p_provider_event_id: providerEventId,
      p_event_type: eventType,
      p_payload: payload,
    });

    // Dual compatibility: Handle OLD function behavior (which raises exceptions)
    if (reconcileError) {
      const errorCode = reconcileError.code || 'UNKNOWN_ERROR';
      console.error('[Razorpay Webhook] Error code:', errorCode);

      // Retryable SQL states: 40001 (serialization failure), 40P01 (deadlock), 55P03 (lock not available)
      const isRetryable = ['40001', '40P01', '55P03'].includes(errorCode);
      if (isRetryable) {
        return NextResponse.json({ received: false }, { status: 503 });
      }

      // Permanent failure under old raising function: return 200 to acknowledge receipt and prevent indefinite replays
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Dual compatibility: Handle NEW function behavior (which returns JSONB with success, retryable, error_code)
    if (reconcileResult && typeof reconcileResult === 'object') {
      const res = reconcileResult as Record<string, unknown>;
      if (res.success === false) {
        const errorCode = typeof res.error_code === 'string' ? res.error_code : 'FAILED';
        console.error('[Razorpay Webhook] Error code:', errorCode);

        if (res.retryable === true) {
          return NextResponse.json({ received: false }, { status: 503 });
        }

        // Permanent failure persisted as FAILED or NEEDS_REVIEW: acknowledge receipt to stop Razorpay retries
        return NextResponse.json({ received: true }, { status: 200 });
      }
    }

    // Clean acknowledgment: Never leak internal database text or reconcile structures
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: unknown) {
    console.error('[Razorpay Webhook] Error code: INTERNAL_ERROR');
    return NextResponse.json({ received: false }, { status: 500 });
  }
}
