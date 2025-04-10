// Script to ensure routes-manifest.json exists
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for routes-manifest.json...');

const nextDir = path.join(__dirname, '.next');
const routesManifestPath = path.join(nextDir, 'routes-manifest.json');
const nextRoutesManifestPath = path.join(nextDir, 'next', 'routes-manifest.json');

// Create .next directory if it doesn't exist
if (!fs.existsSync(nextDir)) {
  console.log('⚠️ .next directory does not exist. Creating it...');
  try {
    fs.mkdirSync(nextDir, { recursive: true });
    console.log('✅ Created .next directory');
  } catch (error) {
    console.error('❌ Error creating .next directory:', error.message);
    process.exit(1);
  }
}

// Create a basic routes-manifest.json file
console.log('ℹ️ Creating routes-manifest.json file');
const basicManifest = {
  version: 3,
  basePath: "",
  pages404: true,
  redirects: [],
  headers: [],
  rewrites: [
    {
      source: "/api/:path*",
      destination: "https://nionfar.up.railway.app/api/:path*"
    }
  ],
  dynamicRoutes: []
};

// Create the next subdirectory if it doesn't exist
const nextSubDir = path.join(nextDir, 'next');
if (!fs.existsSync(nextSubDir)) {
  fs.mkdirSync(nextSubDir, { recursive: true });
  console.log('✅ Created .next/next directory');
}
  
try {
  // Use 'w' flag to truncate the file if it exists
  const manifestJson = JSON.stringify(basicManifest, null, 2);
  fs.writeFileSync(routesManifestPath, manifestJson, { encoding: 'utf8', flag: 'w' });
  console.log('✅ Created routes-manifest.json file');
  
  // Also create it in the next subdirectory for redundancy
  fs.writeFileSync(nextRoutesManifestPath, manifestJson, { encoding: 'utf8', flag: 'w' });
  console.log('✅ Also created routes-manifest.json in .next/next directory');
} catch (error) {
  console.error('❌ Error creating routes-manifest.json:', error.message);
}

console.log('✅ Done checking routes-manifest.json'); 