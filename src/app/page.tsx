
'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TransactionForm from '@/components/TransactionForm';
import TransactionsTable from '@/components/TransactionsTable';
import SummaryCards from '@/components/SummaryCards';
import FiltersBar from '@/components/FiltersBar';

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;
  username?: string;
};

type SessionData = {
  user?: SessionUser;
  expires?: string;
};

export default function Page() {
  const { data: session, status } = useSession() as { data: SessionData; status: string };
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [filters, setFilters] = useState<{ month?: string; direction?: string; mode?: string }>({});
  // Removed refreshKey state

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/unauthenticated');
    }
  }, [status, router]);

  async function load() {
    const params = new URLSearchParams();
    if (filters.month) params.set('month', filters.month);
    if (filters.direction) params.set('direction', filters.direction!);
    if (filters.mode) params.set('mode', filters.mode!);
    const res = await fetch(`/api/transactions?${params.toString()}`, { cache: 'no-store' });
    try {
      setItems(await res.json());
    } catch (e) {
      console.error('Failed to parse JSON from /api/transactions', e);
      setItems([]);
    }
  }
  useEffect(() => { if (status === 'authenticated') load(); }, [filters, status]);

  const summary = useMemo(() => {
    let income = 0, expense = 0;
    for (const it of items) {
      if (it.direction === 'credit') income += it.amountCents;
      else expense += it.amountCents;
    }
    return { income, expense, balance: income - expense };
  }, [items]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-700">
          {session?.user?.username && (
            <>Welcome <span className="font-semibold">{session.user.username}</span></>
          )}
        </div>
        <button
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          onClick={async () => {
            const { signOut } = await import('next-auth/react');
            signOut({ callbackUrl: '/login' });
          }}
        >
          Logout
        </button>
      </div>
      <FiltersBar value={filters} onChange={setFilters} />
      <SummaryCards {...summary} />
      <div className="grid md:grid-cols-2 gap-6">
        <TransactionForm onCreated={load} />
        <TransactionsTable items={items} onChanged={load} />
      </div>
    </div>
  );
}