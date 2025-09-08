import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { Product, ProductCategory } from '../types/index';

// Mock data for products - replace with Firebase data later
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Custom Pens',
    category: 'pens',
    basePrice: 2.50,
    description: 'High-quality ballpoint pens with your business logo',
    image: '/images/pens.jpg',
    minQuantity: 50,
    maxQuantity: 10000,
    customizationOptions: [
      { id: 'color', name: 'Pen Color', type: 'color', options: ['Black', 'Blue', 'Red', 'Silver'], required: true },
      { id: 'logo', name: 'Logo Placement', type: 'logo', options: ['Side', 'Clip'], required: true },
    ]
  },
  {
    id: '2',
    name: 'Business Cards',
    category: 'business-cards',
    basePrice: 0.15,
    description: 'Professional business cards with premium finish',
    image: '/images/business-cards.jpg',
    minQuantity: 100,
    maxQuantity: 5000,
    customizationOptions: [
      { id: 'material', name: 'Material', type: 'material', options: ['Standard', 'Premium Matte', 'Glossy'], required: true },
      { id: 'logo', name: 'Logo', type: 'logo', options: ['Upload'], required: true },
      { id: 'text', name: 'Custom Text', type: 'text', options: [], required: true },
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
    name: 'Promotional Items',
    category: 'promotional',
    basePrice: 5.75,
    description: 'Various promotional items with custom branding',
    image: '/images/promotional.jpg',
    minQuantity: 25,
    maxQuantity: 1000,
    customizationOptions: [
      { id: 'item', name: 'Item Type', type: 'material', options: ['Keychains', 'Magnets', 'Stickers', 'Mugs'], required: true },
      { id: 'logo', name: 'Logo', type: 'logo', options: ['Upload'], required: true },
    ]
  }
];

const categories: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Products' },
  { value: 'pens', label: 'Pens' },
  { value: 'business-cards', label: 'Business Cards' },
  { value: 'bags', label: 'Bags' },
  { value: 'receipts', label: 'Receipt Books' },
  { value: 'letterheads', label: 'Letterheads' },
  { value: 'promotional', label: 'Promotional Items' },
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
