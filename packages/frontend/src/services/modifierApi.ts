import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Mock storage for development
const mockStorage = {
  groups: [
    {
      id: 'mod-size-pho',
      restaurantId: 'mock-restaurant',
      name: 'Size',
      selectionType: 'single' as const,
      isRequired: true,
      displayOrder: 1,
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      options: [
        { id: 'size-s', groupId: 'mod-size-pho', name: 'Nhỏ', priceAdjustment: 0, status: 'active' as const, createdAt: new Date() },
        { id: 'size-m', groupId: 'mod-size-pho', name: 'Vừa', priceAdjustment: 10000, status: 'active' as const, createdAt: new Date() },
        { id: 'size-l', groupId: 'mod-size-pho', name: 'Lớn', priceAdjustment: 20000, status: 'active' as const, createdAt: new Date() }
      ]
    },
    {
      id: 'mod-meat-pho',
      restaurantId: 'mock-restaurant',
      name: 'Thịt bò',
      selectionType: 'multiple' as const,
      isRequired: false,
      minSelections: 0,
      maxSelections: 3,
      displayOrder: 2,
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      options: [
        { id: 'meat-tai', groupId: 'mod-meat-pho', name: 'Tái', priceAdjustment: 15000, status: 'active' as const, createdAt: new Date() },
        { id: 'meat-nam', groupId: 'mod-meat-pho', name: 'Nạm', priceAdjustment: 12000, status: 'active' as const, createdAt: new Date() },
        { id: 'meat-gau', groupId: 'mod-meat-pho', name: 'Gầu', priceAdjustment: 18000, status: 'active' as const, createdAt: new Date() },
        { id: 'meat-vien', groupId: 'mod-meat-pho', name: 'Bò viên', priceAdjustment: 10000, status: 'active' as const, createdAt: new Date() }
      ]
    },
    {
      id: 'mod-veggies-pho',
      restaurantId: 'mock-restaurant',
      name: 'Rau ăn kèm',
      selectionType: 'multiple' as const,
      isRequired: false,
      displayOrder: 3,
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      options: [
        { id: 'veg-no-onion', groupId: 'mod-veggies-pho', name: 'Không hành', priceAdjustment: 0, status: 'active' as const, createdAt: new Date() },
        { id: 'veg-extra', groupId: 'mod-veggies-pho', name: 'Thêm rau', priceAdjustment: 5000, status: 'active' as const, createdAt: new Date() },
        { id: 'veg-lemon', groupId: 'mod-veggies-pho', name: 'Thêm chanh', priceAdjustment: 2000, status: 'active' as const, createdAt: new Date() }
      ]
    }
  ] as ModifierGroupWithOptions[],
  // Map itemId -> groupIds
  itemModifiers: {} as Record<string, string[]>
};

export interface ModifierGroup {
  id: string;
  restaurantId: string;
  name: string;
  selectionType: 'single' | 'multiple';
  isRequired: boolean;
  minSelections?: number;
  maxSelections?: number;
  displayOrder: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface ModifierOption {
  id: string;
  groupId: string;
  name: string;
  priceAdjustment: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface ModifierGroupWithOptions extends ModifierGroup {
  options: ModifierOption[];
}

export interface CreateModifierGroupDto {
  name: string;
  selectionType: 'single' | 'multiple';
  isRequired: boolean;
  minSelections?: number;
  maxSelections?: number;
  displayOrder?: number;
  status?: 'active' | 'inactive';
}

export interface UpdateModifierGroupDto {
  name?: string;
  selectionType?: 'single' | 'multiple';
  isRequired?: boolean;
  minSelections?: number;
  maxSelections?: number;
  displayOrder?: number;
  status?: 'active' | 'inactive';
}

export interface CreateModifierOptionDto {
  name: string;
  priceAdjustment: number;
  status?: 'active' | 'inactive';
}

export interface UpdateModifierOptionDto {
  name?: string;
  priceAdjustment?: number;
  status?: 'active' | 'inactive';
}

export interface AttachModifierGroupsDto {
  modifierGroupIds: string[];
}

const modifierApi = {
  // Modifier Groups
  async getModifierGroups(): Promise<ModifierGroupWithOptions[]> {
    const useMock = String(import.meta.env.VITE_USE_MOCK_MENU || '').toLowerCase() === 'true';
    
    if (useMock) {
      return Promise.resolve(mockStorage.groups);
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/menu/modifier-groups`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch modifier groups from API:', error);
      return mockStorage.groups;
    }
  },

  async createModifierGroup(data: CreateModifierGroupDto): Promise<ModifierGroup> {
    const response = await axios.post(`${API_BASE_URL}/api/admin/menu/modifier-groups`, data);
    return response.data;
  },

  async updateModifierGroup(id: string, data: UpdateModifierGroupDto): Promise<ModifierGroup> {
    const response = await axios.put(`${API_BASE_URL}/api/admin/menu/modifier-groups/${id}`, data);
    return response.data;
  },

  async deleteModifierGroup(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/admin/menu/modifier-groups/${id}`);
  },

  // Modifier Options
  async addOptionToGroup(groupId: string, data: CreateModifierOptionDto): Promise<ModifierOption> {
    const response = await axios.post(
      `${API_BASE_URL}/api/admin/menu/modifier-groups/${groupId}/options`,
      data
    );
    return response.data;
  },

  async updateOption(optionId: string, data: UpdateModifierOptionDto): Promise<ModifierOption> {
    const response = await axios.put(
      `${API_BASE_URL}/api/admin/menu/modifier-options/${optionId}`,
      data
    );
    return response.data;
  },

  async deleteOption(optionId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/admin/menu/modifier-options/${optionId}`);
  },

  // Attach/Detach Groups to Items
  async attachGroupsToItem(itemId: string, data: AttachModifierGroupsDto): Promise<void> {
    const useMock = String(import.meta.env.VITE_USE_MOCK_MENU || '').toLowerCase() === 'true';
    
    if (useMock) {
      // Store in mock storage
      const existing = mockStorage.itemModifiers[itemId] || [];
      const newIds = data.modifierGroupIds.filter(id => !existing.includes(id));
      mockStorage.itemModifiers[itemId] = [...existing, ...newIds];
      console.log(`[Mock] Attached ${newIds.length} groups to item ${itemId}`);
      return Promise.resolve();
    }
    
    try {
      await axios.post(
        `${API_BASE_URL}/api/admin/menu/items/${itemId}/modifier-groups`,
        data
      );
    } catch (error) {
      console.error('Failed to attach modifier groups:', error);
      throw error;
    }
  },

  async detachGroupFromItem(itemId: string, groupId: string): Promise<void> {
    const useMock = String(import.meta.env.VITE_USE_MOCK_MENU || '').toLowerCase() === 'true';
    
    if (useMock) {
      // Remove from mock storage
      if (mockStorage.itemModifiers[itemId]) {
        mockStorage.itemModifiers[itemId] = mockStorage.itemModifiers[itemId].filter(
          id => id !== groupId
        );
        console.log(`[Mock] Detached group ${groupId} from item ${itemId}`);
      }
      return Promise.resolve();
    }
    
    try {
      await axios.delete(
        `${API_BASE_URL}/api/admin/menu/items/${itemId}/modifier-groups/${groupId}`
      );
    } catch (error) {
      console.error('Failed to detach modifier group:', error);
      throw error;
    }
  },

  // Get groups for a specific item
  async getItemModifierGroups(itemId: string): Promise<ModifierGroupWithOptions[]> {
    const useMock = String(import.meta.env.VITE_USE_MOCK_MENU || '').toLowerCase() === 'true';
    
    if (useMock) {
      const groupIds = mockStorage.itemModifiers[itemId] || [];
      const groups = mockStorage.groups.filter(g => groupIds.includes(g.id));
      return Promise.resolve(groups);
    }
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/menu/items/${itemId}/modifier-groups`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch item modifier groups:', error);
      return [];
    }
  },
};

export default modifierApi;
