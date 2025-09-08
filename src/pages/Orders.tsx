import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import type { Product, OrderItem, Order } from '../types/index';

// Mock products data (same as in Products.tsx - would be fetched from Firebase in real app)
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Custom Pens',
    category: 'pens',
    basePrice: 2.50,
    description: 'High-quality ballpoint pens with your business logo',
    minQuantity: 50,
    maxQuantity: 10000,
    customizationOptions: [
      { id: 'color', name: 'Pen Color', type: 'color', options: ['Black', 'Blue', 'Red', 'Silver'], required: true },
      { id: 'logo', name: 'Logo Placement', type: 'logo', options: ['Side', 'Clip'], required: true },
    ]
  },
  // Add other products as needed
];

const Orders: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [currentItem, setCurrentItem] = useState<Partial<OrderItem>>({
    quantity: 50,
    customizations: {},
    logoFile: undefined,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'product' | 'customize' | 'review' | 'shipping'>('product');

  useEffect(() => {
    const productId = searchParams.get('product');
    if (productId) {
      const product = mockProducts.find(p => p.id === productId);
      if (product) {
        setSelectedProduct(product);
        setStep('customize');
      }
    }
  }, [searchParams]);

  const calculateItemPrice = () => {
    if (!selectedProduct || !currentItem.quantity) return 0;
    
    let price = selectedProduct.basePrice * currentItem.quantity;
    
    // Add customization costs
    selectedProduct.customizationOptions.forEach(option => {
      if (option.additionalCost && currentItem.customizations?.[option.id]) {
        price += option.additionalCost * currentItem.quantity!;
      }
    });
    
    return price;
  };

  const addItemToOrder = () => {
    if (!selectedProduct || !currentItem.quantity) return;
    
    const item: OrderItem = {
      productId: selectedProduct.id,
      product: selectedProduct,
      quantity: currentItem.quantity,
      customizations: currentItem.customizations || {},
      logoFile: logoFile || undefined,
      unitPrice: selectedProduct.basePrice,
      totalPrice: calculateItemPrice(),
    };
    
    setOrderItems([...orderItems, item]);
    setCurrentItem({ quantity: selectedProduct.minQuantity, customizations: {} });
    setLogoFile(null);
    setStep('product');
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const getTotalAmount = () => {
    return orderItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const submitOrder = async () => {
    if (!currentUser || orderItems.length === 0) {
      alert('Please add items to your order before submitting.');
      return;
    }

    // Validate shipping address
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      alert('Please fill in all shipping address fields.');
      return;
    }
    
    setLoading(true);
    try {
      // Process items without uploading logos (temporary solution)
      const itemsWithLogos = orderItems.map((item) => {
        let processedItem = {
          productId: item.productId,
          product: {
            id: item.product.id,
            name: item.product.name,
            category: item.product.category,
            basePrice: item.product.basePrice,
            description: item.product.description,
            minQuantity: item.product.minQuantity,
            maxQuantity: item.product.maxQuantity,
            customizationOptions: item.product.customizationOptions || [],
          },
          quantity: item.quantity,
          customizations: item.customizations || {},
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          logoFile: item.logoFile instanceof File ? `Logo: ${item.logoFile.name}` : null,
        };
        
        return processedItem;
      });
      
      const order = {
        userId: currentUser.uid,
        items: itemsWithLogos,
        totalAmount: getTotalAmount(),
        status: 'pending',
        shippingAddress: {
          street: shippingAddress.street || '',
          city: shippingAddress.city || '',
          state: shippingAddress.state || '',
          zipCode: shippingAddress.zipCode || '',
          country: shippingAddress.country || 'US',
        },
        notes: notes || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Debug: Log the order object to identify undefined values
      console.log('Order object before submission:', JSON.stringify(order, null, 2));
      
      await addDoc(collection(db, 'orders'), order);
      
      // Clear the order
      setOrderItems([]);
      setShippingAddress({ street: '', city: '', state: '', zipCode: '', country: 'US' });
      setNotes('');
      setStep('product');
      
      navigate('/order-history');
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Order</h1>
        <p className="text-gray-600">Customize business items with your logo and branding.</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          {['Product', 'Customize', 'Review', 'Shipping'].map((stepName, index) => (
            <div
              key={stepName}
              className={`flex items-center ${index < 3 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  (step === 'product' && index === 0) ||
                  (step === 'customize' && index === 1) ||
                  (step === 'review' && index === 2) ||
                  (step === 'shipping' && index === 3)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                (step === 'product' && index === 0) ||
                (step === 'customize' && index === 1) ||
                (step === 'review' && index === 2) ||
                (step === 'shipping' && index === 3)
                  ? 'text-blue-600'
                  : 'text-gray-500'
              }`}>
                {stepName}
              </span>
              {index < 3 && <div className="flex-1 h-px bg-gray-200 mx-4" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {step === 'product' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Select a Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product);
                  setCurrentItem({ quantity: product.minQuantity, customizations: {} });
                  setStep('customize');
                }}
                className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
              >
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                <p className="text-blue-600 font-medium">${product.basePrice.toFixed(2)} each</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'customize' && selectedProduct && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Customize {selectedProduct.name}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min={selectedProduct.minQuantity}
                  max={selectedProduct.maxQuantity}
                  value={currentItem.quantity || ''}
                  onChange={(e) => setCurrentItem({
                    ...currentItem,
                    quantity: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Min: {selectedProduct.minQuantity}, Max: {selectedProduct.maxQuantity}
                </p>
              </div>

              {/* Customization Options */}
              {selectedProduct.customizationOptions.map((option) => (
                <div key={option.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {option.name} {option.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {option.type === 'logo' ? (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-blue-600 mt-1">
                        📎 Logo files are temporarily saved as references. File upload storage will be added soon.
                      </p>
                    </div>
                  ) : option.type === 'text' ? (
                    <textarea
                      placeholder="Enter your text here..."
                      value={currentItem.customizations?.[option.id] || ''}
                      onChange={(e) => setCurrentItem({
                        ...currentItem,
                        customizations: {
                          ...currentItem.customizations,
                          [option.id]: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  ) : (
                    <select
                      value={currentItem.customizations?.[option.id] || ''}
                      onChange={(e) => setCurrentItem({
                        ...currentItem,
                        customizations: {
                          ...currentItem.customizations,
                          [option.id]: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select {option.name}</option>
                      {option.options.map((optionValue) => (
                        <option key={optionValue} value={optionValue}>
                          {optionValue}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Price Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Unit price:</span>
                  <span>${selectedProduct.basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span>{currentItem.quantity || 0}</span>
                </div>
                <div className="border-t pt-1 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${calculateItemPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setStep('product')}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={addItemToOrder}
              disabled={!currentItem.quantity || currentItem.quantity < selectedProduct.minQuantity}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Add to Order
            </button>
          </div>
        </div>
      )}

      {/* Order Summary */}
      {orderItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Order Summary</h2>
            <div className="text-lg font-semibold">
              Total: ${getTotalAmount().toFixed(2)}
            </div>
          </div>

          <div className="space-y-4">
            {orderItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-sm text-gray-600">
                    Customizations: {Object.entries(item.customizations).map(([key, value]) => `${key}: ${value}`).join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${item.totalPrice.toFixed(2)}</p>
                  <button
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {step === 'product' && (
            <div className="mt-4 text-right">
              <button
                onClick={() => setStep('shipping')}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      )}

      {/* Shipping Form */}
      {step === 'shipping' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={shippingAddress.street}
                onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                value={shippingAddress.state}
                onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                value={shippingAddress.zipCode}
                onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Any special instructions for your order..."
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setStep('product')}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back to Products
            </button>
            <button
              onClick={submitOrder}
              disabled={loading || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
