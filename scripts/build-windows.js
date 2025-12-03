#!/usr/bin/env node

/**
 * Build script for Windows .msi installer
 * Uses electron-builder to package the application
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🪟 Building Windows installer (.msi)...\n");

// Step 1: Build the application
console.log("📦 Step 1: Building application...");
try {
  execSync("pnpm build", { stdio: "inherit" });
  console.log("✅ Build completed\n");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}

// Step 2: Create electron wrapper
console.log("🔧 Step 2: Creating Electron wrapper...");
const electronMain = `
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, 'assets/icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Start the Node.js server
  serverProcess = spawn('node', [path.join(__dirname, 'server/index.js')], {
    cwd: __dirname,
    env: { ...process.env, NODE_ENV: 'production' },
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(\`Server: \${data}\`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(\`Server Error: \${data}\`);
  });

  // Wait for server to start, then load the app
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:3000');
  }, 2000);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
`;

const electronDir = path.join(__dirname, "..", "electron");
if (!fs.existsSync(electronDir)) {
  fs.mkdirSync(electronDir, { recursive: true });
}

fs.writeFileSync(path.join(electronDir, "main.js"), electronMain);
console.log("✅ Electron wrapper created\n");

// Step 3: Create electron-builder config
console.log("⚙️  Step 3: Creating electron-builder config...");
const builderConfig = {
  appId: "com.tsitelecom.headsetmanager",
  productName: "Headset Manager",
  directories: {
    output: "dist-installers",
    buildResources: "electron/assets",
  },
  files: ["dist/**/*", "electron/main.js", "package.json", "node_modules/**/*"],
  win: {
    target: ["msi"],
    icon: "electron/assets/icon.ico",
  },
  msi: {
    oneClick: false,
    perMachine: true,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
  },
};

fs.writeFileSync(
  path.join(__dirname, "..", "electron-builder.json"),
  JSON.stringify(builderConfig, null, 2)
);
console.log("✅ Config created\n");

// Step 4: Install electron-builder if not present
console.log("📥 Step 4: Installing electron-builder...");
try {
  execSync("pnpm add -D electron electron-builder", { stdio: "inherit" });
  console.log("✅ Dependencies installed\n");
} catch (error) {
  console.error("❌ Installation failed:", error.message);
  process.exit(1);
}

// Step 5: Build the installer
console.log("🏗️  Step 5: Building .msi installer...");
try {
  execSync(
    "pnpm exec electron-builder --win --x64 --config electron-builder.json",
    {
      stdio: "inherit",
    }
  );
  console.log("\n✅ Windows installer built successfully!");
  console.log("📦 Output: dist-installers/HeadsetManager-Setup.msi\n");
} catch (error) {
  console.error("❌ Installer build failed:", error.message);
  process.exit(1);
}

console.log("🎉 Done! Installer ready for distribution.");
