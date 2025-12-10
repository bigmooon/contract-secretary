#!/bin/bash

# Docker Development Helper Script
# This script provides convenient commands for Docker-based development

set -e

COLOR_RESET='\033[0m'
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_RED='\033[0;31m'
COLOR_BLUE='\033[0;34m'

print_success() {
    echo -e "${COLOR_GREEN}✓ $1${COLOR_RESET}"
}

print_error() {
    echo -e "${COLOR_RED}✗ $1${COLOR_RESET}"
}

print_info() {
    echo -e "${COLOR_BLUE}ℹ $1${COLOR_RESET}"
}

print_warning() {
    echo -e "${COLOR_YELLOW}⚠ $1${COLOR_RESET}"
}

print_header() {
    echo -e "\n${COLOR_BLUE}═══════════════════════════════════════${COLOR_RESET}"
    echo -e "${COLOR_BLUE}  $1${COLOR_RESET}"
    echo -e "${COLOR_BLUE}═══════════════════════════════════════${COLOR_RESET}\n"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_success "Docker and Docker Compose are installed"
}

# Start services
start_services() {
    print_header "Starting Docker Services"

    if [ -f ".env.dev" ]; then
        print_info "Using .env.dev configuration"
        docker-compose --env-file .env.dev up -d
    else
        print_warning ".env.dev not found, please create it from .env.example"
        print_warning "cp .env.example .env.dev"
        exit 1
    fi

    print_success "Services started successfully"
    print_info "Waiting for services to be healthy..."
    sleep 5

    show_status
}

# Stop services
stop_services() {
    print_header "Stopping Docker Services"
    docker-compose down
    print_success "Services stopped successfully"
}

# Restart services
restart_services() {
    print_header "Restarting Docker Services"
    docker-compose restart
    print_success "Services restarted successfully"
}

# Show service status
show_status() {
    print_header "Service Status"
    docker-compose ps

    echo ""
    print_info "Service URLs:"
    echo "  • API Server:      http://localhost:3000"
    echo "  • API Docs:        http://localhost:3000/api"
    echo "  • pgAdmin:         http://localhost:5050"
    echo "  • PostgreSQL:      localhost:5432"
}

# Show logs
show_logs() {
    print_header "Service Logs"
    if [ -z "$1" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$1"
    fi
}

# Clean everything
clean_all() {
    print_header "Cleaning Docker Resources"
    print_warning "This will remove all containers, volumes, and images!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v
        docker-compose rm -f
        print_success "Cleaned successfully"
    else
        print_info "Cancelled"
    fi
}

# Database operations
db_shell() {
    print_header "PostgreSQL Shell"
    docker-compose exec postgres psql -U postgres -d contract_secretary
}

db_backup() {
    print_header "Database Backup"
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker-compose exec -T postgres pg_dump -U postgres contract_secretary > "$BACKUP_FILE"
    print_success "Database backed up to $BACKUP_FILE"
}

db_restore() {
    if [ -z "$1" ]; then
        print_error "Please provide backup file: $0 db:restore <backup.sql>"
        exit 1
    fi

    print_header "Database Restore"
    print_warning "This will overwrite the current database!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose exec -T postgres psql -U postgres contract_secretary < "$1"
        print_success "Database restored from $1"
    else
        print_info "Cancelled"
    fi
}

# Server operations
server_shell() {
    print_header "Server Shell"
    docker-compose exec server sh
}

server_rebuild() {
    print_header "Rebuilding Server"
    docker-compose up -d --build server
    print_success "Server rebuilt successfully"
}

# Show help
show_help() {
    cat << EOF
Docker Development Helper Script

Usage: $0 [command]

Commands:
  start              Start all services
  stop               Stop all services
  restart            Restart all services
  status             Show service status
  logs [service]     Show logs (optionally for specific service)
  clean              Remove all containers and volumes

  db:shell           Open PostgreSQL shell
  db:backup          Backup database
  db:restore <file>  Restore database from backup

  server:shell       Open server container shell
  server:rebuild     Rebuild server container

  help               Show this help message

Examples:
  $0 start                    # Start all services
  $0 logs server              # View server logs
  $0 db:backup                # Backup database
  $0 db:restore backup.sql    # Restore from backup

EOF
}

# Main script
main() {
    check_docker

    case "${1:-help}" in
        start)
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs "$2"
            ;;
        clean)
            clean_all
            ;;
        db:shell)
            db_shell
            ;;
        db:backup)
            db_backup
            ;;
        db:restore)
            db_restore "$2"
            ;;
        server:shell)
            server_shell
            ;;
        server:rebuild)
            server_rebuild
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
