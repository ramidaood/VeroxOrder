import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { X, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import type { Product, ProductCategory, OrderItem } from '../types/index';

// Type for stepper steps
type Step = 'products' | 'customize' | 'shipping';

// נתוני מוצרים דמה - יוחלפו בנתוני Firebase מאוחר יותר
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'עטים מותאמים אישית',
    category: 'pens',
    basePrice: 2.50,
    description: 'עטים כדוריים איכותיים עם הלוגו של העסק שלך',
    image: '/assets/images/pen.webp',
    minQuantity: 50,
    maxQuantity: 10000,
    customizationOptions: [
      { id: 'color', name: 'צבע העט', type: 'color', options: ['שחור', 'כחול', 'אדום', 'כסף'], required: true },
      { id: 'logo', name: 'מיקום הלוגו', type: 'logo', options: ['בצד', 'על הקליפס'], required: true },
    ]
  },
  {
    id: '2',
    name: 'כרטיסי ביקור',
    category: 'business-cards',
    basePrice: 0.15,
    description: 'כרטיסי ביקור מקצועיים עם גימור פרימיום',
    image: '/assets/images/card.png',
    minQuantity: 100,
    maxQuantity: 5000,
    customizationOptions: [
      { id: 'material', name: 'חומר', type: 'material', options: ['רגיל', 'מט פרימיום', 'מבריק'], required: true },
      { id: 'logo', name: 'לוגו', type: 'logo', options: ['העלאה'], required: true },
      { id: 'text', name: 'טקסט מותאם', type: 'text', options: [], required: true },
    ]
  },
  {
    id: '3',
    name: 'Shopping Bags',
    category: 'bags',
    basePrice: 3.25,
    description: 'Eco-friendly paper bags with custom printing',
    image: '/assets/images/bag.webp',
    minQuantity: 25,
    maxQuantity: 2000,
    customizationOptions: [
      { id: 'size', name: 'Size', type: 'size', options: ['Small', 'Medium', 'Large'], required: true },
      { id: 'color', name: 'Bag Color', type: 'color', options: ['White', 'Brown', 'Black'], required: true },
      { id: 'logo', name: 'Logo', type: 'logo', options: ['Upload'], required: true },
    ]
  },
  {
    id: '4',
    name: 'Letterheads',
    category: 'letterheads',
    basePrice: 0.35,
    description: 'Professional letterhead paper with your branding',
    image: '/assets/images/letterheads.jpg',
    minQuantity: 100,
    maxQuantity: 2000,
    customizationOptions: [
      { id: 'logo', name: 'Header Logo', type: 'logo', options: ['Upload'], required: true },
      { id: 'text', name: 'Business Information', type: 'text', options: [], required: true },
      { id: 'color', name: 'Accent Color', type: 'color', options: ['Blue', 'Green', 'Red', 'Purple'], required: false },
    ]
  },
  {
    id: '5',
    name: 'חולצות מותאמות',
    category: 'shirts',
    basePrice: 25.00,
    description: 'חולצות איכותיות עם הדפסה של הלוגו שלך',
    image: '/assets/images/clothes.jpg',
    minQuantity: 10,
    maxQuantity: 500,
    customizationOptions: [
      { id: 'size', name: 'מידה', type: 'size', options: ['S', 'M', 'L', 'XL', 'XXL'], required: true },
      { id: 'color', name: 'צבע החולצה', type: 'color', options: ['לבן', 'שחור', 'כחול', 'אדום', 'אפור'], required: true },
      { id: 'logo', name: 'לוגו', type: 'logo', options: ['העלאה'], required: true },
      { id: 'print-location', name: 'מיקום הדפסה', type: 'material', options: ['חזה', 'גב', 'שרוול'], required: true },
    ]
  },
  {
    id: '6',
    name: 'קבלות מס',
    category: 'tax-receipts',
    basePrice: 12.50,
    description: 'פנקסי קבלות מס מותאמים עם פרטי העסק',
    image: '/assets/images/book.jpg',
    minQuantity: 5,
    maxQuantity: 200,
    customizationOptions: [
      { id: 'size', name: 'גודל', type: 'size', options: ['A5', 'A6'], required: true },
      { id: 'pages', name: 'מספר עמודים', type: 'material', options: ['50 עמודים', '100 עמודים'], required: true },
      { id: 'logo', name: 'לוגו העסק', type: 'logo', options: ['העלאה'], required: true },
      { id: 'text', name: 'פרטי העסק', type: 'text', options: [], required: true },
    ]
  }
];

const categories: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'כל המוצרים' },
  { value: 'pens', label: 'עטים' },
  { value: 'business-cards', label: 'כרטיסי ביקור' },
  { value: 'bags', label: 'שקיות' },
  { value: 'letterheads', label: 'נייר מכתבים' },
  { value: 'shirts', label: 'חולצות' },
  { value: 'tax-receipts', label: 'קבלות מס' },
];

const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [products] = useState<Product[]>(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Ordering state
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
  const [step, setStep] = useState<'products' | 'customize' | 'shipping'>('products');

  useEffect(() => {
    const categoryParam = searchParams.get('category') as ProductCategory;
    if (categoryParam && categories.find(c => c.value === categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    let filtered = products;

    // סינון לפי קטגוריה
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // סינון לפי מונח חיפוש
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm]);

  const calculateItemPrice = () => {
    if (!selectedProduct || !currentItem.quantity) return 0;
    
    let price = selectedProduct.basePrice * currentItem.quantity;
    
    // Add customization costs (safely handle missing additionalCost)
    selectedProduct.customizationOptions.forEach(option => {
      const additionalCost = option.additionalCost ?? 0;
      if (additionalCost > 0 && currentItem.customizations?.[option.id]) {
        price += additionalCost * currentItem.quantity!;
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
    setSelectedProduct(null);
    setStep('products');
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

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setCurrentItem({ quantity: product.minQuantity, customizations: {} });
    setStep('customize');
  };

  const submitOrder = async () => {
    if (!currentUser || orderItems.length === 0) {
      alert('אנא הוסף פריטים להזמנה שלך לפני השליחה.');
      return;
    }

    // Validate shipping address
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      alert('אנא מלא את כל השדות של כתובת המשלוח.');
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

      await addDoc(collection(db, 'orders'), order);
      
      // Clear the order
      setOrderItems([]);
      setShippingAddress({ street: '', city: '', state: '', zipCode: '', country: 'US' });
      setNotes('');
      setStep('products');
      
      navigate('/order-history');
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('שגיאה בשליחת ההזמנה. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-8 h-full max-w-full overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 space-y-6 p-6 overflow-y-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">קטלוג מוצרי עסק</h1>
        <p className="text-gray-600">
          בחר ממבחר רחב של פריטים עסקיים שניתן להתאים עם הלוגו והמיתוג שלך.
        </p>
      </div>

      {/* Progress Steps - Show only when in ordering process */}
      {step !== 'products' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            {['מוצרים', 'התאמה', 'משלוח'].map((stepName, index) => {
              const steps: readonly Step[] = ['products', 'customize', 'shipping'] as const;
              const activeIndex = steps.indexOf(step as Step);
              const isActive = index === activeIndex;
              
              return (
                <div
                  key={stepName}
                  className={`flex items-center ${index < 2 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isActive ? 'bg-sky-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-sky-600' : 'text-gray-500'
                  }`}>
                    {stepName}
                  </span>
                  {index < 2 && <div className="flex-1 h-px bg-gray-200 mx-4" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === 'products' && (
        <>
          {/* מסננים */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  חיפוש מוצרים
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="חפש לפי שם או תיאור..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div className="md:w-64">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  קטגוריה
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ProductCategory | 'all')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* רשת מוצרים - All uniform cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="relative">
                {/* Fixed height container for uniformity - NOW the hover group */}
                <div 
                  className="product-card-container relative h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer group"
                  onClick={() => handleProductSelect(product)}
                >
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="product-image w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="text-6xl mb-3">📦</div>
                        <div className="text-lg font-medium">תמונה בקרוב</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Hover Overlay - doesn't block hover events */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
                  
                  {/* Info Panel - Shows on Hover with slide-up animation */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out pointer-events-none group-hover:pointer-events-auto">
                    <div className="bg-white/95 backdrop-blur-lg rounded-xl p-4 shadow-xl border border-white/20">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                      
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <div className="text-xs text-gray-500">מחיר התחלה</div>
                          <div className="text-lg font-bold text-sky-600">₪{product.basePrice.toFixed(2)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">כמות מינימלית</div>
                          <div className="text-sm font-semibold text-gray-900">{product.minQuantity}</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.customizationOptions.slice(0, 2).map((option) => (
                          <span
                            key={option.id}
                            className="px-2 py-1 bg-sky-100 text-sky-700 text-xs rounded-full font-medium"
                          >
                            {option.name}
                          </span>
                        ))}
                        {product.customizationOptions.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{product.customizationOptions.length - 2}
                          </span>
                        )}
                      </div>
                      
                      <div className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-2.5 px-4 rounded-lg text-center font-semibold text-sm shadow-lg">
                        🛒 לחץ להזמנה
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">לא נמצאו מוצרים</h3>
              <p className="text-gray-600">נסה לשנות את קריטריוני החיפוש או עיין בכל המוצרים.</p>
            </div>
          )}
        </>
      )}

      {/* Customization Step */}
      {step === 'customize' && selectedProduct && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">התאם {selectedProduct.name}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  כמות
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  מינימום: {selectedProduct.minQuantity}, מקסימום: {selectedProduct.maxQuantity}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                      />
                      <p className="text-xs text-sky-600 mt-1">
                        📎 קבצי לוגו נשמרים זמנית כהפניות. אחסון קבצים יוסף בקרוב.
                      </p>
                    </div>
                  ) : option.type === 'text' ? (
                    <textarea
                      placeholder="הכנס את הטקסט שלך כאן..."
                      value={currentItem.customizations?.[option.id] || ''}
                      onChange={(e) => setCurrentItem({
                        ...currentItem,
                        customizations: {
                          ...currentItem.customizations,
                          [option.id]: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option value="">בחר {option.name}</option>
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
              <h3 className="font-semibold mb-2">סיכום מחיר</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>מחיר ליחידה:</span>
                  <span>₪{selectedProduct.basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>כמות:</span>
                  <span>{currentItem.quantity || 0}</span>
                </div>
                <div className="border-t pt-1 flex justify-between font-semibold">
                  <span>סה"כ:</span>
                  <span>₪{calculateItemPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => {
                setSelectedProduct(null);
                setStep('products');
              }}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              חזרה למוצרים
            </button>
            <button
              onClick={addItemToOrder}
              disabled={!currentItem.quantity || currentItem.quantity < selectedProduct.minQuantity}
              className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-50"
            >
              הוסף להזמנה
            </button>
          </div>
        </div>
      )}


      {/* Shipping Form */}
      {step === 'shipping' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">מידע משלוח</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                כתובת רחוב
              </label>
              <input
                type="text"
                value={shippingAddress.street}
                onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                עיר
              </label>
              <input
                type="text"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                מדינה
              </label>
              <input
                type="text"
                value={shippingAddress.state}
                onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                מיקוד
              </label>
              <input
                type="text"
                value={shippingAddress.zipCode}
                onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              הוראות מיוחדות (אופציונלי)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              rows={3}
              placeholder="כל הוראות מיוחדות להזמנה שלך..."
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setStep('products')}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              חזרה למוצרים
            </button>
            <button
              onClick={submitOrder}
              disabled={loading || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode}
              className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'שולח...' : 'שלח הזמנה'}
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Persistent Cart Sidebar */}
      <div className="w-80 flex-shrink-0 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-6 h-fit max-h-[calc(100vh-3rem)] overflow-y-auto border border-gray-100"
             style={{
               background: 'rgba(255, 255, 255, 0.95)',
               backdropFilter: 'blur(10px)',
               WebkitBackdropFilter: 'blur(10px)'
             }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">עגלת הזמנות</h2>
          {orderItems.length > 0 && (
            <div className="bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-sm font-semibold">
              {orderItems.length} פריטים
            </div>
          )}
        </div>

        {orderItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-3">🛒</div>
            <p className="text-gray-500 text-sm">העגלה ריקה</p>
            <p className="text-gray-400 text-xs mt-1">לחץ על מוצר כדי להתחיל הזמנה</p>
          </div>
        ) : (
          <>
            {/* Order Items */}
            <div className="space-y-4 mb-8">
              {orderItems.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{item.product.name}</h3>
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700 ml-2 p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>כמות: {item.quantity}</div>
                    {Object.entries(item.customizations).length > 0 && (
                      <div className="max-h-16 overflow-y-auto">
                        {Object.entries(item.customizations).map(([key, value]) => (
                          <div key={key}>{key}: {value}</div>
                        ))}
                      </div>
                    )}
                    {item.logoFile && (
                      <div className="text-sky-600">📎 קובץ לוגו צורף</div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">₪{item.unitPrice.toFixed(2)} ליחידה</span>
                    <span className="font-bold text-sky-600">₪{item.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">סה"כ:</span>
                  <span className="text-2xl font-bold text-sky-600">₪{getTotalAmount().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            {step === 'products' && (
              <button
                onClick={() => setStep('shipping')}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Send size={20} />
                המשך לתשלום
              </button>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
};

export default Products;