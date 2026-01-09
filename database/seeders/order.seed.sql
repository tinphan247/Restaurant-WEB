-- Seed dữ liệu mẫu cho bảng orders và order_items
-- Lưu ý: Chạy sau khi đã có dữ liệu trong bảng menu_items

-- Xóa dữ liệu cũ (nếu có)
DELETE FROM order_items WHERE order_id IN ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22');
DELETE FROM orders WHERE id IN ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22');

-- Thêm đơn hàng mẫu
INSERT INTO orders (id, table_id, status, total_amount) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, 'pending', 150000),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 2, 'completed', 200000),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 3, 'cancelled', 180000);

-- Thêm chi tiết đơn hàng mẫu
-- Lưu ý: Thay thế các UUID dưới đây bằng menu_item_id thực tế từ bảng menu_items
-- Hoặc chạy query để lấy menu_item_id: SELECT id FROM menu_items LIMIT 3;
INSERT INTO order_items (order_id, menu_item_id, quantity, price, notes) VALUES
-- Order 1: pending
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
  (SELECT id FROM menu_items LIMIT 1 OFFSET 0), 
  2, 50000, 'Không hành'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
  (SELECT id FROM menu_items LIMIT 1 OFFSET 1), 
  1, 50000, NULL),
-- Order 2: completed
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 
  (SELECT id FROM menu_items LIMIT 1 OFFSET 2), 
  4, 50000, 'Nhiều đá'),
-- Order 3: cancelled
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 
  (SELECT id FROM menu_items LIMIT 1 OFFSET 0), 
  3, 60000, NULL);