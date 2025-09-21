import './BalanceCard.css';

const BalanceCard = ({ balance }) => {
  const style = {
    color: balance.amount > 0 ? 'green' : 'red',
  };

  return (
    <div className="balance-card">
      <h3>{balance.person}</h3>
      <p style={style}>
        {balance.amount > 0 ? 'Gets back' : 'Owes'} ${Math.abs(balance.amount)}
      </p>
    </div>
  );
};

export default BalanceCard;
