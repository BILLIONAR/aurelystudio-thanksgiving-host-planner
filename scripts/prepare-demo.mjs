import { readFile, writeFile } from 'node:fs/promises';

const htmlPath = 'dist-demo/index.html';
let html = await readFile(htmlPath, 'utf8');
const replacements = [
  ['content="AurelyStudio Thanksgiving Host Planner"', 'content="AurelyStudio Thanksgiving Host Planner Demo"'],
  ['content="Plan your Thanksgiving or Friendsgiving gathering with guests, menu, shopping, budget, prep, keepsakes and a theme you can make your own."', 'content="Explore a sample Thanksgiving gathering with guests, menu, budget, prep and themes in the AurelyStudio Host Planner demo."'],
  ['content="AurelyStudio · Thanksgiving Host Planner"', 'content="AurelyStudio · Thanksgiving Host Planner Demo"'],
  ['content="A thoughtful space for the meal, the people and the moments that matter."', 'content="Explore a sample Thanksgiving gathering with the AurelyStudio Host Planner demo."'],
  ['content="An undated hosting planner by AurelyStudioCo."', 'content="AurelyStudioCo Thanksgiving Host Planner demo with a sample gathering."'],
  ['content="AurelyStudio"', 'content="Aurely Demo"'],
  ['<title>AurelyStudio · Thanksgiving Host Planner</title>', '<title>AurelyStudio · Thanksgiving Host Planner Demo</title>'],
];
for (const [from, to] of replacements) {
  if (!html.includes(from)) throw new Error(`Missing demo metadata source: ${from}`);
  html = html.replaceAll(from, to);
}
await writeFile(htmlPath, html);
const manifestPath = 'dist-demo/manifest.webmanifest';
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
manifest.id = './demo';
manifest.name = 'AurelyStudio · Thanksgiving Host Planner Demo';
manifest.short_name = 'Aurely Demo';
manifest.description = 'Explore an editable sample Thanksgiving gathering in the AurelyStudio Host Planner demo.';
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log('Demo title, metadata and manifest prepared.');
