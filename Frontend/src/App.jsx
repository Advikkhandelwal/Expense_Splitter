import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import AddExpense from './pages/AddExpense';
import ManageGroup from './pages/ManageGroup';
import Friends from './pages/Friends';
import Settings from './pages/Settings';
import './index.css';

function ProtectedRoute({ children }) {
  const { user } = useStore();
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
}

function App() {
  const { theme } = useStore();

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = () => {
      if (!theme) return;
      
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme();

    let mediaQuery = null;
    let handleChange = null;
    
    if (theme === 'auto') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
    }

    return () => {
      if (mediaQuery && handleChange) {
        mediaQuery.removeEventListener('change', handleChange);
      }
    };
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const initialTheme = localStorage.getItem('theme') || 'auto';
    
    if (initialTheme === 'dark') {
      root.classList.add('dark');
    } else if (initialTheme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:id"
          element={
            <ProtectedRoute>
              <GroupDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:id/add-expense"
          element={
            <ProtectedRoute>
              <AddExpense />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:id/manage"
          element={
            <ProtectedRoute>
              <ManageGroup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <Friends />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;