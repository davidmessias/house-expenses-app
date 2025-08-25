export default function CurrencyDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = ['EUR','USD','GBP','CHF'];
  return (
    <select className="border rounded p-2 w-full" value={value} onChange={e => onChange(e.target.value)}>
      {options.map(c => <option key={c} value={c}>{c}</option>)}
    </select>
  );
}
