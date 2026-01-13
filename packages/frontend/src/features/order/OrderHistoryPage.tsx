import { useEffect, useState } from 'react';
import { orderApi } from './services/order-api';
import { OrderDetailModal } from './components/OrderDetailModal';
import { useOrderSocket } from './hooks/useOrderSocket';
import type { Order } from './types';

export const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { socket } = useOrderSocket();

  useEffect(() => {
    if (!socket) return;
    
    socket.on('new_order', (newOrder: Order) => {
      setOrders(prev => [newOrder, ...prev]);
    });

    socket.on('order_status_update', ({ orderId, status }: { orderId: string, status: Order['status'] }) => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status } : prev);
    });

    return () => {
      socket.off('new_order');
      socket.off('order_status_update');
    }
  }, [socket]);

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
            <div 
              key={order.id} 
              className="border p-4 rounded shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
            <div className="flex justify-between">
              <span className="font-bold">Đơn #{order.id.slice(0, 8)}</span>
              <span className={`px-2 py-1 rounded text-sm font-bold uppercase ${
                order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                order.status === 'PENDING' ? 'bg-gray-100 text-gray-800' :
                order.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' :
                order.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                order.status === 'PREPARING' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'READY' ? 'bg-indigo-100 text-indigo-800' :
                order.status === 'SERVED' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
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
      
      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
};