import React from 'react';

export const dynamic = 'force-dynamic';

export default function SetupRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
