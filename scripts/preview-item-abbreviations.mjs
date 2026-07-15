import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

/* eslint-disable no-console */

const abbreviationsPath = './src/modules/experiments/modules/enhanced-search/item-abbreviations.json';
const outputPath = './dist/item-abbreviations.html';

/**
 * Load the item list, caching it locally so the page can be regenerated offline after the first run.
 *
 * @return {Promise<Array>} The complete item list.
 */
const getItems = async () => {
  const cachePath = path.resolve(os.tmpdir(), 'mh-improved-items.json');

  if (fs.existsSync(cachePath)) {
    console.log('Using cached item list…');
    return JSON.parse(await readFile(cachePath, 'utf8'));
  }

  console.log('Getting item list from api.mouse.rip…');
  const response = await fetch('https://api.mouse.rip/items');
  if (! response.ok) {
    throw new Error(`Failed to get item list: ${response.status} ${response.statusText}`);
  }

  const items = await response.json();
  fs.writeFileSync(cachePath, JSON.stringify(items));

  return items;
};

/**
 * Make the data embedded in the preview page.
 *
 * @return {Promise<Object>} The item data and current abbreviation mapping.
 */
const buildData = async () => {
  const abbreviations = JSON.parse(await readFile(abbreviationsPath, 'utf8'));
  const searchable = new Set(['weapon', 'base', 'trinket', 'bait', 'crafting_item', 'stat', 'convertible']);
  const items = await getItems();

  const searchableItems = items
    .filter((item) => searchable.has(item.classification))
    .map((item) => ({
      type: item.type,
      name: item.name,
      classification: item.classification,
      image: item.images?.best || item.images?.thumbnail || '',
      abbreviations: abbreviations[item.type] || [],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { abbreviations, items: searchableItems };
};

/**
 * Build the standalone preview page.
 *
 * @param {Object} data The item data and abbreviation mapping to embed.
 *
 * @return {string} The page markup.
 */
const buildHtml = (data) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Item Abbreviations</title>
<style>
:root { color-scheme: light dark; --bg:#f6f3ed; --panel:#fffdf9; --ink:#292521; --muted:#70685e; --line:#ddd5c9; --accent:#a14920; --tag:#eee4d8; }
@media (prefers-color-scheme:dark) { :root { --bg:#20201e; --panel:#2a2926; --ink:#eee9e1; --muted:#b6aea3; --line:#4b4842; --accent:#ff9b70; --tag:#3b3731; } }
* { box-sizing:border-box; }
body { margin:0; color:var(--ink); background:var(--bg); font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
header { position:sticky; top:0; z-index:2; padding:16px max(20px,calc((100vw - 1500px)/2)); background:color-mix(in srgb,var(--bg) 92%,transparent); backdrop-filter:blur(10px); border-bottom:1px solid var(--line); }
h1 { margin:0; font-size:22px; } .intro { margin:3px 0 12px; color:var(--muted); }
.controls { display:flex; flex-wrap:wrap; gap:8px; align-items:center; } input,select,button { min-height:34px; padding:6px 9px; font:inherit; color:var(--ink); background:var(--panel); border:1px solid var(--line); border-radius:5px; }
input[type=search] { flex:1 1 280px; } button { cursor:pointer; } button:hover { border-color:var(--accent); } .primary { color:white; background:var(--accent); border-color:var(--accent); }
.categories { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }.categories button { min-height:28px; padding:3px 7px; color:var(--muted); font-size:12px; }.categories button.active { color:white; background:var(--accent); border-color:var(--accent); }
main { max-width:1500px; padding:20px; margin:auto; } #summary { margin:0 0 14px; color:var(--muted); } .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:10px; }
.item { display:grid; grid-template-columns:54px 1fr; gap:10px; min-height:112px; padding:10px; background:var(--panel); border:1px solid var(--line); border-radius:7px; }
.item img,.placeholder { width:54px; height:54px; object-fit:contain; border-radius:5px; background:var(--tag); } .placeholder { display:grid; place-items:center; color:var(--muted); }
.name { font-weight:650; } .type { overflow:hidden; margin-top:1px; color:var(--muted); font:11px ui-monospace,SFMono-Regular,Menlo,monospace; text-overflow:ellipsis; white-space:nowrap; }
.badges,.terms { display:flex; flex-wrap:wrap; gap:4px; margin-top:7px; }.badge,.term { padding:2px 5px; border-radius:3px; font-size:11px; }.badge { color:var(--muted); background:var(--tag); }.term { color:var(--accent); background:color-mix(in srgb,var(--accent) 12%,var(--panel)); font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }
.add { display:flex; gap:5px; margin-top:7px; }.add input { width:100%; min-height:28px; padding:3px 6px; font-size:12px; }.add button { min-height:28px; padding:3px 7px; font-size:12px; }.hidden { display:none; }
dialog { width:min(680px,calc(100vw - 32px)); color:var(--ink); background:var(--panel); border:1px solid var(--line); border-radius:8px; } dialog::backdrop { background:#0008; } dialog textarea { width:100%; min-height:380px; margin:8px 0; resize:vertical; font:12px ui-monospace,SFMono-Regular,Menlo,monospace; } dialog form { display:flex; gap:8px; justify-content:flex-end; }
</style>
</head>
<body>
<header>
  <h1>Item Abbreviations</h1>
  <p class="intro">Browse every searchable item, test the existing mappings, and collect draft additions. Drafts remain in this page until copied.</p>
  <div class="controls">
    <input id="search" type="search" placeholder="Search names, types, or abbreviations" autofocus>
    <select id="classification"><option value="">All item types</option></select>
    <select id="coverage"><option value="">Mapped and unmapped</option><option value="mapped">Mapped only</option><option value="unmapped">Unmapped only</option><option value="drafted">Drafted only</option></select>
    <button id="copy" class="primary">Copy draft JSON</button>
  </div>
  <div id="categories" class="categories"></div>
</header>
<main><p id="summary"></p><section id="items" class="grid"></section></main>
<dialog id="output"><strong>Draft additions</strong><textarea readonly></textarea><form method="dialog"><button>Close</button></form></dialog>
<script id="data" type="application/json">${JSON.stringify(data).replaceAll('</', '<\\/')}</script>
<script>
const data = JSON.parse(document.querySelector('#data').textContent);
const items = data.items;
const abbreviations = data.abbreviations;
const drafts = new Map();
const search = document.querySelector('#search');
const classification = document.querySelector('#classification');
const coverage = document.querySelector('#coverage');
const itemRoot = document.querySelector('#items');
const escape = (text) => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const allTerms = (item) => [...item.abbreviations, ...(drafts.get(item.type) || [])];

for (const type of [...new Set(items.map((item) => item.classification))].sort()) {
  classification.insertAdjacentHTML('beforeend', '<option value="' + escape(type) + '">' + escape(type.replaceAll('_', ' ')) + '</option>');
}

const renderCategories = () => {
  const categories = ['', ...new Set(items.map((item) => item.classification).sort())];
  document.querySelector('#categories').innerHTML = categories.map((type) => {
    const count = type ? items.filter((item) => item.classification === type).length : items.length;
    const label = type ? type.replaceAll('_', ' ') : 'all items';
    return '<button data-category="' + escape(type) + '" class="' + (classification.value === type ? 'active' : '') + '">' + escape(label) + ' <span>' + count + '</span></button>';
  }).join('');
};

const render = () => {
  const query = search.value.trim().toLowerCase();
  const visible = items.filter((item) => {
    const terms = allTerms(item);
    const text = [item.name, item.type, item.classification, ...terms].join(' ').toLowerCase();
    const mapped = item.abbreviations.length > 0;
    const drafted = drafts.has(item.type);
    return (! query || text.includes(query)) &&
      (! classification.value || item.classification === classification.value) &&
      (! coverage.value || ('mapped' === coverage.value && mapped) || ('unmapped' === coverage.value && ! mapped) || ('drafted' === coverage.value && drafted));
  });
  document.querySelector('#summary').textContent = visible.length + ' of ' + items.length + ' items · ' + items.filter((item) => item.abbreviations.length).length + ' mapped · ' + drafts.size + ' draft entries';
  itemRoot.innerHTML = visible.map((item) => {
    const terms = allTerms(item).map((term) => '<span class="term">' + escape(term) + '</span>').join('');
    const image = item.image ? '<img src="' + escape(item.image) + '" alt="" loading="lazy">' : '<div class="placeholder">?</div>';
    return '<article class="item"><div>' + image + '</div><div><div class="name">' + escape(item.name) + '</div><div class="type">' + escape(item.type) + '</div><div class="badges"><span class="badge">' + escape(item.classification.replaceAll('_', ' ')) + '</span></div><div class="terms">' + terms + '</div><form class="add" data-type="' + escape(item.type) + '"><input aria-label="Add abbreviation for ' + escape(item.name) + '" placeholder="Add draft abbreviation"><button>Add</button></form></div></article>';
  }).join('');
  renderCategories();
};

itemRoot.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  const input = form.querySelector('input');
  const term = input.value.trim().toLowerCase();
  if (! term) return;
  const existing = new Set(allTerms(items.find((item) => item.type === form.dataset.type)));
  if (! existing.has(term)) drafts.set(form.dataset.type, [...(drafts.get(form.dataset.type) || []), term]);
  render();
});
search.addEventListener('input', render); classification.addEventListener('change', render); coverage.addEventListener('change', render);
document.querySelector('#categories').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-category]');
  if (! button) return;
  classification.value = button.dataset.category;
  render();
});
document.querySelector('#copy').addEventListener('click', async () => {
  const output = Object.fromEntries(Object.entries(abbreviations).map(([type, terms]) => [type, [...terms]]));
  for (const [type, terms] of drafts) output[type] = [...(output[type] || []), ...terms];
  const classifications = new Map(items.map((item) => [item.type, item.classification]));
  const groups = ['weapon', 'base', 'trinket', 'bait'];
  const lines = ['{'];
  const append = (entries) => entries.forEach(([type, terms]) => lines.push('  ' + JSON.stringify(type) + ': ' + JSON.stringify(terms).replaceAll(',', ', ') + ','));
  for (const group of groups) {
    const entries = Object.entries(output).filter(([type]) => classifications.get(type) === group).sort(([a], [b]) => a.localeCompare(b));
    if (entries.length) { append(entries); lines.push(''); }
  }
  append(Object.entries(output).filter(([type]) => ! groups.includes(classifications.get(type))).sort(([a], [b]) => a.localeCompare(b)));
  lines[lines.length - 1] = lines.at(-1).replace(/,$/, '');
  const text = lines.concat('}', '').join('\\n');
  document.querySelector('#output textarea').value = text;
  document.querySelector('#output').showModal();
  try { await navigator.clipboard.writeText(text); } catch (error) { /* Clipboard access is unavailable from some file URLs. */ }
});
render();
</script>
</body>
</html>`;

const items = await buildData();
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, buildHtml(items));
console.log(`Wrote ${outputPath} with ${items.items.length} items.`);
/* eslint-enable no-console */
