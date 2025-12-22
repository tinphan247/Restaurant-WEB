// shared/types/menu.d.ts (Dùng chung cho BE và FE)

export type CategoryStatus = 'active' | 'inactive';
export type MenuItemStatus = 'available' | 'unavailable' | 'sold_out';
export type ModifierGroupSelectionType = 'single' | 'multiple';
export type ModifierStatus = 'active' | 'inactive';

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  displayOrder: number;
  status: CategoryStatus;
  itemCount?: number;
  isDeleted?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  prepTimeMinutes?: number;
  status: MenuItemStatus;
  isChefRecommended?: boolean;
  popularity?: number;
  isDeleted?: boolean;
  primaryPhotoUrl?: string | null;
  photos?: MenuItemPhoto[];
  modifierGroups?: ModifierGroupWithOptions[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface MenuItemPhoto {
  id: string;
  menuItemId: string;
  url: string;
  isPrimary: boolean;
  createdAt: string | Date;
}

export interface ModifierGroup {
  id: string;
  restaurantId: string;
  name: string;
  selectionType: ModifierGroupSelectionType;
  isRequired: boolean;
  minSelections?: number;
  maxSelections?: number;
  displayOrder?: number;
  status: ModifierStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ModifierOption {
  id: string;
  groupId: string;
  name: string;
  priceAdjustment: number;
  status: ModifierStatus;
  createdAt: string | Date;
}

export interface ModifierGroupWithOptions extends ModifierGroup {
  options?: ModifierOption[];
}

// DTOs
export interface CreateMenuCategoryDto {
  name: string;
  description?: string;
  displayOrder?: number;
  status?: CategoryStatus;
}

export interface UpdateMenuCategoryDto extends Partial<CreateMenuCategoryDto> {}

export interface CreateMenuItemDto {
  categoryId: string;
  name: string;
  price: number;
  description?: string;
  prepTimeMinutes?: number;
  status: MenuItemStatus;
  isChefRecommended?: boolean;
  modifierGroupIds?: string[];
}

export interface UpdateMenuItemDto extends Partial<CreateMenuItemDto> {
  categoryId?: string;
}

export interface MenuItemQueryDto {
  q?: string;
  categoryId?: string;
  status?: MenuItemStatus;
  chefRecommended?: boolean;
  sort?: 'createdAt' | 'price' | 'popularity';
  order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface GuestMenuQuery extends MenuItemQueryDto {
  sort?: 'popularity' | 'price' | 'createdAt';
}

export interface CreateModifierGroupDto {
  name: string;
  selectionType: ModifierGroupSelectionType;
  isRequired?: boolean;
  minSelections?: number;
  maxSelections?: number;
  displayOrder?: number;
  status?: ModifierStatus;
}

export interface UpdateModifierGroupDto extends Partial<CreateModifierGroupDto> {}

export interface CreateModifierOptionDto {
  groupId?: string; // optional if provided via path param
  name: string;
  priceAdjustment?: number;
  status?: ModifierStatus;
}

export interface UpdateModifierOptionDto extends Partial<CreateModifierOptionDto> {}

export interface AttachModifierGroupsDto {
  modifierGroupIds: string[];
}

export interface PaginatedMenuCategories {
  data: MenuCategory[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedMenuItems {
  data: MenuItem[];
  total: number;
  page: number;
  limit: number;
}
