-- Migration: Tạo bảng payment
CREATE TABLE IF NOT EXISTS payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    method VARCHAR(32) NOT NULL DEFAULT 'momo', -- 'stripe', 'momo', 'cash'
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- 'pending', 'expired', 'success', 'failed'
    momo_trans_id VARCHAR(255),
    momo_error_code VARCHAR(50),
    momo_message VARCHAR(500),
    expired_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_payment_order_id ON payment(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment(status);
CREATE INDEX IF NOT EXISTS idx_payment_created_at ON payment(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_expired_at ON payment(expired_at) WHERE status = 'expired';
CREATE INDEX IF NOT EXISTS idx_payment_status_expired_at ON payment(status, expired_at);