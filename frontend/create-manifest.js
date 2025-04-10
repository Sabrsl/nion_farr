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
  routes: [
    {
      src: "/api/(.*)",
      dest: "https://nionfar.up.railway.app/api/$1"
    },
    {
      src: "/(.*)",
      dest: "/$1"
    }
  ],
  dynamicRoutes: []
};

const manifestJson = JSON.stringify(basicManifest, null, 2);
fs.writeFileSync(path.join(nextDir, 'routes-manifest.json'), manifestJson, { encoding: 'utf8', flag: 'w' });
console.log('Created routes-manifest.json file');

// Also create it in .next/next for redundancy
const nextSubDir = path.join(nextDir, 'next');
if (!fs.existsSync(nextSubDir)) {
  fs.mkdirSync(nextSubDir, { recursive: true });
}
fs.writeFileSync(path.join(nextSubDir, 'routes-manifest.json'), manifestJson, { encoding: 'utf8', flag: 'w' });
console.log('Created routes-manifest.json in next directory'); 