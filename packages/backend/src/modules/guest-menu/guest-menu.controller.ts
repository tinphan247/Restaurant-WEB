import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { GuestMenuService } from './guest-menu.service';
import { GuestMenuQueryDto } from './dto/guest-menu-query.dto';

/**
 * Controller xử lý Guest Menu API (Public - không cần authentication)
 * Endpoint: GET /api/menu
 * 
 * Guest có thể:
 * - Xem menu với categories và items
 * - Filter theo search query, category, chef recommended
 * - Sort theo popularity, price, createdAt
 * - Pagination
 */
@Controller('api/menu')
export class GuestMenuController {
  constructor(private readonly guestMenuService: GuestMenuService) {}

  /**
   * GET /api/menu
   * Public endpoint - không cần authentication
   * 
   * Query Parameters:
   * - q: string - Tìm kiếm theo tên món
   * - categoryId: uuid - Filter theo category
   * - chefRecommended: boolean - Chỉ lấy món chef recommended
   * - sort: 'popularity' | 'price' | 'createdAt' - Sort field (default: createdAt)
   * - order: 'ASC' | 'DESC' - Sort order (default: DESC)
   * - page: number - Trang hiện tại (default: 1, min: 1)
   * - limit: number - Số items per page (default: 20, max: 100)
   * 
   * Response:
   * {
   *   data: {
   *     categories: [
   *       {
   *         id: string,
   *         name: string,
   *         description?: string,
   *         displayOrder: number,
   *         items: [
   *           {
   *             id: string,
   *             name: string,
   *             description?: string,
   *             price: number,
   *             prepTimeMinutes?: number,
   *             status: string,
   *             isChefRecommended: boolean,
   *             primaryPhotoUrl?: string | null,
   *             modifierGroups?: [
   *               {
   *                 id: string,
   *                 name: string,
   *                 selectionType: 'single' | 'multiple',
   *                 isRequired: boolean,
   *                 minSelections?: number,
   *                 maxSelections?: number,
   *                 displayOrder?: number,
   *                 options: [
   *                   {
   *                     id: string,
   *                     name: string,
   *                     priceAdjustment: number,
   *                     status: string
   *                   }
   *                 ]
   *               }
   *             ]
   *           }
   *         ]
   *       }
   *     ]
   *   },
   *   page: number,
   *   limit: number,
   *   total: number
   * }
   * 
   * Business Rules:
   * - Chỉ hiển thị categories có status = 'active'
   * - Chỉ hiển thị items có status = 'available' và isDeleted = false
   * - Modifiers và options chỉ lấy status = 'active'
   * - Pagination: default limit = 20, max = 100
   * - Total price = base price + sum(modifier adjustments) - client tự tính
   */
  @Get()
  async getGuestMenu(@Query() query: GuestMenuQueryDto) {
    try {
      // TODO: Lấy restaurantId từ subdomain hoặc query param
      // Ví dụ: restaurant.example.com -> restaurantId = "restaurant"
      // Hoặc: example.com/menu?restaurantId=xxx
      const restaurantId = query.restaurantId ?? 'mock-restaurant-id';

      return await this.guestMenuService.getGuestMenu(restaurantId, query);
    } catch (error) {
      // Debug: log error to help diagnose 400 responses during tests
      // eslint-disable-next-line no-console
      console.error('GuestMenuController error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        code: 'FETCH_MENU_FAILED',
        message: 'Không thể tải menu',
        errors: { general: [error.message] },
      });
    }
  }
}
