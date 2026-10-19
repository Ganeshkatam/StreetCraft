# Operational Runbook: NEEDS_REVIEW Payment Reconciliation

## Context & Purpose
When a customer's payment is captured by Razorpay, but cannot be safely or automatically fulfilled (such as Founder slots sold out, duplicate claims, or amount mismatches), StreetCraft preserves financial integrity by:
1. Recording the provider event in `public.provider_events` with `status = 'NEEDS_REVIEW'` and `needs_review = true`.
2. Acknowledging the webhook with HTTP 200 `{ "received": true }` so Razorpay does not endlessly retry a permanently unfulfillable event.
3. Preventing any unauthorized quota allocation or corrupt subscription state in the database.

## Identification
To inspect all events requiring manual intervention, query the dedicated view:
```sql
SELECT 
  id,
  provider,
  provider_event_id,
  event_type,
  entity_id,
  error_code,
  error_message,
  received_at
FROM public.provider_events_needs_review;
```

Common error codes:
- `FOUNDER_SOLD_OUT`: Customer attempted to purchase a Founder tier subscription after all allocated slots were claimed.
- `FOUNDER_ALREADY_CLAIMED`: Customer already owns an active Founder claim.
- `PAYMENT_ALREADY_CLAIMED`: Payment reference was previously attached to a different account.
- `AMOUNT_MISMATCH`: Payment amount captured does not match authoritative plan catalog pricing.
- `INVALID_PLAN_OR_CYCLE`: Order notes contain an unrecognized plan or cycle combination.

## Resolution Procedure

### 1. Manual Refund via Razorpay Dashboard
1. Log into the Razorpay Merchant Dashboard (`https://dashboard.razorpay.com`).
2. Search for the payment using `entity_id` (e.g. `pay_...`) or the transaction ID found in `payload`.
3. Verify that the payment is in `captured` state.
4. Click **Issue Refund** -> **Full Refund**.
5. Add a note: `"Unfulfillable tier allocation - refunded automatically per policy."`

### 2. Mark Row Resolved in StreetCraft Database
Once the refund has been initiated in Razorpay, mark the event row as resolved in the database:
```sql
UPDATE public.provider_events
SET 
  needs_review = false,
  status = 'REFUNDED_RESOLVED',
  error_message = error_message || ' | Resolved via manual dashboard refund on ' || now()::text
WHERE id = '<EVENT_UUID>';
```

### 3. Customer Communication
Notify the customer at their registered email explaining that the tier was sold out or could not be activated, and confirm that a 100% refund has been processed back to their original payment method.

## Alerting
In production environments, configure a Supabase Database Webhook or Scheduled Edge Function on `public.provider_events` triggering on `INSERT` or `UPDATE` where `needs_review = true` to dispatch an urgent notification to the operations Slack channel or administrator email.
