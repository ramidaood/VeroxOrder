import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  if (!currentUser) {
    return (
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold">
              VeroxOrder
            </Link>
            <div className="space-x-4">
              <Link to="/login" className="hover:text-blue-200">
                Login
              </Link>
              <Link to="/register" className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-800">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="text-xl font-bold">
            VeroxOrder
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="hover:text-blue-200">
              Dashboard
            </Link>
            <Link to="/products" className="hover:text-blue-200">
              Products
            </Link>
            <Link to="/orders" className="hover:text-blue-200">
              New Order
            </Link>
            <Link to="/order-history" className="hover:text-blue-200">
              Order History
            </Link>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm">
                Welcome, {currentUser.businessName || currentUser.displayName || 'User'}
              </span>
              <button
                onClick={handleLogout}
                className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
