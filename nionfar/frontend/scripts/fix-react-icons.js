const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

// Get all files recursively
async function getFilesRecursively(dir) {
  const files = [];
  
  async function traverse(currentDir) {
    const entries = await readDir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, .next, and other non-source directories
        if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== 'public' && !entry.name.startsWith('.')) {
          await traverse(fullPath);
        }
      } else if (entry.isFile() && (fullPath.endsWith('.js') || fullPath.endsWith('.jsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  }
  
  await traverse(dir);
  return files;
}

async function fixReactIconsImports() {
  console.log('Starting to fix react-icons imports...');
  const rootDir = process.cwd(); // Current working directory
  const files = await getFilesRecursively(rootDir);
  
  console.log(`Found ${files.length} JavaScript/TypeScript files to check`);
  let fixedFilesCount = 0;
  
  for (const file of files) {
    try {
      const content = await readFile(file, 'utf8');
      
      // Check if the file has a react-icons import that needs fixing
      if (content.includes('react-icons/') && !content.includes('react-icons/fi/index.js')) {
        // Fix all react-icons imports
        const updatedContent = content.replace(/from ['"]react-icons\/([^'"]+)['"]/g, 'from \'react-icons/$1/index.js\'');
        
        if (content !== updatedContent) {
          await writeFile(file, updatedContent, 'utf8');
          console.log(`Fixed imports in: ${path.relative(rootDir, file)}`);
          fixedFilesCount++;
        }
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error.message);
    }
  }
  
  console.log(`Finished fixing imports in ${fixedFilesCount} files`);
}

// Run the script
fixReactIconsImports().catch(error => {
  console.error('Error fixing react-icons imports:', error);
  process.exit(1);
}); 