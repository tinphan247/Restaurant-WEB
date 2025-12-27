import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { MenuCategoryEntity } from '../menu-categories/entities/menu-category.entity';
import { MenuItemEntity } from '../menu-items/entities/menu-item.entity';
import { GuestMenuQueryDto } from './dto/guest-menu-query.dto';

/**
 * Response interface cho Guest Menu
 */
export interface GuestMenuResponse {
  data: {
    categories: Array<{
      id: string;
      name: string;
      description?: string;
      displayOrder: number;
      items: Array<{
        id: string;
        name: string;
        description?: string;
        price: number;
        prepTimeMinutes?: number;
        status: string;
        isChefRecommended: boolean;
        primaryPhotoUrl?: string | null;
        modifierGroups?: Array<{
          id: string;
          name: string;
          selectionType: string;
          isRequired: boolean;
          minSelections?: number;
          maxSelections?: number;
          displayOrder?: number;
          options: Array<{
            id: string;
            name: string;
            priceAdjustment: number;
            status: string;
          }>;
        }>;
      }>;
    }>;
  };
  page: number;
  limit: number;
  total: number;
}

/**
 * Service xử lý logic cho Guest Menu (Public)
 * Tối ưu performance với eager loading và query optimization
 */
@Injectable()
export class GuestMenuService {
  constructor(
    @InjectRepository(MenuCategoryEntity)
    private readonly categoryRepo: Repository<MenuCategoryEntity>,
    @InjectRepository(MenuItemEntity)
    private readonly menuItemRepo: Repository<MenuItemEntity>,
  ) {}

  /**
   * Lấy Guest Menu với filter, sort, pagination
   * Business Rules:
   * - Chỉ lấy categories có status = 'active'
   * - Chỉ lấy items có status = 'available' và isDeleted = false
   * - Include primaryPhotoUrl, modifierGroups, options
   * - Tối ưu query để tránh N+1
   */
  async getGuestMenu(
    restaurantId: string,
    query: GuestMenuQueryDto,
  ): Promise<GuestMenuResponse> {
    const {
      q,
      categoryId,
      chefRecommended,
      sort = 'createdAt',
      order = 'DESC',
      page = 1,
      limit = 20,
    } = query;

    // Validate và giới hạn pagination
    const validLimit = Math.min(Math.max(limit, 1), 100);
    const validPage = Math.max(page, 1);
    const offset = (validPage - 1) * validLimit;

    // Query categories (chỉ lấy active)
    const categoryQuery = this.categoryRepo
      .createQueryBuilder('category')
      // .where('category.restaurant_id = :restaurantId', { restaurantId }) // Tạm thời bỏ qua filter restaurantId
      .where('category.status = :status', { status: 'active' })
      .andWhere('category.is_deleted = :isDeleted', { isDeleted: false })
      .orderBy('category.display_order', 'ASC');

    // Nếu có filter categoryId, chỉ lấy category đó
    if (categoryId) {
      categoryQuery.andWhere('category.id = :categoryId', { categoryId });
    }

    const categories = await categoryQuery.getMany();

    if (categories.length === 0) {
      return {
        data: { categories: [] },
        page: validPage,
        limit: validLimit,
        total: 0,
      };
    }

    const categoryIds = categories.map(c => c.id);

    // Query items với các relations (eager loading để tránh N+1)
    let itemQuery = this.menuItemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.photos', 'photo')
      .leftJoinAndSelect('item.modifierGroups', 'modifierGroup')
      .leftJoinAndSelect('modifierGroup.options', 'option')
      .where('item.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('item.category_id IN (:...categoryIds)', { categoryIds })
      .andWhere('item.status = :status', { status: 'available' })
      .andWhere('item.is_deleted = :isDeleted', { isDeleted: false });

    // Filter by search query
    if (q) {
      itemQuery.andWhere('LOWER(item.name) LIKE LOWER(:search)', {
        search: `%${q}%`,
      });
    }

    // Filter by chef recommended
    if (chefRecommended !== undefined) {
      itemQuery.andWhere('item.is_chef_recommended = :chefRecommended', {
        chefRecommended,
      });
    }

    // Count total trước khi pagination
    const total = await itemQuery.getCount();

    // Lấy tất cả items trước, rồi sort + paginate ở memory để tránh lỗi driver sqlite
    const allItems = await itemQuery.getMany();

    // Sorting in memory
    const sortedItems = this.sortItemsInMemory(allItems, sort, order);

    // Pagination slice
    const items = sortedItems.slice(offset, offset + validLimit);

    // Transform data thành response structure
    const responseCategories = categories.map(category => {
      const categoryItems = items
        .filter(item => item.categoryId === category.id)
        .map(item => this.transformMenuItem(item));

      return {
        id: category.id,
        name: category.name,
        description: category.description,
        displayOrder: category.displayOrder,
        items: categoryItems,
      };
    }).filter(cat => cat.items.length > 0); // Chỉ trả về categories có items

    return {
      data: {
        categories: responseCategories,
      },
      page: validPage,
      limit: validLimit,
      total,
    };
  }

  /**
   * Apply sorting logic
   */
  private sortItemsInMemory(items: MenuItemEntity[], sort: string, order: string): MenuItemEntity[] {
    const asc = order.toUpperCase() === 'ASC';
    const compare = (a: number | Date | undefined, b: number | Date | undefined) => {
      const av = a ?? 0;
      const bv = b ?? 0;
      if (av < bv) return asc ? -1 : 1;
      if (av > bv) return asc ? 1 : -1;
      return 0;
    };

    switch (sort) {
      case 'price':
        return items.sort((a, b) => compare(Number(a.price), Number(b.price)));
      case 'popularity':
        return items.sort((a, b) => compare(a.popularity, b.popularity));
      case 'createdAt':
      default:
        return items.sort((a, b) => compare(a.createdAt, b.createdAt));
    }
  }

  /**
   * Transform MenuItem entity sang response format
   * Calculate primaryPhotoUrl, format modifierGroups
   */
  private transformMenuItem(item: MenuItemEntity): any {
    // Tìm primary photo
    const primaryPhoto = item.photos?.find(p => p.isPrimary);
    const primaryPhotoUrl = primaryPhoto?.url || null;

    // Format modifier groups (chỉ lấy active groups và options)
    const modifierGroups = (item.modifierGroups || [])
      .filter(group => group.status === 'active')
      .map(group => ({
        id: group.id,
        name: group.name,
        selectionType: group.selectionType,
        isRequired: group.isRequired,
        minSelections: group.minSelections,
        maxSelections: group.maxSelections,
        displayOrder: group.displayOrder,
        options: (group.options || [])
          .filter(opt => opt.status === 'active')
          .sort((a, b) => {
            const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return at - bt;
          })
          .map(opt => ({
            id: opt.id,
            name: opt.name,
            priceAdjustment: Number(opt.priceAdjustment),
            status: opt.status,
          })),
      }))
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      prepTimeMinutes: item.prepTimeMinutes,
      status: item.status,
      isChefRecommended: item.isChefRecommended || false,
      primaryPhotoUrl,
      modifierGroups,
    };
  }
}
