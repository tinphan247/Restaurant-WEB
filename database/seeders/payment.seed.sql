-- Seed dữ liệu mẫu cho bảng payment
INSERT INTO payment (id, order_id, amount, method, status, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 250000, 'stripe', 'success', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 150000, 'momo', 'pending', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 50000, 'cash', 'failed', NOW(), NOW());