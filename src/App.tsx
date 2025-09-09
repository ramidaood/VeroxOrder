import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import OrderHistory from './pages/OrderHistory';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  return !currentUser ? <>{children}</> : <Navigate to="/dashboard" />;
};

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <Router>
      <div className="app-layout">
        {currentUser ? (
          <div className="app-container">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/products" 
                  element={
                    <ProtectedRoute>
                      <Products />
                    </ProtectedRoute>
                  } 
                />
                {/* Orders route redirects to products page now */}
                <Route path="/orders" element={<Navigate to="/products" />} />
                <Route 
                  path="/order-history" 
                  element={
                    <ProtectedRoute>
                      <OrderHistory />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
          </div>
        ) : (
          <div className="auth-layout">
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />
            </Routes>
          </div>
        )}
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;