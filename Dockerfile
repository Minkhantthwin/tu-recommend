# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install OpenSSL 1.1 and other required libraries for Prisma
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    ca-certificates

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy prisma schema and generate client
COPY src/prisma ./src/prisma
RUN npx prisma generate

# Copy built files from builder
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