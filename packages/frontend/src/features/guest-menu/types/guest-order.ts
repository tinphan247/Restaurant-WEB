export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'expired' | 'success' | 'failed';
export type PaymentMethod = 'momo' | 'stripe' | 'cash';

export interface GuestOrder {
  id: string;
  created_at: string;
  total_amount: number;
  status: OrderStatus;
  payment?: {
    status: PaymentStatus;
    method: PaymentMethod;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}