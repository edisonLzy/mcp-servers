# Subskill: Deepin Page Content

## Goal

Fetch highlights from a URL using @codemons/cli, retrieve the page content via web fetch, then **derive outward from the highlights** — using them as knowledge anchors to generate actionable insights — rather than dumping all page content into the note.

## Input

- **URL**: The source page URL to process (required)
- **Tags**: Tag filter for highlights to fetch (default: `Important`)
- **Target File**: Path to an existing Obsidian note to update (optional; if not provided, user specifies)

## Core Principle

> **Highlights are anchors, not content to copy.**
>
> The user's highlights represent curated insights they found valuable. The skill's job is to **derive outward** from those anchors — connecting them to practical scenarios, mental models, and actionable knowledge — rather than regurgitating the full source documentation.

## Execution Steps

### 1. Validate CLI Availability

```bash
codemons-cli --version
```

If unavailable, prompt: `npm install -g @codemons/cli`

### 2. Validate Authentication

```bash
codemons-cli auth
```

If not logged in, prompt user to login first.

### 3. Fetch Highlights

```bash
codemons-cli highlight --url <url> --tag <tag>
```

Extract highlights. Each highlight contains:

| Field | Description |
|-------|-------------|
| `content` | The user's actual note/insight |
| `tag` | Tag type (Important/Idea/Question/Vocabulary/Sentence) |
| `text` | The highlighted source text |
| `sentence` | The surrounding sentence context |

> [!important] Note on Tags
> - Fetch **`Important`** highlights first — these represent the user's highest-value insights
> - `Idea` and `Question` are secondary; only fetch if specifically requested
> - The `content` field (user's own words) is the primary anchor for derivation

### 4. Fetch Source Page Content

Use a web fetch tool to retrieve the source page. Extract only what's needed to contextualize the highlights — **not the entire page**.

### 5. Derive from Highlights (Not Dump Content)

This is the critical step. For each highlight, derive outward:

**Derivation Pattern:**

```
highlight (anchor) + source context → [practical scenario] + [why it matters] + [related technique]
```

**What to do:**

- For each `Important` highlight, use it as a section heading or core concept
- Add **practical scenarios** where this knowledge applies
- Explain **why** this matters (the problem it solves)
- Connect to **related techniques** from the same source if they're naturally related
- Include a **code example** if the concept benefits from one (e.g., Error Cause)

**What NOT to do:**

- Do not copy-paste entire sections from the source page
- Do not create chapters for every heading in the source documentation
- Do not include information that exists only in the source but has no connection to the user's highlights
- Do not add speculative "advanced" topics that weren't triggered by a highlight

**Example transformation:**

```
Highlight: "rethrowing errors — 可通过 Error 的第二个参数中的 cause 指定错误原因"

↓ DERIVE OUTWARD

### Error Cause 链

使用 Error 的第二个参数 cause 可以在 rethrowing 时保留完整错误链：
```javascript
try {
  fetch('/api/data').catch(err => {
    throw new Error('API调用失败', { cause: err });
  });
} catch (e) {
  console.error(e); // Console 显示完整 cause 链
}
```

rethrowing 时保留原始错误信息而不丢失中间过程，是这个技巧的核心价值。
```

### 6. Structure the Output

Organize around **practical concerns**, not source document structure:

```
## [Practical Concern 1]
  - Knowledge derived from highlight A
  - Knowledge derived from highlight B

## [Practical Concern 2]
  - ...

## Summary
  - 3-5 core takeaways (not a list of features)
```

**Good structure**: Log Filtering | Multi-Context Debugging | Error Tracing | Network Monitoring

**Bad structure**: Copy of all H2/H3 headings from the source documentation

### 7. Write to Target File

If a target file path is provided:

1. Read the existing file to understand current structure
2. Identify which sections to update/replace vs. keep
3. Preserve existing content that isn't being refreshed
4. Update only the sections that connect to the fetched highlights

If no target file (new note):

1. Create with appropriate frontmatter
2. Structure as described above

### 8. Present Result

Offer the user:

- Summary of what was added/updated
- Key insights derived
- A brief explanation of the derivation logic used

## Sample Workflow

```
User: "用 tag 为 important 的笔记完善 /path/to/note.md"

1. codemons-cli highlight --url https://developer.chrome.com/docs/devtools/console/reference --tag Important
   → 12 highlights returned (content, text, sentence)

2. firecrawl_scrape the source page
   → Full page markdown retrieved

3. For each highlight, derive:
   - "Command+F 搜索" → search section with Match Case + RegEx
   - "Selected Context Only" → multi-context debugging section
   - "url: / -url:" → URL filtering with practical negative-filter scenario
   - "Error cause" → Error Cause chain with code example
   - ...

4. Write to /path/to/note.md:
   - Preserve existing frontmatter
   - Restructure around practical concerns
   - Summary condensed to 5 core points

5. Report to user: "已从 12 条 important 笔记衍生了 X 个知识点，更新到 Y 行"
```

## Acceptance Criteria

- [ ] CLI available and authenticated
- [ ] Highlights fetched with correct tag filter
- [ ] Source page fetched (not entire site)
- [ ] Content derived from highlights, not copied from source
- [ ] No information added that wasn't triggered by a highlight
- [ ] Practical scenarios and code examples included where helpful
- [ ] Output written to correct target file
- [ ] File structure is organized by practical concerns, not source headings
- [ ] Summary reflects user's highlights, not feature lists
