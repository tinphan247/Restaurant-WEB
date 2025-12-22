import { IsString, IsEnum, IsBoolean, IsOptional, IsInt, Min, Max, IsArray, IsUUID, IsNumber, MinLength, MaxLength, ValidateIf } from 'class-validator';
import type { 
  CreateModifierGroupDto as ICreateModifierGroupDto,
  UpdateModifierGroupDto as IUpdateModifierGroupDto,
  CreateModifierOptionDto as ICreateModifierOptionDto,
  UpdateModifierOptionDto as IUpdateModifierOptionDto,
  AttachModifierGroupsDto as IAttachModifierGroupsDto,
  ModifierGroupSelectionType,
  ModifierStatus
} from '@shared/types/menu';

/**
 * DTO cho việc tạo Modifier Group
 */
export class CreateModifierGroupDto implements ICreateModifierGroupDto {
  @IsString()
  @MinLength(1, { message: 'Tên group không được để trống' })
  @MaxLength(100, { message: 'Tên group không được vượt quá 100 ký tự' })
  name: string;

  @IsEnum(['single', 'multiple'], { message: 'selectionType phải là "single" hoặc "multiple"' })
  selectionType: ModifierGroupSelectionType;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsInt({ message: 'minSelections phải là số nguyên' })
  @Min(0, { message: 'minSelections phải >= 0' })
  minSelections?: number;

  @IsOptional()
  @IsInt({ message: 'maxSelections phải là số nguyên' })
  @Min(1, { message: 'maxSelections phải >= 1' })
  maxSelections?: number;

  @IsOptional()
  @IsInt({ message: 'displayOrder phải là số nguyên' })
  @Min(0, { message: 'displayOrder phải >= 0' })
  displayOrder?: number;

  @IsOptional()
  @IsEnum(['active', 'inactive'], { message: 'status phải là "active" hoặc "inactive"' })
  status?: ModifierStatus;
}

/**
 * DTO cho việc cập nhật Modifier Group
 */
export class UpdateModifierGroupDto implements IUpdateModifierGroupDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Tên group không được để trống' })
  @MaxLength(100, { message: 'Tên group không được vượt quá 100 ký tự' })
  name?: string;

  @IsOptional()
  @IsEnum(['single', 'multiple'], { message: 'selectionType phải là "single" hoặc "multiple"' })
  selectionType?: ModifierGroupSelectionType;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsInt({ message: 'minSelections phải là số nguyên' })
  @Min(0, { message: 'minSelections phải >= 0' })
  minSelections?: number;

  @IsOptional()
  @IsInt({ message: 'maxSelections phải là số nguyên' })
  @Min(1, { message: 'maxSelections phải >= 1' })
  maxSelections?: number;

  @IsOptional()
  @IsInt({ message: 'displayOrder phải là số nguyên' })
  @Min(0, { message: 'displayOrder phải >= 0' })
  displayOrder?: number;

  @IsOptional()
  @IsEnum(['active', 'inactive'], { message: 'status phải là "active" hoặc "inactive"' })
  status?: ModifierStatus;
}

/**
 * DTO cho việc tạo Modifier Option
 */
export class CreateModifierOptionDto implements ICreateModifierOptionDto {
  @IsOptional()
  @IsUUID('4', { message: 'groupId phải là UUID hợp lệ' })
  groupId?: string;

  @IsString()
  @MinLength(1, { message: 'Tên option không được để trống' })
  @MaxLength(100, { message: 'Tên option không được vượt quá 100 ký tự' })
  name: string;

  @IsOptional()
  @IsNumber({}, { message: 'priceAdjustment phải là số' })
  @Min(0, { message: 'priceAdjustment phải >= 0' })
  priceAdjustment?: number;

  @IsOptional()
  @IsEnum(['active', 'inactive'], { message: 'status phải là "active" hoặc "inactive"' })
  status?: ModifierStatus;
}

/**
 * DTO cho việc cập nhật Modifier Option
 */
export class UpdateModifierOptionDto implements IUpdateModifierOptionDto {
  @IsOptional()
  @IsUUID('4', { message: 'groupId phải là UUID hợp lệ' })
  groupId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Tên option không được để trống' })
  @MaxLength(100, { message: 'Tên option không được vượt quá 100 ký tự' })
  name?: string;

  @IsOptional()
  @IsNumber({}, { message: 'priceAdjustment phải là số' })
  @Min(0, { message: 'priceAdjustment phải >= 0' })
  priceAdjustment?: number;

  @IsOptional()
  @IsEnum(['active', 'inactive'], { message: 'status phải là "active" hoặc "inactive"' })
  status?: ModifierStatus;
}

/**
 * DTO cho việc attach modifier groups vào menu item
 */
export class AttachModifierGroupsDto implements IAttachModifierGroupsDto {
  @IsArray({ message: 'modifierGroupIds phải là mảng' })
  @IsUUID('4', { each: true, message: 'Mỗi modifierGroupId phải là UUID hợp lệ' })
  modifierGroupIds: string[];
}
