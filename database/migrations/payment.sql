-- Migration: Tạo bảng payment
CREATE TABLE IF NOT EXISTS payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    method VARCHAR(32) NOT NULL, -- 'stripe', 'momo', ...
    status VARCHAR(32) NOT NULL, -- 'pending', 'success', 'failed', ...
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Index cho order_id
CREATE INDEX IF NOT EXISTS idx_payment_order_id ON payment(order_id);