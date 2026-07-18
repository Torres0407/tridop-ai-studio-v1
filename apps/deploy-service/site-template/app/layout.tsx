import React from 'react';
import { Watermark } from '../components/Watermark';
import { ConsentBanner } from '../components/ConsentBanner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hasCustomDomain = process.env.HAS_CUSTOM_DOMAIN === 'true';
  return (
    <html lang="en">
      <body>
        {children}
        <Watermark hasCustomDomain={hasCustomDomain} />
        <ConsentBanner />
      </body>
    </html>
  );
}
