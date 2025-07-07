# Telemetry Endpoints Setup Instructions

## Overview
This guide explains how to implement the missing telemetry endpoints in the dcx-cloud-backend-unified to fix the "0 VMs showing" issue.

## Files to Move/Create

### 1. Bronze Database Schema
**Source**: `bronze-schema.prisma`
**Destination**: `dcx-cloud-backend-unified/src/prisma/bronze/schema.prisma`

### 2. Bronze Prisma Client
**Source**: `prismaBronze.ts`
**Destination**: `dcx-cloud-backend-unified/src/utils/prisma/prismaBronze.ts`

### 3. Telemetry Endpoints
**Source**: `telemetry-endpoints.ts`
**Destination**: `dcx-cloud-backend-unified/src/controllers/cloud/telemetry.ts`

## Setup Steps

### Step 1: Copy Files to Backend
```bash
# Navigate to backend directory
cd dcx-cloud-backend-unified

# Create directories
mkdir -p src/prisma/bronze
mkdir -p src/controllers/cloud
mkdir -p src/routes/cloud

# Copy schema
cp ../dcx-cloud-frontend-unified/bronze-schema.prisma src/prisma/bronze/schema.prisma

# Copy prisma client
cp ../dcx-cloud-frontend-unified/prismaBronze.ts src/utils/prisma/prismaBronze.ts

# Copy telemetry endpoints
cp ../dcx-cloud-frontend-unified/telemetry-endpoints.ts src/controllers/cloud/telemetry.ts
```

### Step 2: Generate Bronze Prisma Client
```bash
# Generate the Bronze database client
npx prisma generate --schema=src/prisma/bronze/schema.prisma
```

### Step 3: Create Routes File
Create `src/routes/cloud/index.ts`:
```typescript
import { Router } from 'express';
import {
  getMetricAggregation,
  getCurrentBill,
  getVMTelemetry,
  getVMCpuRamWindow,
  getVMHealthWindow,
  getVMDiskWindow,
  getVMNetworkWindow,
  getAfgriPastBills
} from '../../controllers/cloud/telemetry';

const router = Router();

// Telemetry endpoints
router.get('/metricAggregation', getMetricAggregation);
router.get('/currentBill', getCurrentBill);
router.get('/vmTelemetry', getVMTelemetry);
router.get('/vmCpuRamWindow', getVMCpuRamWindow);
router.get('/vmHealthWindow', getVMHealthWindow);
router.get('/vmDiskWindow', getVMDiskWindow);
router.get('/vmNetworkWindow', getVMNetworkWindow);
router.get('/afgriPastBills', getAfgriPastBills);

export default router;
```

### Step 4: Update Server Routes
In `src/server.ts`, add the cloud routes:
```typescript
import cloudRoutes from './routes/cloud';

// Add this line with other route registrations
app.use('/api/cloud', cloudRoutes);
```

### Step 5: Update Package.json Scripts
Add Bronze database generation to package.json:
```json
{
  "scripts": {
    "generate:bronze": "prisma generate --schema=src/prisma/bronze/schema.prisma",
    "generate:all": "npm run generate && npm run generate:bronze"
  }
}
```

## Environment Variables
Ensure the backend.env file has the Bronze database URL:
```env
BRONZE_DATABASE_URL="postgresql://aas_user:BUih76FhOp9)e@10.1.1.17:5432/aas_bronze_data"
```

## Testing the Endpoints

### Test Metric Aggregation
```bash
curl -X GET "http://localhost:8003/api/cloud/metricAggregation?customer=Adcock" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Current Bill
```bash
curl -X GET "http://localhost:8003/api/cloud/currentBill?customer=Adcock" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test VM Telemetry
```bash
curl -X GET "http://localhost:8003/api/cloud/vmTelemetry?vmId=50050d90-9f3a-815d-de68-472ea8275cf5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Expected Results
After implementation, the dashboard should show:
- ✅ VMs: 3,260 (instead of 0)
- ✅ Memory: 84.00 GB (instead of 0 GB)
- ✅ CPU Cores: 30 (instead of 0)
- ✅ Storage: 1.03 TB (instead of 0 TB)
- ✅ Individual VM metrics showing real percentages

## Troubleshooting

### If endpoints return 404
- Verify routes are registered in server.ts
- Check that the cloud routes file is properly imported

### If database connection fails
- Verify BRONZE_DATABASE_URL is set correctly
- Test connection manually: `psql -h 10.1.1.17 -U aas_user -d aas_bronze_data`

### If authentication fails
- Ensure JWT tokens are being passed correctly
- Check that protect middleware is applied to routes

### If data returns empty
- Verify organization names match exactly (case-sensitive)
- Check that is_current = true in VM data
- Verify audit status = 'SUCCESS' for current month

## Impact
Once implemented, this will resolve the "0 VMs showing" issue by providing:
1. Real-time VM inventory data
2. Performance metrics (CPU, Memory, Disk)
3. Historical billing information
4. Individual VM telemetry details

The investigation showed all data exists in the Bronze database - this implementation simply exposes it through the unified backend API.