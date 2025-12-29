# Hướng dẫn setup & sử dụng chức năng Payment

## 1. Migration & Seed database

- Migration bảng payment:
  - File: `database/migrations/payment.sql`
  - Chạy lệnh (PostgreSQL):
    ```sh
    psql -U <user> -d <db> -f database/migrations/payment.sql
    ```
- Seed dữ liệu mẫu:
  - File: `database/seeders/payment.seed.sql`
  - Chạy lệnh:
    ```sh
    psql -U <user> -d <db> -f database/seeders/payment.seed.sql
    ```

## 2. Backend
- Source: `packages/backend/src/modules/payment/`
- Đảm bảo đã cấu hình kết nối DB, import PaymentModule vào AppModule.
- Các API mẫu:
  - `POST /api/payment` (tạo payment)
  - `GET /api/payment/:id` (xem chi tiết)
  - `GET /api/payment?orderId=...` (danh sách theo order)

## 3. Frontend
- Source: `packages/frontend/src/features/payment/`
- Đã có sẵn PaymentPage, PaymentForm, PaymentStatus, hook `usePayment`.
- Kết nối API qua file `services/paymentApi.ts`.

## 4. Biến môi trường
- Thêm các biến liên quan payment gateway (nếu có) vào `.env` backend.

## 5. Kiểm thử
- Tạo đơn hàng, thực hiện thanh toán thử trên UI.
- Kiểm tra trạng thái payment trên DB và qua API.

## 6. Ghi chú
- Tuần 1 chỉ cần mock API, chưa cần tích hợp thật với Stripe/MoMo.
- Đảm bảo separation of concerns, code rõ ràng, có comment.

---
Mọi thắc mắc trao đổi qua nhóm hoặc ghi chú trực tiếp vào file này.