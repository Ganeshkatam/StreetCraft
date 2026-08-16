/**
 * StreetCraft Core Common Types
 */

export type UUID = string;
export type ISODateString = string;

export type ValidationStatus = 'VALID' | 'WARNING' | 'REPAIRED' | 'INVALID';

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationReport {
  isValid: boolean;
  issues: ValidationIssue[];
}
