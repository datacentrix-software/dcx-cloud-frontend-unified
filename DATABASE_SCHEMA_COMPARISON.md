# Database Schema Comparison Report

## Summary
This report compares the Prisma schema expectations in our code with the actual database dump from `aas_product_local_dump.sql`.

## Schema Comparison

### 1. Categories Table

| Field | Prisma Schema | Database Dump | Match | Notes |
|-------|---------------|---------------|-------|-------|
| Table Name | `categories` | `categories` | ✅ | |
| id | String @id @default(uuid()) | text NOT NULL | ✅ | |
| name | String | text NOT NULL | ✅ | |
| description | String? | text | ✅ | Nullable in both |
| createdAt | DateTime @default(now()) | timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL | ✅ | |
| updatedAt | DateTime @default(now()) @updatedAt | timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL | ⚠️ | Dump missing auto-update trigger |
| Product | Product[] | - | N/A | Prisma relation, not in DB |

### 2. Products Table

| Field | Prisma Schema | Database Dump | Match | Notes |
|-------|---------------|---------------|-------|-------|
| Table Name | `products` | `products` | ✅ | |
| id | String @id @default(uuid()) | text NOT NULL | ✅ | |
| title | String | text NOT NULL | ✅ | |
| price | Float | double precision NOT NULL | ✅ | |
| cost | Float | double precision NOT NULL | ✅ | |
| categoryId | String | text NOT NULL | ✅ | |
| code | String | text NOT NULL | ✅ | |
| unit | Int @default(1) | integer DEFAULT 1 NOT NULL | ✅ | |
| profit | Int? | integer | ✅ | Nullable in both |
| createdAt | DateTime @default(now()) | timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL | ✅ | |
| updatedAt | DateTime @default(now()) @updatedAt | timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL | ⚠️ | Dump missing auto-update trigger |
| Category | Category @relation(...) | - | N/A | Prisma relation, not in DB |

### 3. TerraformVMConfig Table

| Field | Prisma Schema | Database Dump | Match | Notes |
|-------|---------------|---------------|-------|-------|
| Table Name | `terraform_vm_config` | `terraform_vm_config` | ✅ | |
| id | String @id @default(uuid()) | text NOT NULL | ✅ | |
| group | String | text NOT NULL | ✅ | |
| osType | String | text NOT NULL | ✅ | |
| description | String | text NOT NULL | ✅ | |
| vcpus | Int | integer NOT NULL | ✅ | |
| ghz | String | text NOT NULL | ✅ | |
| memory | Int | integer NOT NULL | ✅ | |
| storage | Int | integer NOT NULL | ✅ | |
| type | String | text NOT NULL | ✅ | |
| template_id | String? | text | ✅ | Nullable in both |
| ostype_version | String? | text | ✅ | Nullable in both |

## Key Findings

### ✅ Matches
1. **All three expected tables exist** in the database dump
2. **All column names match** exactly (including case-sensitive names like `categoryId`)
3. **Data types are compatible**:
   - Prisma `String` → PostgreSQL `text`
   - Prisma `Int` → PostgreSQL `integer`
   - Prisma `Float` → PostgreSQL `double precision`
   - Prisma `DateTime` → PostgreSQL `timestamp(3) with time zone`
4. **Default values match** where specified
5. **Nullable fields match** (indicated by `?` in Prisma)

### ⚠️ Minor Differences
1. **updatedAt auto-update**: The Prisma schema uses `@updatedAt` which automatically updates the timestamp on record changes. The dump only has a default value, not an update trigger.

### ✅ Verified Constraints
1. **Primary key constraints** are properly set on all `id` fields:
   - `categories_pkey` on `categories.id`
   - `products_pkey` on `products.id`
   - `terraform_vm_config_pkey` on `terraform_vm_config.id`
2. **Foreign key constraint** exists: `products_categoryId_fkey` from `products.categoryId` to `categories.id` with CASCADE UPDATE and RESTRICT DELETE
3. **Indexes** will be automatically created by the primary key constraints

## Recommendations

### ✅ Recommended Approach: Import As-Is with Minor Adjustments

1. **Import the dump directly** into `aas_bronze_production` database
2. **Add only the missing update triggers** after import:
   ```sql
   -- Add update triggers for updatedAt columns
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
       NEW."updatedAt" = CURRENT_TIMESTAMP;
       RETURN NEW;
   END;
   $$ language 'plpgsql';
   
   CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   
   CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   ```

3. **No code changes needed** - The Prisma schema perfectly matches the database structure

### Why This Approach?
- **Minimal risk**: The schemas are already compatible
- **Preserves existing data**: All data in the dump can be used immediately
- **Quick implementation**: Only need to add update triggers (constraints already exist)
- **Future-proof**: The update triggers ensure `updatedAt` works as expected by Prisma

## Alternative Approaches (Not Recommended)

### Option 2: Update Code to Match Dump Exactly
- **Not needed** because the schemas already match
- Would require removing `@updatedAt` from Prisma schema and handling updates manually

### Option 3: Hybrid Approach
- **Overkill** for this situation since compatibility is already excellent
- Would add unnecessary complexity

## Next Steps

1. Import `aas_product_local_dump.sql` into the `aas_bronze_production` database
2. Run the SQL commands above to add constraints and triggers
3. Test the Prisma client connection to verify everything works
4. Run a few test queries to ensure data integrity

The database dump is fully compatible with your Prisma schema, making this a straightforward migration.

## Data Content Summary

The dump contains production data:
- **Categories**: 5+ categories including "Infrastructure as a Service (IaaS)", "Cloud Services - Connectivity", etc.
- **Products**: Multiple products linked to these categories
- **Terraform VM Configs**: VM configuration templates

This is valuable production data that should be preserved during the migration.