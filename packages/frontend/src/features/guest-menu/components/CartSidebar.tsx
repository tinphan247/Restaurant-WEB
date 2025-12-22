import { X, ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../../../contexts/CartContext';
import type { CartItem } from '../../../contexts/CartContext';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout?: () => void;
}

export default function CartSidebar({ isOpen, onClose, onCheckout }: CartSidebarProps) {
  const { items, itemCount, totalPrice, updateQuantity, removeItem, clearCart, getItemPrice } = useCart();

  if (!isOpen) return null;

  /**
   * Format modifier selections cho display
   */
  const formatModifiers = (item: CartItem): string[] => {
    const modifierTexts: string[] = [];

    Object.entries(item.selectedModifiers).forEach(([groupId, optionIds]) => {
      const group = item.modifierGroups.find((g) => g.id === groupId);
      if (group && Array.isArray(optionIds)) {
        optionIds.forEach((optionId) => {
          const option = group.options.find((o) => o.id === optionId);
          if (option) {
            const priceText = option.priceAdjustment > 0 
              ? ` (+$${option.priceAdjustment.toFixed(2)})` 
              : '';
            modifierTexts.push(`${option.name}${priceText}`);
          }
        });
      }
    });

    return modifierTexts;
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Your Cart ({itemCount})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm mt-1">Add some delicious items!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item: CartItem) => {
                const modifiers = formatModifiers(item);
                const itemPrice = getItemPrice(item);

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
                  >
                    {/* Item Info */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {item.menuItemName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ${item.basePrice.toFixed(2)} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 hover:bg-red-50 rounded transition-colors"
                        title="Remove item"
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
                        ${itemPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3 bg-gray-50">
            {/* Total */}
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-gray-900">Total</span>
              <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={clearCart}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Clear Cart
              </button>
              <button
                onClick={onCheckout}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
