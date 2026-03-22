# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**awesome.json** is a data aggregation pipeline that fetches curated "Awesome Lists" from GitHub, parses them, and outputs structured JSON. It powers [awesomelists.top](https://awesomelists.top).

## Commands

```bash
# Fetch the master sindresorhus/awesome list and generate jsons/awesome/awesome.json
npm run awesome

# Pull latest, then generate all individual repo JSON files into jsons/repo-json/
npm run build

# Stage, commit, and push all changes to update-branch
npm run push
```

There are no tests (`npm test` exits with error — this is intentional/unfixed upstream).

## Architecture

### Data Pipeline

```
GitHub API → HTML parsing (Cheerio) → jsons/awesome/awesome.json → jsons/repo-json/*.json
```

**Stage 1 — `scrapers/awesome.js`**
Fetches the `sindresorhus/awesome` README via GitHub API, parses it with Cheerio, extracts category/name/URL/GitHub path for each entry, and writes `test-output/awesome.json` (moved to `jsons/awesome/` by npm script).

**Stage 2 — `scrapers/gen-all-awesome-list.js`**
Reads `jsons/awesome/awesome.json`, iterates over all ~760 repos using the `awesomelists-index` library, and writes one JSON file per repo into `jsons/repo-json/`.

**Stage 3 — `scrapers/search.js`**
`AwesomeSearcher` utility class — filters empty categories and handles file I/O for saving JSON.

### Data Formats

`jsons/awesome/awesome.json` — master index, keyed by category:
```json
{
  "category_name": [
    { "name": "...", "url": "https://github.com/user/repo", "repo": "user/repo", "cate": "category_name" }
  ]
}
```

`jsons/repo-json/{author}-{repo}.json` — individual list contents:
```json
[{ "name": "...", "url": "...", "description": "..." }]
```

### Git Workflow

- `master` — stable branch
- `update-branch` — automated JSON updates are committed here, then merged via PR
- Automated commits follow the pattern: `:chart_with_upwards_trend: UPDATE JSON AT \`date\``

## Key Dependencies

| Package | Purpose |
|---|---|
| `cheerio` | HTML parsing of GitHub README pages |
| `awesomelists-index` | Parses individual awesome list repos |
| `p-limit` | Concurrency control for batch API calls in `gen-all-awesome-list.js` |

Built-in `fetch` (Node 18+) replaces the removed `request` package. `fs.promises` replaces `jsonfile`.
