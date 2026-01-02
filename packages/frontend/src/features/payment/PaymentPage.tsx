import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import PaymentStatus from './components/PaymentStatus';
import { usePayment } from './hooks/usePayment';



type CartItem = {
  id: string;
  menuItemName: string;
  size?: string;
  basePrice: number;
  quantity: number;
  selectedModifiers?: Record<string, string[]>;
  selectedModifiersTotal?: number;
  modifierGroups?: any[];
};

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { pay, status, error, payment, loading } = usePayment();

  const {
    items = [],
    orderId,
  }: {
    items?: CartItem[];
    orderId?: string;
  } = location.state || {};

  const [tab, setTab] = useState<'order' | 'status' | 'add'>('order');

  // Tổng tiền
  const subTotal = items.reduce(
    (sum, item) =>
      sum +
      (item.basePrice + (item.selectedModifiersTotal || 0)) * item.quantity,
    0
  );

  const discount = 0;
  const grandTotal = subTotal - discount;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-[420px] bg-white shadow-lg flex flex-col min-h-screen md:rounded-xl md:my-8 relative">

        {/* HEADER */}
        <div className="p-4 border-b bg-white sticky top-0 z-10 flex items-center gap-2">
          <button
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            onClick={() => navigate(-1)}
            aria-label="Quay lại"
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="font-bold text-lg flex-1">
            Giỏ hàng Tầng trệt - TR9
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 px-4 py-3">
          <TabButton active={tab === 'order'} onClick={() => setTab('order')}>
            Thông tin đơn hàng
          </TabButton>
          <TabButton active={tab === 'status'} onClick={() => setTab('status')}>
            Trạng thái
          </TabButton>
          <TabButton active={tab === 'add'} onClick={() => setTab('add')}>
            + Thêm món
          </TabButton>
        </div>

        {/* TAB: ORDER */}
        {tab === 'order' && (
          <div className="flex-1 overflow-y-auto px-4 pb-36">
            {items.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                Chưa có món nào trong giỏ
              </div>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="border-b pb-3">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-semibold">
                          {item.menuItemName}
                          {item.size && ` (${item.size})`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Object.entries(item.selectedModifiers || {}).map(
                            ([_, opts]: any) =>
                              opts.map((opt: any, i: number) => (
                                <span key={i}>{opt}, </span>
                              ))
                          )}
                        </div>
                      </div>
                      <div className="font-bold">
                        {(item.basePrice * item.quantity).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button className="px-2 bg-gray-100 rounded">-</button>
                      <span>{item.quantity}</span>
                      <button className="px-2 bg-gray-100 rounded">+</button>
                      <button className="ml-2 text-red-500 text-xs">
                        Xóa
                      </button>
                      <button className="ml-2 text-blue-500 text-xs">
                        Chỉnh sửa
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* TOTAL */}
            <div className="mt-8 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tạm tính ({items.length} món)</span>
                <span>{subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Giảm giá</span>
                <span>{discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng cộng</span>
                <span className="text-yellow-600">
                  {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: STATUS */}
        {tab === 'status' && (
          <div className="flex-1 p-4">
            <PaymentStatus status={status} error={error} />
            {payment && (
              <div className="mt-4 bg-gray-50 p-3 rounded text-xs">
                <div>Mã: {payment.id}</div>
                <div>Trạng thái: {payment.status}</div>
                <div>Phương thức: {payment.method}</div>
              </div>
            )}
          </div>
        )}

        {/* TAB: ADD */}
        {tab === 'add' && (
          <div className="flex-1 p-4 text-center text-gray-400">
            Tính năng thêm món sẽ sớm có!
          </div>
        )}

        {/* FOOTER */}
        <div className="fixed bottom-0 left-0 w-full flex justify-center bg-white border-t">
          <div className="w-full max-w-[420px] flex gap-3 p-4">
            <button className="flex-1 bg-yellow-400 text-white font-bold py-3 rounded-full">
              Xác nhận
            </button>
            <button
              className="flex-1 bg-yellow-500 text-white font-bold py-3 rounded-full"
              onClick={() => {
                if (!orderId) return;
                pay({
                  orderId,
                  amount: grandTotal,
                  method: 'stripe',
                });
                setTab('status');
              }}
              disabled={loading}
            >
              Thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENT PHỤ ================= */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm font-medium ${
        active
          ? 'bg-yellow-400 text-white'
          : 'bg-gray-100 text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}
