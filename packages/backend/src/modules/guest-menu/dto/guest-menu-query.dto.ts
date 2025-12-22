import { IsOptional, IsString, IsEnum, IsBoolean, IsInt, Min, Max, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { GuestMenuQuery as IGuestMenuQuery } from '@shared/types/menu';

/**
 * DTO cho Guest Menu Query Parameters
 */
export class GuestMenuQueryDto implements IGuestMenuQuery {
  // Optional restaurantId để test/integration; thực tế lấy từ subdomain/session
  @IsOptional()
  @IsString()
  restaurantId?: string;
  // Tìm kiếm theo tên món
  @IsOptional()
  @IsString()
  q?: string;

  // Filter theo category
  @IsOptional()
  @IsUUID('4', { message: 'categoryId phải là UUID hợp lệ' })
  categoryId?: string;

  // Filter theo chef recommended
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  chefRecommended?: boolean;

  // Sort field
  @IsOptional()
  @IsEnum(['popularity', 'price', 'createdAt'], {
    message: 'sort phải là "popularity", "price", hoặc "createdAt"',
  })
  sort?: 'popularity' | 'price' | 'createdAt';

  // Sort order
  @IsOptional()
  @IsEnum(['ASC', 'DESC'], {
    message: 'order phải là "ASC" hoặc "DESC"',
  })
  order?: 'ASC' | 'DESC';

  // Pagination
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const n = typeof value === 'number' ? value : parseInt(value);
    return Number.isNaN(n) ? undefined : n;
  })
  @IsInt({ message: 'page phải là số nguyên' })
  @Min(1, { message: 'page phải >= 1' })
  page?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const n = typeof value === 'number' ? value : parseInt(value);
    return Number.isNaN(n) ? undefined : n;
  })
  @IsInt({ message: 'limit phải là số nguyên' })
  @Min(1, { message: 'limit phải >= 1' })
  limit?: number;
}
