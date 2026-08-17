/**
 * StreetCraft Privacy-Conscious Observability & Product Telemetry
 * Captures lifecycle funnel events without logging sensitive store data.
 */

export type TelemetryEvent =
  | 'user_signup'
  | 'user_signin'
  | 'business_created'
  | 'preferences_saved'
  | 'campaign_started'
  | 'campaign_generated'
  | 'campaign_saved'
  | 'campaign_failed'
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
  private _isDev = import.meta.env.DEV;

  public track(event: TelemetryEvent, payload?: TelemetryPayload): void {
    const timestamp = new Date().toISOString();
    const entry = {
      event,
      timestamp,
      ...payload,
    };

    if (this._isDev) {
      console.log(`[STREETCRAFT TELEMETRY]:`, entry);
    }
  }
}

export const telemetry = new TelemetryLogger();
