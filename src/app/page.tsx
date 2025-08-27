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

type Transaction = {
  PK: string;
  SK: string;
  id?: string;
  date: string;
  kind: string;
  mode: string;
  direction: string;
  description?: string;
  currency: string;
  amountCents: number;
};

export default function Page() {
  const { data: session, status } = useSession() as { data: SessionData; status: string };
  const router = useRouter();
  const [items, setItems] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<{ month?: string; direction?: string; mode?: string }>({});

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

  // Load transactions when component mounts and when month filter changes
  useEffect(() => {
    if (status === 'authenticated') {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.month, status]);

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
        <div>
          {session?.user?.username && (
            <span style={{ fontSize: 14, color: '#616161' }}>
              Welcome <strong style={{ color: '#1976d2' }}>{session.user.username}</strong>
            </span>
          )}
        </div>
        <button
          type="button"
          style={{
            backgroundColor: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '6px 16px',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(25, 118, 210, 0.08)',
            transition: 'background 0.2s',
          }}
          onClick={async () => {
            const { signOut } = await import('next-auth/react');
            signOut({ callbackUrl: '/login' });
          }}
          onMouseOver={e => (e.currentTarget.style.backgroundColor = '#1565c0')}
          onMouseOut={e => (e.currentTarget.style.backgroundColor = '#1976d2')}
        >
          Logout
        </button>
      </div>
      <p></p>      
      <FiltersBar
        value={filters}
        onChange={f => {
          setFilters(f);
        }}
      />
      <p></p>
      <SummaryCards {...summary} />
      <div className="grid md:grid-cols-2 gap-6">
      <p></p>        
        <TransactionForm onCreated={load} />
      <p></p>        
        <TransactionsTable items={items} onChanged={load} />
      </div>
    </div>
  );
}
