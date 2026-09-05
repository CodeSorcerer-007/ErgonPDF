#!/usr/bin/env node

/**
 * ErgonPDF Tool Generator
 * Usage: node scripts/create-tool.js <tool-name>
 * Example: node scripts/create-tool.js grayscale-pdf
 */

const toolSlug = process.argv[2];

if (!toolSlug) {
  console.error('\x1b[31mError: Please specify a tool slug name.\x1b[0m');
  console.log('Example: node scripts/create-tool.js grayscale-pdf');
  process.exit(1);
}

const formatTitle = (slug) =>
  slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const toolTitle = formatTitle(toolSlug);

console.log(`\x1b[36mScaffolding new ErgonPDF tool: \x1b[1m${toolTitle} (${toolSlug})\x1b[0m\n`);

const toolTemplate = `
// Tool Definition for: ${toolTitle}
{
  id: "${toolSlug}",
  name: "${toolTitle}",
  shortName: "${toolTitle.replace(' PDF', '')}",
  description: "Provide a clear, human-focused description of what this tool accomplishes.",
  category: "organize", // organize | edit | convert | compress | security | ocr | ai
  iconName: "FileText",
  intents: ["${toolSlug.replace('-', ' ')}", "custom task"],
  processingMode: "local",
  popular: false
}
`;

console.log('Generated tool registry snippet:\n');
console.log(toolTemplate);
console.log('\n\x1b[32m✔ Boilerplate generated!\x1b[0m');
console.log(`Next steps:\n1. Paste the snippet into src/config/toolsRegistry.ts\n2. Add handling logic in src/components/UniversalWorkspace.tsx`);
