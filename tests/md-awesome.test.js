'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { isExcluded, extractRepo, isGitHub, stripFragment, parseLink, parse } = require('../scrapers/md-awesome.js');

// --- isExcluded ---

test('isExcluded: rejects Contents and License', () => {
  assert.equal(isExcluded('Contents'), true);
  assert.equal(isExcluded('License'), true);
});

test('isExcluded: rejects promotional headings', () => {
  assert.equal(isExcluded('Supercharge your workflow'), true);
  assert.equal(isExcluded('Elevate your Mac experience'), true);
  assert.equal(isExcluded('Product Hunt launch'), true);
  assert.equal(isExcluded('Check out this app'), true);
  assert.equal(isExcluded('Hyperduck'), true);
  assert.equal(isExcluded('iPhone Lock Screen'), true);
  assert.equal(isExcluded('Color Picker app'), true);
});

test('isExcluded: accepts real category headings', () => {
  assert.equal(isExcluded('Platforms'), false);
  assert.equal(isExcluded('Security'), false);
  assert.equal(isExcluded('Databases'), false);
});

// --- isGitHub ---

test('isGitHub: returns true for github.com URLs', () => {
  assert.equal(isGitHub('https://github.com/user/repo'), true);
});

test('isGitHub: returns false for non-GitHub URLs', () => {
  assert.equal(isGitHub('https://example.com/repo'), false);
  assert.equal(isGitHub('https://gitlab.com/user/repo'), false);
});

test('isGitHub: returns false for invalid input', () => {
  assert.equal(isGitHub('not-a-url'), false);
  assert.equal(isGitHub(''), false);
});

// --- extractRepo ---

test('extractRepo: extracts owner/repo', () => {
  assert.equal(extractRepo('https://github.com/sindresorhus/awesome'), 'sindresorhus/awesome');
});

test('extractRepo: ignores extra path segments', () => {
  assert.equal(extractRepo('https://github.com/sindresorhus/awesome/tree/main'), 'sindresorhus/awesome');
});

test('extractRepo: returns null for too-short path', () => {
  assert.equal(extractRepo('https://github.com/sindresorhus'), null);
});

test('extractRepo: returns null for invalid URL', () => {
  assert.equal(extractRepo('not-a-url'), null);
});

// --- stripFragment ---

test('stripFragment: removes #readme', () => {
  assert.equal(
    stripFragment('https://github.com/sindresorhus/awesome#readme'),
    'https://github.com/sindresorhus/awesome'
  );
});

test('stripFragment: leaves URLs without fragments unchanged', () => {
  assert.equal(
    stripFragment('https://github.com/sindresorhus/awesome'),
    'https://github.com/sindresorhus/awesome'
  );
});

test('stripFragment: returns original string for invalid URL', () => {
  assert.equal(stripFragment('not-a-url'), 'not-a-url');
});

// --- parseLink ---

test('parseLink: parses a standard markdown link', () => {
  const result = parseLink('[Awesome Node.js](https://github.com/sindresorhus/awesome-nodejs)');
  assert.deepEqual(result, { text: 'Awesome Node.js', url: 'https://github.com/sindresorhus/awesome-nodejs' });
});

test('parseLink: returns null for plain text', () => {
  assert.equal(parseLink('Just some text'), null);
});

test('parseLink: returns null for non-http links', () => {
  assert.equal(parseLink('[Link](ftp://example.com)'), null);
});

// --- parse ---

test('parse: extracts categories from ## headings', () => {
  const md = `## Platforms\n- [Node.js](https://github.com/sindresorhus/awesome-nodejs)\n`;
  const result = parse(md);
  assert.ok('Platforms' in result);
});

test('parse: skips excluded headings', () => {
  const md = `## Contents\n- [Foo](https://github.com/a/b)\n## License\n- [Bar](https://github.com/c/d)\n## Platforms\n- [Baz](https://github.com/e/f)\n`;
  const result = parse(md);
  assert.ok(!('Contents' in result));
  assert.ok(!('License' in result));
  assert.ok('Platforms' in result);
});

test('parse: skips promotional headings', () => {
  const md = `## Supercharge your Mac\n- [App](https://github.com/a/b)\n## Platforms\n- [Node.js](https://github.com/sindresorhus/awesome-nodejs)\n`;
  const result = parse(md);
  assert.ok(!('Supercharge your Mac' in result));
  assert.ok('Platforms' in result);
});

test('parse: skips non-GitHub URLs', () => {
  const md = `## Platforms\n- [External](https://example.com/tool)\n- [GitHub](https://github.com/a/b)\n`;
  const result = parse(md);
  assert.equal(result['Platforms'].length, 1);
  assert.equal(result['Platforms'][0].name, 'GitHub');
});

test('parse: strips #readme fragments', () => {
  const md = `## Platforms\n- [Node.js](https://github.com/sindresorhus/awesome-nodejs#readme)\n`;
  const result = parse(md);
  assert.equal(result['Platforms'][0].url, 'https://github.com/sindresorhus/awesome-nodejs');
});

test('parse: handles sub-entries under a linked parent', () => {
  const md = [
    '## Platforms',
    '- [Node.js](https://github.com/sindresorhus/awesome-nodejs)',
    '  - [Cross-Platform](https://github.com/bcoe/awesome-cross-platform-nodejs)',
  ].join('\n');
  const result = parse(md);
  assert.equal(result['Platforms'].length, 2);
  assert.equal(result['Platforms'][0].name, 'Node.js');
  assert.equal(result['Platforms'][1].name, 'Node.js - Cross-Platform');
  assert.equal(result['Platforms'][1].repo, 'bcoe/awesome-cross-platform-nodejs');
});

test('parse: handles sub-entries under a plain-text parent', () => {
  const md = [
    '## Platforms',
    '- Mobile',
    '  - [iOS](https://github.com/vsouza/awesome-ios)',
    '  - [Android](https://github.com/JStumpp/awesome-android)',
  ].join('\n');
  const result = parse(md);
  assert.equal(result['Platforms'].length, 2);
  assert.equal(result['Platforms'][0].name, 'Mobile - iOS');
  assert.equal(result['Platforms'][1].name, 'Mobile - Android');
});

test('parse: preserves category order', () => {
  const md = `## Zebra\n- [Z](https://github.com/a/z)\n## Alpha\n- [A](https://github.com/a/a)\n`;
  const result = parse(md);
  assert.deepEqual(Object.keys(result), ['Zebra', 'Alpha']);
});

test('parse: each entry has exactly name, url, repo, cate fields', () => {
  const md = `## Platforms\n- [Node.js](https://github.com/sindresorhus/awesome-nodejs)\n`;
  const result = parse(md);
  const entry = result['Platforms'][0];
  assert.deepEqual(Object.keys(entry).sort(), ['cate', 'name', 'repo', 'url']);
});
