import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  HttpCode, 
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ModifierService } from './modifiers.service';
import { 
  CreateModifierGroupDto, 
  UpdateModifierGroupDto, 
  CreateModifierOptionDto, 
  UpdateModifierOptionDto,
  AttachModifierGroupsDto 
} from './dto/modifier.dto';
import { ModifierGroupEntity } from './entities/modifier-group.entity';
import { ModifierOptionEntity } from './entities/modifier-option.entity';

/**
 * Controller xử lý các API endpoints cho Modifier Management
 * Tất cả endpoints yêu cầu authentication (admin)
 * 
 * TODO: Thêm Guards cho authentication và authorization
 * - @UseGuards(AuthGuard) để verify user đã đăng nhập
 * - Lấy restaurantId từ session/token (@CurrentUser() user)
 */
@Controller('api/admin/menu')
export class ModifierController {
  constructor(private readonly modifierService: ModifierService) {}

  /**
   * 1. GET /api/admin/menu/modifier-groups
   * Lấy danh sách tất cả modifier groups
   */
  @Get('modifier-groups')
  async getAllModifierGroups(): Promise<ModifierGroupEntity[]> {
    // TODO: Lấy restaurantId từ authenticated user
    const restaurantId = 'test-restaurant-id'; // Placeholder cho E2E
    
    return await this.modifierService.getAllModifierGroups(restaurantId);
  }

  /**
   * 2. POST /api/admin/menu/modifier-groups
   * Tạo mới modifier group
   */
  @Post('modifier-groups')
  @HttpCode(HttpStatus.CREATED)
  async createModifierGroup(
    @Body() dto: CreateModifierGroupDto,
  ): Promise<ModifierGroupEntity> {
    // TODO: Lấy restaurantId từ authenticated user
    const restaurantId = 'test-restaurant-id'; // Placeholder cho E2E

    try {
      return await this.modifierService.createModifierGroup(restaurantId, dto);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        code: 'CREATE_FAILED',
        message: 'Không thể tạo modifier group',
        errors: { general: [error.message] },
      });
    }
  }

  /**
   * 3. PUT /api/admin/menu/modifier-groups/:id
   * Cập nhật modifier group
   */
  @Put('modifier-groups/:id')
  async updateModifierGroup(
    @Param('id') groupId: string,
    @Body() dto: UpdateModifierGroupDto,
  ): Promise<ModifierGroupEntity> {
    // TODO: Lấy restaurantId từ authenticated user
    const restaurantId = 'test-restaurant-id'; // Placeholder cho E2E

    try {
      return await this.modifierService.updateModifierGroup(groupId, restaurantId, dto);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        code: 'UPDATE_FAILED',
        message: 'Không thể cập nhật modifier group',
        errors: { general: [error.message] },
      });
    }
  }

  /**
   * 4. POST /api/admin/menu/modifier-groups/:id/options
   * Thêm option vào modifier group
   */
  @Post('modifier-groups/:id/options')
  @HttpCode(HttpStatus.CREATED)
  async addOptionToGroup(
    @Param('id') groupId: string,
    @Body() dto: CreateModifierOptionDto,
  ): Promise<ModifierOptionEntity> {
    // TODO: Lấy restaurantId từ authenticated user
    const restaurantId = 'test-restaurant-id'; // Placeholder cho E2E

    try {
      return await this.modifierService.addOptionToGroup(groupId, restaurantId, dto);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        code: 'CREATE_OPTION_FAILED',
        message: 'Không thể thêm option vào group',
        errors: { general: [error.message] },
      });
    }
  }

  /**
   * 5. PUT /api/admin/menu/modifier-options/:id
   * Cập nhật modifier option
   */
  @Put('modifier-options/:id')
  async updateOption(
    @Param('id') optionId: string,
    @Body() dto: UpdateModifierOptionDto,
  ): Promise<ModifierOptionEntity> {
    // TODO: Lấy restaurantId từ authenticated user
    const restaurantId = 'test-restaurant-id'; // Placeholder cho E2E

    try {
      return await this.modifierService.updateOption(optionId, restaurantId, dto);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        code: 'UPDATE_OPTION_FAILED',
        message: 'Không thể cập nhật option',
        errors: { general: [error.message] },
      });
    }
  }

  /**
   * 6. POST /api/admin/menu/items/:itemId/modifier-groups
   * Attach modifier groups vào menu item
   */
  @Post('items/:itemId/modifier-groups')
  @HttpCode(HttpStatus.NO_CONTENT)
  async attachModifierGroupsToItem(
    @Param('itemId') itemId: string,
    @Body() dto: AttachModifierGroupsDto,
  ): Promise<void> {
    // TODO: Lấy restaurantId từ authenticated user
    const restaurantId = 'test-restaurant-id'; // Placeholder cho E2E

    try {
      await this.modifierService.attachModifierGroupsToItem(itemId, restaurantId, dto);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        code: 'ATTACH_FAILED',
        message: 'Không thể attach modifier groups vào item',
        errors: { general: [error.message] },
      });
    }
  }

  /**
   * 7. DELETE /api/admin/menu/items/:itemId/modifier-groups/:groupId
   * Detach modifier group khỏi menu item
   */
  @Delete('items/:itemId/modifier-groups/:groupId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async detachModifierGroupFromItem(
    @Param('itemId') itemId: string,
    @Param('groupId') groupId: string,
  ): Promise<void> {
    // TODO: Lấy restaurantId từ authenticated user
    const restaurantId = 'test-restaurant-id'; // Placeholder cho E2E

    try {
      await this.modifierService.detachModifierGroupFromItem(itemId, groupId, restaurantId);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        code: 'DETACH_FAILED',
        message: 'Không thể detach modifier group khỏi item',
        errors: { general: [error.message] },
      });
    }
  }
}
