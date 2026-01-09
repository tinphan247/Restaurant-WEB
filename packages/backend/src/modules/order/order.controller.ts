import { Controller, Get, Post, Body, Param, Patch, BadRequestException, Logger } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    this.logger.log(`[CREATE_ORDER] payload=${JSON.stringify(createOrderDto)}`);
    try {
      const result = await this.orderService.create(createOrderDto);
      this.logger.log(`[CREATE_ORDER_SUCCESS] orderId=${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`[CREATE_ORDER_ERROR] ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new BadRequestException(error instanceof Error ? error.message : 'Failed to create order');
    }
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }
  
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
      return this.orderService.updateStatus(id, status);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
      return this.orderService.update(id, updateOrderDto);
  }
}
