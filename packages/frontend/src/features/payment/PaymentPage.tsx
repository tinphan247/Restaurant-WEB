import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Trash2, Banknote, Smartphone, Landmark } from 'lucide-react';
import PaymentStatus from './components/PaymentStatus';
import PaymentSuccessModal from './components/PaymentSuccessModal';
import { usePayment } from './hooks/usePayment';
import { useCart } from '../../contexts/CartContext';
import type { CartItem } from '../../contexts/CartContext';
import { orderApi } from '../order/services/order-api';
import { GuestOrderStatus } from '../guest-menu/components/GuestOrderStatus';

const createOrderId = () =>
  (crypto.randomUUID?.() ?? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  }));

export const PaymentMethod = {
  CASH: 'cash',
  BANK: 'bank',
  MOMO: 'momo',
} as const;

export type PaymentMethodType = typeof PaymentMethod[keyof typeof PaymentMethod];

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: cartItems, updateQuantity, removeItem, getItemPrice } = useCart();

  const { pay, payWithMomo, status, error, payment, loading, MENU_RETURN_KEY, setReturnUrl } = usePayment();

  const {
    orderId,
  }: {
    orderId?: string;
  } = location.state || {};

  const orderIdRef = useRef<string>(orderId || createOrderId());

  // Use items from CartContext instead of location.state
  const items = cartItems;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>(PaymentMethod.MOMO);
  const [tab, setTab] = useState<'order' | 'status' | 'history'>('order');
  const successParam = searchParams.get('success');
  const [showSuccessModal, setShowSuccessModal] = useState(!!successParam);
  const returnUrlRef = useRef<string>('/menu');

  const getReturnUrl = () => {
    try {
      const saved = localStorage.getItem(MENU_RETURN_KEY) || '';
      if (saved.includes('/payment')) return '/menu';
      return saved || '/menu';
    } catch (e) {
      return '/menu';
    }
  };

  // Store return URL as soon as page loads (only if not /payment)
  useEffect(() => {
    setReturnUrl();
    returnUrlRef.current = getReturnUrl();
  }, [setReturnUrl]);

  useEffect(() => {
    if (successParam) {
      setShowSuccessModal(true);
    }
  }, [successParam]);

  useEffect(() => {
    if (!successParam) return;

    const timer = setTimeout(() => {
      // Try close current tab (works if opened by script); then navigate back to saved menu URL
      const lastUrl = getReturnUrl();
      returnUrlRef.current = lastUrl;

      if (window.close) {
        window.close();
      }

      navigate(lastUrl, { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [successParam, navigate, MENU_RETURN_KEY]);

  useEffect(() => {
    if (successParam) {
      const timer = setTimeout(() => {
        // Clean URL params after we show modal
        window.history.replaceState({}, '', '/payment');
        setSearchParams({});
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [successParam, setSearchParams]);

  // Helper function to format modifiers
  const formatModifiers = (item: CartItem): string[] => {
    const modifierTexts: string[] = [];
    if (!item.selectedModifiers || !item.modifierGroups) return modifierTexts;

    Object.entries(item.selectedModifiers).forEach(([groupId, optionIds]) => {
      const group = item.modifierGroups?.find((g: any) => g.id === groupId);
      if (group && Array.isArray(optionIds)) {
        optionIds.forEach((optionId) => {
          const option = group.options?.find((o: any) => o.id === optionId);
          if (option) {
            const priceText = option.priceAdjustment > 0 
              ? ` (+${option.priceAdjustment.toLocaleString()})` 
              : '';
            modifierTexts.push(`${option.name}${priceText}`);
          }
        });
      }
    });
    return modifierTexts;
  };

  // Tổng tiền
  const subTotal = items.reduce((sum, item) => sum + getItemPrice(item), 0);
  const discount = 0;
  const grandTotal = subTotal - discount;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      {showSuccessModal && (
        <PaymentSuccessModal
          onClose={() => {
            setShowSuccessModal(false);
            navigate(returnUrlRef.current, { replace: true });
          }}
        />
      )}
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
        <div className="flex justify-center gap-2 px-4 py-3">
          <TabButton active={tab === 'order'} onClick={() => setTab('order')}>
            Thông tin đơn hàng
          </TabButton>
          <TabButton active={tab === 'status'} onClick={() => setTab('status')}>
            Trạng thái
          </TabButton>
          <TabButton active={tab === 'history'} onClick={() => setTab('history')}>
            Lịch sử
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
                {items.map((item) => {
                  const modifiers = formatModifiers(item);
                  const itemPrice = getItemPrice(item);
                  
                  return (
                    <li key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {item.menuItemName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.basePrice.toLocaleString()} mỗi món
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm('Xóa món này khỏi giỏ hàng?')) {
                              removeItem(item.id);
                            }
                          }}
                          className="p-1 hover:bg-red-50 rounded transition-colors"
                          title="Xóa món"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>

                      {/* Modifiers */}
                      {modifiers.length > 0 && (
                        <div className="mb-2 pl-2 border-l-2 border-gray-200">
                          {modifiers.map((mod, idx) => (
                            <p key={idx} className="text-xs text-gray-500">
                              • {mod}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 border border-gray-300 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="px-3 font-medium text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                        <span className="font-bold text-blue-600">
                          {itemPrice.toLocaleString()}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* TOTAL */}
            <div className="mt-8 space-y-3 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Tạm tính ({items.length} món)</span>
                <span>{subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Giảm giá</span>
                <span>{discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-3">
                <span>Tổng cộng</span>
                <span className="text-blue-600">
                  {grandTotal.toLocaleString()}
                </span>
              </div>

              {/* PAYMENT METHOD SELECTION */}
              <div className="mt-6 border-t pt-4">
                <div className="mb-3 text-gray-700 font-semibold text-sm">Phương thức thanh toán</div>
                <div className="space-y-2">
                  {/* Cash */}
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod(PaymentMethod.CASH)}
                    className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-all ${
                      selectedPaymentMethod === PaymentMethod.CASH
                        ? 'border-blue-500 bg-blue-50 shadow'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-green-600" />
                    <span className="flex-1 text-left font-medium text-gray-900 text-sm">Tiền mặt</span>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedPaymentMethod === PaymentMethod.CASH ? 'border-blue-500' : 'border-gray-300'
                    }`}>
                      {selectedPaymentMethod === PaymentMethod.CASH && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full block" />
                      )}
                    </span>
                  </button>

                  {/* Bank Transfer */}
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod(PaymentMethod.BANK)}
                    className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-all ${
                      selectedPaymentMethod === PaymentMethod.BANK
                        ? 'border-blue-500 bg-blue-50 shadow'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Landmark className="w-5 h-5 text-blue-600" />
                    <span className="flex-1 text-left font-medium text-gray-900 text-sm">Chuyển khoản</span>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedPaymentMethod === PaymentMethod.BANK ? 'border-blue-500' : 'border-gray-300'
                    }`}>
                      {selectedPaymentMethod === PaymentMethod.BANK && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full block" />
                      )}
                    </span>
                  </button>

                  {/* MoMo */}
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod(PaymentMethod.MOMO)}
                    className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-all ${
                      selectedPaymentMethod === PaymentMethod.MOMO
                        ? 'border-blue-500 bg-blue-50 shadow'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-pink-500" />
                    <span className="flex-1 text-left font-medium text-gray-900 text-sm">Ví MoMo</span>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedPaymentMethod === PaymentMethod.MOMO ? 'border-blue-500' : 'border-gray-300'
                    }`}>
                      {selectedPaymentMethod === PaymentMethod.MOMO && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full block" />
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: STATUS */}
        {tab === 'status' && (
          <div className="flex-1 overflow-y-auto px-4 pb-4">
             <GuestOrderStatus viewMode="tracking" />
          </div>
        )}

        {/* TAB: HISTORY */}
        {tab === 'history' && (
          <div className="flex-1 overflow-y-auto px-4 pb-4">
             <GuestOrderStatus viewMode="history" />
          </div>
        )}

        {/* FOOTER - PAYMENT SECTION */}
        {/* Chỉ hiện footer khi ở tab 'order' và có món trong giỏ */}
        {tab === 'order' && items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <div className="flex gap-3">
              <button
                className="flex-1 bg-blue-500 text-white font-bold py-3 rounded-full hover:bg-blue-600 disabled:opacity-50"
                onClick={async () => {
                  if (items.length === 0) {
                    alert('Giỏ hàng trống!');
                    return;
                  }
                  
                  const resolvedOrderId = orderIdRef.current;
                  if (!resolvedOrderId) {
                    alert('Không tìm thấy mã đơn hàng!');
                    return;
                  }
                  
                  // Common Payload
                  const orderPayload = {
                    id: resolvedOrderId,
                    table_id: 1, // Default guest table ID
                    items: items.map((item) => ({
                      menu_item_id: item.menuItemId,
                      quantity: item.quantity,
                      price: getItemPrice(item) / item.quantity,
                      notes: formatModifiers(item).join(', '),
                    })),
                  };

                  if (selectedPaymentMethod === PaymentMethod.MOMO) {
                    try {
                      console.log('Creating order (MOMO flow)...');
                      const orderResponse = await orderApi.create(orderPayload);
                      console.log('Order created:', orderResponse);
                      
                      payWithMomo(resolvedOrderId, grandTotal);
                    } catch (err: any) {
                      console.error('Order creation error:', err);
                      alert(`Lỗi tạo đơn hàng: ${err.message || 'Unknown code'}`);
                    }
                  } 
                  else {
                    // CASH / BANK
                    try {
                      console.log('Creating order (CASH/BANK flow)...');
                      await orderApi.create(orderPayload);
                      
                      // Create Payment Record (Pending)
                      await pay({
                        orderId: resolvedOrderId,
                        amount: grandTotal,
                        method: selectedPaymentMethod
                      });
                      
                      alert(`Đơn hàng đã gửi thành công! Vui lòng thanh toán ${selectedPaymentMethod === PaymentMethod.CASH ? 'tiền mặt' : 'chuyển khoản'} tại quầy.`);
                      setTab('history');
                      
                      // Optional: Clear cart here if needed
                    } catch (err: any) {
                      console.error('Order process error:', err);
                      alert(`Lỗi xử lý: ${err.message}`);
                    }
                  }
                }}
                disabled={loading || items.length === 0}
                title="Thanh toán"
              >
                {`Thanh toán ${grandTotal.toLocaleString()}`}
              </button>
            </div>
          </div>
        )}
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
          ? 'bg-blue-400 text-white'
          : 'bg-gray-100 text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}
