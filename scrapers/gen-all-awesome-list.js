/**
 * Generates JSON index files for all awesome repos listed in awesome/awesome.json.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const Awesome = require('awesomelists-index');
const pLimit = require('p-limit');

const CONCURRENCY = 10;

function isGitHubUrl(repoUrl) {
  try {
    return new URL(repoUrl).hostname === 'github.com';
  } catch {
    return false;
  }
}

function extractRepo(repoUrl) {
  try {
    const parts = new URL(repoUrl).pathname.split('/').filter(Boolean);
    if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
  } catch {
    // invalid URL
  }
  return null;
}

function makeIndexJsonAsync(opts) {
  return new Promise((resolve, reject) => {
    const a = new Awesome(opts);
    a.makeIndexJson((err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

(async () => {
  const indexPath = path.resolve(__dirname, '..', 'jsons', 'awesome', 'awesome.json');
  const nameMapObject = JSON.parse(await fs.promises.readFile(indexPath, 'utf-8'));

  const repos = [];
  for (const category of Object.keys(nameMapObject)) {
    for (const repo of nameMapObject[category]) {
      if (isGitHubUrl(repo.url)) {
        const repoPath = extractRepo(repo.url);
        if (repoPath) repos.push({ ...repo, repoPath });
      }
    }
  }

  console.log(`Processing ${repos.length} repos with concurrency ${CONCURRENCY}...`);

  const limit = pLimit(CONCURRENCY);
  const token = process.env.TOKEN || process.env.GITHUB_TOKEN;

  const results = await Promise.allSettled(
    repos.map((repo) =>
      limit(async () => {
        const opts = { token, repo: repo.repoPath };
        try {
          const res = await makeIndexJsonAsync(opts);
          console.log(`OK  ${repo.repoPath}`);
          return res;
        } catch (err) {
          console.error(`ERR ${repo.repoPath}: ${err.message}`);
          return null;
        }
      })
    )
  );

  const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value !== null).length;
  console.log(`Done. ${succeeded}/${repos.length} succeeded.`);
})().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
