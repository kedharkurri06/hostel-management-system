const fs = require('fs');
const path = require('path');

function search(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '.bin') search(full);
    } else if (/\.(js|mjs|cjs)$/.test(entry.name)) {
      try {
        const content = fs.readFileSync(full, 'utf8');
        if (content.includes('new Function(') || content.includes('eval(')) {
          // Check if it's not a comment
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (/(\beval\s*\(|new\s+Function\s*\()/.test(line) && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
              console.log(`${full}:${idx + 1}: ${line.trim().slice(0, 100)}`);
            }
          });
        }
      } catch (e) {}
    }
  }
}

search('client/src');
console.log('--- client/src done ---');
search('client/node_modules/react');
search('client/node_modules/react-dom');
console.log('--- react / react-dom done ---');
search('client/node_modules/vite');
console.log('--- vite done ---');

