'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const AwesomeSearcher = require('../scrapers/search.js');

test('save() writes filtered JSON to disk', async () => {
  const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'awesome-test-'));
  const searcher = new AwesomeSearcher('test');

  // Patch the output dir by temporarily overriding __dirname resolution
  // We test via the actual file path used by the class
  const input = {
    Platforms: [{ name: 'Node.js', url: 'https://github.com/u/r', repo: 'u/r', cate: 'Platforms' }],
    Empty: [],
  };

  await searcher.save(input);

  const outPath = path.resolve(__dirname, '..', 'test-output', 'test.json');
  const written = JSON.parse(await fs.promises.readFile(outPath, 'utf8'));

  assert.ok('Platforms' in written, 'non-empty category should be present');
  assert.ok(!('Empty' in written), 'empty category should be removed');
  assert.equal(written.Platforms.length, 1);
  assert.equal(written.Platforms[0].name, 'Node.js');
});

test('save() removes all empty categories', async () => {
  const searcher = new AwesomeSearcher('empty-test');
  await searcher.save({ A: [], B: [], C: [] });

  const outPath = path.resolve(__dirname, '..', 'test-output', 'empty-test.json');
  const written = JSON.parse(await fs.promises.readFile(outPath, 'utf8'));
  assert.deepEqual(written, {});
});

test('save() creates output directory if missing', async () => {
  const searcher = new AwesomeSearcher('dir-test');
  // Should not throw even if test-output doesn't exist yet
  await assert.doesNotReject(() => searcher.save({ X: [{ name: 'a', url: 'https://github.com/a/b', repo: 'a/b', cate: 'X' }] }));
});
