import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { pathToFileURL } from 'node:url';

const testDir = path.resolve('src/__tests__');
const tempDir = path.resolve('.test-dist');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Recursively compile TS files needed by tests
function compileFile(srcPath, outPath) {
  const code = fs.readFileSync(srcPath, 'utf-8');
  const result = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  
  // Rewrite relative imports to append .js if not present
  let jsCode = result.outputText;
  jsCode = jsCode.replace(/(from\s+['"])(\.\.?\/[^'"]+?)(['"])/g, (match, p1, p2, p3) => {
    if (!p2.endsWith('.js') && !p2.endsWith('.json')) {
      return `${p1}${p2}.js${p3}`;
    }
    return match;
  });
  
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, jsCode);
}

function processDir(srcDir, destDir) {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullSrc = path.join(srcDir, entry.name);
    const fullDest = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullSrc, fullDest);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      const destJs = fullDest.replace(/\.tsx?$/, '.js');
      compileFile(fullSrc, destJs);
    }
  }
}

console.log('Compiling test suites and domain modules...');
processDir(path.resolve('src'), path.resolve(tempDir, 'src'));

// Run test runner
import { run } from 'node:test';
import { spec } from 'node:test/reporters';

const testFiles = fs.readdirSync(path.join(tempDir, 'src/__tests__'))
  .filter((f) => f.endsWith('.test.js'))
  .map((f) => path.join(tempDir, 'src/__tests__', f));

console.log(`Running ${testFiles.length} test suites:`, testFiles.map((f) => path.basename(f)).join(', '));

run({ files: testFiles })
  .compose(new spec())
  .pipe(process.stdout);
