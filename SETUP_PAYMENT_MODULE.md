# 🚀 SETUP INSTRUCTIONS - Payment Module

## Prerequisites
- Node.js ≥ 18
- PostgreSQL ≥ 13
- Git

---

## Step 1: Install Dependencies

```bash
cd packages/backend

# Install @nestjs/schedule for CRON support
npm install @nestjs/schedule

# Verify installation
npm list @nestjs/schedule
# Should show: @nestjs/schedule@X.X.X
```

---

## Step 2: Enable ScheduleModule in App Module

Edit: `packages/backend/src/app.module.ts`

**Uncomment these lines**:
```typescript
// Line 5
import { ScheduleModule } from '@nestjs/schedule';

// Line 78 (approx)
ScheduleModule.forRoot(),
```

Should look like:
```typescript
import { ScheduleModule } from '@nestjs/schedule';  // ✓ Uncommented

@Module({
  imports: [
    // ...
    ScheduleModule.forRoot(),  // ✓ Uncommented
    // ...
  ],
})
```

---

## Step 3: Database Migration

### Option A: PostgreSQL CLI
```bash
# Connect to PostgreSQL
psql -U postgres -d restaurant_db

# Run migration
\i database/migrations/payment.sql

# Verify
\dt payment;  -- Should show payment table

# Optional: Run seeder
\i database/seeders/payment.seed.sql
```

### Option B: pgAdmin GUI
1. Open pgAdmin
2. Servers → PostgreSQL → Databases → restaurant_db
3. Tools → Query Tool
4. Open `database/migrations/payment.sql`
5. Execute (F5)
6. Verify in Tables → payment

### Option C: TypeORM Synchronize (Dev Only)
```bash
# In .env
DB_SYNC=true

# Start backend (will auto-create tables)
npm run start:dev

# Then set back to false
DB_SYNC=false
npm run start:dev
```

---

## Step 4: Configure Environment Variables

Edit: `packages/backend/.env`

```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=restaurant_db

# MoMo (Get from MoMo partner dashboard)
MOMO_PARTNER_CODE=MOMO123
MOMO_PARTNER_NAME=Your Restaurant Name
MOMO_SECRET_KEY=your_secret_key_here
MOMO_PUBLIC_KEY=your_public_key_here

# Development
DB_SYNC=false
NODE_ENV=development

# Optional
JWT_SECRET=your_jwt_secret_here
```

---

## Step 5: Verify Installation

### Check TypeORM Entity Registration
```bash
# In app.module.ts, verify Payment entity is in entities array
entities: [
  // ...
  Payment,  // ✓ Should be here
  // ...
]
```

### Check Payment Module Config
```bash
# In payment.module.ts, verify TypeOrmModule and Task:
imports: [
  ConfigModule,
  OrderModule,
  TypeOrmModule.forFeature([Payment])  # ✓ Should be here
],
providers: [
  PaymentService,
  PaymentRepository,
  MomoService,
  PaymentTimeoutTask  # ✓ Should be here
],
```

---

## Step 6: Start Backend

```bash
cd packages/backend

# Start in development mode
npm run start:dev

# You should see:
# [Nest] ... - 01/08/2025, 10:00:00 AM     LOG [NestFactory] Starting Nest application...
# [Nest] ... - 01/08/2025, 10:00:00 AM     LOG [TypeOrmModule] Database connected
# [Nest] ... - 01/08/2025, 10:00:00 AM     LOG [InstanceLoader] PaymentModule dependencies initialized
# [Nest] ... - 01/08/2025, 10:00:00 AM     LOG [ScheduleService] Scheduled tasks registered...
# [Nest] ... - 01/08/2025, 10:00:01 AM     LOG [NestApplication] Nest application successfully started
```

---

## Step 7: Quick Test

### Test 1: Health Check
```bash
curl http://localhost:3000/

# Should respond with something (depends on your API setup)
```

### Test 2: Create Payment
```bash
curl -X POST http://localhost:3000/payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "11111111-1111-1111-1111-111111111111",
    "amount": 100000,
    "method": "momo"
  }'

# Should return: { id, orderId, amount, method, status: "pending", ... }

# Check backend logs:
# [PAYMENT_CREATE] paymentId=..., orderId=..., amount=100000, method=momo, status=pending
```

### Test 3: Check Database
```bash
# In PostgreSQL
SELECT * FROM payment;

# Should show 1 record with status='pending'
```

### Test 4: Verify CRON is Running
```bash
# Backend logs should show every minute:
# [PAYMENT_CRON_START] timestamp=...
# [PAYMENT_CRON_FOUND] Found 0 pending payments...
# [PAYMENT_CRON_END] processedCount=0

# Wait 5+ minutes on a pending payment, then CRON should update it to expired
```

---

## 🔧 Troubleshooting

### Error: `Cannot find module '@nestjs/schedule'`
**Solution**: Run `npm install @nestjs/schedule`

### Error: `PaymentRepository not found`
**Solution**: 
- Check `payment.module.ts` has `TypeOrmModule.forFeature([Payment])`
- Check `payment.repository.ts` has `@Injectable()` decorator

### Error: `Database connection failed`
**Solution**:
- Check `.env` database credentials
- Verify PostgreSQL is running
- Check database `restaurant_db` exists

### Error: `CRON not running (no logs every minute)`
**Solution**:
- Check `app.module.ts` has `ScheduleModule.forRoot()` uncommented
- Check `payment.module.ts` includes `PaymentTimeoutTask` in providers
- Check backend is running in development mode (start:dev)

### Error: `rows_affected = 0 when updating payment`
**Solution**:
- Check payment exists in database
- Check status is correct before update
- Try creating a payment first

### Error: `MoMo Signature verification failed`
**Solution**:
- Check `MOMO_SECRET_KEY` in `.env` is correct
- Check MoMo IPN payload format
- Check MoMo endpoint is calling correct URL

---

## 📊 Verify Setup Success

When everything is set up correctly:

1. ✅ Backend starts without errors
2. ✅ Payment table exists in database
3. ✅ POST /payment creates record in DB
4. ✅ Logs show [PAYMENT_CREATE] event
5. ✅ CRON logs every 1 minute
6. ✅ No TypeScript compilation errors

---

## 📝 Next Steps

1. **Test all 7 scenarios** (see `PAYMENT_IMPLEMENTATION_GUIDE.md`)
2. **Review logs** for accuracy
3. **Check database** for data
4. **Deploy** to staging for team testing
5. **Start Phase 2**: Frontend Report Dashboard

---

## 💡 Tips

- Keep `.env` file secure, don't commit to Git
- Use MoMo sandbox for testing (MOMO_PARTNER_CODE with 'test' prefix)
- Monitor logs while testing (open 2 terminals: one for backend, one for logs)
- Test timeout by creating payment and waiting 5+ minutes
- Test race condition by sending IPN after CRON runs

---

## 📞 Support

If issues persist:
1. Check `PAYMENT_IMPLEMENTATION_GUIDE.md` troubleshooting section
2. Review backend logs
3. Check database query results
4. Contact team lead

---

**Setup Complete!** ✅
Ready to test payment module.
