export class CreateOrderItemDto {
  menu_item_id: number;
  quantity: number;
  price: number;
  notes?: string;
}

export class CreateOrderDto {
  table_id: number;
  items: CreateOrderItemDto[];
}