# Database Emergency Plan - Wallet Schema Conflicts

## Created: July 5, 2025 - 19:00 GMT
## Priority: CRITICAL - Blocks all wallet functionality

---

## 🚨 SITUATION ANALYSIS

### **Critical Discovery:**
During wallet system integration, we discovered that **an existing wallet system exists in production with fundamentally broken schema constraints**. The current implementation cannot handle multiple transactions per wallet due to an incorrect unique constraint.

### **Impact:**
- **Revenue Protection**: VM provisioning cannot validate wallet balances properly
- **Transaction History**: Impossible to track wallet transaction history
- **Business Logic**: One transaction per wallet breaks billing and top-up functionality

### **Root Cause:**
Previous wallet implementation used wrong database relationship model:
- **Current (Wrong)**: One-to-one relationship (wallet ↔ single transaction)
- **Required (Correct)**: One-to-many relationship (wallet ↔ multiple transactions)

---

## 📊 DATABASE ASSESSMENT

### **3 Active Databases:**
1. **`datacentrix_cloud_local`** (Main) - **WALLET CONFLICT HERE**
2. **`aas_product_local`** (AAS Products) - No conflicts
3. **`enetworks_product_local`** (E-Networks) - No conflicts

### **Current Data State (SAFE):**
```
OrganisationWallet table: 1 record
wallet_transactions table: 0 records
Risk Level: LOW (minimal data loss risk)
```

### **Schema Conflict Details:**
```sql
-- CURRENT (WRONG) - Has unique constraint
CREATE UNIQUE INDEX "wallet_transactions_walletId_key" ON "wallet_transactions"("walletId");

-- REQUIRED (CORRECT) - No unique constraint
-- walletId should allow multiple transactions per wallet
```

---

## 🛠️ EMERGENCY FIX PLAN

### **Execution Time: 8 minutes total**
### **Risk Level: LOW (0 transactions to lose)**

---

## **STEP 1: Environment Configuration Fix (1 minute)**

**Problem**: Frontend wallet system cannot connect to database
**Solution**: Add missing DATABASE_URL

```bash
# Add to /Users/garsensubramoney/gs_projects/dcx/dcx-cloud-frontend/backend.env
echo 'DATABASE_URL="postgresql://garsensubramoney:@localhost:5432/datacentrix_cloud_local"' >> backend.env
```

**Verification:**
```bash
grep DATABASE_URL backend.env
# Should show: DATABASE_URL="postgresql://garsensubramoney:@localhost:5432/datacentrix_cloud_local"
```

---

## **STEP 2: Remove Wrong Database Constraint (2 minutes)**

**Problem**: Unique constraint prevents multiple transactions per wallet
**Solution**: Remove the incorrect unique index

```sql
-- Connect to database
psql -h localhost -U garsensubramoney -d datacentrix_cloud_local

-- Remove the wrong constraint
DROP INDEX IF EXISTS "wallet_transactions_walletId_key";

-- Verify removal
\d wallet_transactions
-- Should NOT show unique constraint on walletId

-- Exit
\q
```

**Safety Check:**
```sql
-- Verify data integrity before and after
SELECT COUNT(*) FROM "OrganisationWallet";  -- Should be 1
SELECT COUNT(*) FROM "wallet_transactions";  -- Should be 0
```

---

## **STEP 3: Fix Frontend Schema Alignment (5 minutes)**

**Problem**: Frontend schema expects wrong table names
**Solution**: Update schema to match database reality

### **3a. Update Prisma Schema (2 minutes)**

```bash
# Update /Users/garsensubramoney/gs_projects/dcx/dcx-cloud-frontend/src/prisma/schema.prisma
```

**Fix table mapping:**
```prisma
model OrganisationWallet {
  id             String   @id @default(uuid())
  organisationId String   @unique
  balance        Int      @default(0)
  currency       String   @default("ZAR")
  threshold      Int?
  topupAmount    Int?
  enabled        Boolean  @default(true)
  updatedAt      DateTime @updatedAt
  createdAt      DateTime @default(now())

  // Remove the incorrect @@map("organisation_wallets") 
  // Use actual table name: OrganisationWallet
  wallet_transactions WalletTransactions[]
}

model WalletTransactions {
  id          String          @id @default(uuid())
  walletId    String          // Remove @unique - allow multiple transactions
  amount      Float           
  type        TransactionType 
  description String?         
  createdAt   DateTime        @default(now()) @db.Timestamptz(3)

  organisationwallet OrganisationWallet @relation(fields: [walletId], references: [id])
  @@map("wallet_transactions")
}
```

### **3b. Regenerate Prisma Client (1 minute)**

```bash
npx prisma generate --schema src/prisma/schema.prisma
```

### **3c. Test Compilation (2 minutes)**

```bash
# Test wallet services compile correctly
npx tsc --noEmit --skipLibCheck src/services/wallet/*.ts
npx tsc --noEmit --skipLibCheck src/utils/prisma.ts

# Should show no errors
```

---

## **STEP 4: Validation & Testing (Additional 5 minutes)**

### **4a. Test Database Connection**
```bash
# Test Prisma can connect
npx prisma db push --schema src/prisma/schema.prisma --accept-data-loss
```

### **4b. Test Wallet Service**
```typescript
// Quick test script
import { prisma } from './src/utils/prisma';

async function testWallet() {
  const wallets = await prisma.organisationWallet.findMany();
  console.log('Wallets found:', wallets.length);
  
  // Test creating multiple transactions (should work now)
  if (wallets.length > 0) {
    const testTransaction1 = await prisma.walletTransactions.create({
      data: {
        walletId: wallets[0].id,
        amount: 100,
        type: 'credit',
        description: 'Test transaction 1'
      }
    });
    
    const testTransaction2 = await prisma.walletTransactions.create({
      data: {
        walletId: wallets[0].id,
        amount: -50,
        type: 'debit', 
        description: 'Test transaction 2'
      }
    });
    
    console.log('Multiple transactions created successfully!');
    
    // Cleanup test data
    await prisma.walletTransactions.deleteMany({
      where: { description: { startsWith: 'Test transaction' } }
    });
  }
}

testWallet().then(() => process.exit(0));
```

---

## 🎯 SUCCESS CRITERIA

### **Immediate Success (8 minutes):**
- [ ] DATABASE_URL environment variable added
- [ ] Unique constraint on walletId removed from database
- [ ] Frontend schema matches database structure
- [ ] Prisma client generates without errors
- [ ] Wallet services compile without TypeScript errors

### **Functional Success (Additional 10 minutes):**
- [ ] Can create multiple transactions for same wallet
- [ ] Wallet balance calculations work correctly
- [ ] VM provisioning validation functions properly
- [ ] All 5 wallet test suites pass

---

## 🔄 ROLLBACK PLAN

**If anything goes wrong:**

### **Step 1: Database Rollback**
```sql
-- Restore unique constraint if needed
CREATE UNIQUE INDEX "wallet_transactions_walletId_key" ON "wallet_transactions"("walletId");
```

### **Step 2: Environment Rollback**
```bash
# Remove DATABASE_URL from backend.env if needed
sed -i '/DATABASE_URL=/d' backend.env
```

### **Step 3: Schema Rollback**
```bash
# Restore original schema from git
git checkout HEAD -- src/prisma/schema.prisma
npx prisma generate --schema src/prisma/schema.prisma
```

---

## 📈 BUSINESS IMPACT

### **Before Fix:**
- **❌ No wallet transaction history**
- **❌ Cannot track billing cycles**
- **❌ VM provisioning unprotected**
- **❌ No revenue validation**

### **After Fix:**
- **✅ Complete transaction history tracking**
- **✅ Multiple transactions per wallet**
- **✅ VM provisioning validates wallet balance**
- **✅ Revenue protection enabled**
- **✅ Billing automation possible**
- **✅ Auto top-up functionality**

---

## 🚀 RECOMMENDATION

**EXECUTE IMMEDIATELY** - This is a foundational fix that enables all wallet functionality. The risk is minimal (no transaction data to lose) and the business impact is critical (revenue protection).

**Estimated Total Time**: 8 minutes of focused work
**Risk Level**: LOW
**Business Impact**: HIGH
**Technical Debt Reduction**: CRITICAL

**Next Steps After Fix:**
1. Run Garsen's wallet population scripts
2. Enable wallet API routes  
3. Test VM provisioning flow
4. Deploy to staging environment