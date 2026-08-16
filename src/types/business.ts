/**
 * StreetCraft Business & Tenant Types
 */

import { UUID, ISODateString } from './common';

export type MemberRole = 'owner' | 'admin' | 'member';

export interface Business {
  id: UUID;
  name: string;
  category: string;
  timezone: string;
  createdAt: ISODateString;
}

export interface BusinessMember {
  id: UUID;
  businessId: UUID;
  userId: UUID;
  role: MemberRole;
  createdAt: ISODateString;
}

export interface BusinessProfile {
  businessId: UUID;
  name: string;
  category: string;
  neighborhood: string;
  city: string;
  landmarks: string;
  targetCustomer: string;
  styleVoice: string;
  signatureItems: string;
  primaryGoal: string;
  peakHours: string;
  slowHours: string;
  defaultOffer: string;
  avgTicketINR: number;
  targetMonthlyCustomers: number;
  phoneWhatsApp: string;
  updatedAt: ISODateString;
}

export interface UserSession {
  userId: UUID;
  email: string;
  phone: string;
  name: string;
  isAuthenticated: boolean;
  activeBusinessId: UUID;
  role: MemberRole;
}
