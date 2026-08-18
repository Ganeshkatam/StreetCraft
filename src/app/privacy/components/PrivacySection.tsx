import React from 'react';

interface PrivacySectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export function PrivacySection({ id, title, children }: PrivacySectionProps) {
  return (
    <section id={id} className="privacy-section-card">
      <h2 className="privacy-section-title">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}
