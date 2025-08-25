'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import CurrencyDropdown from './CurrencyDropdown';
import { toCents } from '@/lib/amount';

const schema = z.object({
  date: z.string(),
  kind: z.enum(['income','expense']),
  mode: z.string(),
  amount: z.string(),
  description: z.string().optional(),
  currency: z.string()
});

type FormData = z.infer<typeof schema>;

export default function TransactionForm({ onCreated }: { onCreated: () => void }) {
  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema), defaultValues: { currency: 'EUR', date: new Date().toISOString().slice(0,10), kind: 'expense' }
  });

  const kind = watch('kind');
  const modes = kind === 'income' ? ['cash','inbound_transfer','salary'] : ['direct_debit','credit_card','transfer'];
  const direction = kind === 'income' ? 'credit' : 'debit';

  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: data.date,
        kind: data.kind,
        mode: data.mode,
        direction,
        description: data.description,
        currency: data.currency,
        amountCents: toCents(data.amount)
      })
    });
    if (res.ok) { reset(); onCreated(); }
    else alert('Failed to create');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-4 rounded-xl shadow space-y-3">
      <h2 className="font-semibold">Add Entry</h2>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Date</label>
          <input type="date" className="border rounded p-2 w-full" {...register('date')} />
        </div>
        <div>
          <label className="text-sm">Kind</label>
          <select className="border rounded p-2 w-full" {...register('kind')}>
            <option value="income">Income (credit)</option>
            <option value="expense">Expense (debit)</option>
          </select>
        </div>
        <div>
          <label className="text-sm">Mode</label>
          <select className="border rounded p-2 w-full" {...register('mode')}>
            {modes.map(m => <option key={m} value={m}>{m.replace('_',' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm">Amount (EUR)</label>
          <input type="number" step="0.01" min="0" placeholder="0.00" className="border rounded p-2 w-full" {...register('amount')} />
        </div>
        <div>
          <label className="text-sm">Currency</label>
          <CurrencyDropdown value={watch('currency')} onChange={(v) => setValue('currency', v)} />
        </div>
        <div className="col-span-2">
          <label className="text-sm">Description</label>
          <input className="border rounded p-2 w-full" placeholder="Optional note" {...register('description')} />
        </div>
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Add</button>
    </form>
  );
}
