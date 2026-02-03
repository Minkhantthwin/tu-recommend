# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy source code and prisma schema
COPY src ./src

# Generate Prisma Client (specify schema location)
RUN npx prisma generate --schema=./src/prisma/schema.prisma

# Build TypeScript code (this will include seed.ts)
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install OpenSSL 1.1 and other required libraries for Prisma
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    ca-certificates

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy prisma schema and generate client
COPY src/prisma ./src/prisma
RUN npx prisma generate --schema=./src/prisma/schema.prisma

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