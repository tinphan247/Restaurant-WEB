import { useState } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Home, User } from 'lucide-react';
import MenuFilters from './MenuFilters';
import MenuItemCard from './MenuItemCard';
import CartSidebar from './components/CartSidebar';
import { useCart } from '../../contexts/CartContext';
import { ProfilePage } from '../admin-dashboard/ProfilePage';
import { LoginScreen } from '../auth/LoginScreen';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://restaurant-web-five-wine.vercel.app';

export interface GuestMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  primaryPhotoUrl?: string;
  status: 'available' | 'unavailable' | 'sold_out';
  isChefRecommended: boolean;
  prepTimeMinutes?: number;
  modifierGroups: {
    id: string;
    name: string;
    selectionType: 'single' | 'multiple';
    isRequired: boolean;
    minSelections?: number;
    maxSelections?: number;
    options: {
      id: string;
      name: string;
      priceAdjustment: number;
    }[];
  }[];
}

export interface GuestMenuCategory {
  id: string;
  name: string;
  description?: string;
  items: GuestMenuItem[];
}

export interface GuestMenuResponse {
  data: {
    categories: GuestMenuCategory[];
  };
  page: number;
  limit: number;
  total: number;
}

export interface MenuFiltersState {
  q: string;
  categoryId: string;
  sort: 'createdAt' | 'price' | 'popularity';
  order: 'ASC' | 'DESC';
  chefRecommended: boolean;
}

interface GuestMenuPageProps {
  tableInfo?: { tableId: string; tableNumber: string } | null;
  authToken?: string | null;
}


export default function GuestMenuPage({ tableInfo, authToken }: GuestMenuPageProps = {}) {
  return <GuestMenuContent tableInfo={tableInfo} authToken={authToken} />;
}

function GuestMenuContent({ tableInfo, authToken }: GuestMenuPageProps) {
  const { itemCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'cart' | 'profile'>('menu');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<MenuFiltersState>({
    q: '',
    categoryId: '',
    sort: 'createdAt',
    order: 'ASC',
    chefRecommended: false,
  });

  // React Query fetch function
  const fetchMenu = async () => {
    const params = new URLSearchParams();
    if (filters.q) params.append('q', filters.q);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.order) params.append('order', filters.order);
    if (filters.chefRecommended) params.append('chefRecommended', 'true');
   // if (authToken) params.append('token', authToken);
    params.append('page', page.toString());
    params.append('limit', '20');
    //params.append('restaurantId', '00000000-0000-0000-0000-000000000000');
    const response = await axios.get(`${API_BASE_URL}/api/menu?${params.toString()}`);
    return response.data;
  };

  const { data: menuData, isLoading, error, refetch } = useQuery({
    queryKey: ['menu', page, filters, authToken],
    queryFn: fetchMenu,
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });

  const handleFilterChange = (newFilters: Partial<MenuFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  // Callback khi đăng nhập thành công
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // Callback khi đăng xuất
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Error Loading Menu</h2>
          <p>{(error as any).message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!menuData || menuData.data.categories.length === 0) {
    return (
      <div className="min-h-screen p-6">
        <MenuFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          categories={[]}
        />
        <div className="text-center py-12 text-gray-500">
          No menu items available at the moment.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                Our Menu
                {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>}
              </h1>
              <p className="text-gray-600 mt-1">Browse our delicious offerings</p>

            </div>
            {tableInfo?.tableNumber && (
              <div className="bg-amber-100 px-4 py-2 rounded-full text-amber-800 font-semibold">
                Bàn {tableInfo.tableNumber}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters - Chỉ hiển thị khi ở tab menu */}
      {activeTab === 'menu' && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <MenuFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            categories={menuData.data.categories}
          />
        </div>
      )}

      {/* Profile Content - Hiển thị LoginScreen hoặc ProfilePage */}
      {activeTab === 'profile' && (
        <div className="pb-20">
          {isLoggedIn ? (
            <ProfilePage />
          ) : (
            <LoginScreen onLoginSuccess={handleLoginSuccess} />
          )}
        </div>
      )}

      {/* Menu Content */}
      {activeTab === 'menu' && (
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {menuData.data.categories.map((category: GuestMenuCategory) => (
          <div key={category.id} className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
              {category.description && (
                <p className="text-gray-600 mt-1">{category.description}</p>
              )}
            </div>

            {category.items.length === 0 ? (
              <p className="text-gray-500 italic">No items in this category.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Pagination */}
        {menuData.total > 20 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {page} of {Math.ceil(menuData.total / 20)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(menuData.total / 20)}
              className="px-4 py-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
      )}

      {/* Floating Cart Button - Chỉ hiển thị trên desktop */}
      <button
        onClick={() => setCartOpen((open) => !open)}
        className="hidden md:flex fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-30 items-center gap-2"
        aria-label="Giỏ hàng"
      >
        <ShoppingCart className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {itemCount}
        </span>
      </button>

      {/* Bottom Navigation - Chỉ hiển thị trên mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[60] shadow-lg">
        <div className="flex items-center justify-around h-16">
          {/* Trang chủ */}
          <button
            onClick={() => {
              setActiveTab('menu');
              setCartOpen(false);
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'menu' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Trang chủ</span>
          </button>

          {/* Giỏ hàng */}
          <button
            onClick={() => {
              setActiveTab('cart');
              setCartOpen(true);
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
              activeTab === 'cart' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <ShoppingCart className="w-6 h-6" />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1/4 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
            <span className="text-xs mt-1">Giỏ hàng</span>
          </button>

          {/* Cá nhân */}
          <button
            onClick={() => {
              setActiveTab('profile');
              setCartOpen(false);
              // TODO: Navigate to profile page
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Cá nhân</span>
          </button>
        </div>
      </nav>

      {/* Logout Button - Hiển thị ở góc phải khi đang ở profile tab và đã đăng nhập */}
      {isLoggedIn && activeTab === 'profile' && (
        <button 
          onClick={handleLogout}
          className="group fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50 flex items-center gap-3 px-4 py-3 bg-white border border-red-200 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300 shadow-lg"
          title="Đăng xuất khỏi hệ thống"
        >
          <div className="p-1 bg-red-50 rounded-full group-hover:bg-red-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </div>
          <span className="font-semibold pr-2">Đăng xuất</span>
        </button>
      )}

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={cartOpen} 
        onClose={() => {
          setCartOpen(false);
          setActiveTab('menu');
        }}
      />
    </div>
  );
}
