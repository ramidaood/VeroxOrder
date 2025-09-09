import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  History, 
  CreditCard, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Order } from '../types/index';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!currentUser) return;
      
      try {
        // Simplified query without orderBy to avoid index requirement
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid),
          limit(5)
        );
        
        const querySnapshot = await getDocs(q);
        const orders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        })) as Order[];
        
        // Sort orders by creation date (newest first) and limit to 5
        const sortedOrders = orders
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5);
        
        setRecentOrders(sortedOrders);
      } catch (error) {
        console.error('Error fetching recent orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, [currentUser]);

  const quickActions = [
    { name: 'עיון במוצרים', link: '/products', icon: Package, description: 'צפו בקטלוג פריטי העסק שלנו' },
    { name: 'הזמנה חדשה', link: '/orders', icon: ShoppingCart, description: 'צרו הזמנה מותאמת חדשה' },
    { name: 'היסטוריית הזמנות', link: '/order-history', icon: History, description: 'צפו והזמינו מחדש מהזמנות קודמות' },
    { name: 'כרטיסי ביקור', link: '/products?category=business-cards', icon: CreditCard, description: 'עצבו כרטיסי ביקור מותאמים' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          ברוך שובך, {currentUser?.businessName || currentUser?.displayName}
        </h1>
        <p className="page-subtitle">
          נהלו את הזמנות העסק שלכם והתאימו פריטים עם המיתוג שלכם.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="pro-grid pro-grid-4 mb-8">
        <div className="pro-card">
          <div className="pro-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">סה"כ הזמנות</p>
                <p className="text-2xl font-bold text-gray-900">{recentOrders.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="pro-card">
          <div className="pro-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">הזמנות בהמתנה</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recentOrders.filter(order => order.status === 'pending').length}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="pro-card">
          <div className="pro-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">הושלמו</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recentOrders.filter(order => order.status === 'delivered').length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="pro-card">
          <div className="pro-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">סה"כ הוצאות</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₪{recentOrders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-sky-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-sky-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pro-grid pro-grid-4 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.name}
              to={action.link}
              className="pro-card pro-card:hover"
            >
              <div className="pro-card-body text-center">
                <div className="p-3 bg-blue-100 rounded-lg inline-flex mb-4">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.name}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="pro-card">
        <div className="pro-card-header">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">הזמנות אחרונות</h2>
            <Link to="/order-history" className="btn-pro-secondary">
              צפה בכל ההזמנות
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="pro-card-body text-center py-8">
            <div className="loading-spinner-pro mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="pro-table">
              <thead>
                <tr>
                  <th>מספר הזמנה</th>
                  <th>תאריך</th>
                  <th>פריטים</th>
                  <th>סה"כ</th>
                  <th>סטטוס</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-medium">
                      #{order.id.slice(-8).toUpperCase()}
                    </td>
                    <td>
                      {order.createdAt.toLocaleDateString()}
                    </td>
                    <td>
                      {order.items.length} פריטים
                    </td>
                    <td className="font-semibold">
                      ₪{order.totalAmount.toFixed(2)}
                    </td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status === 'pending' ? 'בהמתנה' :
                         order.status === 'confirmed' ? 'אושר' :
                         order.status === 'in-production' ? 'בייצור' :
                         order.status === 'shipped' ? 'נשלח' :
                         order.status === 'delivered' ? 'הועבר' :
                         order.status === 'cancelled' ? 'בוטל' : order.status}
                      </span>
                    </td>
                    <td>
                      <div className="space-x-pro">
                        <button className="text-sky-600 hover:text-sky-500 text-sm font-medium">
                          צפה
                        </button>
                        <button className="text-emerald-600 hover:text-emerald-500 text-sm font-medium">
                          הזמן שוב
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="pro-card-body text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full inline-flex mb-4">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין הזמנות עדיין</h3>
            <p className="text-gray-600 mb-6">התחל על ידי עיון במוצרים ויצירת ההזמנה הראשונה שלך.</p>
            <Link
              to="/products"
              className="btn-pro-primary"
            >
              עיון במוצרים
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
