import React from 'react';
import Link from 'next/link';

interface ReportFooterProps {
  businessId: string;
}

export function ReportFooter({ businessId }: ReportFooterProps) {
  return (
    <footer
      style={{
        marginTop: '40px',
        paddingTop: '24px',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        fontSize: '13px',
        color: 'var(--color-ink-muted)',
      }}
    >
      <div>Operational Data &bull; StreetCraft Commercial Ledger</div>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <Link href={`/user/today?biz=${businessId}`} className="footer-link" style={{ width: 'auto', display: 'inline' }}>
          Today Workspace
        </Link>
        <Link href={`/user/create?biz=${businessId}`} className="footer-link" style={{ width: 'auto', display: 'inline' }}>
          Create Campaign
        </Link>
        <Link href={`/user/campaigns?biz=${businessId}`} className="footer-link" style={{ width: 'auto', display: 'inline' }}>
          Campaign Vault
        </Link>
        <Link href={`/user/business/${businessId}/plan`} className="footer-link" style={{ width: 'auto', display: 'inline' }}>
          Plan &amp; Quotas
        </Link>
      </div>
    </footer>
  );
}
