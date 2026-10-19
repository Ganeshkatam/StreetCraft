import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Brief 3: Business Members Role Escalation and Ownership Protection', () => {
  const migrationPath = path.join(
    process.cwd(),
    'supabase',
    'migrations',
    '20261019060000_brief3_business_members_role_protection.sql'
  );

  it('migration file exists with valid SQL statements', () => {
    assert.ok(fs.existsSync(migrationPath), 'Migration file must exist');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    assert.ok(sql.length > 500, 'Migration file should contain substantial SQL definitions');
  });

  it('drops and replaces business_members_insert policy with strict role checks', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    assert.ok(
      sql.includes('DROP POLICY IF EXISTS business_members_insert ON public.business_members;'),
      'Must drop old insert policy'
    );
    assert.ok(
      sql.includes('CREATE POLICY business_members_insert ON public.business_members'),
      'Must create new insert policy'
    );
    assert.ok(
      sql.includes("m.role = 'owner' AND business_members.role IN ('member', 'admin')") ||
      sql.includes("m.role = 'owner' and business_members.role in ('member', 'admin')") ||
      sql.includes("m.role = 'owner' and business_members.role in ('member','admin')"),
      'Owner can only insert member or admin'
    );
    assert.ok(
      sql.includes("m.role = 'admin' AND business_members.role = 'member'") ||
      sql.includes("m.role = 'admin' and business_members.role = 'member'"),
      'Admin can only insert member'
    );
  });

  it('drops and replaces business_members_update policy preventing role escalation', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    assert.ok(
      sql.includes('DROP POLICY IF EXISTS business_members_update ON public.business_members;'),
      'Must drop old update policy'
    );
    assert.ok(
      sql.includes('CREATE POLICY business_members_update ON public.business_members'),
      'Must create new update policy'
    );
    assert.ok(
      sql.includes("role <> 'owner'"),
      'Update policy USING must prevent updating owner rows directly'
    );
    assert.ok(
      sql.includes("m.role = 'owner'"),
      'Update policy USING must require caller to be an owner'
    );
    assert.ok(
      sql.includes("WITH CHECK (role IN ('member', 'admin'))") ||
      sql.includes("WITH CHECK (role in ('member', 'admin'))") ||
      sql.includes("with check (role in ('member','admin'))"),
      'Update policy WITH CHECK must restrict target role to member or admin'
    );
  });

  it('creates last-owner guard trigger function and trigger on business_members', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    assert.ok(
      sql.includes('CREATE OR REPLACE FUNCTION public.guard_last_business_owner'),
      'Must define guard_last_business_owner function'
    );
    assert.ok(
      sql.includes('SECURITY DEFINER'),
      'Guard function must be SECURITY DEFINER'
    );
    assert.ok(
      sql.includes("SET search_path = public"),
      'Guard function must lock search_path = public'
    );
    assert.ok(
      sql.includes('LAST_OWNER'),
      'Guard function must raise LAST_OWNER exception'
    );
    assert.ok(
      sql.includes('NOT EXISTS (SELECT 1 FROM public.businesses WHERE id = OLD.business_id)'),
      'Guard function must skip check when parent business no longer exists'
    );
    assert.ok(
      sql.includes('user_id <> OLD.user_id'),
      'Guard function must compare user_id <> OLD.user_id rather than relying on surrogate id'
    );
    assert.ok(
      sql.includes('CREATE TRIGGER trg_guard_last_business_owner'),
      'Must attach BEFORE UPDATE OR DELETE trigger on business_members'
    );
  });

  it('creates transfer_business_ownership RPC with business_limit enforcement and direct sync_store_entitlements', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    assert.ok(
      sql.includes('CREATE OR REPLACE FUNCTION public.transfer_business_ownership'),
      'Must define transfer_business_ownership RPC'
    );
    assert.ok(
      sql.includes('BUSINESS_LIMIT_REACHED'),
      'transfer_business_ownership must enforce business_limit before promoting'
    );
    assert.ok(
      sql.includes('PERFORM public.sync_store_entitlements(v_caller_id);'),
      'transfer_business_ownership must directly call sync_store_entitlements for caller'
    );
    assert.ok(
      sql.includes('REVOKE ALL ON FUNCTION public.transfer_business_ownership'),
      'Must revoke all from public and anon'
    );
    assert.ok(
      sql.includes('TO authenticated'),
      'Must grant execute to authenticated'
    );
    assert.ok(
      !sql.includes('TO anon;'),
      'Must not grant execute to anon'
    );
  });
});
