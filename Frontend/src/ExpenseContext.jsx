import { createContext, useContext, useState } from 'react';

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([
    { id: 1, description: 'Dinner', amount: 100, paidBy: 'You', splitAmong: ['You', 'Friend1', 'Friend2'], category: 'General' },
    { id: 2, description: 'Rent', amount: 1200, paidBy: 'Roommate', splitAmong: ['You', 'Roommate'], category: 'General' },
    { id: 3, description: 'Scuba Gear Rental', amount: 150, paidBy: 'Friend1', splitAmong: ['You', 'Friend1'], category: 'Dive' },
    { id: 4, description: 'Dive Trip', amount: 300, paidBy: 'You', splitAmong: ['You', 'Friend2'], category: 'Dive' },
  ]);

  const addExpense = (expense) => {
    setExpenses([...expenses, { id: expenses.length + 1, ...expense }]);
  };

  return (
    <ExpenseContext.Provider value={{ expenses, addExpense }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);