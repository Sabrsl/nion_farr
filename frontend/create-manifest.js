const fs = require('fs');
const path = require('path');

console.log('Creating routes-manifest.json...');

const nextDir = path.join(__dirname, '.next');
if (!fs.existsSync(nextDir)) {
  fs.mkdirSync(nextDir, { recursive: true });
}

const basicManifest = {
  version: 3,
  basePath: "",
  pages404: true,
  redirects: [],
  headers: [],
  rewrites: [
    {
      source: "/api/:path*",
      destination: "https://nionfar-backend.onrender.com/api/:path*"
    }
  ],
  dynamicRoutes: []
};

const manifestJson = JSON.stringify(basicManifest, null, 2);
fs.writeFileSync(path.join(nextDir, 'routes-manifest.json'), manifestJson);
console.log('Created routes-manifest.json file');

// Also create it in .next/next for redundancy
const nextSubDir = path.join(nextDir, 'next');
if (!fs.existsSync(nextSubDir)) {
  fs.mkdirSync(nextSubDir, { recursive: true });
}
fs.writeFileSync(path.join(nextSubDir, 'routes-manifest.json'), manifestJson);
console.log('Created routes-manifest.json in next directory'); 