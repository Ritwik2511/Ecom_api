# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies (required for some node modules and prisma)
RUN apk add --no-cache openssl build-base python3

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the source code
COPY . .

# --- Production Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache openssl

# Set environment to production
ENV NODE_ENV=production

# Copy only the necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/index.js ./
COPY --from=builder /app/swagger.js ./
COPY --from=builder /app/prismaClient.js ./
# Copy directories
COPY --from=builder /app/routes ./routes/
COPY --from=builder /app/controllers ./controllers/
COPY --from=builder /app/services ./services/
COPY --from=builder /app/middleware ./middleware/
COPY --from=builder /app/config ./config/
COPY --from=builder /app/utils ./utils/
COPY --from=builder /app/validations ./validations/

# Create logs directory and set permissions
RUN mkdir -p logs && chmod 777 logs

# Expose the port
EXPOSE 3000

# Use a non-root user for security (optional but recommended)
# RUN addgroup -S nodeapp && adduser -S nodeapp -G nodeapp
# USER nodeapp

# Start the application
CMD ["npm", "start"]
