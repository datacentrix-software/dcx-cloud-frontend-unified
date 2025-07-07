# SERVER-ONLY DEVELOPMENT PRINCIPLE

## Development Environment: Server Exclusively
ALL development work happens exclusively on the test server (DaaS-DEV-2).

**Core Principle: "NO local development permitted under any circumstances."**

## Zero Local Development Policy:
- NO code creation on local machines
- NO documentation work on local machines  
- NO file editing on local machines
- NO testing on local machines
- NO preliminary work on local machines

## Server-Only Workflow:
1. SSH to server: `ssh -p 2423 dev_2_user@45.220.228.16`
2. Create/edit ALL code directly on server
3. Test ALL functionality on server
4. Commit changes directly from server
5. Deploy directly from server

## Benefits of Server-Only Approach:
- Eliminates environment-specific issues
- Ensures deployment compatibility
- Prevents file transfer errors
- Maintains consistent development environment
- Follows documented development standards

## Status: Bronze Cleanup Complete Despite Process Issues
- ✅ Frontend Bronze naming eliminated
- ✅ API endpoints standardized  
- ✅ System stable and ready for VM data service
- ✅ All changes committed to GitHub

Next: Investigate running Claude from server to eliminate local/server confusion entirely.
