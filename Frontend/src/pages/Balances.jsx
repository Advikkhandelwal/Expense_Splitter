import { useExpenses } from '../ExpenseContext';
import BalanceCard from '../components/BalanceCard';
import './Balances.css';

const Balances = () => {
  const { expenses } = useExpenses();
  const mockUsers = ['You', 'Friend1', 'Friend2', 'Roommate'];

  const balances = mockUsers.map(user => {
    let totalOwed = 0;
    expenses.forEach(expense => {
      const splitAmount = expense.amount / expense.splitAmong.length;
      if (expense.paidBy === user) {

        totalOwed += expense.amount - splitAmount; 
      }
      if (expense.splitAmong.includes(user) && expense.paidBy !== user) {
        totalOwed -= splitAmount;
      }
    });
    return { id: user, person: user, amount: Math.round(totalOwed * 100) / 100 }; 
  });

  return (
    <div className="balances">
      <h2>Balances</h2>
      <div className="balances-list">
        {balances.map(balance => (
          <BalanceCard key={balance.id} balance={balance} />
        ))}
      </div>
    </div>
  );
};

export default Balances;
