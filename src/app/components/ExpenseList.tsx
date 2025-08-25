import React from 'react';

const ExpenseList = () => {
  // TODO: Fetch expenses from DynamoDB via Amplify
  type Expense = { description: string; amount: number };
  const expenses: Expense[] = [];

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Expenses</h2>
      <ul>
        {expenses.length === 0 ? (
          <li>No expenses yet.</li>
        ) : (
          expenses.map((exp, idx) => (
            <li key={idx}>{exp.description} - {exp.amount}</li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ExpenseList;
