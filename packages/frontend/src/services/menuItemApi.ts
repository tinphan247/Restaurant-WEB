import axios from 'axios';
import { mockMenuItems } from '../features/customer-view/components/MockMenu';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  description?: string;
  status: string;
  isChefRecommended: boolean;
}

/**
 * Convert mock data to MenuItem format
 */
function buildMockMenuItems(): MenuItem[] {
  const items: MenuItem[] = [];
  
  mockMenuItems.forEach(category => {
    category.items.forEach((item, idx) => {
      items.push({
        id: `${category.id}-${idx + 1}`,
        name: item.name,
        price: item.price,
        categoryId: category.id,
        categoryName: category.category,
        description: item.description,
        status: 'available',
        isChefRecommended: false,
      });
    });
  });
  
  return items;
}

/**
 * Get all menu items (simplified for admin dropdown)
 * Supports both API and mock data via VITE_USE_MOCK_MENU env flag
 */
export async function getMenuItems(): Promise<MenuItem[]> {
  const useMock = String(import.meta.env.VITE_USE_MOCK_MENU || '').toLowerCase() === 'true';
  
  // Use mock data if flag is enabled
  if (useMock) {
    return buildMockMenuItems();
  }
  
  // Otherwise call real API
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/menu/items`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch menu items from API:', error);
    // Fallback to mock data on error
    return buildMockMenuItems();
  }
}

export default {
  getMenuItems,
};
