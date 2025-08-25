'use client';
import { fromCents } from '@/lib/amount';

export default function TransactionsTable({ items, onChanged }: { items: any[]; onChanged: () => void }) {
  async function del(sk: string, pk: string, id?: string) {
    if (!confirm('Delete entry?')) return;
    console.log(`[UI] Delete requested for transaction id: ${id}`);
    try {
      const res = await fetch(`/api/transactions/${encodeURIComponent(sk)}?pk=${encodeURIComponent(pk)}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        alert('Delete failed: ' + (data?.error || 'Unknown error'));
      }
    } catch (e) {
      alert('Delete failed: ' + String(e));
      console.error('Delete error:', e);
    } finally {
      onChanged(); // Always refresh UI after delete attempt
    }
  }
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-3">Transactions</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="py-2">Date</th>
            <th>Kind</th>
            <th>Mode</th>
            <th>Direction</th>
            <th className="text-right">Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr
              key={it.sk || it.id || idx}
              className={`border-t ${it.direction === 'debit' ? 'bg-red-50' : it.direction === 'credit' ? 'bg-green-50' : ''}`}
            >
              <td className="py-2">{it.date}</td>
              <td>{it.kind}</td>
              <td>{it.mode}</td>
              <td>{it.direction}</td>
              <td className="text-right">{it.currency} {fromCents(it.amountCents)}</td>
              <td className="text-right">
                <button onClick={() => del(it.SK, it.PK, it.id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
