# Base stage
FROM node:20-alpine AS base

# Install build dependencies for native modules (bcrypt, etc.)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    openssl-dev

# Install pnpm and nest CLI globally
RUN corepack enable && corepack prepare pnpm@latest --activate && \
    npm install -g @nestjs/cli

WORKDIR /app

# Dependencies stage
FROM base AS dependencies

# Copy package.json
COPY package.json ./

# Copy prisma schema and config
COPY prisma ./prisma

# Install dependencies (allow scripts for bcrypt)
RUN pnpm install --no-frozen-lockfile

# Generate Prisma Client
RUN pnpm prisma:generate

# Development stage
FROM base AS development

WORKDIR /app

# Copy node_modules from dependencies stage (includes Prisma Client)
COPY --from=dependencies /app/node_modules ./node_modules

# Copy package.json
COPY package.json ./

# Copy prisma schema (for potential regeneration)
COPY prisma ./prisma

# Regenerate Prisma Client in development stage to ensure it's available
# This ensures the generated directory exists even if it wasn't copied from host
RUN pnpm prisma:generate

# Copy entrypoint script
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Use entrypoint to run migrations before starting the app
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["pnpm", "exec", "nest", "start", "--watch"]

# Builder stage for production
FROM base AS builder

WORKDIR /app

# Copy node_modules from dependencies stage (includes Prisma Client)
COPY --from=dependencies /app/node_modules ./node_modules

# Copy package.json
COPY package.json ./

# Copy prisma schema
COPY prisma ./prisma

# Regenerate Prisma Client in builder stage to ensure it's available
RUN pnpm prisma:generate

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Install runtime dependencies only (not build tools)
RUN apk add --no-cache openssl

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package.json
COPY package.json ./

# Create prisma directory
RUN mkdir -p prisma

# Install only production dependencies
RUN pnpm install --prod --no-frozen-lockfile

# Copy Prisma Client from builder stage (needed at runtime)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy prisma schema and migrations for production
COPY --from=builder /app/prisma ./prisma

# Copy entrypoint script
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Use entrypoint to run migrations before starting the app
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main"]
