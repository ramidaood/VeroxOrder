export interface User {
  uid: string;
  email: string;
  displayName?: string;
  businessName?: string;
  phoneNumber?: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  basePrice: number;
  description: string;
  image?: string;
  customizationOptions: CustomizationOption[];
  minQuantity: number;
  maxQuantity: number;
}

export type ProductCategory = 
  | 'pens'
  | 'bags'
  | 'business-cards'
  | 'letterheads'
  | 'shirts'
  | 'tax-receipts';

export interface CustomizationOption {
  id: string;
  name: string;
  type: 'color' | 'text' | 'logo' | 'size' | 'material';
  options: string[];
  additionalCost?: number;
  required: boolean;
}

export interface OrderItem {
  productId: string;
  product: Product;
  quantity: number;
  customizations: Record<string, string>;
  logoFile?: File | string;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  shippingAddress: Address;
  notes?: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'in-production'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
