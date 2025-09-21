import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <h1 className="navbar-title">wisesplit</h1>
      {isLoggedIn ? (
        <button className="navbar-button" onClick={handleLogout}>
          Logout
        </button>
      ) : (
        <div className="navbar-links">
          <Link to="/login" className="navbar-link">Login</Link>
          <Link to="/signup" className="navbar-link">Signup</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
