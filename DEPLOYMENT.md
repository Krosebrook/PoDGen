# Deployment Guide

This guide covers deploying NanoGen Studio to various hosting platforms and environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Build Process](#build-process)
4. [Deployment Platforms](#deployment-platforms)
   - [Vercel](#vercel-recommended)
   - [Netlify](#netlify)
   - [AWS S3 + CloudFront](#aws-s3--cloudfront)
   - [Docker](#docker)
   - [Self-Hosted](#self-hosted)
5. [Post-Deployment](#post-deployment)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] Node.js 20.x or higher installed
- [ ] A valid Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- [ ] Git repository access
- [ ] Account on your chosen hosting platform

---

## Environment Configuration

### Required Environment Variables

```bash
# Required: Google Gemini API Key
API_KEY=your_gemini_api_key_here

# Optional: Environment mode
NODE_ENV=production
```

### Security Best Practices

1. **API Key Management**
   - Use separate keys for dev/staging/production
   - Enable API restrictions in Google Cloud Console
   - Rotate keys every 90 days
   - Set usage quotas and billing alerts

2. **Key Restrictions**
   ```
   Google Cloud Console → APIs & Services → Credentials
   ├── Application restrictions: HTTP referrers (your-domain.com)
   ├── API restrictions: Generative Language API only
   └── Usage quotas: Set appropriate limits
   ```

3. **Never Commit Secrets**
   ```bash
   # Ensure .env is in .gitignore
   echo ".env" >> .gitignore
   git rm --cached .env  # Remove if accidentally committed
   ```

---

## Build Process

### Local Build

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Build Output

The build process creates a `dist/` directory with:

```
dist/
├── index.html              # Entry point
├── assets/
│   ├── index-[hash].js    # Main bundle (~205 KB)
│   ├── index-[hash].css   # Styles
│   └── [vendor]-[hash].js # Vendor chunks
└── metadata.json          # App metadata
```

### Build Optimization

#### 1. Analyze Bundle Size

```bash
# Install analyzer
npm install -D vite-bundle-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ]
});

# Run build and open report
npm run build
```

#### 2. Environment-Specific Builds

```bash
# Development build (larger, with source maps)
npm run build -- --mode development

# Production build (optimized, minified)
npm run build -- --mode production
```

---

## Deployment Platforms

### Vercel (Recommended)

Vercel offers the easiest deployment with excellent performance.

#### Option 1: GitHub Integration

1. **Connect Repository**
   ```
   https://vercel.com/new
   → Import Git Repository
   → Select your GitHub repo
   ```

2. **Configure Project**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Add Environment Variables**
   ```
   Settings → Environment Variables
   → Add API_KEY
   → Set to Production, Preview, Development
   → Save
   ```

4. **Deploy**
   ```
   Click "Deploy"
   Wait 1-2 minutes
   Visit your-project.vercel.app
   ```

#### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add API_KEY production
# Paste your API key when prompted

# Deploy to production
vercel --prod
```

#### Vercel Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "env": {
    "API_KEY": "@api_key"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

### Netlify

Netlify provides similar ease of use with great DX.

#### Option 1: Netlify UI

1. **Connect Repository**
   ```
   https://app.netlify.com/start
   → Import from Git
   → Select your repo
   ```

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Environment Variables**
   ```
   Site settings → Environment variables
   → Add API_KEY
   → Save
   ```

#### Option 2: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod

# Set environment variable
netlify env:set API_KEY your_api_key_here
```

#### Netlify Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

### AWS S3 + CloudFront

For full control and scalability.

#### 1. Build Application

```bash
npm run build
```

#### 2. Create S3 Bucket

```bash
# Install AWS CLI
pip install awscli

# Configure credentials
aws configure

# Create bucket
aws s3 mb s3://nanogen-studio-prod

# Enable static website hosting
aws s3 website s3://nanogen-studio-prod \
  --index-document index.html \
  --error-document index.html
```

#### 3. Upload Build

```bash
# Sync dist folder to S3
aws s3 sync dist/ s3://nanogen-studio-prod \
  --delete \
  --cache-control max-age=31536000,public

# Update index.html separately (no cache)
aws s3 cp dist/index.html s3://nanogen-studio-prod/index.html \
  --cache-control no-cache,no-store,must-revalidate
```

#### 4. Create CloudFront Distribution

```bash
# Create distribution (via AWS Console)
AWS Console → CloudFront → Create Distribution
├── Origin Domain: nanogen-studio-prod.s3.amazonaws.com
├── Viewer Protocol Policy: Redirect HTTP to HTTPS
├── Compress Objects: Yes
├── Default Root Object: index.html
└── Custom Error Pages:
    └── 403 → /index.html (for SPA routing)
```

#### 5. Setup Environment Variables

For client-side apps, environment variables must be baked into the build:

```bash
# Create .env.production
echo "API_KEY=your_production_key" > .env.production

# Build with production env
npm run build
```

#### 6. Invalidate CloudFront Cache

```bash
# After deployment
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

#### Automation Script

Create `deploy-aws.sh`:

```bash
#!/bin/bash
set -e

echo "Building application..."
npm run build

echo "Uploading to S3..."
aws s3 sync dist/ s3://nanogen-studio-prod \
  --delete \
  --cache-control max-age=31536000,public

aws s3 cp dist/index.html s3://nanogen-studio-prod/index.html \
  --cache-control no-cache,no-store,must-revalidate

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"

echo "Deployment complete!"
```

```bash
chmod +x deploy-aws.sh
./deploy-aws.sh
```

---

### Docker

Containerize for consistent deployments.

#### Dockerfile

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # No cache for index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

#### Build and Run

```bash
# Build image
docker build -t nanogen-studio .

# Run container
docker run -d \
  --name nanogen-studio \
  -p 8080:80 \
  nanogen-studio

# Access at http://localhost:8080
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f
```

---

### Self-Hosted

Deploy on your own server.

#### Requirements

- Ubuntu 20.04+ or similar Linux distribution
- Node.js 20.x
- Nginx or Apache
- SSL certificate (Let's Encrypt recommended)

#### Setup Steps

1. **Install Node.js**

```bash
# Using Node Version Manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

2. **Clone and Build**

```bash
# Clone repository
git clone https://github.com/Krosebrook/PoDGen.git /var/www/nanogen-studio
cd /var/www/nanogen-studio

# Install dependencies
npm install

# Build
npm run build
```

3. **Configure Nginx**

```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Create site config
sudo nano /etc/nginx/sites-available/nanogen-studio
```

Add configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/nanogen-studio/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/nanogen-studio /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

4. **Setup SSL with Let's Encrypt**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (runs twice daily)
sudo systemctl enable certbot.timer
```

5. **Process Manager (PM2)**

For running dev server in production (not recommended, use static build instead):

```bash
# Install PM2
npm install -g pm2

# Start app
pm2 start npm --name "nanogen-studio" -- run dev

# Save process list
pm2 save

# Auto-start on reboot
pm2 startup
```

---

## Post-Deployment

### Checklist

After deployment, verify:

- [ ] Application loads correctly
- [ ] API key is configured
- [ ] Image upload works
- [ ] AI generation works
- [ ] Export functionality works
- [ ] All features are accessible
- [ ] No console errors
- [ ] SSL certificate is valid (if applicable)
- [ ] Performance is acceptable

### Performance Testing

```bash
# Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://your-domain.com --view

# Target scores:
# Performance: 90+
# Accessibility: 90+
# Best Practices: 90+
# SEO: 90+
```

### Security Hardening

1. **Content Security Policy**

Add to index.html or server config:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://generativelanguage.googleapis.com;">
```

2. **Rate Limiting**

For self-hosted, use Nginx:

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api {
    limit_req zone=api burst=20 nodelay;
    # ... rest of config
}
```

---

## Monitoring

### Error Tracking

#### Sentry Integration

```bash
npm install @sentry/react @sentry/vite-plugin
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Analytics

#### Google Analytics

```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Uptime Monitoring

Use services like:
- UptimeRobot (free tier available)
- Pingdom
- StatusCake
- New Relic

---

## Troubleshooting

### Build Failures

**Issue:** `npm run build` fails

**Solutions:**
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build

# Check Node version
node --version  # Should be 20.x+

# Check for TypeScript errors
npx tsc --noEmit
```

### Environment Variable Issues

**Issue:** API_KEY not found

**Solutions:**
```bash
# Verify .env file
cat .env | grep API_KEY

# For Vite, prefix with VITE_
VITE_API_KEY=your_key_here

# Restart dev server
npm run dev
```

### Deployment Issues

**Issue:** White screen after deployment

**Solutions:**
```bash
# Check base path in vite.config.ts
export default defineConfig({
  base: '/',  # or '/your-subdirectory/'
});

# Rebuild
npm run build
```

**Issue:** 404 on refresh (SPA routing)

**Solutions:**
- Vercel/Netlify: Add `vercel.json` or `netlify.toml` (see above)
- Nginx: Ensure `try_files` directive is set
- Apache: Use `.htaccess` with mod_rewrite

### Performance Issues

**Issue:** Slow loading times

**Solutions:**
```bash
# Enable gzip compression
# Nginx: gzip on;
# Apache: mod_deflate

# Use CDN for assets
# Cloudflare, AWS CloudFront, etc.

# Optimize images
# Use WebP format
# Compress before upload

# Code splitting
# Already implemented via React.lazy
```

---

## Rollback Procedure

### Vercel/Netlify

```bash
# Via UI: Deployments → Previous deployment → "Rollback to this version"

# Via CLI
vercel rollback  # Vercel
netlify rollback # Netlify
```

### AWS

```bash
# Restore previous S3 version
aws s3 sync s3://backup-bucket/ s3://nanogen-studio-prod/

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### Docker

```bash
# Use previous image
docker run previous-image-tag
```

---

## Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

---

**Need Help?**

- Open an issue: [GitHub Issues](https://github.com/Krosebrook/PoDGen/issues)
- Check documentation: [README.md](./README.md)
- Review security: [SECURITY.md](./SECURITY.md)

---

**Last Updated:** December 30, 2024  
**Next Review:** After v0.1.0 release

---

## Docker Deployment (Production-Ready)

### Quick Start with Docker

```bash
# 1. Build the image
docker build -t nanogen-studio:latest .

# 2. Run the container
docker run -d \
  --name nanogen-studio \
  -p 3000:3000 \
  -e API_KEY=your_api_key_here \
  nanogen-studio:latest

# 3. Access the application
# Visit http://localhost:3000
```

### Docker Compose (Recommended)

The project includes a `docker-compose.yml` file for easy multi-container deployment.

```bash
# 1. Create .env file
cp .env.example .env
# Edit .env and set API_KEY

# 2. Start all services
docker-compose up -d

# 3. View logs
docker-compose logs -f web

# 4. Stop services
docker-compose down
```

### Docker Compose Services

- **web**: Main NanoGen Studio application
- **redis**: Optional caching backend
- **nginx**: Optional reverse proxy

### Multi-Stage Dockerfile

The Dockerfile uses multi-stage builds for optimization:

1. **Builder Stage**: Installs dependencies and builds the application
2. **Production Stage**: Lightweight Alpine-based image for production
3. **GPU Stage**: NVIDIA CUDA-enabled for GPU acceleration

### GPU-Enabled Deployment

For GPU-accelerated inference (future feature):

```bash
# Build GPU image
docker build --target gpu -t nanogen-studio:gpu .

# Run with NVIDIA runtime
docker run -d \
  --name nanogen-studio-gpu \
  --runtime=nvidia \
  --gpus all \
  -p 3000:3000 \
  -e API_KEY=your_api_key_here \
  -e NVIDIA_VISIBLE_DEVICES=all \
  nanogen-studio:gpu
```

### Docker Health Checks

The container includes built-in health checks:

```bash
# Check container health
docker ps
# Look for "healthy" status

# View health check logs
docker inspect nanogen-studio --format='{{json .State.Health}}'
```

---

## CI/CD Pipeline (GitHub Actions)

### Automated Workflows

The project includes a complete CI/CD pipeline in `.github/workflows/ci-cd.yml`:

#### Workflow Jobs

1. **Lint & Type Check**
   - Runs TypeScript compiler in `--noEmit` mode
   - Catches type errors before deployment

2. **Test Suite**
   - Runs all unit tests with Vitest
   - Generates code coverage reports
   - Uploads coverage to Codecov

3. **Build Application**
   - Builds production bundle
   - Uploads artifacts for deployment
   - Verifies successful build

4. **Security Audit**
   - Runs `npm audit` for dependency vulnerabilities
   - Optional Snyk security scanning
   - Continues on non-critical issues

5. **Docker Build** (main branch only)
   - Builds and pushes Docker image
   - Tags with `latest` and commit SHA
   - Uses Docker layer caching

### Setting Up CI/CD

#### 1. Required Secrets

Add these secrets to your GitHub repository:

```
Settings → Secrets and variables → Actions → New repository secret
```

- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_TOKEN`: Docker Hub access token
- `SNYK_TOKEN`: Snyk API token (optional)

#### 2. Branch Protection

Enable branch protection for `main`:

```
Settings → Branches → Add branch protection rule
├── Require status checks to pass before merging
│   ├── lint
│   ├── test
│   └── build
├── Require pull request reviews
└── Include administrators
```

#### 3. Automatic Deployments

The pipeline automatically:
- Runs on every push to `main` and `develop`
- Runs on all pull requests
- Builds Docker images on `main` branch
- Can be extended to deploy to cloud platforms

### Manual Workflow Trigger

```bash
# Go to GitHub Actions tab
Actions → CI/CD Pipeline → Run workflow
```

---

## Environment-Specific Configuration

### Development

```bash
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_AI_CACHE=false
```

### Staging

```bash
NODE_ENV=staging
LOG_LEVEL=info
ENABLE_AI_CACHE=true
CACHE_TTL_MS=1800000  # 30 minutes
```

### Production

```bash
NODE_ENV=production
LOG_LEVEL=warn
ENABLE_AI_CACHE=true
CACHE_TTL_MS=3600000  # 1 hour
ENABLE_COST_TRACKING=true
```

---

## Performance & Optimization

### Build Performance

- **Multi-stage Docker builds**: Reduces final image size by ~60%
- **Layer caching**: Speeds up rebuilds significantly
- **Asset optimization**: Vite minifies and chunks automatically

### Runtime Performance

- **Lazy loading**: Components loaded on-demand
- **AI request caching**: Reduces API calls by 40-60%
- **Service worker**: Caches static assets locally

### Monitoring Recommendations

1. **Application Performance**
   - Use Google Analytics for page load metrics
   - Monitor Core Web Vitals (LCP, FID, CLS)
   - Track AI request latency

2. **Error Tracking**
   - Integrate Sentry for error monitoring
   - Set up alerts for critical errors
   - Track error rates per feature

3. **Resource Usage**
   - Monitor Docker container CPU/memory
   - Track API quota usage
   - Set up billing alerts

---

## Security Checklist

- [x] TypeScript strict mode enabled
- [x] Prompt injection protection
- [x] Rate limiting implemented
- [x] Input validation and sanitization
- [ ] HTTPS enforced (via reverse proxy)
- [ ] CSP headers configured
- [ ] CORS policies defined
- [ ] Regular dependency audits

---

## Troubleshooting

### Docker Issues

**Container fails to start:**
```bash
# Check logs
docker logs nanogen-studio

# Common issues:
# - Missing API_KEY environment variable
# - Port 3000 already in use
# - Insufficient memory allocation
```

**Build fails:**
```bash
# Clear Docker build cache
docker builder prune -a

# Rebuild without cache
docker build --no-cache -t nanogen-studio:latest .
```

### CI/CD Issues

**Type check fails:**
```bash
# Run locally to debug
npx tsc --noEmit

# Check for new strict mode violations
```

**Tests fail in CI but pass locally:**
```bash
# Ensure same Node.js version
nvm use 20

# Check for environment-specific issues
NODE_ENV=test npm test
```

---

**Last Updated**: 2026-01-08  
**Version**: 0.1.0 with Production Deployment Support
