import { useState } from 'react';
import { useExpenses } from '../ExpenseContext';
import ExpenseCard from '../components/ExpenseCard';
import Modal from '../components/Modal';
import './Expenses.css';

const Expenses = () => {
  const { expenses, addExpense } = useExpenses();
  const mockUsers = ['You', 'Friend1', 'Friend2', 'Roommate'];
  const [showModal, setShowModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', paidBy: '', splitAmong: [], category: 'General' });

  const handleAddExpense = (e) => {
    e.preventDefault();
    console.log('Adding expense:', newExpense); 
    const newExpenseData = {
      description: newExpense.description,
      amount: parseFloat(newExpense.amount) || 0,
      paidBy: newExpense.paidBy,
      splitAmong: newExpense.splitAmong,
      category: newExpense.category,
    };
    addExpense(newExpenseData);
    setShowModal(false);
    setNewExpense({ description: '', amount: '', paidBy: '', splitAmong: [], category: 'General' });
  };

  const handleSplitChange = (user) => {
    setNewExpense({
      ...newExpense,
      splitAmong: newExpense.splitAmong.includes(user)
        ? newExpense.splitAmong.filter(u => u !== user)
        : [...newExpense.splitAmong, user]
    });
  };

  return (
    <div className="expenses">
      <h2>Expenses</h2>
      <button className="add-button" onClick={() => setShowModal(true)}>Add Expense</button>
      <div className="expenses-list">
        {expenses.map(expense => (
          <ExpenseCard key={expense.id} expense={expense} />
        ))}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h3>Add New Expense</h3>
        <form onSubmit={handleAddExpense}>
          <input
            type="text"
            placeholder="Description"
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Amount"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            required
            step="0.01"
          />
          <select
            value={newExpense.paidBy}
            onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
            required
          >
            <option value="">Paid by</option>
            {mockUsers.map(user => <option key={user} value={user}>{user}</option>)}
          </select>
          <select
            value={newExpense.category}
            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            required
          >
            <option value="General">General</option>
            <option value="Dive">Dive</option>
          </select>
          <div className="split-among">
            <label>Split among:</label>
            {mockUsers.map(user => (
              <div key={user}>
                <input
                  type="checkbox"
                  checked={newExpense.splitAmong.includes(user)}
                  onChange={() => handleSplitChange(user)}
                />
                <label>{user}</label>
              </div>
            ))}
          </div>
          <button type="submit">Add Expense</button>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;