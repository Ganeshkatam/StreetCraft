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
