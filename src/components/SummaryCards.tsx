import { fromCents } from '@/lib/amount';

export default function SummaryCards({ income, expense, balance }: { income: number; expense: number; balance: number }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-xl shadow">
        <div className="text-sm text-gray-500">Income</div>
        <div className="text-2xl font-semibold">€ {fromCents(income)}</div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow">
        <div className="text-sm text-gray-500">Expense</div>
        <div className="text-2xl font-semibold">€ {fromCents(expense)}</div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow">
        <div className="text-sm text-gray-500">Balance</div>
        <div
          className="text-2xl font-bold"
          style={{
            color:
              balance > 0
            ? '#16a34a' // green-600
            : balance < 0
            ? '#dc2626' // red-600
            : '#000000', // black
            fontWeight: 'bold',
          }}
        >
          € {fromCents(balance)}
        </div>
      </div>
    </div>
  );
}
