export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  categoryId: string;
  category?: { id: string; name: string };
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string;
  total: number;
  status: string;
  deliveryAddress: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
  user?: { name: string; email: string };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CUSTOMER';
}