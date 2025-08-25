'use client';

type Filters = {
  month?: string;
  direction?: string;
  mode?: string;
};

export default function FiltersBar({ value, onChange }: { value: Filters; onChange: (v: Filters) => void }) {
  const set = (k: string, v: string) => onChange({ ...value, [k]: v || undefined });
  return (
    <div className="bg-white p-4 rounded-xl shadow grid md:grid-cols-4 gap-3">
      <div>
        <label className="text-sm">Month</label>
        <input type="month" className="border rounded p-2 w-full" value={value.month || ''} onChange={e => set('month', e.target.value)} />
      </div>
      <div>
        <label className="text-sm">Direction</label>
        <select className="border rounded p-2 w-full" value={value.direction || ''} onChange={e => set('direction', e.target.value)}>
          <option value="">All</option>
          <option value="credit">Income</option>
          <option value="debit">Expense</option>
        </select>
      </div>
      <div>
        <label className="text-sm">Mode</label>
        <select className="border rounded p-2 w-full" value={value.mode || ''} onChange={e => set('mode', e.target.value)}>
          <option value="">All</option>
          <option value="cash">cash</option>
          <option value="inbound_transfer">inbound_transfer</option>
          <option value="salary">salary</option>
          <option value="direct_debit">direct_debit</option>
          <option value="credit_card">credit_card</option>
          <option value="transfer">transfer</option>
        </select>
      </div>
      <div className="flex items-end">
        <button className="px-3 py-2 border rounded w-full" onClick={() => onChange({})}>Clear</button>
      </div>
    </div>
  );
}
