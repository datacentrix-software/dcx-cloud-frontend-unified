#!/bin/bash

# DCX Cloud Platform - Data Migration Script
# Migrate local database data to server
# Date: July 4, 2025

set -e

# Server configuration
SERVER_HOST="45.220.228.16"
SERVER_PORT="2423"
SERVER_USER="dev_2_user"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to create database dump
create_dump() {
    local db_name=$1
    local dump_file=$2
    
    log "Creating dump for database: $db_name"
    pg_dump -h localhost -U postgres -d "$db_name" > "$dump_file"
    
    if [ $? -eq 0 ]; then
        success "Dump created successfully: $dump_file"
    else
        error "Failed to create dump for $db_name"
        exit 1
    fi
}

# Function to transfer and restore dump
transfer_and_restore() {
    local dump_file=$1
    local target_db=$2
    
    log "Transferring $dump_file to server..."
    scp -P $SERVER_PORT "$dump_file" $SERVER_USER@$SERVER_HOST:~/dcx-platform/
    
    if [ $? -eq 0 ]; then
        success "File transferred successfully"
        
        log "Restoring database: $target_db"
        ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "cd ~/dcx-platform && sudo -u postgres psql -d $target_db < $(basename $dump_file)"
        
        if [ $? -eq 0 ]; then
            success "Database $target_db restored successfully"
        else
            error "Failed to restore $target_db"
        fi
    else
        error "Failed to transfer $dump_file"
    fi
}

main() {
    log "🚀 Starting DCX Cloud Platform Data Migration"
    
    # Create dumps directory
    mkdir -p ./db-dumps
    cd ./db-dumps
    
    warning "Make sure local databases are accessible and PostgreSQL is running"
    warning "This script will overwrite data on the server!"
    
    read -p "Continue with data migration? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Migration cancelled by user"
        exit 0
    fi
    
    # Database mapping: local_db -> server_db
    declare -A DB_MAPPING=(
        ["datacentrix_cloud_local"]="datacentrix_cloud_production"
        ["aas_product_local"]="aas_product_production"
        ["aas_bronze_local"]="aas_bronze_production"
        ["enetworks_product_local"]="enetworks_product_production"
    )
    
    # Create dumps and transfer
    for local_db in "${!DB_MAPPING[@]}"; do
        server_db="${DB_MAPPING[$local_db]}"
        dump_file="${local_db}_dump.sql"
        
        log "Processing: $local_db -> $server_db"
        
        # Create dump
        create_dump "$local_db" "$dump_file"
        
        # Transfer and restore
        transfer_and_restore "$dump_file" "$server_db"
        
        # Clean up local dump file
        rm -f "$dump_file"
    done
    
    success "🎉 Data migration completed successfully!"
    success "All databases have been migrated to the server"
    
    log "Next steps:"
    log "1. Verify data integrity on server"
    log "2. Test application connectivity"
    log "3. Start backend and frontend services"
}

# Run migration
main "$@"