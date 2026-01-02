import { useEffect, useState } from 'react';
import { orderApi } from './services/order-api';
import type { Order } from './types';

export const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderApi.getAll();
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error('API returned non-array data:', data);
          setOrders([]);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Không thể tải danh sách đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lịch sử đơn hàng</h1>
      <div className="space-y-4">
        {orders.length === 0 ? (
          <p>Chưa có đơn hàng nào.</p>
        ) : (
          orders.map(order => (
            <div key={order.id} className="border p-4 rounded shadow">
            <div className="flex justify-between">
              <span className="font-bold">Đơn #{order.id.slice(0, 8)}</span>
              <span className={`px-2 py-1 rounded text-sm ${
                order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {order.status}
              </span>
            </div>
            <div className="mt-2 text-gray-600">
              Bàn: {order.table_id} | Tổng tiền: {Number(order.total_amount).toLocaleString()}đ
            </div>
          </div>
        )))}
      </div>
    </div>
  );
};