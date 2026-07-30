#!/bin/bash
# ==============================================================================
# NetForge Studio — Server Setup & Docker Deployment (SSH Deploy Key Method)
# Target OS: Ubuntu / Debian / Fedora / CentOS
# Repository: git@github.com:Davidv9200/netforgestudio.git
# ==============================================================================

set -e

GITHUB_USER="${GITHUB_USER:-Davidv9200}"
REPO_NAME="${REPO_NAME:-netforgestudio}"
REPO_URL="git@github.com:${GITHUB_USER}/${REPO_NAME}.git"
INSTALL_DIR="/opt/netforgestudio"
CONTAINER_NAME="netforge-studio-app"
PORT=80
SOURCE_DIR="$(pwd)"

echo "🚀 Starting NetForge Studio Deployment Setup (Method 1: SSH Deploy Key)..."

# 1. Install prerequisites (Git & Docker)
echo "📦 Checking dependencies..."

if ! command -v git &> /dev/null; then
    echo "Installing Git..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y git
    elif command -v dnf &> /dev/null; then
        sudo dnf install -y git
    fi
fi

if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo systemctl enable --now docker
    sudo usermod -aG docker $USER || true
fi

# Ensure SSH host key for github.com is recognized
mkdir -p ~/.ssh
chmod 700 ~/.ssh
if ! grep -q "github.com" ~/.ssh/known_hosts 2>/dev/null; then
    echo "🔑 Adding github.com to known_hosts..."
    ssh-keyscan -t ed25519,rsa github.com >> ~/.ssh/known_hosts 2>/dev/null || true
fi

# Prepare target installation directory with proper user permissions
echo "📁 Ensuring directory permissions for $INSTALL_DIR..."
sudo mkdir -p "$INSTALL_DIR"
sudo chown -R $USER:$USER "$INSTALL_DIR"

# 2. Clone or pull latest repository
if [ ! -d "$INSTALL_DIR/.git" ]; then
    echo "📥 Cloning private repository from $REPO_URL to $INSTALL_DIR..."
    git clone "$REPO_URL" "$INSTALL_DIR" || {
        echo ""
        echo "❌ Error cloning repository!"
        echo "Please make sure you generated an SSH key on this server and added it as a Deploy Key in GitHub:"
        echo "1. Run: cat ~/.ssh/id_ed25519.pub"
        echo "2. Add to: https://github.com/${GITHUB_USER}/${REPO_NAME} -> Settings -> Deploy keys"
        exit 1
    }
else
    echo "🔄 Repository already exists at $INSTALL_DIR. Pulling latest code..."
    cd "$INSTALL_DIR"
    git pull || echo "⚠️ Warning: git pull returned non-zero, continuing build..."
fi

# Ensure Dockerfile exists in target installation directory
if [ ! -f "$INSTALL_DIR/Dockerfile" ] && [ -f "$SOURCE_DIR/Dockerfile" ]; then
    echo "📋 Copying Dockerfile & configuration to $INSTALL_DIR..."
    cp "$SOURCE_DIR/Dockerfile" "$INSTALL_DIR/" 2>/dev/null || true
    cp "$SOURCE_DIR/.dockerignore" "$INSTALL_DIR/" 2>/dev/null || true
fi

cd "$INSTALL_DIR"

# Determine docker command prefix (use sudo if non-root user cannot access socket)
DOCKER_CMD="docker"
if ! docker info &>/dev/null; then
    DOCKER_CMD="sudo docker"
fi

# 3. Build Docker Image
echo "🔨 Building Docker image using $DOCKER_CMD..."
$DOCKER_CMD build -t netforge-studio:latest .

# 4. Stop and remove existing container if running
if [ $($DOCKER_CMD ps -aq -f name=^/${CONTAINER_NAME}$) ]; then
    echo "🛑 Stopping existing container..."
    $DOCKER_CMD stop "$CONTAINER_NAME" || true
    $DOCKER_CMD rm "$CONTAINER_NAME" || true
fi

# Prepare data directory for persistent project storage
sudo mkdir -p /opt/netforgestudio/data
sudo chown -R $USER:$USER /opt/netforgestudio/data

# 5. Run the new container
echo "▶️ Launching container on port $PORT with persistent data volume..."
$DOCKER_CMD run -d \
    --name "$CONTAINER_NAME" \
    --restart always \
    -p "$PORT":80 \
    -v /opt/netforgestudio/data:/app/data \
    netforge-studio:latest

# 6. Create quick update script for future deployments
cat << 'EOF' > "$INSTALL_DIR/update.sh"
#!/bin/bash
set -e
echo "🔄 Updating NetForge Studio..."
cd /opt/netforgestudio
git pull

DOCKER_CMD="docker"
if ! docker info &>/dev/null; then
    DOCKER_CMD="sudo docker"
fi

$DOCKER_CMD build -t netforge-studio:latest .
$DOCKER_CMD stop netforge-studio-app || true
$DOCKER_CMD rm netforge-studio-app || true
$DOCKER_CMD run -d --name netforge-studio-app --restart always -p 80:80 -v /opt/netforgestudio/data:/app/data netforge-studio:latest
echo "✅ Update complete! NetForge Studio is running."
EOF

chmod +x "$INSTALL_DIR/update.sh"

echo "======================================================================"
echo "🎉 NetForge Studio successfully deployed!"
echo "🌐 Access your app at: http://localhost:$PORT or http://$(hostname -I | awk '{print $1}'):$PORT"
echo "🔄 To update in the future, run: /opt/netforgestudio/update.sh"
echo "======================================================================"
