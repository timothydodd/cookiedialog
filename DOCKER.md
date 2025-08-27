# 🐳 Docker Deployment for CookieDialog Documentation

## Quick Start

### Pull and Run from Docker Hub

```bash
# Pull the latest image
docker pull timdoddcool/cookiedialog:latest

# Run the documentation site
docker run -d -p 8080:80 --name cookiedialog-docs timdoddcool/cookiedialog:latest

# Or run a specific commit version
docker run -d -p 8080:80 --name cookiedialog-docs timdoddcool/cookiedialog:a1b2c3d

# Access at http://localhost:8080
```

### Using Docker Compose (Recommended)

```bash
# Development
docker-compose up -d

# Production with custom domain
docker-compose --profile production up -d

# Stop services
docker-compose down
```

## Building Locally

```bash
# Build the Docker image
docker build -f Dockerfile.docs -t cookiedialog-docs .

# Run locally built image
docker run -d -p 8080:80 cookiedialog-docs
```

## Production Deployment

### 1. Basic HTTP Deployment

```bash
# Run on port 80
docker run -d \
  --name cookiedialog-docs \
  --restart unless-stopped \
  -p 80:80 \
  timdoddcool/cookiedialog:latest
```

### 2. With SSL/HTTPS (using reverse proxy)

Create an nginx reverse proxy or use Traefik:

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  cookiedialog-docs:
    image: timdoddcool/cookiedialog:latest
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.cookiedialog.rule=Host(\`cookiedialog.com\`)"
      - "traefik.http.routers.cookiedialog.tls.certresolver=letsencrypt"
```

### 3. Environment Variables

```bash
docker run -d \
  --name cookiedialog-docs \
  -p 8080:80 \
  -e NGINX_HOST=cookiedialog.com \
  timdoddcool/cookiedialog:latest
```

## Health Checks

The container includes a health check endpoint:

```bash
# Check if container is healthy
curl http://localhost:8080/health

# Docker health status
docker ps --format "table {{.Names}}\t{{.Status}}"
```

## Image Details

- **Base**: `nginx:alpine`
- **Size**: ~50MB
- **Platforms**: `linux/amd64`, `linux/arm64`
- **Port**: `80`
- **Health Check**: `/health`

## Available Tags

Every commit to the documentation creates multiple tags:

- `latest` - Latest stable version
- `{commit-hash}` - Short commit hash (7 chars) e.g., `a1b2c3d`
- `commit-{commit-hash}` - Prefixed commit hash e.g., `commit-a1b2c3d`
- `{timestamp}-{commit-hash}` - Timestamped version e.g., `20240827-143045-a1b2c3d`

```bash
# Use latest
docker pull timdoddcool/cookiedialog:latest

# Use specific commit
docker pull timdoddcool/cookiedialog:a1b2c3d

# Use timestamped version for exact builds
docker pull timdoddcool/cookiedialog:20240827-143045-a1b2c3d
```

## Automatic Updates

The Docker image is automatically built and pushed when:
- Documentation files in `/docs` are updated
- `Dockerfile.docs` is modified
- Manual workflow dispatch

## Custom Domain Setup

1. **Point your domain** to your server
2. **Run with custom domain**:
   ```bash
   docker run -d \
     --name cookiedialog-docs \
     -p 80:80 \
     -e NGINX_HOST=yourdomain.com \
     timdoddcool/cookiedialog:latest
   ```

## Logs and Debugging

```bash
# View container logs
docker logs cookiedialog-docs

# Access container shell
docker exec -it cookiedialog-docs sh

# View nginx configuration
docker exec cookiedialog-docs cat /etc/nginx/nginx.conf
```

## Performance

- **Gzip compression** enabled for all text assets
- **Static asset caching** (1 year expiry)
- **Multi-stage build** for minimal image size
- **Health checks** for container orchestration

## Security

- Security headers included (X-Frame-Options, X-Content-Type-Options)
- Minimal attack surface (Alpine Linux + Nginx)
- No shell access by default
- Regular base image updates

## Development

To rebuild and test locally:

```bash
# Build new image
docker build -f Dockerfile.docs -t cookiedialog-docs:dev .

# Test the build
docker run --rm -p 8080:80 cookiedialog-docs:dev

# Push to Docker Hub (maintainers only)
docker tag cookiedialog-docs:dev timdoddcool/cookiedialog:latest
docker push timdoddcool/cookiedialog:latest
```