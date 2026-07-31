'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BillingView from '@/src/components/BillingView';
import { client } from '@/lib/client';

export default function BillingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    client.users.getMe()
      .then((data) => {
        setUser({ name: data.name || 'User', email: data.email });
      })
      .catch(() => {
        setUser({ name: 'Chinonye Okubor', email: 'okuborchinonye@gmail.com' });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        Loading Billing Telemetry...
      </div>
    );
  }

  return (
    <BillingView
      user={user}
      onBackToDashboard={() => router.push('/dashboard')}
    />
  );
}
