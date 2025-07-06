# Server Configuration Documentation - DaaS-DEV-2

## 🏢 SERVER INFRASTRUCTURE OVERVIEW

### **Primary Test Server: DaaS-DEV-2**
- **Host**: 45.220.228.16
- **SSH Port**: 2423
- **SSH Access**: `ssh -p 2423 dev_2_user@45.220.228.16`
- **User**: dev_2_user
- **Purpose**: Pre-production testing environment for DCX Cloud Platform
- **Status**: ✅ Operational

## 🔧 SYSTEM ARCHITECTURE

### **Operating System & Environment**
- **OS**: Linux (Ubuntu/Debian-based)
- **Node.js**: Installed and configured
- **PM2**: Process manager for application services
- **Nginx**: Reverse proxy and SSL termination
- **PostgreSQL**: Database server with multiple schemas

### **Application Stack**
- **Frontend**: Next.js 15.3.4 application
- **Backend**: Express.js API server
- **Database**: PostgreSQL with Prisma ORM
- **Process Management**: PM2 for service orchestration

## 📂 DIRECTORY STRUCTURE

### **Unified Repositories Location**
```
/home/dev_2_user/
├── dcx-cloud-frontend-unified/    # Main frontend application
│   ├── src/                       # Source code
│   ├── public/                    # Static assets
│   ├── .env                       # Environment variables
│   └── package.json               # Dependencies
├── dcx-cloud-backend-unified/     # Main backend API
│   ├── src/                       # Source code
│   ├── prisma/                    # Database schema
│   ├── .env                       # Environment variables
│   └── package.json               # Dependencies
└── logs/                          # Application logs
```

## 🚀 PM2 PROCESS CONFIGURATION

### **Current Running Processes**
```bash
┌────┬─────────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┐
│ id │ name                    │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │
├────┼─────────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┤
│ 7  │ dcx-backend-unified     │ default     │ N/A     │ fork    │ 252327   │ 110m   │ 1985 │ online    │
│ 6  │ dcx-frontend-unified    │ default     │ N/A     │ fork    │ 255657   │ 56m    │ 47   │ online    │
└────┴─────────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┘
```

### **Service Configuration**
- **Frontend Process**: 
  - **Name**: dcx-frontend-unified
  - **Port**: 3000
  - **Status**: ✅ Stable (47 restarts)
  - **Command**: `npm run dev` or `npm start`

- **Backend Process**:
  - **Name**: dcx-backend-unified  
  - **Port**: 8003
  - **Status**: ⚠️ High restart count (1985 restarts - requires investigation)
  - **Command**: `npm run dev` or `npm start`

### **PM2 Management Commands**
```bash
# Status check
pm2 status

# Restart services
pm2 restart dcx-frontend-unified
pm2 restart dcx-backend-unified

# View logs
pm2 logs dcx-frontend-unified
pm2 logs dcx-backend-unified

# Monitor processes
pm2 monit
```

## 🔒 NGINX CONFIGURATION

### **SSL/HTTPS Setup**
- **SSL Certificates**: Self-signed certificates for development
- **Certificate Location**: 
  - Certificate: `/etc/ssl/certs/nginx-selfsigned.crt`
  - Private Key: `/etc/ssl/private/nginx-selfsigned.key`

### **Domain Configuration**
- **Frontend Domain**: `https://dev.frontend.test.daas.datacentrix.cloud`
- **Backend Domain**: `https://dev.backend.test.daas.datacentrix.cloud`

### **Reverse Proxy Setup**
```nginx
# Frontend Configuration
server {
    listen 443 ssl;
    server_name dev.frontend.test.daas.datacentrix.cloud;
    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend Configuration  
server {
    listen 443 ssl;
    server_name dev.backend.test.daas.datacentrix.cloud;
    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
    
    location / {
        proxy_pass http://localhost:8003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🗄️ DATABASE CONFIGURATION

### **PostgreSQL Setup**
- **Database Server**: PostgreSQL running on server
- **Connection**: Via DATABASE_URL environment variable
- **Multi-Database Architecture**: 
  - **Main Database**: Primary application data
  - **AAS Database**: As-a-Service specific data
  - **E-Networks Database**: E-Networks integration data

### **Database Schemas**
- **Users & Organizations**: Main database
- **Wallet System**: AAS database with organization wallet management
- **VM Management**: Multi-database integration for VM provisioning
- **Total Records**: 933,527+ migrated records

### **Connection String Format**
```
DATABASE_URL="postgresql://[username]:[password]@[host]:[port]/[database]"
```

## 📊 MONITORING & HEALTH CHECKS

### **Service Health Status**
- **Frontend**: ✅ Healthy (HTTPS accessible)
- **Backend**: ⚠️ Running but unstable (high restart count)
- **Database**: ✅ Connected and operational
- **SSL**: ✅ Working with self-signed certificates

### **Key Metrics to Monitor**
- **PM2 Restart Count**: Backend showing 1985 restarts (investigate)
- **Memory Usage**: Frontend ~53.9MB, Backend ~62.1MB
- **CPU Usage**: Both processes at 0% (normal for idle)
- **Uptime**: Frontend 56m, Backend 110m

## 🔐 SECURITY CONFIGURATION

### **Authentication System**
- **JWT Secret**: `prod_jwt_secret_dcx_cloud_2025_secure_key`
- **Token Expiry**: Automatic refresh 5 minutes before expiration
- **Session Management**: Complete session cleanup on logout
- **OTP System**: Development popup for testing (remove in production)

### **Environment Variables**
```bash
# Backend Configuration
NODE_ENV=development
PORT=8003
DATABASE_URL=[configured]
JWT_SECRET=prod_jwt_secret_dcx_cloud_2025_secure_key

# Frontend Configuration
NEXT_PUBLIC_BACK_END_BASEURL=https://dev.backend.test.daas.datacentrix.cloud
NEXT_PUBLIC_FRONT_END_BASEURL=https://dev.frontend.test.daas.datacentrix.cloud
```

## 📋 MAINTENANCE PROCEDURES

### **Regular Maintenance Tasks**
1. **Monitor PM2 processes**: Check restart counts daily
2. **Review logs**: Check for errors and performance issues
3. **Database backups**: Ensure regular backups are configured
4. **SSL certificate renewal**: Replace self-signed certificates for production
5. **Security updates**: Keep dependencies updated

### **Emergency Procedures**
1. **Service restart**: Use PM2 commands to restart failing services
2. **Log investigation**: Check PM2 logs for error diagnosis
3. **Database recovery**: Follow database backup restoration procedures
4. **SSL issues**: Verify nginx configuration and certificate validity

## 🚨 KNOWN ISSUES & MONITORING ALERTS

### **Critical Issues**
1. **Backend High Restart Count**: 1985 restarts indicate stability issues
2. **API Communication**: 404/500 errors on some endpoints
3. **Development Dependencies**: Remove development flags before production

### **Monitoring Alerts**
- **PM2 Restart Count > 100**: Investigate backend stability
- **Service Down**: Immediate notification required
- **SSL Certificate Expiry**: 30-day warning for certificate renewal
- **Database Connection Issues**: Monitor connection health

## 📞 SUPPORT INFORMATION

### **Key Contacts**
- **Technical Lead**: Garsen Subramoney
- **Development Team**: Siyabonga, Chand, Zayaan, Abel
- **Infrastructure**: DCX Team

### **Documentation References**
- **Project Guide**: PROJECT_GUIDE.md
- **Current State**: CURRENT_STATE.md
- **Development Session**: DEVELOPMENT_SESSION_SUMMARY.md
- **TODO List**: TODO.md

---

**Last Updated**: July 5, 2025  
**Next Review**: July 12, 2025  
**Maintainer**: Development Team  
**Environment**: Pre-production Test Server