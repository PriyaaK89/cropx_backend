# Stage 1 — build
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies (smaller image)
RUN npm install --production

# Copy source code
COPY . .

# If you build assets (TypeScript, etc.), build here
# RUN npm run build

# Stage 2 — runtime (smaller image)
FROM node:18-alpine AS runner
WORKDIR /app

# Copy only production dependencies and app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Expose port
EXPOSE 3000

# Add non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy wait-for-it script
COPY wait-for-it.sh /app/wait-for-it.sh
RUN chmod +x /app/wait-for-it.sh

# Wait for MySQL to be ready before starting backend
CMD ["sh", "/app/wait-for-it.sh", "mysql:3306", "--", "npm", "start"]
