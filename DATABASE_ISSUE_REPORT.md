# Database Issue Report - Missing Products Table

**Date**: July 6, 2025  
**Server**: DaaS-DEV-2 (45.220.228.16)  
**Issue**: Critical missing table in AAS database causing API failures

## Problem Summary

The `products` table is missing from the `aas_bronze_production` database on our development server, causing the Products API endpoint to fail with a P2021 error.

## Technical Details

### Error Details
- **Error Code**: P2021 
- **Error Message**: "The table `aas_bronze_production.products` does not exist in the current database"
- **Affected Endpoint**: `/api/products/all`
- **Impact**: Customer dashboard products section non-functional

### Expected vs Actual Database State

**Expected** (according to Prisma schema):
```sql
-- Table should exist: products
-- Table should exist: categories  
-- Both tables with proper foreign key relationships
```

**Actual** (current database state):
```sql
-- products table: MISSING
-- categories table: Unknown status
-- Other tables: Present (terraform_vm_config exists)
```

### Code Evidence

**Prisma Schema Definition** (`/src/generated/client-aas/schema.prisma`):
```prisma
model Product {
  id         String @id @default(uuid())
  title      String
  price      Float
  cost       Float
  categoryId String
  code       String
  unit       Int    @default(1)
  profit     Int?
  
  createdAt DateTime @default(now()) @db.Timestamptz(3)
  updatedAt DateTime @default(now()) @updatedAt @db.Timestamptz(3)
  
  Category Category @relation(fields: [categoryId], references: [id])
  
  @@map("products")
}
```

**Controller Code** (`/src/controllers/product/getAllProducts.ts`):
```typescript
const products = await prismaAas.product.findMany({
  include: {
    Category: {
      select: { name: true },
    },
  },
})
```

## Current Workaround

Implemented mock products fallback to prevent dashboard crashes:
```typescript
catch (error) {
  console.log('AAS database connection failed, returning mock products data:', error.message)
  const mockProducts = [/* mock data array */]
  res.json(mockProducts)
}
```

## Root Cause Analysis

**Two Possible Scenarios:**

1. **Missing from Original Database**: The `products` table never existed in the production AAS database that was dumped
2. **Dump/Restore Issue**: The table existed in production but was not included in the development database dump or failed during restore

## Database Context

- **Server Role**: Development/Test server with database dumps from production
- **Database**: `aas_bronze_production` (PostgreSQL)
- **Connection**: Local Unix socket connection
- **Purpose**: Testing environment using production data snapshots

## Questions for Team

1. **Does the `products` table exist in the actual production AAS database?**
2. **If yes, was it included in the database dump provided to development?**
3. **Should we create the missing table structure, or is there a newer dump available?**
4. **Are there other missing tables we should be aware of?**

## Impact Assessment

**Current Impact:**
- Products API returns mock data instead of real products
- Dashboard functional but not displaying actual product inventory
- Customer billing calculations may be affected

**Business Risk:**
- Development/testing against mock data instead of real product catalog
- Potential deployment issues if code expects real products data
- Testing scenarios incomplete without actual product relationships

## Recommended Actions

1. **Immediate**: Verify production database table existence
2. **Short-term**: Provide complete database dump if table should exist
3. **Long-term**: Establish database sync process to prevent future discrepancies

## Technical Contact

Development team working on DaaS-DEV-2 server - this issue is blocking proper development and testing of the products/billing functionality.