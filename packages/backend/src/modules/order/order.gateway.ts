import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class OrderGateway {
  @WebSocketServer() server: Server;

  notifyNewOrder(order: any) {
    this.server.emit('new_order', order);
  }

  notifyOrderStatusUpdate(orderId: string, status: string) {
    this.server.emit('order_status_update', { orderId, status });
  }

  notifyPaymentStatusUpdate(orderId: string, status: string) {
    this.server.emit('payment_status_update', { orderId, status });
  }
}
