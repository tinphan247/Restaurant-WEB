-- Seed dữ liệu mẫu cho bảng payment
-- Xóa dữ liệu cũ (nếu có)
DELETE FROM payment WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004'
);

-- Thêm các payment mẫu
INSERT INTO payment (
  id, 
  order_id, 
  amount, 
  method, 
  status, 
  momo_trans_id, 
  momo_error_code, 
  momo_message,
  expired_at,
  created_at, 
  updated_at
) VALUES
-- Payment thành công qua MoMo
('00000000-0000-0000-0000-000000000001', 
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 
  200000, 
  'momo', 
  'success', 
  '3046512345', 
  NULL, 
  'Giao dịch thành công',
  NULL,
  NOW() - INTERVAL '1 hour', 
  NOW() - INTERVAL '1 hour'),

-- Payment đang pending
('00000000-0000-0000-0000-000000000002', 
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
  150000, 
  'momo', 
  'pending', 
  NULL, 
  NULL, 
  NULL,
  NULL,
  NOW() - INTERVAL '2 minutes', 
  NOW() - INTERVAL '2 minutes'),

-- Payment expired (hết hạn sau 5 phút)
('00000000-0000-0000-0000-000000000003', 
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 
  180000, 
  'momo', 
  'expired', 
  NULL, 
  NULL, 
  NULL,
  NOW() - INTERVAL '10 minutes',  -- expired_at timestamp
  NOW() - INTERVAL '20 minutes', 
  NOW() - INTERVAL '10 minutes'),

-- Payment failed
('00000000-0000-0000-0000-000000000004', 
  (SELECT id FROM orders WHERE status='cancelled' LIMIT 1 OFFSET 1), 
  50000, 
  'momo', 
  'failed', 
  '3046512346', 
  '1006', 
  'Giao dịch thất bại. Khách hàng hủy thanh toán',
  NULL,
  NOW() - INTERVAL '30 minutes', 
  NOW() - INTERVAL '30 minutes');