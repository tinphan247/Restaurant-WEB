# Payment Module - Implementation & Testing Guide

## 🎯 Objective Checklist

Người 2 phụ trách: **Payment & Báo cáo**

### ✅ Đã Hoàn Thành

#### Backend
- ✅ **Payment Module**:
  - Entity: PaymentEntity với TypeORM (@Entity)
  - Repository: PaymentRepository với DB queries
  - Service: PaymentService với state machine logic
  - Controller: PaymentController (không đổi)
  
- ✅ **MoMo Integration**:
  - Create payment → MoMo gateway
  - IPN callback handler → Verify + Update status
  - Query payment → Check status from MoMo
  
- ✅ **Cron Timeout**:
  - PaymentTimeoutTask (runs every 1 minute)
  - Auto-timeout pending payments ≥5 minutes to expired
  
- ✅ **Logging**:
  - [PAYMENT_CREATE], [PAYMENT_SUCCESS], [PAYMENT_FAILED]
  - [PAYMENT_EXPIRED], [PAYMENT_CRON_*], [PAYMENT_RACE_CONDITION]
  - [SQL], [SQL_ERROR], [SQL_WARNING]

#### Database
- ✅ **Migration**: `database/migrations/payment.sql`
  - Bảng payment với all fields
  - Indexes trên orderId, status, createdAt
  
- ✅ **Seeder**: `database/seeders/payment.seed.sql`
  - 3 sample records (stripe success, momo pending, cash failed)

#### Documentation
- ✅ **API Docs**: `docs/payment_report_README.md`
  - Payment lifecycle
  - Logging events
  - Schema
  - Endpoints
  - Configuration
  - Security notes

---

## 📋 Còn Thiếu (PHASE 2)

### Frontend - Report Dashboard
- ⏳ Revenue analytics page
- ⏳ Best seller products
- ⏳ Charts & visualizations
- ⏳ Admin dashboard integration

### Database - Report Schema
- ⏳ `database/migrations/report.sql`
- ⏳ `database/seeders/report.seed.sql`

### Documentation - Report
- ⏳ Báo cáo README

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd packages/backend
npm install @nestjs/schedule  # For CRON support

# Verify installed
npm list @nestjs/schedule
```

### 2. Setup Database
```bash
# In PostgreSQL client or GUI (e.g., pgAdmin)
# Run migration
\i database/migrations/payment.sql

# Optional: Seed sample data
\i database/seeders/payment.seed.sql

# Verify tables
\dt payment;  -- Should show payment table
```

### 3. Configure Environment
```bash
# Edit packages/backend/.env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=restaurant_db

MOMO_PARTNER_CODE=MOMO123
MOMO_PARTNER_NAME=Your Restaurant
MOMO_SECRET_KEY=xxxxx
MOMO_PUBLIC_KEY=xxxxx

# Only for dev/test
DB_SYNC=false
```

### 4. Start Backend
```bash
cd packages/backend
npm run start:dev

# You should see:
# [Nest] ... - 01/08/2025, 10:00:00 AM     LOG [NestFactory] Starting Nest application...
# [Nest] ... - 01/08/2025, 10:00:00 AM     LOG [InstanceLoader] PaymentModule dependencies initialized
# [Nest] ... - 01/08/2025, 10:00:00 AM     LOG [InstanceLoader] ScheduleModule dependencies initialized
# [Nest] ... - 01/08/2025, 10:00:01 AM     LOG [ScheduleService] Scheduled tasks registered...
```

---

## 🧪 Testing Scenarios

### Test 1: Create Payment
```bash
curl -X POST http://localhost:3000/payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "11111111-1111-1111-1111-111111111111",
    "amount": 100000,
    "method": "momo"
  }'

# Expected Response:
# {
#   "id": "uuid",
#   "orderId": "11111111-1111-1111-1111-111111111111",
#   "amount": 100000,
#   "method": "momo",
#   "status": "pending",
#   "createdAt": "2025-01-08T10:00:00.000Z",
#   "updatedAt": "2025-01-08T10:00:00.000Z"
# }

# Check logs:
# [PAYMENT_CREATE] paymentId=..., orderId=..., amount=100000, method=momo, status=pending
```

### Test 2: Create MoMo Payment
```bash
curl -X POST http://localhost:3000/payment/momo/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "22222222-2222-2222-2222-222222222222",
    "amount": 250000
  }'

# Expected Response:
# {
#   "paymentId": "uuid",
#   "orderId": "22222222-2222-2222-2222-222222222222",
#   "requestId": "22222222-2222-2222-2222-222222222222",
#   "momo": {
#     "payUrl": "https://test-payment.momo.vn/...",
#     "deeplink": "momo://..."
#   }
# }
```

### Test 3: Simulate MoMo IPN Callback
```bash
# Success case
curl -X POST http://localhost:3000/payment/momo/ipn \
  -H "Content-Type: application/json" \
  -d '{
    "partnerCode": "MOMO",
    "orderId": "22222222-2222-2222-2222-222222222222",
    "requestId": "22222222-2222-2222-2222-222222222222",
    "amount": 250000,
    "transId": 1234567890,
    "resultCode": 0,
    "message": "Success",
    "signature": "valid_signature_here"
  }'

# Expected logs:
# [PAYMENT_IPN_RECEIVED] orderId=..., paymentId=...
# [PAYMENT_IPN_VERIFIED] orderId=...
# [PAYMENT_SUCCESS] paymentId=..., orderId=..., previousStatus=pending, momoTransId=1234567890

# Check DB:
SELECT * FROM payment WHERE order_id = '22222222-2222-2222-2222-222222222222';
# Should show: status=success, momo_trans_id=1234567890
```

### Test 4: Check Timeout (Wait 5+ minutes)
```bash
# Create a payment and wait 5+ minutes
# CRON will run every 1 minute and update pending → expired

# Check logs:
# [PAYMENT_CRON_START] timestamp=...
# [PAYMENT_CRON_FOUND] Found X pending payments older than 5 minutes
# [PAYMENT_CRON_UPDATE] paymentId=..., orderId=..., from=pending, to=expired
# [PAYMENT_EXPIRED] paymentId=..., orderId=..., expiredAt=..., pendingDuration=300+ seconds
# [PAYMENT_CRON_END] processedCount=X

# Check DB:
SELECT * FROM payment WHERE status = 'expired';
```

### Test 5: Race Condition (IPN after timeout)
```bash
# 1. Create payment
# 2. Wait 5+ minutes → CRON updates pending → expired
# 3. Send IPN with resultCode=0

# Expected behavior:
# - Check status = expired ✓
# - Update expired → success
# - Log: [PAYMENT_SUCCESS] previousStatus=expired

# Or if IPN comes first:
# - Update pending → success
# - Then CRON runs
# - Check status = success
# - Log: [PAYMENT_RACE_CONDITION] currentStatus=success, source=CRON, action=SKIPPED
```

### Test 6: Duplicate IPN
```bash
# Send same IPN twice

# First IPN:
# - pending → success
# - Log: [PAYMENT_SUCCESS]

# Second IPN:
# - Check status = success
# - Skip (already success)
# - Log: [PAYMENT_RACE_CONDITION] currentStatus=success, source=IPN, 
#        action=SKIPPED, reason=already_success
```

### Test 7: Query Payment
```bash
curl http://localhost:3000/payment/11111111-1111-1111-1111-111111111111

# Expected Response:
# {
#   "id": "uuid",
#   "orderId": "11111111-1111-1111-1111-111111111111",
#   "amount": 100000,
#   "method": "momo",
#   "status": "success",
#   "momoTransId": "trans-123",
#   "createdAt": "2025-01-08T10:00:00Z",
#   "updatedAt": "2025-01-08T10:00:30Z"
# }
```

---

## 🔍 Debugging

### Enable Verbose Logging
```typescript
// In PaymentService, PaymentRepository
// Already enabled via this.logger.log(), this.logger.error()
// Check console output or logs file
```

### View All Payments in DB
```sql
SELECT * FROM payment;

-- View by status
SELECT * FROM payment WHERE status = 'pending';
SELECT * FROM payment WHERE status = 'success';
SELECT * FROM payment WHERE status = 'expired';
SELECT * FROM payment WHERE status = 'failed';

-- View by order
SELECT * FROM payment WHERE order_id = 'xxx';

-- View pending older than 5 minutes
SELECT * FROM payment WHERE status = 'pending' 
  AND created_at < NOW() - INTERVAL '5 minutes';
```

### View Logs
```bash
# Terminal output
# Logs are printed to console in development

# If using file logging:
tail -f logs/payment.log | grep "PAYMENT_"

# Filter by event
tail -f logs/payment.log | grep "\[PAYMENT_SUCCESS\]"
tail -f logs/payment.log | grep "\[PAYMENT_CRON"
tail -f logs/payment.log | grep "\[PAYMENT_RACE_CONDITION\]"
```

### Check CRON Status
```typescript
// Add this to a test endpoint to verify CRON is running
@Get('cron-status')
async getCronStatus() {
  const scheduleService = this.moduleRef.get(ScheduleService);
  return {
    cronJobs: scheduleService.getCronJobs(),
    intervals: scheduleService.getIntervals(),
  };
}
```

---

## 📊 Database Verification

```sql
-- Verify migration
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'payment';

-- Verify columns
\d payment;

-- Verify indexes
SELECT * FROM pg_indexes WHERE tablename = 'payment';

-- Count records
SELECT COUNT(*) FROM payment;
SELECT COUNT(*) FROM payment WHERE status = 'pending';
SELECT COUNT(*) FROM payment WHERE status = 'success';

-- Total revenue
SELECT SUM(amount) as total_revenue FROM payment WHERE status = 'success';
```

---

## ⚠️ Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `PaymentRepository not found` | Missing @Injectable() | Check decorators |
| `Cannot find Payment entity` | Missing TypeOrmModule.forFeature() | Add to payment.module.ts |
| `CRON not running` | ScheduleModule not imported | Add to app.module.ts |
| `DB connection error` | Wrong environment vars | Check DATABASE_* in .env |
| `rows_affected=0 on update` | Payment not exist | Check DB, create first |
| `MoMo signature error` | Payload corrupted | Verify MOMO_* keys |
| `IPN not received` | Firewall/CORS issue | Check network, enable CORS |
| `Status not updating` | Transaction issue | Check DB logs, retry |

---

## 📈 Next Steps (PHASE 2)

1. **Report Dashboard Frontend**:
   - Create `packages/frontend/src/features/report/`
   - Add revenue chart
   - Add best-seller list
   - Integrate with admin dashboard

2. **Report Schema**:
   - Create `database/migrations/report.sql`
   - Create `database/seeders/report.seed.sql`

3. **Report API**:
   - Create `packages/backend/src/modules/report/`
   - Implement revenue endpoint
   - Implement best-seller endpoint
   - Add date range filtering

4. **Testing**:
   - Unit tests for payment
   - E2E tests for payment flow
   - Performance tests for CRON

---

## ✅ Sign-off

- **Implemented by**: AI Assistant
- **Date**: 2025-01-08
- **Status**: ✅ COMPLETE (Backend Payment)
- **Remaining**: ⏳ Frontend Report Dashboard
