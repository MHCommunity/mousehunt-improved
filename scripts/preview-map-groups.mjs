import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

/* eslint-disable no-console */

const mapGroupsPath = './src/data/map-groups';
const outputPath = './dist/map-groups.html';

// Categories larger than this are called out.
const maxCategorySize = 15;

/**
 * Read a JSON file.
 *
 * @param {string} filePath The path to the file to read.
 *
 * @return {Object} The parsed contents of the file.
 */
const loadFile = async (filePath) => {
  const file = path.resolve(filePath);
  const contents = await readFile(file);

  return JSON.parse(contents);
};

/**
 * Get the mice list, keyed by mouse type.
 *
 * @return {Object} The mice, keyed by type.
 */
const getMice = async () => {
  const cachePath = path.resolve(os.tmpdir(), 'mh-improved-mice.json');

  let mice;
  if (fs.existsSync(cachePath)) {
    console.log('Using cached mice list…');
    mice = await loadFile(cachePath);
  } else {
    console.log('Getting mice list from api.mouse.rip…');
    const response = await fetch('https://api.mouse.rip/mice');
    mice = await response.json();

    fs.writeFileSync(cachePath, JSON.stringify(mice));
  }

  const miceByType = {};
  for (const mouse of mice) {
    const images = mouse.images || {};

    miceByType[mouse.type] = {
      name: mouse.name,
      // The square crop is the highest resolution image that still frames the mouse
      // the way the thumbnail does.
      thumbnail: images.square || images.medium || images.thumbnail || '',
    };
  }

  return miceByType;
};

/**
 * Load every map group file, keyed by filename.
 *
 * @return {Object} The map groups.
 */
const getMapGroups = async () => {
  const files = fs.readdirSync(mapGroupsPath)
    .filter((file) => file.endsWith('.json'))
    .sort();

  const groups = {};
  for (const file of files) {
    groups[path.basename(file, '.json')] = await loadFile(path.resolve(mapGroupsPath, file));
  }

  return groups;
};

/**
 * Check a map group for the mistakes that are easy to make by hand.
 *
 * @param {Object} group      The map group.
 * @param {Object} miceByType The mice, keyed by type.
 *
 * @return {Array} The issues found, as strings.
 */
const getIssues = (group, miceByType) => {
  const issues = [];
  const categories = group.categories || [];
  const subcategoryIds = new Set((group.subcategories || []).map((subcategory) => subcategory.id));
  const usedSubcategoryIds = new Set();
  const seenMice = new Map();
  const seenCategoryIds = new Set();

  if (! group.names || 0 === group.names.length) {
    issues.push('No <code>names</code> array, so the group only matches by filename.');
  }

  for (const category of categories) {
    const label = [category.name, category.id ? `(${category.id})` : '']
      .filter(Boolean)
      .join(' ') || 'unnamed category';

    if (! category.id) {
      issues.push(`${label}: no <code>id</code>.`);
    } else if (seenCategoryIds.has(category.id)) {
      issues.push(`${label}: duplicate category id <code>${category.id}</code>.`);
    } else {
      seenCategoryIds.add(category.id);
    }

    if (! category.color) {
      issues.push(`${label}: no <code>color</code>.`);
    }

    const mice = category.mice || [];
    if (mice.length > maxCategorySize) {
      issues.push(`${label}: ${mice.length} mice`);
    }

    for (const entry of mice) {
      const type = 'object' === typeof entry ? entry.mouse : entry;
      const subcategory = 'object' === typeof entry ? entry.subcategory : false;

      if (! miceByType[type]) {
        issues.push(`${label}: <code>${type}</code> isn't a known mouse type.`);
      }

      if (seenMice.has(type)) {
        const other = seenMice.get(type);
        issues.push(other === label
          ? `${label}: <code>${type}</code> is listed twice.`
          : `${label}: <code>${type}</code> is also in ${other}.`);
      } else {
        seenMice.set(type, label);
      }

      if (subcategory) {
        usedSubcategoryIds.add(subcategory);

        if (! subcategoryIds.has(subcategory)) {
          issues.push(`${label}: <code>${type}</code> uses subcategory <code>${subcategory}</code>, which isn't defined.`);
        }
      }
    }
  }

  for (const id of subcategoryIds) {
    if (! usedSubcategoryIds.has(id)) {
      issues.push(`Subcategory <code>${id}</code> is defined but never used.`);
    }
  }

  return issues;
};

/**
 * Get the upscaled image map, keyed by the game-relative path it replaces.
 *
 * @return {Object} The upscaled images.
 */
const getUpscaledImages = async () => {
  const cachePath = path.resolve(os.tmpdir(), 'mh-improved-upscaled-images.json');

  if (fs.existsSync(cachePath)) {
    console.log('Using cached upscaled images…');

    return loadFile(cachePath);
  }

  console.log('Getting upscaled images from api.mouse.rip…');
  const response = await fetch('https://api.mouse.rip/upscaled-images');
  const upscaled = await response.json();

  fs.writeFileSync(cachePath, JSON.stringify(upscaled));

  return upscaled;
};

/**
 * Resolve a category icon to the highest resolution version available.
 *
 * Icons in the map groups are game-relative paths, which often point at the small
 * thumbnail. The upscaled image map replaces those with an upscaled image or the
 * game's own large version, keyed by the path without the leading slash.
 *
 * @param {string} icon     The icon from the map group.
 * @param {Object} upscaled The upscaled images, keyed by game-relative path.
 *
 * @return {string} The icon URL.
 */
const getIconUrl = (icon, upscaled) => {
  if (! icon) {
    return '';
  }

  const gameImages = 'https://www.mousehuntgame.com/images/';
  const relative = icon.replace(gameImages, '').replace(/^\//, '');
  const best = upscaled[relative] || relative;

  return best.startsWith('http') ? best : `${gameImages}${best}`;
};

/**
 * Build the data that gets embedded in the page.
 *
 * @return {Object} The maps, keyed by map group key.
 */
const buildData = async () => {
  const miceByType = await getMice();
  const upscaled = await getUpscaledImages();
  const groups = await getMapGroups();

  const maps = {};
  for (const [key, group] of Object.entries(groups)) {
    maps[key] = {
      key,
      names: group.names || [],
      subcategories: group.subcategories || [],
      issues: getIssues(group, miceByType),
      categories: (group.categories || []).map((category) => ({
        ...category,
        icon: getIconUrl(category.icon, upscaled),
        mice: (category.mice || []).map((entry) => {
          const type = 'object' === typeof entry ? entry.mouse : entry;
          const subcategory = 'object' === typeof entry ? entry.subcategory : '';

          return {
            type,
            subcategory,
            name: miceByType[type]?.name || type,
            thumbnail: miceByType[type]?.thumbnail || '',
            unknown: ! miceByType[type],
          };
        }),
      })),
    };
  }

  return maps;
};

/**
 * Build the page.
 *
 * @param {Object} maps The maps, keyed by map group key.
 *
 * @return {string} The page markup.
 */
const buildHtml = (maps) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Map Groups</title>
<style>
:root {
  --bg: #fff;
  --text: #1a1a1a;
  --muted: #6b6b6b;
  --border: #d8d3c8;
  --panel: #f7f5f0;
  --warning: #a8371f;
  --warning-bg: #fdeeea;
}

body.dark {
  --bg: #24272c;
  --text: #e4e4e4;
  --muted: #9a9a9a;
  --border: #3c4045;
  --panel: #2c3036;
  --warning: #ff9d87;
  --warning-bg: #3a2622;
}

* {
  box-sizing: border-box;
}

body {
  display: flex;
  min-height: 100vh;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: var(--text);
  background: var(--bg);
}

nav {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  flex: 0 0 260px;
  height: 100vh;
  padding: 16px;
  background: var(--panel);
  border-right: 1px solid var(--border);
}

nav .controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

nav input[type="search"] {
  padding: 6px 8px;
  color: var(--text);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
}

nav label {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  color: var(--muted);
}

nav ol {
  flex: 1;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  font-size: 13px;
  list-style: none;
}

nav a {
  display: flex;
  gap: 6px;
  justify-content: space-between;
  padding: 4px 6px;
  color: var(--text);
  text-decoration: none;
  border-radius: 4px;
}

nav a:hover {
  background: var(--bg);
}

nav .count {
  color: var(--muted);
}

main {
  flex: 1;
  padding: 24px 32px 80px;
  overflow-x: hidden;
}

h1 {
  margin: 0 0 4px;
  font-size: 22px;
}

.summary {
  margin-bottom: 24px;
  font-size: 13px;
  color: var(--muted);
}

.map {
  padding-bottom: 20px;
  margin-bottom: 28px;
  border-bottom: 1px solid var(--border);
}

.map h2 {
  margin: 0 0 2px;
  font-size: 18px;
}

.map .key {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: var(--muted);
}

.map .names {
  margin: 4px 0 12px;
  font-size: 13px;
  color: var(--muted);
}

.issues {
  padding: 10px 12px;
  margin-bottom: 14px;
  font-size: 13px;
  color: var(--warning);
  background: var(--warning-bg);
  border: 1px solid currentcolor;
  border-radius: 4px;
}

.issues ul {
  padding-left: 18px;
  margin: 6px 0 0;
}

.issues code,
.mouse .type {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
}

.categories {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}

.category {
  padding: 10px 12px;
  color: #1a1a1a;
  border: 1px solid var(--border);
  border-radius: 6px;
}

.category h3 {
  display: flex;
  gap: 8px;
  align-items: baseline;
  justify-content: space-between;
  margin: 0;
  font-size: 15px;
}

.category .subtitle {
  margin-top: 2px;
  font-size: 12px;
  opacity: 0.75;
}

.category .icon {
  width: 18px;
  height: 18px;
  vertical-align: middle;
}

.category .size {
  font-size: 11px;
  opacity: 0.6;
}

.category.oversized .size {
  font-weight: bold;
  opacity: 1;
}

.subcategory {
  padding: 6px 8px;
  margin-top: 8px;
  border-radius: 4px;
}

.subcategory .subcategory-name {
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: bold;
}

.mice {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin-top: 8px;
}

.mouse {
  display: flex;
  gap: 5px;
  align-items: center;
  font-size: 13px;
}

.mouse img {
  width: 22px;
  height: 22px;
  border-radius: 3px;
}

.mouse.unknown {
  padding: 0 4px;
  color: var(--warning);
  background: var(--warning-bg);
  border-radius: 3px;
}

.hidden {
  display: none;
}
</style>
</head>
<body>
<nav>
  <div class="controls">
    <input type="search" id="filter" placeholder="Filter maps or mice…" autocomplete="off">
    <label><input type="checkbox" id="issues-only"> Only maps with issues</label>
    <label><input type="checkbox" id="dark"> Dark mode colors</label>
    <label><input type="checkbox" id="types"> Show mouse types</label>
  </div>
  <ol id="nav"></ol>
</nav>
<main>
  <h1>Map Groups</h1>
  <p class="summary" id="summary"></p>
  <div id="maps"></div>
</main>
<script id="data" type="application/json">${JSON.stringify(maps).replaceAll('</', '<\\/')}</script>
<script>
const maps = JSON.parse(document.querySelector('#data').textContent);

const escape = (text) => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const isDark = () => document.body.classList.contains('dark');

const categoryColor = (item) => (isDark() && item['color-dark']) ? item['color-dark'] : (item.color || 'transparent');

const buildMouse = (mouse) => \`<span class="mouse\${mouse.unknown ? ' unknown' : ''}" data-search="\${escape((mouse.name + ' ' + mouse.type).toLowerCase())}">
  \${mouse.thumbnail ? \`<img src="\${escape(mouse.thumbnail)}" alt="" loading="lazy">\` : ''}
  <span>\${escape(mouse.name)}</span>
  <span class="type">\${escape(mouse.type)}</span>
</span>\`;

const buildCategory = (category, subcategories) => {
  const mice = category.mice || [];
  const loose = mice.filter((mouse) => ! mouse.subcategory);

  const grouped = subcategories
    .map((subcategory) => {
      const subMice = mice.filter((mouse) => mouse.subcategory === subcategory.id);
      if (! subMice.length) {
        return '';
      }

      return \`<div class="subcategory" style="background: \${escape(categoryColor(subcategory))}" data-color="\${escape(subcategory.color || '')}" data-color-dark="\${escape(subcategory['color-dark'] || '')}">
        <div class="subcategory-name">\${escape(subcategory.name || subcategory.id)}</div>
        <div class="mice">\${subMice.map(buildMouse).join('')}</div>
      </div>\`;
    })
    .join('');

  return \`<div class="category\${mice.length > ${maxCategorySize} ? ' oversized' : ''}" style="background: \${escape(categoryColor(category))}" data-color="\${escape(category.color || '')}" data-color-dark="\${escape(category['color-dark'] || '')}">
    <h3>
      <span>\${category.icon ? \`<img class="icon" src="\${escape(category.icon)}" alt="" loading="lazy">\` : ''} \${escape(category.name || category.id)}</span>
      <span class="size">\${mice.length} mice</span>
    </h3>
    \${category.subtitle ? \`<div class="subtitle">\${escape(category.subtitle)}</div>\` : ''}
    \${loose.length ? \`<div class="mice">\${loose.map(buildMouse).join('')}</div>\` : ''}
    \${grouped}
  </div>\`;
};

const buildMap = (map) => \`<section class="map" id="map-\${escape(map.key)}" data-issues="\${map.issues.length}">
  <h2>\${escape(map.names[0] || map.key)}</h2>
  <div class="key">\${escape(map.key)}.json</div>
  \${map.names.length ? \`<div class="names">\${map.names.map(escape).join(' · ')}</div>\` : ''}
  \${map.issues.length ? \`<div class="issues"><strong>\${map.issues.length} issue\${1 === map.issues.length ? '' : 's'}</strong><ul>\${map.issues.map((issue) => \`<li>\${issue}</li>\`).join('')}</ul></div>\` : ''}
  <div class="categories">\${map.categories.map((category) => buildCategory(category, map.subcategories)).join('')}</div>
</section>\`;

const render = () => {
  const all = Object.values(maps);

  document.querySelector('#maps').innerHTML = all.map(buildMap).join('');

  document.querySelector('#nav').innerHTML = all
    .map((map) => \`<li data-key="\${escape(map.key)}"><a href="#map-\${escape(map.key)}">
      <span>\${escape(map.names[0] || map.key)}</span>
      <span class="count">\${map.issues.length ? '⚠ ' : ''}\${map.categories.length}</span>
    </a></li>\`)
    .join('');

  const mice = new Set(all.flatMap((map) => map.categories.flatMap((category) => category.mice.map((mouse) => mouse.type))));
  const issues = all.reduce((total, map) => total + map.issues.length, 0);
  document.querySelector('#summary').textContent = \`\${all.length} maps · \${mice.size} unique mice · \${issues} issue\${1 === issues ? '' : 's'}\`;
};

const applyColors = () => {
  for (const node of document.querySelectorAll('[data-color]')) {
    const dark = node.dataset.colorDark;
    node.style.background = (isDark() && dark) ? dark : (node.dataset.color || 'transparent');
    node.style.color = isDark() ? '#e4e4e4' : '#1a1a1a';
  }
};

const applyFilter = () => {
  const query = document.querySelector('#filter').value.trim().toLowerCase();
  const issuesOnly = document.querySelector('#issues-only').checked;

  for (const map of document.querySelectorAll('.map')) {
    const matchesQuery = ! query ||
      map.id.toLowerCase().includes(query) ||
      map.querySelector('h2').textContent.toLowerCase().includes(query) ||
      [...map.querySelectorAll('.mouse')].some((mouse) => mouse.dataset.search.includes(query));

    const visible = matchesQuery && (! issuesOnly || '0' !== map.dataset.issues);
    map.classList.toggle('hidden', ! visible);

    const navItem = document.querySelector(\`#nav li[data-key="\${map.id.replace('map-', '')}"]\`);
    if (navItem) {
      navItem.classList.toggle('hidden', ! visible);
    }
  }
};

document.querySelector('#filter').addEventListener('input', applyFilter);
document.querySelector('#issues-only').addEventListener('change', applyFilter);

document.querySelector('#dark').addEventListener('change', (event) => {
  document.body.classList.toggle('dark', event.target.checked);
  applyColors();
});

document.querySelector('#types').addEventListener('change', (event) => {
  for (const type of document.querySelectorAll('.mouse .type')) {
    type.classList.toggle('hidden', ! event.target.checked);
  }
});

render();
applyColors();
document.querySelector('#types').dispatchEvent(new Event('change'));
</script>
</body>
</html>
`;
};

const maps = await buildData();

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, buildHtml(maps));

const issues = Object.values(maps).reduce((total, map) => total + map.issues.length, 0);
console.log(`✓ Wrote ${Object.keys(maps).length} maps to ${outputPath} (${issues} issues found)`);
/* eslint-enable no-console */
