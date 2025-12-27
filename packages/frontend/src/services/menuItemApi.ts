import axios from 'axios';
import type {
  CreateMenuItemDto,
  MenuItem,
  MenuItemQueryDto,
  MenuItemStatus,
  PaginatedMenuItems,
  UpdateMenuItemDto,
} from '@shared/types/menu.d';

const API_BASE = '/api/admin/menu/items';

export type MenuItemDropdown = Pick<
  MenuItem,
  'id' | 'name' | 'price' | 'categoryId' | 'description' | 'status' | 'isChefRecommended'
> & {
  categoryName?: string;
};

function toDropdownItem(item: MenuItem): MenuItemDropdown {
  return {
    id: item.id,
    name: item.name,
    price: Number(item.price),
    categoryId: item.categoryId,
    description: item.description,
    status: item.status,
    isChefRecommended: item.isChefRecommended ?? false,
  };
}

export const menuItemApi = {
  async list(params: MenuItemQueryDto): Promise<PaginatedMenuItems> {
    const res = await axios.get(API_BASE, { params });
    return res.data;
  },

  async create(data: CreateMenuItemDto): Promise<MenuItem> {
    const res = await axios.post(API_BASE, data);
    return res.data;
  },

  async getById(id: string): Promise<MenuItem> {
    const res = await axios.get(`${API_BASE}/${id}`);
    return res.data;
  },

  async update(id: string, data: UpdateMenuItemDto): Promise<MenuItem> {
    const res = await axios.put(`${API_BASE}/${id}`, data);
    return res.data;
  },

  async updateStatus(id: string, status: MenuItemStatus): Promise<MenuItem> {
    const res = await axios.patch(`${API_BASE}/${id}/status`, { status });
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await axios.delete(`${API_BASE}/${id}`);
  },

  /**
   * Backward-compatible helper used by AttachModifiersToItem.
   * Returns an array (not paginated).
   */
  async getMenuItems(): Promise<MenuItemDropdown[]> {
    try {
      const page = await menuItemApi.list({ page: 1, limit: 100, sort: 'createdAt', order: 'DESC' });
      if (!page || !Array.isArray(page.data)) {
        console.warn('getMenuItems: Invalid response format', page);
        return [];
      }
      return page.data.map(toDropdownItem);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      return [];
    }
  },
};

export default menuItemApi;
