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
      console.error('[Razorpay Webhook] Configuration error: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is not set.');
      return NextResponse.json({ error: 'SERVER_CONFIGURATION_ERROR' }, { status: 500 });
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

    if (reconcileError) {
      console.error('[Razorpay Webhook] reconcile_provider_event error:', reconcileError.message);
      return NextResponse.json({ error: 'RECONCILIATION_FAILED' }, { status: 500 });
    }

    return NextResponse.json({
      received: true,
      event_id: providerEventId,
      reconcileResult,
    });
  } catch (err: unknown) {
    console.error('Razorpay webhook processing error:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
