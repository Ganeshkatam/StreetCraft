import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Folders and files to ignore
const IGNORED = new Set([
  'node_modules',
  '.next',
  '.test-dist',
  '.git',
  'dist',
  'build',
  'coverage',
  '.gemini',
  '.vercel',
  '.DS_Store',
  'projecttree.md',
  'PROJECT_TREE.md'
]);

let totalFiles = 0;
let totalDirs = 0;

function buildTree(dirPath, prefix = '') {
  let output = '';

  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true })
      .filter(item => !IGNORED.has(item.name))
      .sort((a, b) => {
        // Directories first, then files alphabetically
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });

    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const pointer = isLast ? '└── ' : '├── ';
      const nextPrefix = prefix + (isLast ? '    ' : '│   ');

      const fullPath = path.join(dirPath, item.name);

      if (item.isDirectory()) {
        totalDirs++;
        output += `${prefix}${pointer}${item.name}/\n`;
        output += buildTree(fullPath, nextPrefix);
      } else {
        totalFiles++;
        output += `${prefix}${pointer}${item.name}\n`;
      }
    });
  } catch (err) {
    output += `${prefix}└── [Error reading directory: ${err.message}]\n`;
  }

  return output;
}

function generate() {
  console.log('Generating projecttree.md...');
  totalFiles = 0;
  totalDirs = 0;

  const treeContent = buildTree(rootDir);
  const now = new Date().toISOString();

  const markdown = `# StreetCraft Project Directory Structure

Generated automatically on: ${now}

Total Directories: ${totalDirs}  
Total Files: ${totalFiles}

\`\`\`text
streetcraft/
${treeContent}\`\`\`

---

## Directory Overview

- \`src/user/\` - Next.js App Router (Public routes, marketing, authenticated workspace, auth handlers)
- \`src/components/\` - Shared UI components (CustomSelect, CalendarPicker, UpgradeModal, UsageMeter)
- \`src/lib/\` - Supabase client, API abstractions, error handling, telemetry, and entitlements
- \`src/config/\` - Immutable plan configurations, channel definitions, and category schemas
- \`src/types/\` - TypeScript database, campaign, and domain interface definitions
- \`supabase/\` - SQL migrations and reference data seeds
- \`docs/\` - Architectural specifications, strategy plans, and audit manifests
- \`scripts/\` - Maintenance, migration, and automation utilities
`;

  const targetPath = path.join(rootDir, 'projecttree.md');
  fs.writeFileSync(targetPath, markdown, 'utf8');
  console.log(`Successfully generated ${targetPath}`);
}

generate();
