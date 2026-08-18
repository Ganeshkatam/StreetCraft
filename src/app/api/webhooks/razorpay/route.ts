import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature when secret is configured
    if (secret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid Razorpay webhook signature');
        return NextResponse.json({ error: 'INVALID_SIGNATURE' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event || 'unknown';
    const providerEventId = payload.event_id || req.headers.get('x-razorpay-event-id') || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
      console.error('reconcile_provider_event error:', reconcileError);
      return NextResponse.json({ error: 'RECONCILIATION_FAILED', details: reconcileError.message }, { status: 500 });
    }

    return NextResponse.json({
      received: true,
      event_id: providerEventId,
      reconcileResult,
    });
  } catch (err: unknown) {
    console.error('Razorpay webhook processing error:', err);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
