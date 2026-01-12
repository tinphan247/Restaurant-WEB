# Hướng dẫn Setup & Sử dụng (Order & Review Module)

## 📋 Giới thiệu
Module này quản lý quy trình **Đặt món (Order)** và **Đánh giá (Review)** của nhà hàng.
- **Order**: Khách đặt món -> Bếp nhận đơn -> User xem lịch sử.
- **Review**: Khách đánh giá món ăn -> Admin quản lý.

---

## 🛠️ 1. Hướng dẫn Setup

### ⚠️ Lưu ý quan trọng cho Team (New Dependencies)
Module này có sử dụng WebSocket, các bạn vui lòng chạy lệnh sau sau khi pull code về:

**Backend:**
```bash
cd packages/backend
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

**Frontend:**
```bash
cd packages/frontend
npm install socket.io-client
```

### 1.1 Backend
1. Cài đặt dependencies:
   ```bash
   cd packages/backend
   npm install
   ```
2. Cấu hình websocket (nếu cần đổi PORT):
   - Mặc định chạy trên PORT 3000
3. Chạy Server:
   ```bash
   npm run start:dev
   ```

### 1.2 Frontend
1. Cài đặt dependencies:
   ```bash
   cd packages/frontend
   npm install
   ```
2. Cấu hình biến môi trường (`.env`):
   ```
   VITE_API_URL=http://localhost:3000
   VITE_SOCKET_URL=http://localhost:3000
   ```
3. Chạy Client:
   ```bash
   npm run dev
   ```

### 1.3 Database
1. Chạy Migration:
   ```bash
   psql -U postgres -d restaurant_db -f database/migrations/order.sql
   psql -U postgres -d restaurant_db -f database/migrations/review.sql
   ```
2. Seed dữ liệu mẫu:
   ```bash
   psql -U postgres -d restaurant_db -f database/seeders/order.seed.sql
   psql -U postgres -d restaurant_db -f database/seeders/review.seed.sql
   ```

---

## 📘 2. Hướng dẫn Sử dụng (User Guide)

### 2.1 Quy trình Đặt món (Ordering)
1. **Khách hàng**: Truy cập trang Menu (`/guest-menu`), chọn món và bấm "Đặt hàng".
2. **Real-time Notification**:
   - Ngay lập tức, màn hình **Admin/Kitchen** (`/admin/orders`) sẽ nhận được thông báo đơn hàng mới.
3. **Cập nhật trạng thái**:
   - Admin bấm "Xác nhận" hoặc "Đang nấu".
   - Trạng thái thay đổi tức thì trên màn hình của Khách (không cần reload).

### 2.2 Quy trình Đánh giá (Reviewing)
1. **Khách hàng**:
   - Vào chi tiết món ăn hoặc lịch sử đơn hàng.
   - Bấm "Viết đánh giá", chọn số sao (1-5) và bình luận.
   - *Yêu cầu đăng nhập để gửi review*.
2. **Admin**:
   - Truy cập `/admin/reviews` để xem toàn bộ đánh giá của khách hàng.

---

## 📡 3. API Documentation

### 🟢 Order API
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| **GET** | `/api/orders` | Lấy danh sách toàn bộ đơn hàng (kèm items) |
| **GET** | `/api/orders/:id` | Xem chi tiết 1 đơn hàng |
| **POST** | `/api/orders` | Tạo đơn hàng mới |
| **PATCH**| `/api/orders/:id` | Cập nhật trạng thái đơn (pending/confirmed/etc) |

**Sample Body (Create Order):**
```json
{
  "table_id": 1,
  "items": [
    { "menu_item_id": "uuid-mon-an", "quantity": 2, "price": 50000 }
  ]
}
```

### 🟠 Review API
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| **GET** | `/api/reviews` | Lấy danh sách review (filter ?menu_item_id=...) |
| **POST** | `/api/reviews` | Gửi đánh giá mới |
| **GET** | `/api/reviews/menu-item/:id/average-rating` | Lấy điểm trung bình món ăn |

**Sample Body (Create Review):**
```json
{
  "user_id": "uuid-user",
  "menu_item_id": "uuid-mon-an",
  "rating": 5,
  "comment": "Món ăn rất ngon!"
}
```

---

## ⚡ 4. WebSocket Events
Hệ thống sử dụng `Socket.IO` namespace mặc định `/`.

| Event Name | Direction | Payload Structure | Mô tả |
| :--- | :--- | :--- | :--- |
| `new_order` | Server -> Client | `Order` object | Bắn ra khi có đơn hàng mới vừa tạo |
| `order_status_update` | Server -> Client | `{ orderId, status }` | Bắn ra khi trạng thái đơn thay đổi |

---
*Documented by Member 1 - Week 2*
