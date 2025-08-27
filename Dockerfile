# Multi-stage build for the CookieDialog library and documentation

# Stage 1: Build the library
FROM node:18-alpine AS library-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source files
COPY tsconfig.json webpack.config.js ./
COPY src/ ./src/
COPY demo/ ./demo/

# Build the library
RUN npm run build

# Stage 2: Build the documentation
FROM node:18-alpine AS docs-builder

WORKDIR /app/docs

# Copy docs package files
COPY docs/package*.json ./
RUN npm ci

# Copy documentation source
COPY docs/ ./

# Build the documentation site
RUN npm run build

# Stage 3: Production image with nginx
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built library files to CDN path
COPY --from=library-builder /app/dist /usr/share/nginx/html/cdn

# Copy demo files
COPY --from=library-builder /app/demo /usr/share/nginx/html/demo

# Copy built documentation site
COPY --from=docs-builder /app/docs/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]