import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateIntegrationTarget,
  normalizeHostname,
  extractProjectRef,
  PRODUCTION_PROJECT_REF,
} from '../lib/server/integrationTargetGuard';

describe('Integration Target Guard & Hostname Classification', () => {
  it('normalizes bracketed IPv6 loopback addresses', () => {
    assert.strictEqual(normalizeHostname('[::1]'), '::1');
    assert.strictEqual(normalizeHostname('::1'), '::1');
    assert.strictEqual(normalizeHostname('localhost'), 'localhost');
    assert.strictEqual(normalizeHostname('127.0.0.1'), '127.0.0.1');
  });

  it('classifies IPv6 loopback as a local disposable target when confirmed', () => {
    const result = validateIntegrationTarget('http://[::1]:54321', {
      allowLocal: true,
    });
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.classification, 'LOCAL_DISPOSABLE');
    assert.strictEqual(result.hostname, '::1');
  });

  it('rejects unconfirmed IPv6 loopback target', () => {
    const result = validateIntegrationTarget('http://[::1]:54321', {
      allowLocal: false,
      confirmIsolated: false,
    });
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.classification, 'INVALID_CONFIGURATION');
    assert.match(result.errorMessage || '', /Local target detected.*unconfirmed/);
  });

  it('classifies standard localhost and 127.0.0.1 as local disposable targets', () => {
    const resLocalhost = validateIntegrationTarget('http://localhost:54321', { confirmIsolated: true });
    assert.strictEqual(resLocalhost.valid, true);
    assert.strictEqual(resLocalhost.classification, 'LOCAL_DISPOSABLE');

    const resIpv4 = validateIntegrationTarget('http://127.0.0.1:54321', { confirmIsolated: true });
    assert.strictEqual(resIpv4.valid, true);
    assert.strictEqual(resIpv4.classification, 'LOCAL_DISPOSABLE');
  });

  it('strictly rejects the known production Supabase project', () => {
    const prodUrl = `https://${PRODUCTION_PROJECT_REF}.supabase.co`;
    const result = validateIntegrationTarget(prodUrl, {
      expectedProjectRef: PRODUCTION_PROJECT_REF,
      confirmIsolated: true,
    });
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.classification, 'PRODUCTION_VIOLATION');
    assert.match(result.errorMessage || '', /SAFETY VIOLATION/);
  });

  it('rejects remote targets using insecure HTTP protocol', () => {
    const insecureRemoteUrl = 'http://disposable-staging.supabase.co';
    const result = validateIntegrationTarget(insecureRemoteUrl, {
      expectedProjectRef: 'disposable-staging',
      confirmIsolated: true,
    });
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.classification, 'INVALID_CONFIGURATION');
    assert.match(result.errorMessage || '', /Insecure HTTP protocol is not permitted/);
  });

  it('classifies remote cloud Supabase target as valid when HTTPS, project ref, and confirmation match', () => {
    const validRemoteUrl = 'https://staging-branch-123.supabase.co';
    const result = validateIntegrationTarget(validRemoteUrl, {
      expectedProjectRef: 'staging-branch-123',
      confirmIsolated: true,
    });
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.classification, 'REMOTE_DISPOSABLE');
    assert.strictEqual(result.projectRef, 'staging-branch-123');
  });

  it('rejects remote target when expected project ref does not match the URL project ref', () => {
    const validRemoteUrl = 'https://staging-branch-123.supabase.co';
    const result = validateIntegrationTarget(validRemoteUrl, {
      expectedProjectRef: 'wrong-project-ref',
      confirmIsolated: true,
    });
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.classification, 'INVALID_CONFIGURATION');
    assert.match(result.errorMessage || '', /Target project ref mismatch/);
  });

  it('does not misclassify domains containing localhost as local targets', () => {
    const spoofUrl = 'https://evil-localhost.com:54321';
    const result = validateIntegrationTarget(spoofUrl, {
      confirmIsolated: true,
    });
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.classification, 'INVALID_CONFIGURATION');
    assert.match(result.errorMessage || '', /Remote cloud target detected with project ref 'evil-localhost\.com'/);
  });
});
