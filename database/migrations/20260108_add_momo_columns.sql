-- Add MoMo-related columns to payment table
ALTER TABLE IF EXISTS payment
    ADD COLUMN IF NOT EXISTS momo_trans_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS momo_error_code VARCHAR(50),
    ADD COLUMN IF NOT EXISTS momo_message VARCHAR(500);
