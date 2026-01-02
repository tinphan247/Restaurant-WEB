# Order Module Documentation

## 1. Giới thiệu
Module **Order (Quản lý Đơn hàng)** chịu trách nhiệm xử lý toàn bộ quy trình đặt món, lưu trữ thông tin đơn hàng và theo dõi trạng thái phục vụ của từng bàn.

### Tính năng chính
- Tạo đơn hàng mới (kèm ghi chú cho từng món).
- Xem danh sách lịch sử đơn hàng.
- Xem chi tiết đơn hàng (món ăn, số lượng, giá, trạng thái).
- Cập nhật trạng thái đơn hàng (`pending` -> `confirmed` -> `completed` -> `cancelled`).

---

## 2. Cấu trúc thư mục & File
Module được phân chia rõ ràng giữa Backend, Frontend và Database:

### Backend (`packages/backend/src/modules/order/`)
- `entities/`: Định nghĩa `OrderEntity` và `OrderItemEntity`.
- `dto/`: Data Transfer Objects cho việc tạo/update đơn hàng.
- `order.controller.ts`: Xử lý các request HTTP (`GET`, `POST`, `PATCH`).
- `order.service.ts`: Logic nghiệp vụ (tính tổng tiền, lưu DB).

### Frontend (`packages/frontend/src/features/order/`)
- `components/`: Các UI component nhỏ (nếu có).
- `services/order-api.ts`: Client gọi API Backend.
- `types/`: TypeScript interfaces (`Order`, `OrderItem`).
- `OrderHistoryPage.tsx`: Trang hiển thị danh sách đơn hàng.

### Database (`database/`)
- `migrations/order.sql`: Script tạo bảng `orders` và `order_items`.
- `seeders/order.seed.sql`: Dữ liệu mẫu để test.

---

## 3. Hướng dẫn Cài đặt & Triển khai (Deployment)

### Bước 1: Chuẩn bị Database
Chạy các lệnh SQL sau để khởi tạo bảng và dữ liệu:

```bash
# 1. Tạo bảng (Migration)
psql -h localhost -U postgres -d restaurant_db -f database/migrations/order.sql

# 2. Thêm dữ liệu mẫu (Seeding)
psql -h localhost -U postgres -d restaurant_db -f database/seeders/order.seed.sql
```

### Bước 2: Cấu hình Backend
Đảm bảo file `.env` trong `packages/backend` đã có thông tin kết nối DB:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=restaurant_db
```

### Bước 3: Khởi chạy
```bash
# Tại thư mục gốc
npm run start:dev
```

---

## 4. API Reference

### Lấy danh sách đơn hàng
- **URL**: `GET /api/orders`
- **Response**: Mảng các object Order.

### Lấy chi tiết đơn hàng
- **URL**: `GET /api/orders/:id`

### Tạo đơn hàng mới
- **URL**: `POST /api/orders`
- **Body**:
```json
{
  "table_id": 1,
  "items": [
    {
      "menu_item_id": 1,
      "quantity": 2,
      "notes": "Không hành"
    }
  ]
}
```

### Cập nhật trạng thái
- **URL**: `PATCH /api/orders/:id/status`
- **Body**: `{"status": "completed"}`

---

## 5. Frontend Integration

### Sử dụng API Service
```typescript
import { orderApi } from '../features/order/services/order-api';

// Lấy danh sách
const orders = await orderApi.getAll();

// Tạo đơn
await orderApi.create({
  table_id: 1,
  items: [...]
});
```

### Truy cập giao diện
- Đường dẫn: `http://localhost:5173/orders`
- Vị trí trên Menu: Sidebar -> **Orders History**

---

## 6. Troubleshooting (Xử lý lỗi thường gặp)

**Lỗi: 404 Not Found khi gọi API**
- Kiểm tra xem Backend có đang chạy không.
- Kiểm tra prefix `/api` trong `order-api.ts`.

**Lỗi: "orders.map is not a function"**
- API trả về lỗi (không phải mảng). Kiểm tra tab Network trong DevTools để xem response body.

**Lỗi: Không kết nối được Database**
- Kiểm tra thông tin trong file `.env`.
- Đảm bảo PostgreSQL đang chạy.

