import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { Product, ProductCategory } from '../types/index';

// Mock data for products - replace with Firebase data later
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'עטים מותאמים אישית',
    category: 'pens',
    basePrice: 2.50,
    description: 'עטים כדוריים איכותיים עם הלוגו של העסק שלך',
    image: '/images/pens.jpg',
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
    image: '/images/business-cards.jpg',
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
    image: '/images/bags.jpg',
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
    name: 'Receipt Books',
    category: 'receipts',
    basePrice: 8.50,
    description: 'Professional receipt books with carbon copies',
    image: '/images/receipts.jpg',
    minQuantity: 10,
    maxQuantity: 500,
    customizationOptions: [
      { id: 'size', name: 'Size', type: 'size', options: ['4x6', '5x8'], required: true },
      { id: 'logo', name: 'Header Logo', type: 'logo', options: ['Upload'], required: true },
      { id: 'text', name: 'Business Info', type: 'text', options: [], required: true },
    ]
  },
  {
    id: '5',
    name: 'Letterheads',
    category: 'letterheads',
    basePrice: 0.35,
    description: 'Professional letterhead paper with your branding',
    image: '/images/letterheads.jpg',
    minQuantity: 100,
    maxQuantity: 2000,
    customizationOptions: [
      { id: 'logo', name: 'Header Logo', type: 'logo', options: ['Upload'], required: true },
      { id: 'text', name: 'Business Information', type: 'text', options: [], required: true },
      { id: 'color', name: 'Accent Color', type: 'color', options: ['Blue', 'Green', 'Red', 'Purple'], required: false },
    ]
  },
  {
    id: '6',
    name: 'פריטים פרסומיים',
    category: 'promotional',
    basePrice: 5.75,
    description: 'פריטים פרסומיים שונים עם מיתוג מותאם',
    image: '/images/promotional.jpg',
    minQuantity: 25,
    maxQuantity: 1000,
    customizationOptions: [
      { id: 'item', name: 'סוג הפריט', type: 'material', options: ['מחזיקי מפתחות', 'מגנטים', 'מדבקות', 'כוסות'], required: true },
      { id: 'logo', name: 'לוגו', type: 'logo', options: ['העלאה'], required: true },
    ]
  },
  {
    id: '7',
    name: 'חולצות מותאמות',
    category: 'shirts',
    basePrice: 25.00,
    description: 'חולצות איכותיות עם הדפסה של הלוגו שלך',
    image: '/images/shirts.jpg',
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
    id: '8',
    name: 'קבלות מס',
    category: 'tax-receipts',
    basePrice: 12.50,
    description: 'פנקסי קבלות מס מותאמים עם פרטי העסק',
    image: '/images/tax-receipts.jpg',
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
  { value: 'shirts', label: 'חולצות' },
  { value: 'bags', label: 'שקיות' },
  { value: 'receipts', label: 'פנקסי קבלות' },
  { value: 'tax-receipts', label: 'קבלות מס' },
  { value: 'letterheads', label: 'נייר מכתבים' },
  { value: 'promotional', label: 'פריטים פרסומיים' },
];

const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const categoryParam = searchParams.get('category') as ProductCategory;
    if (categoryParam && categories.find(c => c.value === categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Business Products Catalog</h1>
        <p className="text-gray-600">
          Choose from our wide selection of business items that can be customized with your logo and branding.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Products
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:w-64">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ProductCategory | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400 text-center">
                  <div className="text-4xl mb-2">📦</div>
                  <div>Image Coming Soon</div>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Starting at:</span>
                  <span className="font-semibold text-gray-900">${product.basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Min quantity:</span>
                  <span className="text-gray-900">{product.minQuantity}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Customization options:</p>
                <div className="flex flex-wrap gap-1">
                  {product.customizationOptions.slice(0, 3).map((option) => (
                    <span
                      key={option.id}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {option.name}
                    </span>
                  ))}
                  {product.customizationOptions.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{product.customizationOptions.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              
              <Link
                to={`/orders?product=${product.id}`}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
              >
                Customize & Order
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or browse all products.</p>
        </div>
      )}
    </div>
  );
};

export default Products;
