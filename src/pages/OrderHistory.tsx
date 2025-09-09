import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import type { Order } from '../types/index';

const OrderHistory: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      
      try {
        // Simplified query without orderBy to avoid index requirement
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        })) as Order[];
        
        // Sort orders by creation date (newest first)
        const sortedOrders = fetchedOrders
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        setOrders(sortedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const handleReorder = (order: Order) => {
    // For now, navigate to orders page with first product
    if (order.items.length > 0) {
      navigate(`/orders?product=${order.items[0].productId}`);
    } else {
      navigate('/orders');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'in-production':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">היסטוריית הזמנות</h1>
            <p className="text-gray-600">צפה בהזמנות קודמות והזמן מחדש בקלות.</p>
          </div>
          <Link
            to="/orders"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            צור הזמנה חדשה
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין הזמנות עדיין</h3>
          <p className="text-gray-600 mb-6">עדיין לא ביצעת הזמנות. התחל לעיין במוצרים שלנו!</p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            עיון במוצרים
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      הזמנה #{order.id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      בוצעה ב-{order.createdAt.toLocaleDateString()} בשעה {order.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status === 'pending' ? 'בהמתנה' :
                       order.status === 'confirmed' ? 'אושר' :
                       order.status === 'in-production' ? 'בייצור' :
                       order.status === 'shipped' ? 'נשלח' :
                       order.status === 'delivered' ? 'הועבר' :
                       order.status === 'cancelled' ? 'בוטל' : order.status}
                    </span>
                    <div className="text-lg font-bold text-gray-900 mt-1">
                      ₪{order.totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">פריטים ({order.items.length})</h4>
                  <div className="space-y-2">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div>
                          <span className="font-medium">{item.product.name}</span>
                          <span className="text-gray-600 ml-2">× {item.quantity}</span>
                        </div>
                        <span className="text-gray-900">₪{item.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-sm text-gray-600">
                        +{order.items.length - 3} פריטים נוספים
                      </div>
                    )}
                  </div>
                </div>

                {order.shippingAddress && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium text-gray-900 mb-1">כתובת משלוח</h4>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <button
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                  >
                    {selectedOrder?.id === order.id ? 'הסתר פרטים' : 'הצג פרטים'}
                  </button>
                  <div className="space-x-3">
                    <button
                      onClick={() => handleReorder(order)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      הזמן מחדש
                    </button>
                    {order.status === 'delivered' && (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                        השאר ביקורת
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Details Expanded */}
                {selectedOrder?.id === order.id && (
                  <div className="mt-6 pt-6 border-t bg-gray-50 -mx-6 px-6 py-4">
                    <h4 className="font-medium text-gray-900 mb-4">פרטי הזמנה</h4>
                    
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="bg-white rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{item.product.name}</h5>
                              <p className="text-sm text-gray-600 mt-1">{item.product.description}</p>
                              
                              <div className="mt-2">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">כמות:</span> {item.quantity}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">מחיר ליחידה:</span> ₪{item.unitPrice.toFixed(2)}
                                </p>
                                
                                {Object.entries(item.customizations).length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-sm font-medium text-gray-700">התאמות:</p>
                                    <ul className="text-sm text-gray-600 ml-4">
                                      {Object.entries(item.customizations).map(([key, value]) => (
                                        <li key={key} className="capitalize">
                                          {key}: {value}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {item.logoFile && typeof item.logoFile === 'string' && (
                                  <div className="mt-2">
                                    <p className="text-sm font-medium text-gray-700">לוגו:</p>
                                    {item.logoFile.startsWith('Logo: ') ? (
                                      <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded border mt-1">
                                        📎 {item.logoFile}
                                      </div>
                                    ) : (
                                      <img 
                                        src={item.logoFile} 
                                        alt="Logo" 
                                        className="w-16 h-16 object-cover rounded border mt-1"
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right ml-4">
                              <p className="font-semibold text-lg text-gray-900">
                                ₪{item.totalPrice.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {order.notes && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-1">הוראות מיוחדות</h5>
                        <p className="text-sm text-gray-700">{order.notes}</p>
                      </div>
                    )}
                    
                    <div className="mt-4 text-right">
                      <div className="text-lg font-bold text-gray-900">
                        סה"כ: ₪{order.totalAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
