import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { MenuCategoryEntity } from '../menu-categories/entities/menu-category.entity';
import { MenuItemEntity } from '../menu-items/entities/menu-item.entity';
import { GuestMenuQueryDto } from './dto/guest-menu-query.dto';
import { FuzzySearchQueryDto, FuzzySearchResponseDto, FuzzySearchItemDto } from './dto/fuzzy-search.dto';
import { FuzzySearchService, FuzzySearchConfig } from './services/fuzzy-search.service';

/**
 * Guest menu item structure
 */
export interface GuestMenuItem {
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
}

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
      items: GuestMenuItem[];
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
    private readonly fuzzySearchService: FuzzySearchService,
  ) { }

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

    // Query categories (filter active)
    const categoryQuery = this.categoryRepo
      .createQueryBuilder('category')
      .where('category.status = :status', { status: 'active' })
      .andWhere('category.is_deleted = :isDeleted', { isDeleted: false })
      .orderBy('category.displayOrder', 'ASC');

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

    // Query items using DB Pagination
    let itemQuery = this.menuItemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.photos', 'photos')
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

    // Apply Sorting at Database Level
    const sortDir = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    switch (sort) {
      case 'price':
        itemQuery.orderBy('item.price', sortDir);
        break;
      case 'popularity':
        itemQuery.orderBy('item.popularity', sortDir);
        break;
      case 'createdAt':
      default:
        itemQuery.orderBy('item.createdAt', sortDir);
        break;
    }

    // Explicit secondary sort to ensure stable pagination
    itemQuery.addOrderBy('item.id', 'ASC');

    // Apply Pagination
    itemQuery.skip(offset).take(validLimit);

    // Execute Query
    const [items, total] = await itemQuery.getManyAndCount();

    // Transform data
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
    }).filter(cat => cat.items.length > 0);

    return {
      data: {
        categories: responseCategories,
      },
      page: validPage,
      limit: validLimit,
      total,
    };
  }

  // sortItemsInMemory method removed as it is no longer needed

  /**
   * Transform MenuItem entity sang response format
   * Calculate primaryPhotoUrl, format modifierGroups
   */
  private transformMenuItem(item: MenuItemEntity): any {
    // Tìm primary photo (fallback lấy ảnh đầu tiên nếu không có cái nào là primary)
    const primaryPhoto = item.photos?.find(p => p.isPrimary) || item.photos?.[0];
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

  /**
   * Fuzzy search on menu items with typo tolerance
   * Business Rules:
   * - Search query supports typos (Levenshtein distance)
   * - Results ranked: exact > fuzzy > partial
   * - Each result includes relevance score (0-1)
   * - Supports multi-word queries
   */
  async fuzzySearch(
    restaurantId: string,
    query: FuzzySearchQueryDto,
  ): Promise<FuzzySearchResponseDto> {
    const {
      q,
      maxEditDistance = 2,
      minScoreThreshold = 0.3,
      categoryId,
      page = 1,
      limit = 20,
    } = query;

    // Validate pagination
    const validLimit = Math.min(Math.max(limit, 1), 100);
    const validPage = Math.max(page, 1);
    const offset = (validPage - 1) * validLimit;

    // Validate fuzzy config
    this.fuzzySearchService.validateConfig({ maxEditDistance, minScoreThreshold });

    // Get all active menu items (optionally filter by category)
    let itemQuery = this.menuItemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.photos', 'photos')
      .leftJoinAndSelect('item.modifierGroups', 'modifierGroup')
      .leftJoinAndSelect('modifierGroup.options', 'option')
      .where('item.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('item.status = :status', { status: 'available' })
      .andWhere('item.is_deleted = :isDeleted', { isDeleted: false });

    if (categoryId) {
      itemQuery = itemQuery.andWhere('item.category_id = :categoryId', { categoryId });
    }

    const allItems = await itemQuery.getMany();

    // Perform fuzzy search on name and description
    const fuzzyResults = this.fuzzySearchService.fuzzySearch(
      allItems,
      q,
      ['name', 'description'],
      {
        maxEditDistance,
        minScoreThreshold,
        fieldWeights: {
          name: 1.0,
          description: 0.5,
        },
      },
    );

    // Find best suggestion from top results
    const bestSuggestion = fuzzyResults
      .filter((r) => r.matchType !== 'exact')
      .sort((a, b) => b.score - a.score)[0]?.suggestion;

    // Transform to response DTOs
    const paginatedResults = fuzzyResults.slice(offset, offset + validLimit);
    const items: FuzzySearchItemDto[] = paginatedResults.map((result) => ({
      item: this.transformMenuItem(result.item),
      score: parseFloat(result.score.toFixed(3)),
      matchType: result.matchType,
      matchedFields: result.matchedFields,
      suggestion: result.suggestion,
    }));

    return {
      items,
      total: fuzzyResults.length,
      page: validPage,
      limit: validLimit,
      didYouMean: bestSuggestion,
    };
  }
}

