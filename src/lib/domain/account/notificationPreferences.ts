export interface NotificationPreferences {
  email: boolean;
  whatsapp: boolean;
  weeklyDigest: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: true,
  whatsapp: false,
  weeklyDigest: true,
};

export function normalizeNotificationPreferences(raw: unknown): NotificationPreferences {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }

  const obj = raw as Record<string, unknown>;

  return {
    email: typeof obj.email === 'boolean' ? obj.email : typeof obj.email === 'string' ? obj.email === 'true' : DEFAULT_NOTIFICATION_PREFERENCES.email,
    whatsapp: typeof obj.whatsapp === 'boolean' ? obj.whatsapp : typeof obj.whatsapp === 'string' ? obj.whatsapp === 'true' : DEFAULT_NOTIFICATION_PREFERENCES.whatsapp,
    weeklyDigest: typeof obj.weekly_digest === 'boolean'
      ? obj.weekly_digest
      : typeof obj.weeklyDigest === 'boolean'
      ? obj.weeklyDigest
      : typeof obj.weekly_digest === 'string'
      ? obj.weekly_digest === 'true'
      : DEFAULT_NOTIFICATION_PREFERENCES.weeklyDigest,
  };
}
