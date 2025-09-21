import './Dashboard.css';

const Dashboard = () => {
  const totalBalance = 50;
  const amountOwed = 20;
  const amountToReceive = 70;

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="dashboard-overview">
        <div className="overview-item">
          <h3>Total Balance</h3>
          <p>${totalBalance}</p>
        </div>
        <div className="overview-item owed">
          <h3>Amount Owed</h3>
          <p>${amountOwed}</p>
        </div>
        <div className="overview-item receive">
          <h3>Amount to Receive</h3>
          <p>${amountToReceive}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
