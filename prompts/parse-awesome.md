Fetch the raw markdown from `https://raw.githubusercontent.com/sindresorhus/awesome/refs/heads/main/readme.md` and parse it into a JSON object with the following exact structure.

**Output format:**
```json
{
  "Category Name": [
    {
      "name": "Display Name",
      "url": "https://github.com/owner/repo",
      "repo": "owner/repo",
      "cate": "Category Name"
    }
  ]
}
```

**Parsing rules:**

1. **Categories** — `## Heading` lines are category keys. Skip these headings entirely: `Contents`, `License`, and any heading that advertises a product, app, or promotion (e.g. contains phrases like "Product Hunt", "Check out", "Supercharge", "Elevate your", "Lock Screen", "Hyperduck", "Color Picker").

2. **Entries** — Under each `## Heading`, find all list items (`- [Name](url)`) that link to a GitHub repo (`https://github.com/owner/repo`). For each:
   - `name`: the link text as written
   - `url`: the full GitHub URL, stripped of any `#readme` fragment
   - `repo`: `"owner/repo"` extracted from the URL path (first two path segments only — ignore any trailing path)
   - `cate`: the parent `## Heading` text exactly

3. **Sub-entries** — Some top-level list items are plain text labels (no link) or linked labels that contain a nested sub-list. For nested items `  - [Name](url)` under a parent `- Parent Name`, set `name` to `"Parent Name - Sub Name"` and use the sub-item's URL and repo.

4. **Non-GitHub URLs** — Skip any list item whose URL hostname is not `github.com`.

5. **Key order** — Preserve the order categories appear in the markdown.

6. **No extra fields** — Each entry has exactly four keys: `name`, `url`, `repo`, `cate`. Nothing else.

Output only the raw JSON object. No markdown fences, no explanation.
