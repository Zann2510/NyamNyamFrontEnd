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

// OrderStatus harus 1:1 dengan Prisma enum di backend
// enum OrderStatus { PENDING, WAITING_PAYMENT, CONFIRMED,
//                    PREPARING, DELIVERING, DELIVERED, CANCELLED }
export type OrderStatus =
  | 'PENDING'
  | 'WAITING_PAYMENT'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Order {
  id: string;
  total: number;
  status: OrderStatus;   // ← pakai union type, bukan string mentah
  deliveryAddress: string;
  paymentMethod: string;
  paymentProofUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
  user?: { id?: string; name: string; email: string };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CUSTOMER';
  phone?: string;
  address?: string;
}