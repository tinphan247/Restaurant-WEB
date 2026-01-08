# Payment Module - Tích Hợp MoMo & Xử Lý Trạng Thái Thanh Toán

## 📋 Tổng Quan

Module thanh toán hiện tại:
- ✅ Lưu trữ payment vào **DB thật** (PostgreSQL qua TypeORM)
- ✅ Xử lý trạng thái: `pending → expired → success/failed`
- ✅ Tích hợp **MoMo** với IPN callback & query status
- ✅ **Cron job** auto-timeout payment sau 5 phút
- ✅ **Race condition protection** giữa IPN và CRON
- ✅ **Logging đầy đủ** cho audit trail tài chính

---

## 🏗️ Cấu Trúc File

```
packages/backend/src/modules/payment/
├── entities/
│   └── payment.entity.ts          # TypeORM Entity + Enums
├── payment.repository.ts           # DAO layer (DB interaction)
├── payment.service.ts              # Business logic & state machine
├── payment.controller.ts           # API endpoints
├── payment.module.ts               # Module config
├── momo.service.ts                 # MoMo API client
├── dto/
│   ├── create-payment.dto.ts
│   ├── create-momo-payment.dto.ts
│   ├── momo-ipn.dto.ts
│   ├── momo-query.dto.ts
│   └── update-payment.dto.ts
├── interfaces/
│   └── payment.interface.ts        # IPayment interface
├── strategies/                     # (Placeholder for future)
├── config/                         # (Placeholder for future)
└── tasks/
    └── payment-timeout.task.ts     # Cron task (EVERY_MINUTE)
```

---

## 🔄 Luồng Trạng Thái Thanh Toán

```
┌─────────────────────────────────────────────────────────┐
│                    PAYMENT LIFECYCLE                     │
└─────────────────────────────────────────────────────────┘

1. KHỞI TẠO (CREATE)
   ├─ Trạng thái: pending
   ├─ Log: [PAYMENT_CREATE]
   └─ Lưu vào DB ✓

2. ĐỢPHÂN HOẶC TIMEOUT (5 phút)
   ├─ IPN từ MoMo → Update status
   │  ├─ resultCode = 0   → success
   │  ├─ resultCode ≠ 0   → failed
   │  └─ Log: [PAYMENT_SUCCESS] / [PAYMENT_FAILED]
   │
   └─ CRON timeout → pending → expired
      └─ Log: [PAYMENT_EXPIRED]

3. RACE CONDITION CHECK
   ├─ Nếu đã success → SKIP
   ├─ Nếu không phải pending/expired → SKIP
   └─ Log: [PAYMENT_RACE_CONDITION]
```

---

## 📝 Logging Events

### 1️⃣ CREATE Payment
```
[PAYMENT_CREATE] paymentId=xxx, orderId=yyy, amount=100000, 
method=momo, status=pending, timestamp=2025-01-08T10:00:00Z
```

### 2️⃣ MoMo IPN Received
```
[PAYMENT_IPN_RECEIVED] orderId=yyy, paymentId=xxx, 
momoPayload={...}, timestamp=...

[PAYMENT_IPN_VERIFIED] orderId=yyy

[PAYMENT_SUCCESS] paymentId=xxx, orderId=yyy, 
previousStatus=pending, momoTransId=abc123, 
amount=100000, timestamp=...

[PAYMENT_FAILED] paymentId=xxx, orderId=yyy, 
previousStatus=pending, momoErrorCode=1003, 
momoMessage=Insufficient balance, timestamp=...
```

### 3️⃣ Race Condition Skip
```
[PAYMENT_RACE_CONDITION] paymentId=xxx, orderId=yyy, 
currentStatus=success, source=IPN, action=SKIPPED, 
reason=already_success, timestamp=...

[PAYMENT_RACE_CONDITION] paymentId=xxx, orderId=yyy, 
currentStatus=success, source=CRON, action=SKIPPED, 
reason=not_pending, timestamp=...
```

### 4️⃣ CRON Timeout
```
[PAYMENT_CRON_START] timestamp=2025-01-08T10:00:00Z

[PAYMENT_CRON_FOUND] Found 5 pending payments older than 5 minutes

[PAYMENT_EXPIRED] paymentId=xxx, orderId=yyy, 
expiredAt=2025-01-08T10:05:00Z, pendingDuration=305 seconds

[PAYMENT_CRON_UPDATE] paymentId=xxx, orderId=yyy, 
from=pending, to=expired

[PAYMENT_CRON_END] processedCount=5, timestamp=2025-01-08T10:00:30Z
```

### 5️⃣ SQL Errors
```
[SQL] INSERT payment - id=xxx, orderId=yyy
[SQL] SELECT payment by orderId - orderId=yyy
[SQL_ERROR] UPDATE payment failed - id=xxx, error=Connection timeout
[SQL_WARNING] UPDATE payment rows_affected=0 - id=xxx, status=success
```

---

## 📊 Payment Entity Schema

```sql
CREATE TABLE payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    method ENUM ('stripe', 'momo', 'cash') DEFAULT 'momo',
    status ENUM ('pending', 'expired', 'success', 'failed') DEFAULT 'pending',
    momo_trans_id VARCHAR(255) NULLABLE,
    momo_error_code VARCHAR(50) NULLABLE,
    momo_message VARCHAR(500) NULLABLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX (order_id),
    INDEX (status),
    INDEX (created_at)
);
```

---

## 🔌 API Endpoints

### 1. Create Payment (Legacy)
```
POST /payment
{
  "orderId": "uuid",
  "amount": 100000,
  "method": "momo" | "stripe" | "cash"
}

Response:
{
  "id": "payment-uuid",
  "orderId": "order-uuid",
  "amount": 100000,
  "method": "momo",
  "status": "pending",
  "createdAt": "2025-01-08T10:00:00Z",
  "updatedAt": "2025-01-08T10:00:00Z"
}
```

### 2. Create MoMo Payment
```
POST /payment/momo/create
{
  "orderId": "uuid",
  "amount": 100000
}

Response:
{
  "paymentId": "payment-uuid",
  "orderId": "order-uuid",
  "requestId": "order-uuid",
  "momo": {
    "payUrl": "https://test-payment.momo.vn/...",
    "deeplink": "momo://..."
  }
}
```

### 3. MoMo IPN Callback (AUTO)
```
POST /payment/momo/ipn
{
  "partnerCode": "MOMO",
  "orderId": "order-uuid",
  "requestId": "order-uuid",
  "amount": 100000,
  "transId": 1234567890,
  "resultCode": 0,
  "message": "Success",
  "signature": "xxx"
}

Response:
{
  "ok": true,
  "status": "success" | "failed"
}
```

### 4. Query MoMo Payment
```
POST /payment/momo/query
{
  "orderId": "order-uuid",
  "requestId": "order-uuid"
}

Response:
{
  "resultCode": 0,
  "transId": 1234567890,
  "amount": 100000,
  "message": "Success"
}
```

### 5. Get All Payments
```
GET /payment

Response:
[
  {
    "id": "payment-uuid",
    "orderId": "order-uuid",
    "amount": 100000,
    "method": "momo",
    "status": "success",
    "momoTransId": "trans-123",
    "createdAt": "2025-01-08T10:00:00Z",
    "updatedAt": "2025-01-08T10:05:00Z"
  }
]
```

### 6. Get Payment by ID
```
GET /payment/:id

Response:
{
  "id": "payment-uuid",
  "orderId": "order-uuid",
  "amount": 100000,
  "method": "momo",
  "status": "success",
  "momoTransId": "trans-123",
  "createdAt": "2025-01-08T10:00:00Z",
  "updatedAt": "2025-01-08T10:05:00Z"
}
```

---

## ⚙️ Cấu Hình & Khởi Động

### 1. Cài Đặt Dependencies
```bash
npm install @nestjs/schedule
```

### 2. Environment Variables (.env)
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=restaurant_db

MOMO_PARTNER_CODE=MOMO...
MOMO_PARTNER_NAME=...
MOMO_SECRET_KEY=...
MOMO_PUBLIC_KEY=...

# Optional
DB_SYNC=false  # Set true để auto-create tables (dev only)
```

### 3. Database Migration
```bash
npm run typeorm migration:run
# Or manually run: database/migrations/payment.sql
```

### 4. Seed Data
```bash
# Manually run: database/seeders/payment.seed.sql
```

### 5. Start Backend
```bash
npm run start:dev
```

---

## 🎯 Xử Lý Race Condition

### Scenario 1: IPN arrives late
```
1. CRON runs → pending → expired (T=5min)
2. IPN arrives late → Check status = expired ✓ (valid)
   → Update expired → success
   → Log: [PAYMENT_RACE_CONDITION] source=IPN, action=SKIPPED (if already success)
```

### Scenario 2: IPN arrives before CRON
```
1. IPN arrives → pending → success (T=2min)
2. CRON runs → Check status = success → SKIP
   → Log: [PAYMENT_RACE_CONDITION] source=CRON, action=SKIPPED, reason=not_pending
```

### Scenario 3: Multiple IPN callbacks
```
1. IPN #1 → pending → success
2. IPN #2 → Check status = success → SKIP
   → Log: [PAYMENT_RACE_CONDITION] source=IPN, action=SKIPPED, reason=already_success
```

---

## 🔐 Security Notes

1. **Signature Verification**: Mọi IPN callback từ MoMo phải đúng signature
2. **Idempotency**: Xử lý multiple IPN callbacks an toàn
3. **State Immutability**: `success` là trạng thái cuối cùng, không update thêm
4. **DB Transaction**: Update status + order status trong 1 transaction
5. **Logging Audit**: Mọi thay đổi được log cho audit trail

---

## 📈 Monitoring & Debugging

### Xem Payment Logs
```bash
# Docker
docker logs backend-container | grep "\[PAYMENT_"

# File logs (nếu có)
tail -f logs/payment.log
```

### Trace Payment Flow
```
1. Payment created → [PAYMENT_CREATE]
2. Waiting for IPN → (silent)
3. IPN received → [PAYMENT_IPN_RECEIVED]
4. IPN processed → [PAYMENT_SUCCESS] / [PAYMENT_FAILED]
   or [PAYMENT_RACE_CONDITION]
5. Order synced → [PAYMENT_ORDER_SYNC]
```

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Payment stuck in pending | IPN callback failed | Re-send IPN or timeout |
| Race condition detected | Timing issue | Check logs, wait for CRON |
| rows_affected=0 | Payment not found | Check DB connection |
| Signature error | Payload corrupted | Verify MoMo payload |

---

## 🚀 Future Improvements

1. **Stripe Integration**: Add PaymentMethod.STRIPE
2. **Refund Handling**: pending → refunding → refunded
3. **Webhook Retry**: Queue IPN callbacks nếu fail
4. **Analytics Dashboard**: Revenue, payment status distribution
5. **Multi-currency**: Support multiple currencies
6. **Encryption**: Encrypt sensitive fields (trans_id, error_code)

---

## 📞 Support

Câu hỏi? Lỗi? Liên hệ developer responsible cho payment module.
