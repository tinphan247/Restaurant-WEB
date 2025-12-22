import { IsString, IsInt, Min, Max, IsNotEmpty, IsIn, IsOptional } from 'class-validator';
// Import từ shared types
import { CreateTableDto, UpdateTableDto, UpdateTableStatusDto, TableQueryDto } from '../../../../shared/types/table';
import { Type } from 'class-transformer';
export class CreateTableDtoValidator implements CreateTableDto {
  @IsInt()
  @Min(1)
  tableNumber: number;

  @IsInt()
  @Min(1)
  @Max(20) 
  capacity: number;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateTableDtoValidator implements UpdateTableDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  tableNumber?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  capacity?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateTableStatusDtoValidator implements UpdateTableStatusDto {
  @IsIn(['active', 'inactive'])
  status: 'active' | 'inactive';
}

export class TableQueryDtoValidator implements TableQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsIn(['active', 'inactive'])
    status?: 'active' | 'inactive';

    @IsOptional()
    @IsIn(['capacity', 'tableNumber', 'createdAt'])
    sort?: 'capacity' | 'tableNumber' | 'createdAt';

    @IsOptional()
    @IsIn(['ASC', 'DESC'])
    order?: 'ASC' | 'DESC';

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    limit?: number = 10;
}