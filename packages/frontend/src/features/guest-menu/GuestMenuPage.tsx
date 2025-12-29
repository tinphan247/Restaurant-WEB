import { useState } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart } from 'lucide-react';
import MenuFilters from './MenuFilters';
import MenuItemCard from './MenuItemCard';
import CartSidebar from './components/CartSidebar';
import { useCart } from '../../contexts/CartContext';
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
    if (authToken) params.append('token', authToken);
    params.append('page', page.toString());
    params.append('limit', '20');
    params.append('restaurantId', '00000000-0000-0000-0000-000000000000');
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
    <div className="min-h-screen bg-gray-50">
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

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <MenuFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          categories={menuData.data.categories}
        />
      </div>

      {/* Menu Content */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Floating Cart Button - luôn hiển thị */}
      <button
        onClick={() => setCartOpen((open) => !open)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-30 flex items-center gap-2"
        aria-label="Giỏ hàng"
      >
        <ShoppingCart className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {itemCount}
        </span>
      </button>

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)}
      />
    </div>
  );
}
