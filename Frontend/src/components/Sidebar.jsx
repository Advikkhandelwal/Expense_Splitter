import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <ul className="sidebar-list">
        <li><Link to="/" className="sidebar-link">Dashboard</Link></li>
        <li><Link to="/groups" className="sidebar-link">Groups</Link></li>
        <li><Link to="/expenses" className="sidebar-link">Expenses</Link></li>
        <li><Link to="/balances" className="sidebar-link">Balances</Link></li>
      </ul>
    </aside>
  );
};

export default Sidebar;