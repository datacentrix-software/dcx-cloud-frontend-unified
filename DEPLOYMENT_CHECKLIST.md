# 🚀 Server Deployment Checklist

## Pre-Deployment Verification

### ✅ Local Environment Status
- [x] Frontend running successfully on localhost:3000
- [x] Backend running successfully on localhost:8003  
- [x] All databases accessible (4 PostgreSQL instances)
- [x] Redis operational for session management
- [x] Authentication flow working (Login → OTP → Dashboard)
- [x] 44/44 TDD tests passing

### ✅ Code Readiness
- [x] All code committed to `fix/dev-environment-july-2025` branch
- [x] Frontend: Latest commit `37bdec5`
- [x] Backend: Latest commit `2159efe`
- [x] No uncommitted changes
- [x] Security vulnerabilities patched (0 remaining)

### ⚠️ Development-Only Features to Remove
**CRITICAL: Remove before deployment**
1. [ ] Backend: OTP exposure in loginUser.ts API response
2. [ ] Frontend: OTP alert in LoginForm.tsx
3. [ ] Backend: Console OTP logging in email.ts
4. [ ] Mock backend files (simple-backend.cjs)
5. [ ] Test commission system files (now obsolete)

## Server Requirements

### Infrastructure Needed
- [ ] Ubuntu 24.04 LTS (or similar)
- [ ] Node.js v22.16.0 (or v20.x minimum)
- [ ] PostgreSQL 16.9
- [ ] Redis 8.0.2
- [ ] PM2 or similar process manager
- [ ] Nginx for reverse proxy

### Environment Variables Required

#### Frontend (.env.production)
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_KEYCLOAK_URL=https://auth.datacentrix.co.za
NEXT_PUBLIC_KEYCLOAK_REALM=datacentrix
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=datacentrix-frontend
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx
```

#### Backend (.env)
```bash
NODE_ENV=production
PORT=8003

# Database URLs (production values)
DATABASE_URL=postgresql://user:pass@host:5432/datacentrix_cloud
DATABASE_URL_AAS=postgresql://user:pass@host:5432/aas_data
DATABASE_URL_ENET=postgresql://user:pass@host:5432/enet_data

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Vault Integration
VAULT_ADDR=https://vault.internal:8200
VAULT_TOKEN=production_token
VAULT_ROLE_ID=production_role_id
VAULT_SECRET_ID=production_secret_id

# Email Service
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
EMAIL_FROM=noreply@datacentrix.co.za

# Keycloak
KEYCLOAK_REALM=datacentrix
KEYCLOAK_CLIENT_ID=datacentrix-backend
KEYCLOAK_CLIENT_SECRET=your_client_secret
KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
KEYCLOAK_ADMIN_CLIENT_SECRET=your_admin_secret
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=your_admin_password

# PayStack
PAYSTACK_SECRET_KEY=sk_live_xxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx

# VMware (if applicable)
VMWARE_HOST=vcenter.datacentrix.local
VMWARE_USER=service_account
VMWARE_PASSWORD=your_password
```

## Deployment Steps

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 22.16.0
nvm use 22.16.0

# Install PostgreSQL 16
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install postgresql-16 -y

# Install Redis
sudo apt install redis-server -y

# Install PM2
npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### 2. Database Migration
```bash
# Create databases
sudo -u postgres createdb datacentrix_cloud_prod
sudo -u postgres createdb aas_product_prod
sudo -u postgres createdb aas_bronze_prod
sudo -u postgres createdb enetworks_product_prod

# Run Prisma migrations
cd backend
npx prisma migrate deploy --schema=./src/prisma/application/schema.prisma
npx prisma migrate deploy --schema=./src/prisma/aas/schema.prisma
npx prisma migrate deploy --schema=./src/prisma/enet/schema.prisma
```

### 3. Application Deployment
```bash
# Clone repositories
git clone git@github.com:datacentrix-software/dcx-cloud-frontend.git
git clone git@github.com:datacentrix-software/nlu-platform-backend.git

# Backend setup
cd nlu-platform-backend
git checkout fix/dev-environment-july-2025
npm install
npm run build
pm2 start dist/server.js --name "dcx-backend"

# Frontend setup
cd ../dcx-cloud-frontend
git checkout fix/dev-environment-july-2025
npm install
npm run build
pm2 start npm --name "dcx-frontend" -- start
```

### 4. Nginx Configuration
```nginx
# /etc/nginx/sites-available/dcx
server {
    listen 80;
    server_name your.domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your.domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8003;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```

## Post-Deployment Verification

### Health Checks
- [ ] Frontend loads at https://your.domain.com
- [ ] API responds at https://your.domain.com/api/health
- [ ] Login flow works end-to-end
- [ ] Database connections verified
- [ ] Redis sessions working
- [ ] Vault secrets loading correctly

### Security Verification
- [ ] HTTPS/TLS configured correctly
- [ ] Development features removed
- [ ] Environment variables secured
- [ ] Firewall rules configured
- [ ] Database access restricted
- [ ] Redis password protected

### Monitoring Setup
- [ ] PM2 monitoring configured
- [ ] Log rotation setup
- [ ] Sentry error tracking active
- [ ] Database backups scheduled
- [ ] SSL certificate auto-renewal

## Rollback Plan

If deployment fails:
1. Keep current branch as-is (don't merge yet)
2. PM2 saves previous app state
3. Database migrations are reversible
4. Document all issues encountered

## Team Handover

### Documentation to Provide
1. This deployment checklist
2. Environment variable template
3. API documentation
4. Database schema diagram
5. Troubleshooting guide

### Access Required
- SSH access to server
- Database credentials
- Vault access tokens
- Domain DNS management
- SSL certificate management

---

**Ready for deployment once server is provisioned by cloud engineer!**