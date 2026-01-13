import React, { useEffect, useState } from 'react';
import { useOrderSocket } from '../../order/hooks/useOrderSocket'; 
import { orderApi } from '../../order/services/order-api';
// Lưu ý: Đảm bảo import đúng đường dẫn type của bạn
import type { GuestOrder } from '../types/guest-order';

// 1. Định nghĩa lại Interface cho Item hiển thị (đã gộp)
interface GuestOrderItem {
  id: string; // menu_item_id
  name: string;
  quantity: number;
  unitPrice: number;
  totalLinePrice: number; // = quantity * unitPrice
}

// 2. Hàm helper để gộp các món giống nhau (xử lý logic outside component cho sạch)
const aggregateItems = (rawItems: any[]): GuestOrderItem[] => {
  const groupedMap = rawItems.reduce((acc: any, item: any) => {
    // Dùng menu_item_id làm key để gom nhóm
    const itemId = item.menu_item_id; 

    if (!acc[itemId]) {
      acc[itemId] = {
        id: itemId,
        name: item.menuItem?.name || `Món #${itemId.toString().slice(0, 4)}`,
        quantity: 0,
        unitPrice: item.price,
        totalLinePrice: 0
      };
    }

    // Cộng dồn số lượng và thành tiền
    acc[itemId].quantity += item.quantity;
    acc[itemId].totalLinePrice += (item.price * item.quantity);

    return acc;
  }, {});

  return Object.values(groupedMap);
};

export const GuestOrderStatus = () => {
  // Chúng ta sẽ lưu items trong state theo dạng đã gộp (GuestOrderItem)
  // Nên cần override lại type của items trong state orders nếu cần thiết, 
  // hoặc cứ để any cho items nếu bạn lười sửa type gốc GuestOrder.
  // Ở đây mình ép kiểu lúc map dữ liệu.
  const [orders, setOrders] = useState<GuestOrder[]>([]);
  const { socket } = useOrderSocket();

  // 3. Fetch dữ liệu từ API và Gộp món ngay lập tức
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderApi.getAll();
        
        const mappedOrders: GuestOrder[] = data.map((o: any) => ({
          id: o.id,
          created_at: o.created_at,
          total_amount: o.total_amount,
          status: o.status,
          // Lấy payment cuối cùng
          payment: o.payments?.length > 0 
            ? { 
                status: o.payments[o.payments.length - 1].status, 
                method: o.payments[o.payments.length - 1].method 
              }
            : undefined,
          // Xử lý gộp món tại đây
          items: aggregateItems(o.items) as any 
        }));

        // Sắp xếp đơn mới nhất lên đầu
        setOrders(mappedOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } catch (err) {
        console.error("Failed to load orders", err);
      }
    };

    fetchOrders();
  }, []);

  // 4. Lắng nghe Real-time (Status & Payment)
  useEffect(() => {
    if (!socket) return;
    
    // a. Order Status Update
    socket.on('order_status_update', ({ orderId, status }) => {
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: status } : o
      ));
    });

    // b. Payment Status Update
    socket.on('payment_status_update', ({ orderId, status }) => {
       setOrders(prev => prev.map(o => 
        o.id === orderId 
          ? { 
              ...o, 
              payment: o.payment 
                ? { ...o.payment, status } 
                : { status: status as any, method: 'cash' } // Default method fallback
            } 
          : o
      ));
    });

    return () => {
      socket.off('order_status_update');
      socket.off('payment_status_update');
    }
  }, [socket]);

  // --- UI Helpers ---
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-200 text-gray-700 border-gray-300',
      confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
      preparing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      ready: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200'
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${colors[status] || 'bg-gray-100'}`}>
            {status.toUpperCase()}
        </span>
    );
  };

  const getPaymentIcon = (status: string) => {
      if (status === 'success' || status === 'completed') return <span title="Đã thanh toán">✅</span>;
      if (status === 'pending') return <span title="Chờ thanh toán">⏳</span>;
      if (status === 'failed') return <span title="Thất bại">❌</span>;
      return <span title="Chưa thanh toán">💰</span>;
  }

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Đơn hàng của bạn</h2>
        
        {orders.length === 0 && (
            <div className="text-center text-gray-500 py-8">Chưa có đơn hàng nào.</div>
        )}

        {orders.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition-all hover:shadow-md">
                {/* Header: ID + Status */}
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                    <span className="font-bold text-gray-700">#{order.id.slice(0, 5)}</span>
                    {getStatusBadge(order.status)}
                </div>
                
                {/* Meta info: Time + Payment */}
                <div className="flex justify-between text-xs text-gray-500 mb-4">
                    <span>{new Date(order.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                        <span className="text-xs">{getPaymentIcon(order.payment?.status || 'pending')}</span>
                        <span className="uppercase font-semibold text-gray-600">
                            {order.payment?.method === 'momo' ? 'MoMo' : 'Tiền mặt'}
                        </span>
                    </div>
                </div>

                {/* Items List (Updated Layout) */}
                <div className="space-y-3">
                    {/* Ép kiểu items về GuestOrderItem[] để TS không báo lỗi */}
                    {(order.items as unknown as GuestOrderItem[]).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start group">
                            {/* Tên món & Đơn giá */}
                            <div className="flex-1 pr-2">
                                <div className="font-medium text-gray-800 text-sm">
                                    {item.name}
                                </div>
                                <div className="text-xs text-gray-400 mt-0.5">
                                    {item.quantity} x {item.unitPrice.toLocaleString()}đ
                                </div>
                            </div>

                            {/* Tổng tiền dòng */}
                            <div className="text-right">
                                <span className="font-semibold text-gray-900 text-sm block">
                                    {item.totalLinePrice.toLocaleString()}đ
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Footer: Tổng cộng */}
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-dashed border-gray-300">
                    <span className="font-medium text-gray-600">Tổng cộng</span>
                    <span className="text-blue-600 text-lg font-bold">
                        {order.total_amount.toLocaleString()}đ
                    </span>
                </div>
            </div>
      ))}
    </div>
  );
};