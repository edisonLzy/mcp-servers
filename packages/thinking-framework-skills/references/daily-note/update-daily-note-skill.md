# Update Daily Note

## Goal

更新今日日报的指定章节内容,包括 Overview、Records、TODO 等。

## Input

- 目标章节 (Overview / Records / TODO)
- 更新内容 (record 条目、todo 状态变更等)

## Execution Steps

### 1. Get Dates & Locate Daily Note

1. Run `bun scripts/get-dates.ts` to get today date
2. Parse JSON output to extract `today` in YYYY-MM-DD format
3. 定位今日日报: `vault_path/Daily/<year>/<MM-DD>.md`

### 2. Read Current Daily Note

读取今日日报完整内容,了解现有章节结构。

### 3. Update Target Section

根据用户输入更新对应章节:

#### 3.1 Update Overview

如用户提供摘要信息,更新 Overview 章节:

```markdown
> [!note] 摘要
> [用户提供的摘要内容]
```

#### 3.2 Add Record

如用户提供新的 record 信息,追加到 Records 章节。**注意:** 模板中的占位 Record 应在添加真实记录时移除。

```markdown
> [!record] [记录标题]
>
> **内容:** [记录详细内容]
>
> **来源:** [来源信息]
>
> **Topic:** [[topic-name/README.md]]
>
> **路径:** [[文档路径]]
```

> [!tip] 格式说明
> 各字段之间使用空行分隔，确保 Obsidian 中 callout 内容块有良好的可读性和排版间距。

#### 3.3 Update TODO

如用户更新 todo 状态或新增待办:

**更新待办状态:**
```markdown
- [x] [已完成项目]
- [ ] [未完成项目]
```

**新增待办到今日:**
```markdown
#### 今日待办
- [ ] [新待办事项]
```

**新增待办到明日:**
```markdown
#### 明日待办
- [ ] [新待办事项]
```

### 4. Write Updated Content

将更新后的完整内容写回日报文件,保持模板格式。

### 5. Output Result

```
✅ 日报已更新: Daily/<year>/<MM-DD>.md

更新内容:
- [章节类型]: [更新摘要]
```

## Acceptance Criteria

- [ ] 正确读取今日日报文件
- [ ] 更新内容遵循模板格式 (使用正确的 callout 类型)
- [ ] Record 条目格式正确 (title、content、source、topic、path)
- [ ] TODO 状态变更正确反映
- [ ] 文件内容完整无丢失

## Helper Tools

- 文件读写: Node.js fs 模块
- 路径解析: path.join()
