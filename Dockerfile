# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY tsconfig.json ./

# Install all dependencies (including devDependencies for building)
RUN pnpm install --frozen-lockfile

# Copy source code and prisma schema
COPY src ./src

# Generate Prisma Client (specify schema location)
RUN pnpm exec prisma generate --schema=./src/prisma/schema.prisma

# Build TypeScript code (this will include seed.ts)
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install OpenSSL 1.1 and other required libraries for Prisma
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    ca-certificates

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy prisma schema and generate client
COPY src/prisma ./src/prisma
RUN pnpm exec prisma generate --schema=./src/prisma/schema.prisma

# Copy built files from builder (includes dist/prisma/seed.js)
COPY --from=builder /app/dist ./dist

# Copy source files for Swagger documentation
COPY --from=builder /app/src ./src

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

CMD ["node", "dist/index.js"]