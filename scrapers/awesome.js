'use strict';
const AwesomeWorker = require('../index');
const cheerio = require('cheerio');

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

function isExcludedHeading(text) {
  const t = text.trim();
  return EXCLUDED_HEADINGS.has(t) || PROMO_PATTERNS.some((re) => re.test(t));
}

function extractRepo(href) {
  if (!href) return null;
  try {
    const u = new URL(href);
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
  } catch {
    // not a valid URL
  }
  return null;
}

async function getAwesomeReadMe() {
  const response = await fetch('https://api.github.com/repos/sindresorhus/awesome/readme', {
    headers: {
      'User-Agent': 'awesome-search',
      Accept: 'application/vnd.github.v3.html',
      Authorization: `token ${process.env.TOKEN}`,
    },
  });
  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${msg}`);
  }
  return response.text();
}

function processReadMe(originalContent) {
  const content = originalContent.replace(/#readme/g, '');
  const $ = cheerio.load(content);
  const awesomeJson = {};

  // GitHub renders each <h2> inside its own <div>, with the <ul> as the
  // immediately following sibling of that <div> at the <article> level.
  // Structure: article > [div(h2), ul, div(h2), ul, ...]
  $('article > div').each((_, div) => {
    const h2 = $(div).find('h2');
    if (!h2.length) return;

    const cate = h2.text().trim();
    if (isExcludedHeading(cate)) return;

    awesomeJson[cate] = [];

    const ul = $(div).next('ul');
    if (!ul.length) return;

    ul.find('> li').each((_, li) => {
      const itemHtml = `<div>${$(li).html()}</div>`;
      const links = $('div > a', itemHtml);
      const subCategoryList = $('li > a', itemHtml);
      let masterCategory = '';

      if (links.length) {
        const href = $(links[0]).attr('href');
        const repo = extractRepo(href);
        masterCategory = $(links[0]).text();

        if (repo) {
          awesomeJson[cate].push({ name: masterCategory, url: href, repo, cate });
        }
      } else {
        masterCategory = $(li).text().split('-')[0].trim();
      }

      subCategoryList.each((_, link) => {
        const href = $(link).attr('href');
        const repo = extractRepo(href);
        if (repo) {
          awesomeJson[cate].push({
            name: `${masterCategory} - ${$(link).text()}`,
            url: href,
            repo,
            cate,
          });
        }
      });
    });
  });

  console.log(Object.keys(awesomeJson));
  return awesomeJson;
}

(async () => {
  try {
    const body = await getAwesomeReadMe();
    const awesomeJson = processReadMe(body);
    const w = new AwesomeWorker('awesome');
    await w.save(awesomeJson);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
})();
