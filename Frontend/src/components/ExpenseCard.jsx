import './ExpenseCard.css';

const ExpenseCard = ({ expense }) => {
  return (
    <div className="expense-card">
      <h3>{expense.description}</h3>
      <p>Amount: ${expense.amount}</p>
      <p>Paid by: {expense.paidBy}</p>
      <p>Split among: {expense.splitAmong.join(', ')}</p>
      <p>Category: {expense.category}</p>
    </div>
  );
};

export default ExpenseCard;