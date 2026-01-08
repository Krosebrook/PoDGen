# Multi-stage Dockerfile for NanoGen Studio
# Optimized for production deployment with optional GPU support

# ============================================
# Stage 1: Build Stage
# ============================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build application
RUN npm run build

# ============================================
# Stage 2: Production Stage
# ============================================
FROM node:20-alpine AS production

# Add metadata
LABEL maintainer="NanoGen Studio <support@nanogen.studio>"
LABEL description="AI-native creative suite for product visualization"
LABEL version="0.1.0"

# Install production dependencies
RUN apk add --no-cache \
    curl \
    ca-certificates

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/index.html ./
COPY --from=builder --chown=nodejs:nodejs /app/manifest.json ./
COPY --from=builder --chown=nodejs:nodejs /app/sw.js ./

# Install serve for static file serving
RUN npm install -g serve

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check with fallback
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || wget --spider -q http://localhost:3000/ || exit 1

# Start application
CMD ["serve", "-s", "dist", "-l", "3000"]

# ============================================
# Stage 3: GPU-Enabled Stage (Optional)
# ============================================
FROM nvidia/cuda:12.2.0-runtime-ubuntu22.04 AS gpu

# Install Node.js
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs -s /bin/bash -m nodejs

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/index.html ./
COPY --from=builder --chown=nodejs:nodejs /app/manifest.json ./
COPY --from=builder --chown=nodejs:nodejs /app/sw.js ./

# Install serve
RUN npm install -g serve

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check with fallback
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || wget --spider -q http://localhost:3000/ || exit 1

# Environment variables for GPU
ENV NVIDIA_VISIBLE_DEVICES=all
ENV NVIDIA_DRIVER_CAPABILITIES=compute,utility

# Start application
CMD ["serve", "-s", "dist", "-l", "3000"]
