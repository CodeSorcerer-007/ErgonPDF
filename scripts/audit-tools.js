import fs from 'fs';
import { TOOLS_REGISTRY } from '../src/config/toolsRegistry.ts';

const workspace = fs.readFileSync('./src/components/UniversalWorkspace.tsx', 'utf8');
const app = fs.readFileSync('./src/App.tsx', 'utf8');

console.log('Total registered tools:', TOOLS_REGISTRY.length);
console.log('----------------------------------------------------');

const report = [];

for (const t of TOOLS_REGISTRY) {
  const inWorkspaceTab = workspace.includes(`currentToolTab === '${t.id}'`);
  const inWorkspaceGeneral = workspace.includes(`'${t.id}'`);
  const inApp = app.includes(`'${t.id}'`);
  
  report.push({
    id: t.id,
    name: t.name,
    category: t.category,
    inWorkspaceTab,
    inWorkspaceGeneral,
    inApp
  });
  
  const status = (inWorkspaceTab || inApp) ? '✅ OK' : '⚠️ GAP';
  console.log(`${status} [${t.category.padEnd(8)}] ${t.id.padEnd(20)} | Tab: ${inWorkspaceTab ? 'YES' : 'NO '} | Modal/App: ${inApp ? 'YES' : 'NO '}`);
}
