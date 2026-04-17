import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { PaginatedMenuItems } from '../../shared/types/menu';

import { MenuCategoryEntity } from '../menu-categories/entities/menu-category.entity';
import { ModifierGroupEntity } from '../modifiers/entities/modifier-group.entity';
import { MenuItemEntity } from './entities/menu-item.entity';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu-item.dto';
import { MenuItemQueryDto } from './dto/menu-item-query.dto';
import { normalizeMenuItemQuery } from './menu-items.utils';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectRepository(MenuItemEntity)
    private readonly menuItemRepo: Repository<MenuItemEntity>,
    @InjectRepository(MenuCategoryEntity)
    private readonly categoryRepo: Repository<MenuCategoryEntity>,
    @InjectRepository(ModifierGroupEntity)
    private readonly modifierGroupRepo: Repository<ModifierGroupEntity>,
  ) {}

  async list(restaurantId: string, query: MenuItemQueryDto): Promise<PaginatedMenuItems> {
    const q = normalizeMenuItemQuery(query);

    const qb = this.menuItemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.photos', 'photos')
      .where('item.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('item.is_deleted = :isDeleted', { isDeleted: false });

    if (q.q) {
      qb.andWhere('LOWER(item.name) LIKE LOWER(:search)', { search: `%${q.q}%` });
    }

    if (q.categoryId) {
      qb.andWhere('item.category_id = :categoryId', { categoryId: q.categoryId });
    }

    if (q.status) {
      qb.andWhere('item.status = :status', { status: q.status });
    }

    if (q.chefRecommended !== undefined) {
      qb.andWhere('item.is_chef_recommended = :chefRecommended', {
        chefRecommended: q.chefRecommended,
      });
    }

    const sortMap: Record<string, string> = {
      createdAt: 'item.created_at',
      price: 'item.price',
      popularity: 'item.popularity',
    };

    const total = await qb.clone().getCount();

    qb.orderBy(sortMap[q.sort] ?? 'item.created_at', q.order)
      .skip(q.offset)
      .take(q.limit);

    const data = await qb.getMany();

    return {
      data: data.map(i => this.toMenuItemResponse(i)),
      total,
      page: q.page,
      limit: q.limit,
    };
  }

  async create(restaurantId: string, dto: CreateMenuItemDto): Promise<MenuItemEntity> {
    const category = await this.ensureCategoryExists(restaurantId, dto.categoryId);
    const modifierGroups = await this.ensureModifierGroupsExist(restaurantId, dto.modifierGroupIds);

    const item = this.menuItemRepo.create({
      restaurantId,
      categoryId: category.id,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      prepTimeMinutes: dto.prepTimeMinutes,
      status: dto.status,
      isChefRecommended: dto.isChefRecommended ?? false,
      popularity: 0,
      isDeleted: false,
      modifierGroups,
    });

    const saved = await this.menuItemRepo.save(item);
    return this.findOne(restaurantId, saved.id);
  }

  async findOne(restaurantId: string, id: string): Promise<MenuItemEntity> {
    const item = await this.menuItemRepo.findOne({
      where: { id, restaurantId, isDeleted: false },
      relations: {
        category: true,
        photos: true,
        modifierGroups: { options: true },
      },
    });

    if (!item) {
      throw new NotFoundException('Không tìm thấy món ăn');
    }

    return this.toMenuItemResponse(item);
  }

  async update(restaurantId: string, id: string, dto: UpdateMenuItemDto): Promise<MenuItemEntity> {
    const item = await this.menuItemRepo.findOne({
      where: { id, restaurantId, isDeleted: false },
      relations: { modifierGroups: true },
    });

    if (!item) {
      throw new NotFoundException('Không tìm thấy món ăn');
    }

    if (dto.categoryId) {
      const category = await this.ensureCategoryExists(restaurantId, dto.categoryId);
      item.categoryId = category.id;
    }

    if (dto.name !== undefined) item.name = dto.name;
    if (dto.description !== undefined) item.description = dto.description;
    if (dto.price !== undefined) item.price = dto.price;
    if (dto.prepTimeMinutes !== undefined) item.prepTimeMinutes = dto.prepTimeMinutes;
    if (dto.status !== undefined) item.status = dto.status;
    if (dto.isChefRecommended !== undefined) item.isChefRecommended = dto.isChefRecommended;

    if (dto.modifierGroupIds !== undefined) {
      item.modifierGroups = await this.ensureModifierGroupsExist(restaurantId, dto.modifierGroupIds);
    }

    const saved = await this.menuItemRepo.save(item);

    return this.findOne(restaurantId, saved.id);
  }

  async updateStatus(
    restaurantId: string,
    id: string,
    status: 'available' | 'unavailable' | 'sold_out',
  ): Promise<MenuItemEntity> {
    const item = await this.menuItemRepo.findOne({ where: { id, restaurantId, isDeleted: false } });
    if (!item) {
      throw new NotFoundException('Không tìm thấy món ăn');
    }

    item.status = status;
    const saved = await this.menuItemRepo.save(item);
    return this.findOne(restaurantId, saved.id);
  }

  async remove(restaurantId: string, id: string): Promise<void> {
    const item = await this.menuItemRepo.findOne({ where: { id, restaurantId, isDeleted: false } });
    if (!item) {
      throw new NotFoundException('Không tìm thấy món ăn');
    }

    item.isDeleted = true;
    await this.menuItemRepo.save(item);
  }

  private async ensureCategoryExists(restaurantId: string, categoryId: string): Promise<MenuCategoryEntity> {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
    });

    if (!category || category.isDeleted || category.deletedAt) {
      throw new NotFoundException('Category không tồn tại');
    }

    if (category.restaurantId && category.restaurantId !== restaurantId) {
      throw new BadRequestException({
        code: 'INVALID_CATEGORY',
        message: 'Category không thuộc restaurant hiện tại',
        errors: { categoryId: ['categoryId không hợp lệ'] },
      });
    }

    return category;
  }

  private async ensureModifierGroupsExist(
    restaurantId: string,
    modifierGroupIds?: string[],
  ): Promise<ModifierGroupEntity[]> {
    if (!modifierGroupIds || modifierGroupIds.length === 0) return [];

    const groups = await this.modifierGroupRepo.find({
      where: {
        id: In(modifierGroupIds),
        restaurantId,
      },
    });

    if (groups.length !== modifierGroupIds.length) {
      throw new BadRequestException({
        code: 'INVALID_MODIFIER_GROUPS',
        message: 'modifierGroupIds không hợp lệ',
        errors: { modifierGroupIds: ['Có modifier group không tồn tại hoặc không thuộc restaurant'] },
      });
    }

    return groups;
  }

  private toMenuItemResponse(item: MenuItemEntity): any {
    const primary = item.photos?.find(p => p.isPrimary);

    return {
      ...item,
      price: Number(item.price),
      popularity: item.popularity ?? 0,
      primaryPhotoUrl: primary?.url ?? null,
      modifierGroups: item.modifierGroups?.map(g => ({
        ...g,
        options: g.options?.map(o => ({
          ...o,
          priceAdjustment: Number(o.priceAdjustment),
        })),
      })),
    };
  }
}
