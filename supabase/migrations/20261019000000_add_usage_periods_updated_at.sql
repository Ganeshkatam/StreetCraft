-- Migration: Add updated_at column to public.usage_periods to align with subscription RPC updates
ALTER TABLE public.usage_periods 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
