// packages/backend/src/modules/report/dto/revenue-query.dto.ts

import { IsDateString, IsIn, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class RevenueQueryDto {
  @IsDateString()
  from: string; // YYYY-MM-DD

  @IsDateString()
  to: string; // YYYY-MM-DD

  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly'])
  period?: 'daily' | 'weekly' | 'monthly'; // default: 'daily'
}

export class BestSellersQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string; // YYYY-MM-DD (optional)

  @IsOptional()
  @IsDateString()
  to?: string; // YYYY-MM-DD (optional)

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number; // default: 10
}
