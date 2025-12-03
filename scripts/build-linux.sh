#!/bin/bash

# Build script for Linux .bin installer
# Creates a self-extracting installer for HeadsetManager

set -e

echo "🐧 Building Linux installer (.bin)..."
echo ""

# Step 1: Build the application
echo "📦 Step 1: Building application..."
pnpm build
echo "✅ Build completed"
echo ""

# Step 2: Create installation directory structure
echo "🔧 Step 2: Creating installation structure..."
INSTALL_DIR="dist-linux/headset-manager"
mkdir -p "$INSTALL_DIR"

# Copy built files
cp -r dist/* "$INSTALL_DIR/"
cp -r node_modules "$INSTALL_DIR/"
cp package.json "$INSTALL_DIR/"
cp client/public/logo.png "$INSTALL_DIR/logo.png"

# Create launcher script
cat > "$INSTALL_DIR/headset-manager.sh" << 'EOF'
#!/bin/bash

# Headset Manager Launcher
# TSI Telecom

INSTALL_DIR="/opt/headset-manager"

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql; then
    echo "⚠️  PostgreSQL is not running. Starting..."
    sudo systemctl start postgresql
fi

# Start the application
cd "$INSTALL_DIR"
NODE_ENV=production node server/index.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Open browser
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3000
elif command -v gnome-open > /dev/null; then
    gnome-open http://localhost:3000
else
    echo "✅ Server started at http://localhost:3000"
    echo "Please open this URL in your browser."
fi

# Wait for user to close
echo ""
echo "Press Ctrl+C to stop the server..."
wait $SERVER_PID
EOF

chmod +x "$INSTALL_DIR/headset-manager.sh"

echo "✅ Installation structure created"
echo ""

# Step 3: Create installer script
echo "⚙️  Step 3: Creating installer script..."
cat > "dist-linux/install.sh" << 'INSTALLER_EOF'
#!/bin/bash

# Headset Manager Installer
# TSI Telecom

set -e

echo "======================================"
echo "  Headset Manager - TSI Telecom"
echo "  Installation Wizard"
echo "======================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Check dependencies
echo "🔍 Checking dependencies..."

if ! command -v node > /dev/null; then
    echo "❌ Node.js is not installed."
    echo "Please install Node.js 22.x first:"
    echo "  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -"
    echo "  sudo apt-get install -y nodejs"
    exit 1
fi

if ! command -v psql > /dev/null; then
    echo "⚠️  PostgreSQL is not installed."
    read -p "Install PostgreSQL now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        apt-get update
        apt-get install -y postgresql postgresql-contrib
        systemctl enable postgresql
        systemctl start postgresql
    else
        echo "❌ PostgreSQL is required. Exiting."
        exit 1
    fi
fi

echo "✅ Dependencies OK"
echo ""

# Installation directory
INSTALL_DIR="/opt/headset-manager"
echo "📁 Installing to: $INSTALL_DIR"

# Remove old installation
if [ -d "$INSTALL_DIR" ]; then
    echo "⚠️  Removing old installation..."
    rm -rf "$INSTALL_DIR"
fi

# Extract files
echo "📦 Extracting files..."
ARCHIVE_START=$(awk '/^__ARCHIVE_BELOW__/ {print NR + 1; exit 0; }' "$0")
tail -n+$ARCHIVE_START "$0" | tar xzf - -C /opt/

# Create symlink
echo "🔗 Creating symlink..."
ln -sf "$INSTALL_DIR/headset-manager.sh" /usr/local/bin/headset-manager

# Create desktop entry
echo "🖥️  Creating desktop entry..."
cat > /usr/share/applications/headset-manager.desktop << EOF
[Desktop Entry]
Name=Headset Manager
Comment=Professional USB Headset Manager
Exec=/usr/local/bin/headset-manager
Icon=$INSTALL_DIR/logo.png
Terminal=false
Type=Application
Categories=AudioVideo;Audio;
EOF

# Set permissions
chmod +x "$INSTALL_DIR/headset-manager.sh"
chmod 755 "$INSTALL_DIR"

echo ""
echo "✅ Installation completed successfully!"
echo ""
echo "To start Headset Manager:"
echo "  1. Run: headset-manager"
echo "  2. Or find it in your applications menu"
echo ""
echo "First-time setup:"
echo "  1. Configure PostgreSQL database"
echo "  2. Run migrations: cd $INSTALL_DIR && pnpm db:push"
echo ""

exit 0

__ARCHIVE_BELOW__
INSTALLER_EOF

echo "✅ Installer script created"
echo ""

# Step 4: Create tarball
echo "📦 Step 4: Creating tarball..."
cd dist-linux
tar czf headset-manager.tar.gz headset-manager/
cd ..

echo "✅ Tarball created"
echo ""

# Step 5: Combine installer + tarball
echo "🔨 Step 5: Creating self-extracting installer..."
cat dist-linux/install.sh dist-linux/headset-manager.tar.gz > dist-installers/HeadsetManager-Installer.bin
chmod +x dist-installers/HeadsetManager-Installer.bin

echo "✅ Self-extracting installer created"
echo ""

# Cleanup
rm -rf dist-linux

echo "🎉 Done! Installer ready for distribution."
echo "📦 Output: dist-installers/HeadsetManager-Installer.bin"
echo ""
echo "To install:"
echo "  chmod +x HeadsetManager-Installer.bin"
echo "  sudo ./HeadsetManager-Installer.bin"
