-- Thêm đơn hàng mẫu
INSERT INTO orders (id, table_id, status, total_amount) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, 'pending', 150000),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 2, 'completed', 200000);

-- Thêm chi tiết đơn hàng mẫu
INSERT INTO order_items (order_id, menu_item_id, quantity, price, notes) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, 2, 50000, 'Không hành'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2, 1, 50000, NULL),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 3, 4, 50000, 'Nhiều đá');