'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { isExcludedHeading, extractRepo, processReadMe } = require('../scrapers/awesome.js');

// --- isExcludedHeading ---

test('isExcludedHeading: rejects Contents and License', () => {
  assert.equal(isExcludedHeading('Contents'), true);
  assert.equal(isExcludedHeading('License'), true);
});

test('isExcludedHeading: rejects promotional headings', () => {
  assert.equal(isExcludedHeading('My color picker app is on Product Hunt'), true);
  assert.equal(isExcludedHeading('Check out: One Thing'), true);
  assert.equal(isExcludedHeading('Supercharge your Mac'), true);
  assert.equal(isExcludedHeading('Elevate your experience'), true);
  assert.equal(isExcludedHeading('Hyperduck app'), true);
  assert.equal(isExcludedHeading('iPhone Lock Screen widget'), true);
});

test('isExcludedHeading: accepts valid category headings', () => {
  assert.equal(isExcludedHeading('Platforms'), false);
  assert.equal(isExcludedHeading('Programming Languages'), false);
  assert.equal(isExcludedHeading('Front-End Development'), false);
  assert.equal(isExcludedHeading('Security'), false);
});

test('isExcludedHeading: trims whitespace before checking', () => {
  assert.equal(isExcludedHeading('  Contents  '), true);
  assert.equal(isExcludedHeading('\tLicense\n'), true);
});

// --- extractRepo ---

test('extractRepo: extracts owner/repo from standard GitHub URL', () => {
  assert.equal(extractRepo('https://github.com/sindresorhus/awesome'), 'sindresorhus/awesome');
});

test('extractRepo: ignores extra path segments', () => {
  assert.equal(extractRepo('https://github.com/sindresorhus/awesome/tree/main/readme.md'), 'sindresorhus/awesome');
});

test('extractRepo: strips query strings and fragments', () => {
  assert.equal(extractRepo('https://github.com/sindresorhus/awesome?tab=readme#readme'), 'sindresorhus/awesome');
});

test('extractRepo: returns null for null input', () => {
  assert.equal(extractRepo(null), null);
});

test('extractRepo: returns null for invalid URL', () => {
  assert.equal(extractRepo('not-a-url'), null);
});

test('extractRepo: returns null for URL with only one path segment', () => {
  assert.equal(extractRepo('https://github.com/sindresorhus'), null);
});

// --- processReadMe ---

function makeHTML(categories) {
  // Builds minimal GitHub-style rendered HTML: article > [div(h2), ul, ...]
  const parts = categories.map(({ heading, items }) => {
    const lis = items.map(({ name, url, subItems }) => {
      const sub = subItems
        ? subItems.map((s) => `<li><a href="${s.url}">${s.name}</a></li>`).join('')
        : '';
      const link = url ? `<a href="${url}">${name}</a>` : name;
      return `<li>${link}${sub ? `<ul>${sub}</ul>` : ''}</li>`;
    }).join('');
    return `<div><h2>${heading}</h2><a></a></div><ul>${lis}</ul>`;
  });
  return `<article>${parts.join('')}</article>`;
}

test('processReadMe: parses categories and entries', () => {
  const html = makeHTML([
    {
      heading: 'Platforms',
      items: [{ name: 'Node.js', url: 'https://github.com/sindresorhus/awesome-nodejs' }],
    },
  ]);
  const result = processReadMe(html);
  assert.ok('Platforms' in result);
  assert.equal(result['Platforms'].length, 1);
  assert.deepEqual(result['Platforms'][0], {
    name: 'Node.js',
    url: 'https://github.com/sindresorhus/awesome-nodejs',
    repo: 'sindresorhus/awesome-nodejs',
    cate: 'Platforms',
  });
});

test('processReadMe: skips excluded headings', () => {
  const html = makeHTML([
    { heading: 'Contents', items: [{ name: 'Foo', url: 'https://github.com/a/b' }] },
    { heading: 'License', items: [{ name: 'Bar', url: 'https://github.com/c/d' }] },
    { heading: 'Platforms', items: [{ name: 'Baz', url: 'https://github.com/e/f' }] },
  ]);
  const result = processReadMe(html);
  assert.ok(!('Contents' in result));
  assert.ok(!('License' in result));
  assert.ok('Platforms' in result);
});

test('processReadMe: strips #readme fragments from URLs', () => {
  const html = makeHTML([
    {
      heading: 'Platforms',
      items: [{ name: 'Node.js', url: 'https://github.com/sindresorhus/awesome-nodejs#readme' }],
    },
  ]);
  const result = processReadMe(html);
  assert.equal(result['Platforms'][0].url, 'https://github.com/sindresorhus/awesome-nodejs');
});

test('processReadMe: handles sub-category items', () => {
  const html = makeHTML([
    {
      heading: 'Platforms',
      items: [
        {
          name: 'Node.js',
          url: 'https://github.com/sindresorhus/awesome-nodejs',
          subItems: [
            { name: 'Cross-Platform', url: 'https://github.com/bcoe/awesome-cross-platform-nodejs' },
          ],
        },
      ],
    },
  ]);
  const result = processReadMe(html);
  assert.equal(result['Platforms'].length, 2);
  assert.equal(result['Platforms'][1].name, 'Node.js - Cross-Platform');
  assert.equal(result['Platforms'][1].repo, 'bcoe/awesome-cross-platform-nodejs');
});

test('processReadMe: skips non-GitHub URLs', () => {
  const html = makeHTML([
    {
      heading: 'Platforms',
      items: [
        { name: 'External', url: 'https://example.com/something' },
        { name: 'GitHub', url: 'https://github.com/a/b' },
      ],
    },
  ]);
  const result = processReadMe(html);
  assert.equal(result['Platforms'].length, 1);
  assert.equal(result['Platforms'][0].name, 'GitHub');
});

test('processReadMe: preserves category order', () => {
  const html = makeHTML([
    { heading: 'Zebra', items: [{ name: 'Z', url: 'https://github.com/a/z' }] },
    { heading: 'Alpha', items: [{ name: 'A', url: 'https://github.com/a/a' }] },
  ]);
  const result = processReadMe(html);
  assert.deepEqual(Object.keys(result), ['Zebra', 'Alpha']);
});
