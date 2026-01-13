import React from 'react';
import { X } from 'lucide-react';
import type { Order } from '../types';
import { orderApi } from '../services/order-api';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

const ORDER_STATUSES = ['PENDING', 'ACCEPTED', 'REJECTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'] as const;

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  const handleStatusChange = async (newStatus: string) => {
      try {
          // Normalizes status to uppercase just in case backend expects it
          await orderApi.updateStatus(order.id, newStatus);
          onClose(); 
      } catch (error) {
          console.error("Failed to update status", error);
          alert("Lỗi cập nhật trạng thái");
      }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Chi tiết đơn hàng #{order.id.slice(0, 8)}</h2>
          <button onClick={onClose}><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded grid grid-cols-2 gap-2 text-sm">
             <div><span className="font-semibold">Bàn:</span> {order.table_id}</div>
             <div><span className="font-semibold">Trạng thái:</span> <span className="uppercase font-bold text-blue-600">{order.status}</span></div>
          </div>

          {/* Status Actions */}
          <div className="flex flex-wrap gap-2">
            {ORDER_STATUSES.map((status) => (
                <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={order.status === status}
                    className={`px-3 py-1 rounded text-sm font-medium capitalize 
                        ${order.status === status 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                >
                    {status}
                </button>
            ))}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Món đã đặt:</h3>
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between border-b pb-2 mb-2">
                <div>
                  <div className="font-medium">Món #{item.menu_item_id}</div>
                  <div className="text-sm text-gray-600">SL: {item.quantity}</div>
                </div>
                <div className="font-semibold">{(Number(item.price) * item.quantity).toLocaleString()}đ</div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 flex justify-between text-lg font-bold">
            <span>Tổng cộng:</span>
            <span className="text-blue-600">{Number(order.total_amount).toLocaleString()}đ</span>
          </div>
        </div>
      </div>
    </div>
  );
};