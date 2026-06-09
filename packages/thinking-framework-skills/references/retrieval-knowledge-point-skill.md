# Retrieve Knowledge Point

## Goal

Retrieve the most relevant knowledge documents based on the user's request. Return the topic path and knowledge document paths.

## Runtime Environment

本 Skill 由主 Agent 调用，dispatch 一个 **general-purpose subagent** 来执行实际的检索操作。
- 主 Agent 负责任务分发和结果聚合
- Subagent 执行知识文档遍历和关键词匹配
- Subagent 仅返回检索结果，不做决策

## Input

- Vault root path (resolved from configuration `obsidian_vault_path`)
- User's knowledge point search query (keywords or description)

## Constraints

- Maximum retrieval depth: **topic + 2 layers** (topic level + knowledge category + knowledge point)
- Return top **5** most relevant knowledge documents for user confirmation
- If no match found, inform user clearly

## Execution Steps

### Flow Overview

```mermaid
flowchart TD
    A[Start: User query] --> B[Execute retrieval-topic-skill to find relevant topic]
    B --> C{Topic found?}
    C -->|No| D[Report: no relevant topic found for "query"]
    C -->|Yes| E[Read topic's README.md to find knowledge category layer]
    E --> F[Scan knowledge category subdirectories]
    F --> G[For each category, read README and list knowledge documents]
    G --> H[Match user query against all knowledge documents]
    H --> I{Rank and filter candidates}
    I --> J[Present top 5 candidates to user via AskUser]
    J --> K{User confirms a candidate?}
    K -->|Yes| L[✅ Return confirmed topic path + knowledge document path]
    K -->|No| M[Report: user did not confirm any candidate]
    I -->|No candidates| N[Report: no relevant knowledge document found for "query"]
```

### 1. Find Relevant Topic

First, execute the `retrieval-topic-skill.md` to locate the most relevant topic for the user's query.

- If no topic is found → return "No relevant topic found for '[query]'" and stop.
- If topic is found → proceed to step 2 with the confirmed topic path.

### 2. Read Topic Structure

Read the confirmed topic's `README.md` to understand the knowledge structure:

1. Identify the knowledge category layer (e.g., `/docs/`, `/points/`, `/notes/`)
2. List all immediate subdirectories under the topic
3. For each subdirectory, read its `README.md` (first 30–50 lines) to understand its scope

### 3. Scan Knowledge Documents

For each knowledge category:

1. List all markdown files (knowledge documents) in the directory
2. For each document, extract:
   - Title (from first H1 heading or filename)
   - Key terms / summary (from opening paragraphs)
   - Tags or metadata (if present)

### 4. Rank Candidates

Match the user's query keywords against each knowledge document using the following priority:

| Priority | Match Location |
|----------|---------------|
| High | Keyword in title or first heading |
| Medium | Keyword in summary / opening paragraph |
| Low | Keyword appears elsewhere in the document |
| No match | Keyword not found |

Keep only documents with at least a **Low** match. If none qualify, proceed to step 6 (no match).

### 5. Confirm with User

Present the ranked top candidates using the AskUser tool:

```
Found the following knowledge documents matching "[query]" in [topic_path]:

1. [doc_path] — "Document title or summary"
2. [doc_path] — "Document title or summary"
...

Which knowledge document are you looking for? Select a number to confirm, or "none" if none match.
```

- **User selects a number** → return both topic path and document path. **Stop.**
- **User selects "none"** → proceed to step 6.

### 6. No Match Found

If no candidates were found **or** the user rejected all candidates:

```
⚠️ No relevant knowledge document found for "[query]" in topic [topic_path].

You may try:
- Rephrasing your query
- Using the "create knowledge point" skill to add a new document
- Browsing the topic directory directly
```

## Acceptance Criteria

- [ ] First executes `retrieval-topic-skill.md` to find relevant topic
- [ ] Scans knowledge documents within the confirmed topic
- [ ] Returns top 5 most relevant documents for user confirmation
- [ ] Returns both topic path and knowledge document path on success
- [ ] Clear "not found" message when no match exists
- [ ] Uses mermaid flowchart for execution flow visualization
