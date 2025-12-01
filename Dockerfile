# Stage 1 — build
FROM node:18-alpine AS builder
WORKDIR /app

# copy only package files first to leverage Docker cache
COPY package*.json ./
# If you use yarn, replace with yarn install
RUN npm install --production=false

# copy source
COPY . .

# If you build assets (example: TypeScript or frontend build), run build here
# RUN npm run build

# Stage 2 — run (smaller runtime image)
FROM node:18-alpine AS runner
WORKDIR /app

# copy only production deps from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# If you have a build output directory (e.g. dist), you can COPY only that
# EXPOSE the port your app uses
EXPOSE 3000

# Use a non-root user (optional but recommended)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# default start command — uses package.json "start"
CMD ["npm", "start"]
