# Sync Feishu Records

## Goal

从飞书多维表格获取当日记录，根据记录内容将记录归类到相关 topic（可能创建新 topic 或更新已有 topic），最后在今日日报中添加 record 条目。

## Feishu Base 配置（固定值）

以下配置为飞书 Daily Note 多维表格的固定值，**所有操作均基于此文档**：

| 配置项 | 值 |
|--------|-----|
| Wiki URL | `https://my.feishu.cn/wiki/BCZqwHTeAiJcqukfuSbc75z5nMh` |
| Table ID | `tbljmyT87cIlcMBz` |
| View ID | `vewrWFYjCc` |
| Base Token | `WGHcbBFFEaXV9qsZN6ecbCmCnfh` |

## 输入

无（使用固定配置，自动获取今日日期）

## 执行步骤

### 1. 获取今日日期

1. Run `bun scripts/get-dates.ts` to get today date
2. Parse JSON output to extract `today` in YYYY-MM-DD format

### 2. 获取飞书当日记录

1. 使用 `lark-cli` 获取当日记录：

```bash
lark-cli base +record-list \
  --base-token WGHcbBFFEaXV9qsZN6ecbCmCnfh \
  --table-id tbljmyT87cIlcMBz \
  --view-id vewrWFYjCc \
  --limit 200
```

2. 解析返回数据，筛选 `日期` 字段为今日（YYYY-MM-DD）的记录
3. 提取每条记录的以下字段：
   - `日期` (fldwTyb1NC)
   - `笔记` (fldYBcxVLV) - 记录主要内容
   - `来源` (fld3z5IQ3F)
   - `状态` (fldsDnLG6z)
   - `智能标签` (fld1MODm22)
   - `更新时间` (fldsj2Ljr3)

### 3. 定位今日日报

1. 定位今日日报: `vault_path/Daily/<year>/<MM-DD>.md`
2. 如日报不存在，先创建（参见 Create Daily Note skill）

### 4. 分类记录到 Topic

对每一条今日记录，根据内容进行分类：

#### 4.1 分析记录内容

根据 `智能标签` 字段和 `笔记` 内容判断 topic 归属：

| 智能标签 | 建议 Topic |
|----------|-----------|
| Technology | Technology |
| Work | Work |
| Words | Words |
| Sentence | Words |
| Others | Others |

#### 4.2 检查 Topic 是否存在

1. 在 `vault_path/` 下查找对应 topic 目录
2. 如 topic 存在，直接使用该 topic
3. 如 topic 不存在，**必须询问用户**是否需要创建新 topic：
   - **禁止在未经用户明确授权的情况下擅自创建 topic**
   - 用户选择创建：执行 Create Topic skill 创建新 topic
   - 用户选择不创建：将该记录归类到 `Others` topic

#### 4.3 关联 Topic

每条记录需确定其归属 topic，用于填充日报中 record 的 `Topic` 和 `路径` 字段。

### 5. 生成日报 Record 条目

对每条今日记录，按以下格式生成 record callout：

```markdown
> [!record] [记录标题摘要]
>
> **内容:** [记录详细内容，截取前200字]
>
> **来源:** [来源信息]
>
> **Topic:** [[topic-name/README.md]]
>
> **路径:** [[docs/topic-name/知识文档名.md]]
```

**记录标题生成规则：**
- 如笔记以 URL 开头，提取 URL 域名作为来源，标题为笔记内容前50字
- 如笔记为纯文本，标题为笔记内容前50字

### 6. 更新日报 Records 章节

1. 读取今日日报内容
2. 找到 `# Records` 章节
3. 移除模板中的占位 Record（首条 `> [!record] 记录标题` 后的占位内容）
4. 将新生成的 record 条目追加到 Records 章节
5. 写回更新后的日报内容

### 7. 输出结果

```
✅ 今日飞书记录已同步: Daily/<year>/<MM-DD>.md

📊 同步统计:
- 获取记录: N 条
- 新增记录: N 条
- 涉及 Topic: [topic1, topic2, ...]
```

## Acceptance Criteria

- [ ] 正确获取飞书今日记录
- [ ] 记录筛选准确（仅包含今日记录）
- [ ] Topic 关联正确
- [ ] Record 条目格式符合模板（title、content、source、topic、path）
- [ ] 日报更新无内容丢失
- [ ] 如需创建新 topic，结构符合规范（README.md + FAQ.md）

## Helper Tools

- Feishu API: `lark-cli base +record-list`
- 日期获取: `bun scripts/get-dates.ts`
- 文件读写: Node.js fs 模块
- Topic 创建: 参见 Create Topic skill

## 注意事项

1. **Feishu Token 固定**：Base Token 等信息为固定值，无需用户每次提供
2. **用户身份**：使用 `--as user` 执行飞书操作
3. **记录去重**：如记录标题完全相同，跳过重复项
4. **内容截断**：笔记内容过长时，日报中只显示前200字，完整内容在对应 topic 知识文档中
