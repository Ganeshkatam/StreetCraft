import React from 'react';

const termsSections = [
  { id: 'agreement', label: '01 Agreement & Eligibility' },
  { id: 'services', label: '02 StreetCraft Services' },
  { id: 'accounts', label: '03 Accounts & Authentication' },
  { id: 'storefronts', label: '04 Storefronts & Business Data' },
  { id: 'ai-content', label: '05 Campaign Generation & AI Content' },
  { id: 'responsibilities', label: '06 Customer Responsibilities' },
  { id: 'billing', label: '07 Subscriptions, Billing & Quotas' },
  { id: 'cancellation', label: '08 Cancellation & Account Closure' },
  { id: 'ip', label: '09 Intellectual Property' },
  { id: 'third-parties', label: '10 Third-Party Platforms' },
  { id: 'privacy', label: '11 Privacy & Data Processing' },
  { id: 'disclaimers', label: '12 Disclaimers' },
  { id: 'liability', label: '13 Limitation of Liability' },
  { id: 'indemnity', label: '14 Indemnification' },
  { id: 'termination', label: '15 Suspension & Termination' },
  { id: 'governing-law', label: '16 Governing Law' },
  { id: 'modifications', label: '17 Changes to These Terms' },
  { id: 'contact', label: '18 Contact Support' },
];

export function TermsContents() {
  return (
    <aside className="privacy-sidebar-nav" aria-label="Table of Contents">
      <div className="privacy-sidebar-title">
        Terms Contents
      </div>
      <nav>
        <ul className="privacy-contents-list">
          {termsSections.map((sec) => (
            <li key={sec.id}>
              <a href={`#${sec.id}`} className="privacy-contents-link" style={{ fontSize: '12px', padding: '6px 10px' }}>
                {sec.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
