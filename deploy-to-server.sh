#!/bin/bash

# DCX Cloud Platform - Server Deployment Script
# Server: DaaS-DEV-2 (ssh -p 2423 dev_2_user@45.220.228.16)
# Date: July 4, 2025

set -e  # Exit on any error

# Server configuration
SERVER_HOST="45.220.228.16"
SERVER_PORT="2423"
SERVER_USER="dev_2_user"
SSH_CMD="ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# Function to run command on server
run_on_server() {
    log "Running on server: $1"
    $SSH_CMD "$1"
}

# Main deployment function
main() {
    log "🚀 Starting DCX Cloud Platform Deployment"
    log "Server: $SERVER_HOST:$SERVER_PORT"
    log "User: $SERVER_USER"
    
    # Step 1: Server prerequisites check
    log "📋 Step 1: Checking server prerequisites..."
    
    run_on_server "echo 'Server: '\$(hostname) && echo 'User: '\$(whoami) && echo 'OS: '\$(cat /etc/os-release | grep PRETTY_NAME)"
    
    # Step 2: Install Node.js 20
    log "📦 Step 2: Installing Node.js 20..."
    run_on_server "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    run_on_server "sudo apt-get update && sudo apt-get install -y nodejs"
    run_on_server "node --version && npm --version"
    
    # Step 3: Install system dependencies
    log "🔧 Step 3: Installing system dependencies..."
    run_on_server "sudo apt-get update && sudo apt-get install -y postgresql-client redis-tools nginx pm2 build-essential"
    
    # Step 4: Create application directory
    log "📁 Step 4: Creating application directories..."
    run_on_server "mkdir -p ~/dcx-platform && cd ~/dcx-platform"
    
    # Step 5: Clone repositories
    log "📥 Step 5: Cloning repositories..."
    run_on_server "cd ~/dcx-platform && git clone https://github.com/datacentrix-software/dcx-cloud-frontend.git"
    run_on_server "cd ~/dcx-platform && git clone https://github.com/datacentrix-software/nlu-platform-backend.git"
    
    # Step 6: Switch to correct branches
    log "🔄 Step 6: Switching to deployment branches..."
    run_on_server "cd ~/dcx-platform/dcx-cloud-frontend && git checkout fix/dev-environment-july-2025"
    run_on_server "cd ~/dcx-platform/nlu-platform-backend && git checkout main"  # or appropriate branch
    
    # Step 7: Install dependencies
    log "📦 Step 7: Installing application dependencies..."
    run_on_server "cd ~/dcx-platform/dcx-cloud-frontend && npm install"
    run_on_server "cd ~/dcx-platform/nlu-platform-backend && npm install"
    
    # Step 8: Setup environment files
    log "⚙️ Step 8: Setting up environment configuration..."
    warning "Environment files need to be configured manually!"
    warning "Create .env files based on local development settings"
    
    # Step 9: Build frontend
    log "🔨 Step 9: Building frontend application..."
    run_on_server "cd ~/dcx-platform/dcx-cloud-frontend && npm run build"
    
    # Step 10: Database setup reminder
    log "💾 Step 10: Database setup required..."
    warning "PostgreSQL databases need to be created:"
    warning "- datacentrix_cloud_production"
    warning "- aas_product_production"
    warning "- aas_bronze_production"
    warning "- enetworks_product_production"
    
    # Step 11: Redis setup reminder
    log "🔄 Step 11: Redis setup required..."
    warning "Redis server needs to be configured and started"
    
    success "🎉 Basic deployment complete!"
    success "Next steps:"
    success "1. Configure environment variables"
    success "2. Set up PostgreSQL databases"
    success "3. Configure Redis"
    success "4. Set up Nginx reverse proxy"
    success "5. Start applications with PM2"
    
    log "📚 Deployment completed. Check server for next steps."
}

# Run deployment
main "$@"