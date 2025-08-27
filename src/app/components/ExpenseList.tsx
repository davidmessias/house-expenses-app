
import React, { useEffect, useState } from 'react';

type Expense = { description: string; amount: number };

const ExpenseList = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await fetch('/api/transactions');
        const data = await res.json();
        setExpenses(Array.isArray(data) ? data.map((exp) => ({ description: exp.description, amount: exp.amountCents / 100 })) : []);
      } catch {
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Expenses</h2>
      <ul>
        {loading ? (
          <li>Loading...</li>
        ) : expenses.length === 0 ? (
          <li>No expenses yet.</li>
        ) : (
          expenses.map((exp, idx) => (
            <li key={idx}>{exp.description} - {exp.amount.toFixed(2)}</li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ExpenseList;
