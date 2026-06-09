# Create Topic Node

## Goal

Create a new topic (or sub-topic) directory in the knowledge tree with basic node initialization. Includes automatic best placement discovery, user interaction for confirmation, duplicate checking, and directory tree output.

## Input

- Parent directory path (passed from SKILL.md after config check)
- New topic name
- One-sentence topic definition
- Optional: initial sub-topic list

## Execution Steps

### 1. Find Best Placement Directory

Invoke the **[Retrieve Topic Node](../retrieve-topic/SKILL.md)** subskill to locate the most suitable parent directory in the knowledge tree.

- Use the new topic's name and definition as the search query.
- The subskill handles vault traversal (up to 3 layers), keyword matching, candidate ranking, and user confirmation.
- On success, it returns the confirmed parent directory path.
- If no matching directory is found, the user may choose to place the new topic at the vault root or a manually specified path.

### 2. Check for Duplicates

- List all subdirectories under the parent directory
- Check if a directory with the same name already exists
- If exists, output warning:

```
⚠️ Warning: Directory [parent_path]/[topic_name] already exists
Existing content:
- README.md
- FAQ.md
- 1.知识文档A.md
- 2.知识文档B.md
- subtopicA/

Overwrite? [y/N]
```

- If user chooses not to overwrite, end the process

### 3. Create Directory Structure

Create the following directory structure:

```
/[topic-name]/
├── README.md                      # 必须：Definition + Boundary + Sub-topic Index
├── FAQ.md                       # 必须：常见问题 + 实践经验沉淀
├── 1.知识文档A.md              # 可选：知识文档，带序号前缀
├── 2.知识文档B.md              # 可选：知识文档，带序号前缀
└── [subtopic1]/                 # 可选：子 Topic
    ├── README.md
    ├── FAQ.md
    └── 1.子topic知识文档.md    # 可选：子 Topic 下的知识文档
```

#### README.md Template

> **⚠️ 约束**：如果需要新创建文件，只需要参考模版生成文件的内容结构即可，不要乱加任何未提及的内容。

Use `resources/README-template.md` as the template. Only fill in content provided by the user - leave placeholders for content not mentioned (e.g., Sub-topic Index section should remain with placeholder content).

#### FAQ.md Template

> **⚠️ 约束**：如果需要新创建文件，只需要参考模版生成文件的内容结构即可，不要乱加任何未提及的内容。

Use `resources/FAQ-template.md` as the template, copy the template content and add the scope description. Only include content provided by the user.

#### 3.3 Optimize Formatting (IMPORTANT)

> **⚠️ 约束**：FAQ 中的 callout 块（如 `> [!faq]-`）标题行后必须有空行 `>`，否则无法正确渲染为可折叠块。添加问题时确保每个部分之间有空行分隔。

**This step is REQUIRED.** Follow the complete workflow defined in [Optimize Topic Files](../optimize-topic-files/SKILL.md).

### 4. Update Parent Directory README.md

After creating the directory, update the parent directory's `README.md` file to add sub-topic index:

1. Read the parent directory's `README.md`
2. Add the new topic link under `## Sub-topic Index`:

```markdown
## Sub-topic Index

- [[topic_name/README.md]]
```

If `## Sub-topic Index` section does not exist, create it.

### 5. Recursively Create Sub-topics (if provided)

If the user provides an initial sub-topic list, recursively create sub-topic directories with their `README.md` and `FAQ.md`.

### 6. Output Directory Tree

Use the `tree` command or manual traversal to output the created directory structure:

```
✅ Directory creation complete!

[parent_directory]/
└── [topic_name]/
    ├── README.md
    ├── FAQ.md
    ├── 1.知识文档A.md       ← (optional, if provided)
    ├── 2.知识文档B.md       ← (optional, if provided)
    └── [subtopic1]/
        ├── README.md
        ├── FAQ.md
        └── 1.子topic文档.md  ← (optional, if provided)
```

## Acceptance Criteria

- [ ] Parent directory located via Retrieve Topic Node subskill
- [ ] Duplicate directory detection works correctly
- [ ] New topic directory structure is complete (contains `README.md` and `FAQ.md`, optionally with numbered knowledge docs)
- [ ] `README.md` follows three-section format (Definition + Boundary + Sub-topic Index)
- [ ] `FAQ.md` uses template structure
- [ ] Parent directory `README.md` updated with new topic in sub-topic index
- [ ] Directory tree output is correct
- [ ] If sub-topic list provided, recursive creation succeeds

## Helper Tools

- Directory tree display: Use `tree -L 3 <path>` command
