-- Migration: Tạo views cho báo cáo (Report)

-- View 1: Doanh thu theo ngày
-- Dùng để hiển thị doanh thu daily/weekly/monthly
-- Lấy từ orders với status = 'completed'
CREATE OR REPLACE VIEW v_revenue_daily AS
SELECT 
  DATE(o.created_at) as report_date,
  SUM(o.total_amount) as total_revenue,
  COUNT(DISTINCT o.id) as total_orders,
  COUNT(DISTINCT o.id) as completed_orders
FROM orders o
WHERE o.status = 'completed'
GROUP BY DATE(o.created_at)
ORDER BY report_date DESC;

-- View 2: Bán chạy nhất (Best Sellers)
-- Dùng để hiển thị top items theo số lượng và doanh thu
CREATE OR REPLACE VIEW v_best_sellers AS
SELECT 
  mi.id,
  mi.name as item_name,
  COUNT(DISTINCT oi.id) as total_times_ordered,
  SUM(oi.quantity) as total_quantity_sold,
  SUM(oi.quantity * oi.price) as total_revenue,
  ROUND(AVG(oi.quantity * oi.price), 2) as avg_order_value
FROM order_items oi
JOIN menu_items mi ON oi.menu_item_id = mi.id
JOIN orders o ON oi.order_id = o.id
WHERE o.status IN ('completed', 'cancelled')
GROUP BY mi.id, mi.name
ORDER BY total_revenue DESC;

-- Demo seed data for report charts
-- First, ensure we have categories for menu items
INSERT INTO menu_categories (id, restaurant_id, name, status, display_order, created_at, updated_at)
VALUES
  ('f2415e64-3c10-4328-a4bd-38ccf73bceb5', '00000000-0000-0000-0000-000000000000', 'Fast Food', 'active', 1, NOW(), NOW()),
  ('8faf5753-52e1-4ea7-8d50-9634a3a15bbb', '00000000-0000-0000-0000-000000000000', 'Vietnamese', 'active', 2, NOW(), NOW()),
  ('cb66c5f5-9adf-4b6c-9293-ab91218e67cc', '00000000-0000-0000-0000-000000000000', 'Drinks', 'active', 3, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Then, ensure we have menu items with known UUIDs for testing
INSERT INTO menu_items (id, restaurant_id, category_id, name, price, status, created_at, updated_at)
VALUES
  ('607944e6-7b74-4cd2-8d51-972e67711111', '00000000-0000-0000-0000-000000000000', 'f2415e64-3c10-4328-a4bd-38ccf73bceb5', 'khoai tây chiên', 20000, 'available', NOW(), NOW()),
  ('88d458d4-ece1-4e22-9532-dd11e11ebebb', '00000000-0000-0000-0000-000000000000', '8faf5753-52e1-4ea7-8d50-9634a3a15bbb', 'phở tái', 50000, 'available', NOW(), NOW()),
  ('c5c45578-e427-4860-be40-6df1f9722666', '00000000-0000-0000-0000-000000000000', 'cb66c5f5-9adf-4b6c-9293-ab91218e67cc', 'cola', 10000, 'available', NOW(), NOW()),
  ('da5cc01b-2cdf-4aa8-b296-7cd221241cfd', '00000000-0000-0000-0000-000000000000', 'f2415e64-3c10-4328-a4bd-38ccf73bceb5', 'hamburger', 100000, 'available', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Orders with completed status
INSERT INTO orders (id, table_id, status, total_amount, created_at, updated_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 'completed', 85000, '2025-12-10 09:00:00', '2025-12-10 09:15:00'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, 'completed', 120000, '2025-12-22 13:15:00', '2025-12-22 13:30:00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 'completed', 40000, '2026-01-02 18:30:00', '2026-01-02 18:45:00'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 4, 'completed', 170000, '2026-01-08 11:50:00', '2026-01-08 12:05:00'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 5, 'completed', 230000, '2026-01-09 08:05:00', '2026-01-09 08:20:00')
ON CONFLICT (id) DO NOTHING;

-- Order items using real menu_item_id from database
INSERT INTO order_items (id, order_id, menu_item_id, quantity, price, created_at)
VALUES
  -- Order 1: 2 khoai tây chiên + 3 cola + 1 phở tái = 85000
  ('11111111-1111-0001-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '607944e6-7b74-4cd2-8d51-972e67711111', 2, 20000, '2025-12-10 09:00:00'),
  ('11111111-1111-0001-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c5c45578-e427-4860-be40-6df1f9722666', 3, 10000, '2025-12-10 09:00:00'),
  ('11111111-1111-0001-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '88d458d4-ece1-4e22-9532-dd11e11ebebb', 1, 50000, '2025-12-10 09:00:00'),
  
  -- Order 2: 1 hamburger + 1 khoai tây = 120000
  ('22222222-2222-0002-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'da5cc01b-2cdf-4aa8-b296-7cd221241cfd', 1, 100000, '2025-12-22 13:15:00'),
  ('22222222-2222-0002-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '607944e6-7b74-4cd2-8d51-972e67711111', 1, 20000, '2025-12-22 13:15:00'),
  
  -- Order 3: 2 cola + 1 khoai tây = 40000 (adjusted)
  ('33333333-3333-0003-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c5c45578-e427-4860-be40-6df1f9722666', 2, 10000, '2026-01-02 18:30:00'),
  ('33333333-3333-0003-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '607944e6-7b74-4cd2-8d51-972e67711111', 1, 20000, '2026-01-02 18:30:00'),
  
  -- Order 4: 1 hamburger + 1 phở tái + 1 khoai tây = 170000
  ('44444444-4444-0004-0000-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'da5cc01b-2cdf-4aa8-b296-7cd221241cfd', 1, 100000, '2026-01-08 11:50:00'),
  ('44444444-4444-0004-0000-000000000002', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '88d458d4-ece1-4e22-9532-dd11e11ebebb', 1, 50000, '2026-01-08 11:50:00'),
  ('44444444-4444-0004-0000-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '607944e6-7b74-4cd2-8d51-972e67711111', 1, 20000, '2026-01-08 11:50:00'),
  
  -- Order 5: 2 hamburger + 3 cola = 230000
  ('55555555-5555-0005-0000-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'da5cc01b-2cdf-4aa8-b296-7cd221241cfd', 2, 100000, '2026-01-09 08:05:00'),
  ('55555555-5555-0005-0000-000000000002', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'c5c45578-e427-4860-be40-6df1f9722666', 3, 10000, '2026-01-09 08:05:00')
ON CONFLICT (id) DO NOTHING;
