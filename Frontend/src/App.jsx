import { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ExpenseProvider } from './ExpenseContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import Expenses from './pages/Expenses';
import Balances from './pages/Balances';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const Layout = () => (
    <div className="app-container">
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <div className="main">
        <Sidebar />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );

  return (
    <ExpenseProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={isLoggedIn ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<Dashboard />} />
            <Route path="groups" element={<Groups />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="balances" element={<Balances />} />
          </Route>
          <Route path="/login" element={!isLoggedIn ? <Login setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/" />} />
          <Route path="/signup" element={!isLoggedIn ? <Signup setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ExpenseProvider>
  );
}

export default App;