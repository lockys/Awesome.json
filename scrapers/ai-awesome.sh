#!/usr/bin/env bash
# Runs the parse-awesome prompt via Claude Code CLI and writes the result to
# jsons/awesome/awesome.json.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROMPT_FILE="$ROOT_DIR/prompts/parse-awesome.md"
OUT_FILE="$ROOT_DIR/jsons/awesome/awesome.json"

if ! command -v claude &>/dev/null; then
  echo "Error: 'claude' CLI not found. Install Claude Code: https://claude.ai/code" >&2
  exit 1
fi

echo "Running Claude to parse sindresorhus/awesome..."
claude --allowedTools "WebFetch" -p "$(cat "$PROMPT_FILE")" > "$OUT_FILE"

# Validate the output is non-empty JSON
node -e "
const fs = require('fs');
const raw = fs.readFileSync('$OUT_FILE', 'utf8').trim();
const d = JSON.parse(raw);
const cats = Object.keys(d).length;
const total = Object.values(d).reduce((s, v) => s + v.length, 0);
console.log('Categories: ' + cats);
console.log('Total entries: ' + total);
if (cats === 0) { console.error('Error: parsed 0 categories'); process.exit(1); }
"

echo "Saved $OUT_FILE"
