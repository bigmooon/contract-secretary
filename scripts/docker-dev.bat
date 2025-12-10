@echo off
REM Docker Development Helper Script for Windows
REM This script provides convenient commands for Docker-based development

setlocal enabledelayedexpansion

set "COMPOSE_FILE=docker-compose.yml"
set "ENV_FILE=.env.dev"

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="status" goto status
if "%1"=="logs" goto logs
if "%1"=="clean" goto clean
if "%1"=="db:shell" goto db_shell
if "%1"=="db:backup" goto db_backup
if "%1"=="db:restore" goto db_restore
if "%1"=="server:shell" goto server_shell
if "%1"=="server:rebuild" goto server_rebuild
goto unknown

:start
echo.
echo =====================================
echo   Starting Docker Services
echo =====================================
echo.

if exist "%ENV_FILE%" (
    echo [INFO] Using .env.dev configuration
    docker-compose --env-file %ENV_FILE% up -d
) else (
    echo [ERROR] .env.dev not found, please create it from .env.example
    echo [INFO] Run: copy .env.example .env.dev
    goto end
)

echo.
echo [SUCCESS] Services started successfully
timeout /t 3 /nobreak >nul
goto status

:stop
echo.
echo =====================================
echo   Stopping Docker Services
echo =====================================
echo.

docker-compose down
echo [SUCCESS] Services stopped successfully
goto end

:restart
echo.
echo =====================================
echo   Restarting Docker Services
echo =====================================
echo.

docker-compose restart
echo [SUCCESS] Services restarted successfully
goto end

:status
echo.
echo =====================================
echo   Service Status
echo =====================================
echo.

docker-compose ps

echo.
echo [INFO] Service URLs:
echo   - API Server:      http://localhost:3000
echo   - API Docs:        http://localhost:3000/api
echo   - pgAdmin:         http://localhost:5050
echo   - PostgreSQL:      localhost:5432
goto end

:logs
echo.
echo =====================================
echo   Service Logs
echo =====================================
echo.

if "%2"=="" (
    docker-compose logs -f
) else (
    docker-compose logs -f %2
)
goto end

:clean
echo.
echo =====================================
echo   Cleaning Docker Resources
echo =====================================
echo.

echo [WARN] This will remove all containers, volumes, and images!
set /p CONFIRM="Are you sure? (y/N): "

if /i "%CONFIRM%"=="y" (
    docker-compose down -v
    docker-compose rm -f
    echo [SUCCESS] Cleaned successfully
) else (
    echo [INFO] Cancelled
)
goto end

:db_shell
echo.
echo =====================================
echo   PostgreSQL Shell
echo =====================================
echo.

docker-compose exec postgres psql -U postgres -d contract_secretary
goto end

:db_backup
echo.
echo =====================================
echo   Database Backup
echo =====================================
echo.

for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set DATE=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set TIME=%%a%%b)
set BACKUP_FILE=backup_%DATE%_%TIME%.sql

docker-compose exec -T postgres pg_dump -U postgres contract_secretary > %BACKUP_FILE%
echo [SUCCESS] Database backed up to %BACKUP_FILE%
goto end

:db_restore
if "%2"=="" (
    echo [ERROR] Please provide backup file: %0 db:restore backup.sql
    goto end
)

echo.
echo =====================================
echo   Database Restore
echo =====================================
echo.

echo [WARN] This will overwrite the current database!
set /p CONFIRM="Are you sure? (y/N): "

if /i "%CONFIRM%"=="y" (
    type %2 | docker-compose exec -T postgres psql -U postgres contract_secretary
    echo [SUCCESS] Database restored from %2
) else (
    echo [INFO] Cancelled
)
goto end

:server_shell
echo.
echo =====================================
echo   Server Shell
echo =====================================
echo.

docker-compose exec server sh
goto end

:server_rebuild
echo.
echo =====================================
echo   Rebuilding Server
echo =====================================
echo.

docker-compose up -d --build server
echo [SUCCESS] Server rebuilt successfully
goto end

:help
echo.
echo Docker Development Helper Script for Windows
echo.
echo Usage: %0 [command]
echo.
echo Commands:
echo   start              Start all services
echo   stop               Stop all services
echo   restart            Restart all services
echo   status             Show service status
echo   logs [service]     Show logs (optionally for specific service)
echo   clean              Remove all containers and volumes
echo.
echo   db:shell           Open PostgreSQL shell
echo   db:backup          Backup database
echo   db:restore ^<file^>  Restore database from backup
echo.
echo   server:shell       Open server container shell
echo   server:rebuild     Rebuild server container
echo.
echo   help               Show this help message
echo.
echo Examples:
echo   %0 start                    # Start all services
echo   %0 logs server              # View server logs
echo   %0 db:backup                # Backup database
echo   %0 db:restore backup.sql    # Restore from backup
echo.
goto end

:unknown
echo [ERROR] Unknown command: %1
echo Run '%0 help' for usage information
goto end

:end
endlocal
