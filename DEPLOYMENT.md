# NetForge Studio — Git Deployment Knowledge Base & Runbook

This Knowledge Base provides step-by-step instructions for deploying **NetForge Studio** using **Git**. 

Since NetForge Studio is a client-side Single Page Application (SPA) built with Vite, deployment involves initializing Git, pushing to a remote repository (such as GitHub, GitLab, or Gitea), and deploying the static build artifacts (`dist/`).

---

## Quick Sitemap & Architecture Overview

```
[ Local Workspace ] ──( git push )──> [ Remote Git Repository ]
                                                │
       ┌────────────────────────────────────────┼────────────────────────────────────────┐
       ▼                                        ▼                                        ▼
[ GitHub / Netlify / Vercel ]        [ Docker on Server / VPS ]              [ Standard Nginx / VPS ]
 (Automated CI/CD Deployment)         (Build & Serve Container)               (Git Pull + static serve)
```

---

## Phase 1: Initialize Local Git Repository

Execute these commands in your project root directory (e.g. `/opt/netforgestudio`):

### 1.1 Create `.gitignore`
Ensure temporary build artifacts and dependency folders are excluded from Git:

```bash
cat << 'EOF' > .gitignore
node_modules
dist
.env
.env.local
*.log
.DS_Store
EOF
```

### 1.2 Initialize & Commit Code
```bash
# Initialize git repository
git init

# Set default branch to main
git branch -M main

# Stage all project files
git add .

# Create initial commit
git commit -m "feat: initial commit for NetForge Studio v2.4.0"
```

### 1.3 Link & Push to Remote Repository
Create a repository on GitHub / GitLab / Gitea, then link and push:

```bash
# Replace with your actual repository URL
git remote add origin https://github.com/YOUR_USERNAME/netforge-studio.git

# Push main branch to remote
git push -u origin main
```

---

## Phase 2: Deployment Methods via Git

Choose the deployment strategy that fits your infrastructure requirements:

---

### Method A: GitHub Pages (Automated CI/CD — Recommended for GitHub Users)

Automatically builds and deploys your application every time you `git push`.

1. **Create GitHub Actions Workflow File**:
   Create a file named `.github/workflows/deploy.yml`:

```yaml
name: Deploy NetForge Studio

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Dependencies
        run: npm ci

      - name: Build Static App
        run: npm run build

      - name: Upload Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub: **Settings** -> **Pages**.
   - Under **Build and deployment** -> **Source**, select **GitHub Actions**.

3. **Deploy**:
   - Push code (`git push origin main`). Your app will be live at `https://YOUR_USERNAME.github.io/netforge-studio/`.

---

### Method B: Vercel or Netlify (Zero-Config One-Click Hosting)

1. Connect your GitHub/GitLab account to **Vercel** or **Netlify**.
2. Select your `netforge-studio` repository.
3. Configure project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Any future `git push` automatically updates the site with zero downtime.

---

### Method C: Self-Hosted Docker via Git (For VPS / On-Premise Servers)

Use Git on your server to pull the code, build the container, and serve it via Nginx Alpine.

#### 1. Add `Dockerfile` & `.dockerignore` to Repository:

**`Dockerfile`**:
```dockerfile
# Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**`.dockerignore`**:
```
node_modules
dist
.git
.gitignore
```

#### 2. Run on Your Server:

SSH into your server and run:

```bash
# Clone the repository onto your server
git clone https://github.com/YOUR_USERNAME/netforge-studio.git /opt/netforge-studio

cd /opt/netforge-studio

# Build and start Docker container
docker build -t netforge-studio .
docker run -d --name netforge-app -p 80:80 --restart always netforge-studio
```

#### 3. Update Script for Server (`deploy.sh`):

Create a one-line update script on your server for fast updates:

```bash
cat << 'EOF' > deploy.sh
#!/bin/bash
set -e
echo "Pulling latest changes from Git..."
git pull origin main

echo "Rebuilding Docker container..."
docker build -t netforge-studio .
docker stop netforge-app || true
docker rm netforge-app || true
docker run -d --name netforge-app -p 80:80 --restart always netforge-studio

echo "Deployment successful!"
EOF

chmod +x deploy.sh
```

---

### Method D: Self-Hosted Nginx VM via Git (Standard Linux Server)

For standard Linux servers (Ubuntu/Debian) running Nginx without Docker:

```bash
# On your server:
git clone https://github.com/YOUR_USERNAME/netforge-studio.git /var/www/netforge-studio
cd /var/www/netforge-studio

# Build production assets
npm ci
npm run build

# Configure Nginx site block to serve /var/www/netforge-studio/dist
```

Sample Nginx Config (`/etc/nginx/sites-available/netforge`):
```nginx
server {
    listen 80;
    server_name netforge.yourdomain.com;
    root /var/www/netforge-studio/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Phase 3: Continuous Deployment Workflow (Runbook)

Whenever you make changes to the codebase locally:

```bash
# 1. Test changes locally
npm run dev

# 2. Verify production build passes
npm run build

# 3. Commit and push to Git
git add .
git commit -m "feat: add new feature description"
git push origin main
```

- **If using GitHub Pages / Vercel**: Deployment happens automatically within ~60 seconds.
- **If using VPS / Docker**: Run `./deploy.sh` on your server.
