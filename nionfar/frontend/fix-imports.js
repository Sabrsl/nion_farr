const fs = require('fs');
const path = require('path');

function findFiles(dir, extensions) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.next') {
      results = results.concat(findFiles(filePath, extensions));
    } else if (extensions.includes(path.extname(file))) {
      results.push(filePath);
    }
  }
  
  return results;
}

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Liste des icônes react-icons à corriger
  const iconSets = ['fa', 'fi', 'bs', 'bi', 'md', 'go', 'di', 'ai', 'io', 'io5', 'ri', 'hi', 'hi2', 'ci', 'si', 'sl', 'tb', 'lu', 'wi', 'gr', 'vsc', 'cg', 'rx'];
  
  // Corriger chaque set d'icônes en ajoutant /index.js
  for (const iconSet of iconSets) {
    content = content.replace(new RegExp(`from 'react-icons\\/${iconSet}'`, 'g'), `from 'react-icons/${iconSet}/index.js'`);
  }
  
  if (content !== originalContent) {
    console.log(`Fixing imports in: ${filePath}`);
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Find all .tsx, .jsx, .ts, and .js files
const extensions = ['.tsx', '.jsx', '.ts', '.js'];
const files = findFiles('.', extensions);
let fixedCount = 0;

for (const file of files) {
  if (replaceInFile(file)) {
    fixedCount++;
  }
}

console.log(`Fixed imports in ${fixedCount} files.`); 