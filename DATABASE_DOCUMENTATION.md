# DCX Cloud Platform - Database Documentation
**Last Updated**: July 6, 2025  
**Consolidated from**: Database Issue Report, Migration Success, Schema Comparison docs

---

## 🗄️ DATABASE ARCHITECTURE OVERVIEW

### **Multi-Database Strategy (Production)**

#### **Database Structure**
```
┌─────────────────────────────────────────────┐
│  MAIN DATABASE (datacentrix_cloud_local)   │
│  ├── Users, Organizations, Roles           │
│  ├── Wallet System & Transactions          │
│  ├── Authentication & Security             │
│  └── Cross-service Business Logic          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  AAS DATABASE (aas_product_data)            │
│  ├── Products Catalog (39 products)        │
│  ├── Categories (10 categories)            │
│  ├── VM Configurations (24 templates)      │
│  └── Service Pricing & Margins             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  E-NETWORKS DATABASE                        │
│  ├── Network Services Catalog              │
│  ├── Provider Integrations                 │
│  └── Bandwidth Pricing                     │
└─────────────────────────────────────────────┘
```

### **Database Purpose & Rationale**
- **MAIN**: Cross-service platform management (Identity, Wallet, Security)
- **AAS**: Cloud service catalog with real pricing data
- **E-NETWORKS**: Network connectivity services and pricing

---

## 📊 AAS PRODUCT DATABASE MIGRATION

### **Migration Crisis & Resolution (July 6, 2025)**

#### **The Problem**
- **Error**: P2021 - Table `aas_bronze_production.products` does not exist
- **Impact**: Products API failing, dashboard showing mock data
- **Root Cause**: Database naming confusion and missing production data

#### **Discovery Process**
1. **Database Name Mismatch**: Code expected `aas_bronze_production`, actual was `aas_product_data`
2. **Wrong Server**: Real product database on remote server `10.1.1.17`
3. **Incomplete Dump**: Test server had VM metrics data, not product catalog

#### **Migration Success**
✅ **Successfully migrated production AAS database to test server**

**Migration Steps Completed**:
1. Retrieved `aas_product_data_correct_dump.sql` (17KB)
2. Created local `aas_product_data` database
3. Imported all tables and production data
4. Updated backend configuration

**Configuration Change**:
```bash
# Old (incorrect)
AAS_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aas_bronze_production"

# New (correct)  
AAS_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aas_product_data"
```

---

## 🔍 DATABASE SCHEMA ANALYSIS

### **Schema Compatibility Report**

#### **Products Table** ✅ Perfect Match
```sql
-- Prisma Schema Expectation
model Product {
  id         String @id @default(uuid())
  title      String
  price      Float
  cost       Float
  categoryId String
  code       String
  unit       Int    @default(1)
  profit     Int?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @default(now()) @updatedAt
}

-- Actual Database Structure (100% Compatible)
CREATE TABLE products (
    id text NOT NULL,
    title text NOT NULL,
    price double precision NOT NULL,
    cost double precision NOT NULL,
    "categoryId" text NOT NULL,
    code text NOT NULL,
    unit integer DEFAULT 1 NOT NULL,
    profit integer,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

#### **Categories Table** ✅ Perfect Match
```sql
-- 10 production categories including:
-- "Infrastructure as a Service (IaaS)"
-- "Cloud Services - Connectivity"
-- Complete foreign key relationships working
```

#### **VM Configurations Table** ✅ Perfect Match
```sql
-- 24 terraform_vm_config templates
-- Complete VM provisioning configurations
-- All fields match Prisma schema exactly
```

### **Schema Validation Results**
- ✅ **All table names match** exactly
- ✅ **All column names match** (including case-sensitive `categoryId`)
- ✅ **Data types compatible** (String→text, Int→integer, Float→double precision)
- ✅ **Primary key constraints** properly set
- ✅ **Foreign key relationships** working (`products.categoryId` → `categories.id`)
- ⚠️ **Minor**: Missing auto-update triggers for `updatedAt` columns

---

## 💾 CURRENT DATABASE STATE

### **Production Data Content**

#### **Products Catalog (39 Items)**
```
Sample Products with Real Pricing:
├── vCPU - 1GHz      → R78.00
├── vCPU - 2GHz      → R155.00  
├── RAM              → R37.00
├── Standard Storage → R1.80/GB
├── Premium Storage  → R2.75/GB
└── ... (34 more products)
```

#### **Categories (10 Items)**
```
Production Categories:
├── Infrastructure as a Service (IaaS)
├── Cloud Services - Connectivity
├── Storage Services
├── Network Services
└── ... (6 more categories)
```

#### **VM Configurations (24 Templates)**
```
VM Template Examples:
├── Ubuntu Server 20.04 (2 vCPU, 4GB RAM, 40GB)
├── Windows Server 2019 (4 vCPU, 8GB RAM, 80GB)
├── CentOS 8 (1 vCPU, 2GB RAM, 20GB)
└── ... (21 more templates)
```

---

## 🔄 DATA FLOW ARCHITECTURE

### **Cross-Database Query Pattern**
```typescript
// Example: VM Provisioning with Real Pricing
async function getVMCostEstimate(vmSpec: VMSpec): Promise<number> {
  // 1. Query AAS database for component pricing
  const cpuCost = await aasDb.product.findFirst({
    where: { code: `CPU_${vmSpec.cpuType}` }
  });
  
  const ramCost = await aasDb.product.findFirst({
    where: { code: 'RAM_GB' }
  });
  
  const storageCost = await aasDb.product.findFirst({
    where: { code: `STORAGE_${vmSpec.storageType}` }
  });
  
  // 2. Calculate total cost
  return (
    (cpuCost.price * vmSpec.cpuCount) +
    (ramCost.price * vmSpec.ramGB) +
    (storageCost.price * vmSpec.storageGB)
  );
}

// 3. Validate against wallet in main database
async function validateProvisioningRequest(cost: number, orgId: string) {
  const wallet = await mainDb.organisationWallet.findFirst({
    where: { organisationId: orgId }
  });
  
  return wallet.balance >= cost;
}
```

### **VM Data Integration**
```sql
-- Real VM data schema (vcenter_vm_data_vms table)
CREATE TABLE vcenter_vm_data_vms (
    identity_instance_uuid VARCHAR(255) NOT NULL,  -- VM unique ID
    identity_name VARCHAR(255) NOT NULL,           -- VM display name
    power_state VARCHAR(50) NOT NULL,              -- VM power status
    guest_os VARCHAR(255),                         -- Operating system
    memory_size_mib INTEGER,                       -- Memory in MiB
    cpu_count INTEGER,                             -- CPU core count
    vcenter_name VARCHAR(255),                     -- vCenter server
    resource_pool_name VARCHAR(255),               -- Resource pool
    is_current BOOLEAN DEFAULT true                -- Current record flag
);
```

---

## ⚙️ DATABASE CONFIGURATION

### **Connection Strings (Current)**
```bash
# Main Database
DATABASE_URL="postgresql://dev_2_user:password@localhost:5432/datacentrix_cloud_local"

# AAS Product Database  
AAS_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aas_product_data"

# E-Networks Database (when needed)
ENETWORKS_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/enetworks_product_local"
```

### **Prisma Client Configuration**
```typescript
// Main database client
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();

// AAS database client
import { PrismaClient as PrismaAas } from '../generated/client-aas';
export const prismaAas = new PrismaAas();
```

---

## 🛠️ DATABASE OPERATIONS

### **Backup & Recovery**
```bash
# Create backup of AAS database
pg_dump -h localhost -U postgres aas_product_data > aas_backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h localhost -U postgres -d aas_product_data < aas_backup_20250706.sql
```

### **Data Validation Queries**
```sql
-- Verify product catalog integrity
SELECT 
  c.name as category,
  COUNT(p.id) as product_count,
  AVG(p.price) as avg_price
FROM categories c
LEFT JOIN products p ON p."categoryId" = c.id
GROUP BY c.id, c.name
ORDER BY product_count DESC;

-- Verify VM configurations
SELECT 
  "group",
  "osType", 
  COUNT(*) as template_count,
  AVG(vcpus) as avg_cpu,
  AVG(memory) as avg_memory_gb
FROM terraform_vm_config
GROUP BY "group", "osType"
ORDER BY template_count DESC;
```

---

## 🚨 CRITICAL ISSUES RESOLVED

### **✅ Resolved Issues**
1. **Database Naming Confusion**: Fixed `aas_bronze_production` vs `aas_product_data`
2. **Missing Products Table**: Successfully imported production catalog
3. **Schema Mismatches**: Confirmed 100% compatibility
4. **Configuration Errors**: Updated environment variables
5. **Mock Data Dependencies**: Real pricing now available

### **⚠️ Monitoring Points**
- **Data Consistency**: Ensure cross-database transactions maintain integrity
- **Performance**: Monitor cross-database query performance
- **Backup Status**: Regular backups of all three databases
- **Schema Drift**: Detect changes between environments

---

## 📋 MAINTENANCE PROCEDURES

### **Regular Tasks**
1. **Weekly**: Verify database connections and performance
2. **Daily**: Monitor error logs for database-related issues
3. **Monthly**: Update database statistics and vacuum
4. **Quarterly**: Review and optimize cross-database queries

### **Emergency Procedures**
1. **Database Corruption**: Restore from latest backup
2. **Connection Issues**: Check configuration and restart services
3. **Performance Problems**: Analyze slow queries and optimize
4. **Data Inconsistency**: Run validation queries and reconcile

---

**Database Status**: ✅ **FULLY OPERATIONAL**  
**Last Migration**: July 6, 2025 (AAS product database)  
**Next Review**: Monitor dashboard metrics integration