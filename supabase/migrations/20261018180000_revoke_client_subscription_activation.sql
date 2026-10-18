-- Migration: 20261018180000_revoke_client_subscription_activation.sql
-- Description: Revoke client-side execution privileges on confirm_payment_and_activate_subscription.
-- Enforces least-privilege boundary: only the privileged service_role (invoked server-side
-- after cryptographic signature verification and Razorpay API reconciliation) can activate subscriptions.

-- Revoke all execute permissions on both 6-arg and 5-arg overloads from public, anon, and authenticated
REVOKE EXECUTE ON FUNCTION public.confirm_payment_and_activate_subscription(text, text, text, text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.confirm_payment_and_activate_subscription(text, text, text, text, text) FROM PUBLIC, anon, authenticated;

-- Strictly grant execute permission to service_role only
GRANT EXECUTE ON FUNCTION public.confirm_payment_and_activate_subscription(text, text, text, text, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_payment_and_activate_subscription(text, text, text, text, text) TO service_role;
