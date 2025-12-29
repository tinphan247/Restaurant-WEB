import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';

/**
 * Cart Item - đại diện cho một món trong giỏ hàng
 */
export interface CartItem {
  id: string; // unique cart item ID
  menuItemId: string;
  menuItemName: string;
  basePrice: number;
  quantity: number;
  selectedModifiers: Record<string, string[]>; // groupId -> [optionId]
  modifierGroups: Array<{
    id: string;
    name: string;
    options: Array<{
      id: string;
      name: string;
      priceAdjustment: number;
    }>;
  }>;
}

export type { CartItem as CartItemType };

/**
 * Cart Context Interface
 */
interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemPrice: (item: CartItem) => number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);


/**
 * Cart Provider - quản lý state giỏ hàng
 */
export function CartProvider({ children }: { children: ReactNode }) {
  // Load cart from localStorage if available
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('cartItems');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(items));
  }, [items]);

  /**
   * Tính giá của 1 cart item (base + modifiers) * quantity
   */
  const getItemPrice = useCallback((item: CartItem): number => {
    let itemTotal = item.basePrice;

    // Add modifier price adjustments
    Object.entries(item.selectedModifiers).forEach(([groupId, optionIds]) => {
      const group = item.modifierGroups.find(g => g.id === groupId);
      if (group) {
        optionIds.forEach(optionId => {
          const option = group.options.find(o => o.id === optionId);
          if (option) {
            itemTotal += option.priceAdjustment;
          }
        });
      }
    });

    return itemTotal * item.quantity;
  }, []);

  /**
   * Thêm item vào giỏ
   */
  const addItem = useCallback((newItem: Omit<CartItem, 'id'>) => {
    setItems(prev => [
      ...prev,
      {
        ...newItem,
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
    ]);
  }, []);

  /**
   * Xóa item khỏi giỏ
   */
  const removeItem = useCallback((cartItemId: string) => {
    setItems(prev => prev.filter(item => item.id !== cartItemId));
  }, []);

  /**
   * Cập nhật số lượng
   */
  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartItemId);
      return;
    }

    setItems(prev =>
      prev.map(item =>
        item.id === cartItemId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  /**
   * Xóa toàn bộ giỏ hàng
   */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Tính tổng số item và tổng giá
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + getItemPrice(item), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook để sử dụng Cart Context
 */
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
