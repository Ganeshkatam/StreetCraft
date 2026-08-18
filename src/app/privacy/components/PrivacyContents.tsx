import React from 'react';

const sections = [
  { id: 'overview', label: '1. Overview' },
  { id: 'collection', label: '2. Information We Collect' },
  { id: 'usage', label: '3. How We Use Data' },
  { id: 'security', label: '4. Security & Isolation' },
  { id: 'third-parties', label: '5. Service Providers' },
  { id: 'retention', label: '6. Data Retention' },
  { id: 'rights', label: '7. Your Rights' },
  { id: 'contact', label: '8. Contact Privacy Team' },
];

export function PrivacyContents() {
  return (
    <aside className="privacy-sidebar-nav" aria-label="Table of Contents">
      <div className="privacy-sidebar-title">
        Contents
      </div>
      <nav>
        <ul className="privacy-contents-list">
          {sections.map((sec) => (
            <li key={sec.id}>
              <a href={`#${sec.id}`} className="privacy-contents-link">
                {sec.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
