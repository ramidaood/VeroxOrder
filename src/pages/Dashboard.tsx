import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
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
    { name: 'Browse Products', link: '/products', icon: '🛍️', description: 'View our catalog of business items' },
    { name: 'Start New Order', link: '/orders', icon: '🛒', description: 'Create a new custom order' },
    { name: 'Order History', link: '/order-history', icon: '📋', description: 'View and reorder from your past orders' },
    { name: 'Business Cards', link: '/products?category=business-cards', icon: '💼', description: 'Design custom business cards' },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {currentUser?.businessName || currentUser?.displayName}!
        </h1>
        <p className="text-gray-600">
          Ready to order custom business items with your logo? Let's get started.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => (
          <Link
            key={action.name}
            to={action.link}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">{action.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.name}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
          <Link to="/order-history" className="text-blue-600 hover:text-blue-500">
            View All Orders →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading orders...</p>
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.items.length} item(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'in-production' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-500 mr-3">
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-500">
                        Reorder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-4">Start by browsing our products and creating your first order.</p>
            <Link
              to="/products"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
