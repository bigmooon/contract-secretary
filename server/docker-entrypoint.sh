#!/bin/sh
set -e

echo "Running database migrations..."
pnpm prisma:migrate

echo "Starting application..."
exec "$@"






