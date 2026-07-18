import React from 'react';

export function Watermark({ hasCustomDomain }: { hasCustomDomain: boolean }) {
  if (hasCustomDomain) return null;
  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16 }}>
      <a href="https://tridopsites.com" target="_blank" rel="noopener noreferrer">Made with TridopAI</a>
    </div>
  );
}
