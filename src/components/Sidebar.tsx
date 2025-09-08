import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  User, 
  LogOut,
  Building2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const navigation = [
    { name: 'לוח בקרה', href: '/dashboard', icon: LayoutDashboard },
    { name: 'מוצרים', href: '/products', icon: Package },
    { name: 'הזמנה חדשה', href: '/orders', icon: ShoppingCart },
    { name: 'היסטוריית הזמנות', href: '/order-history', icon: History },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (!currentUser) {
    return null;
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">VeroxOrder</h1>
            <p className="text-xs text-gray-500">פורטל עסקי</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`nav-item ${isActive(item.href) ? 'nav-item-active' : ''}`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="flex items-center space-x-3 mb-4">
            <div className="user-avatar">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentUser.businessName || currentUser.displayName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentUser.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            <LogOut className="h-4 w-4" />
            <span>התנתק</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
