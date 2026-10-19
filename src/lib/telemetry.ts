/**
 * StreetCraft Lightweight Client Telemetry & Metric Logger
 */

export type TelemetryEvent =
  | 'campaign_generated'
  | 'campaign_saved'
  | 'campaign_exported'
  | 'opportunity_viewed'
  | 'proof_copied'
  | 'subscription_upgraded'
  | 'subscription_cancelled'
  | 'founder_claimed';

export interface TelemetryPayload {
  businessId?: string;
  campaignType?: string;
  channel?: string;
  planId?: string;
  error?: string;
  durationMs?: number;
}

class TelemetryLogger {
  private _isDev = typeof process !== 'undefined' && process.env ? process.env.NODE_ENV !== 'production' : true;

  public track(event: TelemetryEvent, payload?: TelemetryPayload): void {
    const timestamp = new Date().toISOString();
    
    const REDACTED_EXACT_KEYS = new Set([
      'token',
      'claim',
      'claim_token',
      'claimtoken',
      'secret',
      'key',
      'api_key',
      'apikey',
      'service_role_key',
      'turnstile_secret',
      'turnstilesecret',
      'password',
      'code',
      'auth_code',
      'access_token',
      'refresh_token',
    ]);

    // Defensive redaction: guarantee tokens, secrets, and claim parameters are never logged
    let sanitizedPayload: Record<string, unknown> | undefined = undefined;
    if (payload && typeof payload === 'object') {
      sanitizedPayload = {};
      for (const [key, value] of Object.entries(payload)) {
        const lowerKey = key.toLowerCase();
        if (
          REDACTED_EXACT_KEYS.has(lowerKey) ||
          lowerKey.includes('token') ||
          lowerKey.includes('claim') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('password')
        ) {
          continue;
        }
        if (typeof value === 'string' && (value.includes('claim=') || value.includes('token=') || value.includes('secret='))) {
          continue;
        }
        sanitizedPayload[key] = value;
      }
    }

    const entry = {
      event,
      timestamp,
      ...sanitizedPayload,
    };

    if (this._isDev) {
      console.log(`[STREETCRAFT TELEMETRY]:`, entry);
    }
  }
}

export const telemetry = new TelemetryLogger();
