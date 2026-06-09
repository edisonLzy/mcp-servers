# Retrieve Topic Node

## Goal

Locate the most relevant topic directory in the knowledge tree based on the user's request.
Following the progressive disclosure principle, traversal starts from the vault root and descends layer by layer, with user confirmation at each proposed match.

## Runtime Environment

本 Skill 由主 Agent 调用，dispatch 一个 **general-purpose subagent** 来执行实际的检索操作。
- 主 Agent 负责任务分发和结果聚合
- Subagent 执行目录遍历和关键词匹配
- Subagent 仅返回检索结果，不做决策

## Input

- Vault root path (resolved from configuration `obsidian_vault_path`)
- User's topic search query (keywords or description)

## Constraints

- Maximum traversal depth: **6 layers** from vault root
- If no topic is confirmed within 6 layers, report that no matching topic was found

## Execution Steps

### Flow Overview

```mermaid
flowchart TD
    A[Start: vault root, depth=1] --> B[Read current README.md]
    B --> C[Scan subdirectories]
    C --> D{Any subdirs match query?}
    D -->|No match| E{depth >= 6?}
    E -->|Yes| F[Report: no matching topic found]
    E -->|No| G[Inform user: no match at this level\nAsk if they want to specify a path manually]
    G -->|User provides path| H[Jump to that path]
    G -->|User gives up| F
    H --> B
    D -->|Matches found| I[Rank candidates by keyword relevance]
    I --> J[Present top candidates to user via AskUser]
    J --> K{User confirms a candidate?}
    K -->|Yes| L[✅ Return confirmed topic path]
    K -->|No / drill deeper| M{depth >= 6?}
    M -->|Yes| F
    M -->|No| N[Move into selected subdirectory, depth++]
    N --> B
```

### 1. Resolve Vault Root

Use the configured `obsidian_vault_path` as the starting directory (depth = 1).

### 2. Read Current Layer

For the current directory:

1. Read its `README.md` (if it exists) to understand the scope of this node.
2. List all immediate subdirectories.
3. For each subdirectory, read its `README.md` (first 30–50 lines is sufficient) and extract:
   - Title / topic name
   - Definition sentence
   - Boundary / scope description

### 3. Rank Candidates

Match the user's query keywords against each subdirectory's README content using the following priority:

| Priority | Match Location |
|----------|---------------|
| High | Keyword in title or definition sentence |
| Medium | Keyword in boundary / includes / scope |
| Low | Keyword appears elsewhere in the file |
| No match | Keyword not found |

Keep only subdirectories with at least a **Low** match. If none qualify, proceed to step 5 (no match).

### 4. Confirm with User

Present the ranked candidates using the AskUser tool:

```
Found the following matching topics for "[query]":

1. /vault/programming/frontend/ — "Frontend development concepts including HTML, CSS, JavaScript frameworks"
2. /vault/programming/ — "Software programming knowledge base"

Which topic are you looking for? Select a number to confirm, or "more" to drill deeper into a candidate, or "none" to indicate no match.
```

- **User selects a number** → return that path as the confirmed topic. **Stop.**
- **User selects "more"** (or names a specific candidate to drill into) → descend into that subdirectory (depth + 1) and repeat from step 2.
- **User selects "none"** → proceed to step 5.

### 5. No Match at Current Layer

If no candidates were found **or** the user rejected all candidates:

- If `depth < 6`: inform the user that no match was found at this level, and ask if they want to manually specify a subdirectory path to continue searching. If they provide a path, jump there and continue. If not, stop.
- If `depth >= 6`: report that the topic was not found within 6 layers and stop.

```
⚠️ No matching topic found within 6 layers of the knowledge tree.

You may try:
- Rephrasing your query
- Manually browsing the vault with: tree -L 6 -d <vault_path>
- Creating a new topic with the "create topic" skill
```

### 6. Return Result

On success, output the confirmed topic path clearly:

```
✅ Topic located: /vault/programming/frontend/

README.md summary:
> Frontend development covers HTML, CSS, and JavaScript frameworks...
```

## Acceptance Criteria

- [ ] Traversal starts from vault root and respects the 6-layer depth limit
- [ ] Each layer reads subdirectory READMEs for keyword matching
- [ ] Candidates are ranked by relevance before presenting to user
- [ ] User is asked to confirm (or reject) at every proposed match via AskUser
- [ ] Confirmed topic path is returned immediately upon user confirmation
- [ ] If no match within 6 layers, a helpful "not found" message is shown
- [ ] Manual path override is supported when no automatic match is found

## Helper Tools

- List subdirectories: `ls -d /path/to/dir/*/`
- Quick directory tree: `tree -L 2 -d <path>`
