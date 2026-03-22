'use strict';
/**
 * Fetches the raw sindresorhus/awesome README markdown and parses it into
 * jsons/awesome/awesome.json following the rules in prompts/parse-awesome.md.
 */
const fs = require('fs');
const path = require('path');

const RAW_URL = 'https://raw.githubusercontent.com/sindresorhus/awesome/refs/heads/main/readme.md';
const OUT_PATH = path.resolve(__dirname, '..', 'jsons', 'awesome', 'awesome.json');

const EXCLUDED_HEADINGS = new Set(['Contents', 'License']);
const PROMO_PATTERNS = [
  /product hunt/i,
  /check out/i,
  /lock screen/i,
  /hyperduck/i,
  /color picker/i,
  /supercharge/i,
  /elevate your/i,
];

function isExcluded(heading) {
  return EXCLUDED_HEADINGS.has(heading) || PROMO_PATTERNS.some((re) => re.test(heading));
}

function extractRepo(url) {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
  } catch {
    // invalid URL
  }
  return null;
}

function isGitHub(url) {
  try {
    return new URL(url).hostname === 'github.com';
  } catch {
    return false;
  }
}

function stripFragment(url) {
  try {
    const u = new URL(url);
    u.hash = '';
    return u.toString();
  } catch {
    return url;
  }
}

// Parse a markdown link: [text](url) → { text, url } or null
function parseLink(str) {
  const m = str.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
  if (!m) return null;
  return { text: m[1], url: m[2] };
}

function parse(markdown) {
  const lines = markdown.split('\n');
  const result = {};
  let currentCate = null;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Category heading
    if (line.startsWith('## ')) {
      const heading = line.slice(3).trim();
      currentCate = isExcluded(heading) ? null : heading;
      if (currentCate) result[currentCate] = [];
      i++;
      continue;
    }

    // Top-level list item
    if (currentCate && /^- /.test(line)) {
      const content = line.slice(2).trim();
      const link = parseLink(content);

      // Collect sub-items on following lines (indented with 2+ spaces + "- ")
      const subItems = [];
      let j = i + 1;
      while (j < lines.length && /^ {2,}- /.test(lines[j])) {
        subItems.push(lines[j].trim().slice(2).trim());
        j++;
      }

      if (link && isGitHub(link.url)) {
        const url = stripFragment(link.url);
        const repo = extractRepo(url);
        if (repo) {
          result[currentCate].push({ name: link.text, url, repo, cate: currentCate });
        }

        // Sub-items under a linked parent
        for (const sub of subItems) {
          const subLink = parseLink(sub);
          if (subLink && isGitHub(subLink.url)) {
            const subUrl = stripFragment(subLink.url);
            const subRepo = extractRepo(subUrl);
            if (subRepo) {
              result[currentCate].push({
                name: `${link.text} - ${subLink.text}`,
                url: subUrl,
                repo: subRepo,
                cate: currentCate,
              });
            }
          }
        }
      } else if (!link) {
        // Plain-text parent label — only sub-items matter
        const parentLabel = content.split('-')[0].trim();
        for (const sub of subItems) {
          const subLink = parseLink(sub);
          if (subLink && isGitHub(subLink.url)) {
            const subUrl = stripFragment(subLink.url);
            const subRepo = extractRepo(subUrl);
            if (subRepo) {
              result[currentCate].push({
                name: `${parentLabel} - ${subLink.text}`,
                url: subUrl,
                repo: subRepo,
                cate: currentCate,
              });
            }
          }
        }
      }

      i = j;
      continue;
    }

    i++;
  }

  return result;
}

if (require.main === module) {
  (async () => {
    try {
      console.log(`Fetching ${RAW_URL}...`);
      const res = await fetch(RAW_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const markdown = await res.text();

      const data = parse(markdown);

      const cats = Object.keys(data).length;
      const total = Object.values(data).reduce((s, v) => s + v.length, 0);
      console.log(`Parsed ${cats} categories, ${total} entries`);

      await fs.promises.mkdir(path.dirname(OUT_PATH), { recursive: true });
      await fs.promises.writeFile(OUT_PATH, JSON.stringify(data, null, 2));
      console.log(`Saved ${OUT_PATH}`);
    } catch (err) {
      console.error('Fatal:', err);
      process.exit(1);
    }
  })();
}

module.exports = { isExcluded, extractRepo, isGitHub, stripFragment, parseLink, parse };
