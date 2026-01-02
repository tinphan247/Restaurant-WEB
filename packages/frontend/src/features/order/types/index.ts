//File này định nghĩa các kiểu TypeScript liên quan đến đơn hàng trong frontend

// Giao diện cho một mục trong đơn hàng
export interface OrderItem {
  id: string;
  menu_item_id: number;
  quantity: number;
  price: number;
  notes?: string;
}

// Giao diện cho đơn hàng
export interface Order {
  id: string;
  table_id: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
  items: OrderItem[];
}

// Giao diện cho dữ liệu gửi khi tạo đơn hàng mới
export interface CreateOrderPayload {
  table_id: number;
  items: Omit<OrderItem, 'id'>[];
}