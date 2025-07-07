# Split Code Prevention - Unified Repository Workflow

## 🚨 CRITICAL: PREVENTING CODE FRAGMENTATION

### **Core Principle**
**ALL DEVELOPMENT WORK MUST HAPPEN IN THE UNIFIED REPOSITORIES ON THE SERVER**

Never work from local copies when the unified repositories exist on the server. This prevents code fragmentation and ensures all work is properly consolidated.

## 🎯 UNIFIED REPOSITORY STRATEGY

### **Primary Working Locations**
1. **Server Unified Repositories** (PRIMARY - ALL CODE WORK):
   - **Frontend**: `/home/dev_2_user/dcx-cloud-frontend-unified/`
   - **Backend**: `/home/dev_2_user/dcx-cloud-backend-unified/`
   - **GitHub**: `datacentrix-software/dcx-cloud-frontend-unified`
   - **GitHub**: `datacentrix-software/dcx-cloud-backend-unified`
   - **Status**: ACTIVE DEVELOPMENT - All code changes happen here

2. **Local Repositories** (DOCUMENTATION ONLY):
   - **Purpose**: Documentation files and session tracking only
   - **Location**: `/Users/garsensubramoney/gs_projects/dcx/dcx-cloud-frontend/unified-migration/`
   - **Restrictions**: NO CODE CHANGES - Frontend, Backend, or any TypeScript/JavaScript files
   - **Allowed**: Only .md documentation files

## 🔄 DEVELOPMENT WORKFLOW

### **✅ CORRECT WORKFLOW**
1. **SSH to Server**: `ssh -p 2423 dev_2_user@45.220.228.16`
2. **Navigate to Unified Repos**: 
   - Frontend: `cd /home/dev_2_user/dcx-cloud-frontend-unified/`
   - Backend: `cd /home/dev_2_user/dcx-cloud-backend-unified/`
3. **Make Code Changes**: Edit files directly on server (both repos)
4. **Test Changes**: Use PM2 restart to test changes
5. **Commit Changes**: Git commit directly from server (both repos)
6. **Push to GitHub**: Push from server to unified repositories

### **❌ INCORRECT WORKFLOW (CAUSES SPLIT CODE)**
1. ❌ Working from local macbook repositories
2. ❌ Making code changes locally then copying to server
3. ❌ Committing from local before pushing to server
4. ❌ Having different code versions on local vs server

## 🛠️ TECHNICAL IMPLEMENTATION

### **SSH Development Commands**
```bash
# Connect to server
ssh -p 2423 dev_2_user@45.220.228.16

# FRONTEND UNIFIED REPOSITORY
cd /home/dev_2_user/dcx-cloud-frontend-unified/
git status
git add .
git commit -m "fix: frontend changes description"
git push origin main

# BACKEND UNIFIED REPOSITORY  
cd /home/dev_2_user/dcx-cloud-backend-unified/
git status
git add .
git commit -m "fix: backend changes description"
git push origin main

# PM2 service management (both services)
pm2 restart dcx-frontend-unified
pm2 restart dcx-backend-unified
pm2 logs dcx-frontend-unified
pm2 logs dcx-backend-unified
pm2 status
```

### **Documentation Workflow**
```bash
# Documentation updates happen locally
cd /Users/garsensubramoney/gs_projects/dcx/dcx-cloud-frontend/unified-migration/

# Edit documentation files
# - CURRENT_STATE.md
# - DEVELOPMENT_SESSION_SUMMARY.md
# - TODO.md
# - SERVER_CONFIGURATION.md

# Commit documentation changes
git add *.md
git commit -m "docs: update session documentation"
git push origin fix/dev-environment-july-2025
```

## 🔒 REPOSITORY ACCESS CONTROL

### **Server Repository Permissions**
- **Frontend Unified**: `/home/dev_2_user/dcx-cloud-frontend-unified/` - Full read/write access
- **Backend Unified**: `/home/dev_2_user/dcx-cloud-backend-unified/` - Full read/write access
- **GitHub Integration**: Deploy keys configured for push access to both repos
- **Development Status**: BOTH repositories actively maintained on server

### **Local Repository Restrictions**
- **Purpose**: Documentation and session tracking only
- **Code Changes**: NOT ALLOWED on ANY code files (Frontend OR Backend)
- **Forbidden**: .ts, .tsx, .js, .jsx, .json, .prisma, .env files
- **Commits**: Only documentation files (*.md)

## 📋 SPLIT CODE PREVENTION CHECKLIST

### **Before Starting Work**
- [ ] SSH connected to server: `ssh -p 2423 dev_2_user@45.220.228.16`
- [ ] Frontend directory: `/home/dev_2_user/dcx-cloud-frontend-unified/`
- [ ] Backend directory: `/home/dev_2_user/dcx-cloud-backend-unified/`
- [ ] Git status clean on both repos: `git status`
- [ ] Latest code pulled on both repos: `git pull origin main`

### **During Development**
- [ ] All code changes made on server (frontend AND backend)
- [ ] PM2 processes tested after changes (both services)
- [ ] No local code modifications on ANY repository
- [ ] Documentation updated locally (if needed)

### **After Development**
- [ ] Frontend changes committed from server: `git commit -m "..."`
- [ ] Backend changes committed from server: `git commit -m "..."`
- [ ] Both repos pushed to GitHub: `git push origin main`
- [ ] Both services restarted and tested: `pm2 restart dcx-frontend-unified && pm2 restart dcx-backend-unified`
- [ ] Documentation updated and committed locally

## 🚨 EMERGENCY RECOVERY PROCEDURES

### **If Code Split Occurs**
1. **STOP ALL WORK** - Do not make additional changes
2. **Assess the Split**: Compare local vs server vs GitHub
3. **Identify Authoritative Source**: Determine which version is correct
4. **Consolidate to Server**: Move all correct code to server repositories
5. **Test Thoroughly**: Ensure all functionality works on server
6. **Update Documentation**: Record what happened and lessons learned

### **Recovery Commands**
```bash
# Check differences between repositories
git diff HEAD~1 HEAD

# Copy specific files from local to server (if needed)
scp -P 2423 localfile.js dev_2_user@45.220.228.16:/home/dev_2_user/dcx-cloud-frontend-unified/src/

# Force push from server (if server is authoritative)
git push --force-with-lease origin main
```

## 📊 MONITORING & COMPLIANCE

### **Daily Checks**
- [ ] All team members working from server repositories
- [ ] No unauthorized local code changes
- [ ] GitHub repositories reflect server state
- [ ] Documentation properly updated

### **Weekly Reviews**
- [ ] Repository consistency check
- [ ] Split code prevention training
- [ ] Workflow compliance assessment
- [ ] Documentation quality review

## 🎓 TEAM TRAINING

### **Developer Guidelines**
1. **Server-First Development**: Always work from server repositories
2. **Local Documentation**: Use local only for documentation
3. **Git Discipline**: Commit and push from server
4. **Communication**: Announce major changes to team

### **Common Mistakes to Avoid**
1. **Working Locally**: Making code changes on local machine
2. **Dual Commits**: Committing same changes from both local and server
3. **File Copying**: Manually copying files between environments
4. **Branch Confusion**: Working on different branches in different locations

## 📞 SUPPORT & ESCALATION

### **When to Escalate**
- Code split detected between local and server
- Unable to access server repositories
- GitHub push/pull conflicts
- PM2 services not responding properly

### **Contact Information**
- **Technical Lead**: Garsen Subramoney
- **Development Team**: Siyabonga, Chand, Zayaan, Abel
- **Infrastructure Support**: DCX Team

### **Documentation References**
- **Server Configuration**: SERVER_CONFIGURATION.md
- **Current State**: CURRENT_STATE.md
- **Development Session**: DEVELOPMENT_SESSION_SUMMARY.md

---

**Bottom Line**: Work from server unified repositories ONLY. Use local only for documentation. This prevents code fragmentation and ensures all work is properly consolidated and tested.

**Last Updated**: July 5, 2025  
**Next Review**: July 12, 2025  
**Compliance**: Mandatory for all development work