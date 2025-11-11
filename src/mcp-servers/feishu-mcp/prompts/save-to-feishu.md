# Save to Feishu Workflow

## 概述
将用户提供的内容保存到飞书文档中，同时在Daily Note多维表格中插入一条记录，方便后续管理和检索。

## Context 信息

1. 使用固定的多维表格配置（Daily Note）：
```json
{
  "app_token": "WGHcbBFFEaXV9qsZN6ecbCmCnfh",
  "table_id": "tbljmyT87cIlcMBz"
}
```

2. 标题为`2025`的文档信息（默认父文档）:
```json
{
  "node_id": "GQl0weU2wixm1UkxxTgcDYIPnwe",
  "obj_token": "RyFyd9oAZo4tA5x6u0Pch69TnJb",
  "obj_type": 8,
  "parent_id": "",
  "sort_id": 1,
  "space_id": "7478521192878669826",
  "title": "2025",
  "url": "https://c16lk2ssrm.feishu.cn/wiki/GQl0weU2wixm1UkxxTgcDYIPnwe"
}
```

## 执行步骤

### 1. 确认保存路径

**如果用户未指定保存路径（父文档）：**

使用 `list-wiki-spaces` 工具获取所有知识空间：
```
工具: list-wiki-spaces
参数: {}
```

**输出示例：**
向用户展示所有可用的知识空间，并询问：
- "我找到了以下知识空间：[空间列表]"
- "请问您希望将文档保存到哪个知识空间下？"
- "如果需要，我可以使用默认的'2025'文档作为父文档。"

**如果用户指定了知识空间，使用 `get-space-nodes` 工具获取该空间下的文档列表：**
```
工具: get-space-nodes
参数: {
  "space_id": "{{user_specified_space_id}}"
}
```

**用户决策点：**
- 用户选择保存位置（知识空间或具体父文档）
- 如果用户同意，使用默认的2025文档（node_id: GQl0weU2wixm1UkxxTgcDYIPnwe）

**错误处理：**
- 如果获取知识空间失败：告知用户"无法获取知识空间列表，可能是权限不足或网络问题"
- 如果用户未做出选择：使用默认的2025文档作为父文档

### 2. 收集内容信息

向用户收集以下信息：
- **文档标题**：新建文档的标题
- **文档内容**：需要保存的内容（支持Markdown格式）
- **记录摘要**（可选）：将在多维表格中保存的摘要信息

**提示用户：**
- "请提供文档标题（如：学习笔记-2025-01-15）"
- "请提供要保存的内容（支持Markdown格式）"
- "请提供一个简短摘要用于多维表格记录（可选，如不提供将使用文档标题）"

**用户决策点：** 确认所有信息是否正确

### 3. 创建飞书文档

使用 `create-wiki-node` 工具创建新文档：
```
工具: create-wiki-node
参数: {
  "space_id": "{{selected_space_id}}",
  "obj_type": "docx",
  "title": "{{user_provided_title}}",
  "parent_node_token": "{{selected_parent_node_id}}"
}
```

**错误处理：**
- 如果创建文档失败：停止执行，告知用户"无法创建文档，错误信息：[具体错误]，可能原因：1) 编辑权限不足 2) 同名文档已存在 3) 父文档不存在"
- 如果同名文档已存在：询问用户是否使用不同的标题或覆盖现有文档
- 如果父文档token无效：告知用户"父文档token无效，请检查文档是否存在或已被删除"

**用户决策点：** 处理同名文档冲突

### 4. 转换内容为Blocks

使用 `convert-content-to-blocks` 工具将用户内容转换为飞书文档blocks：
```
工具: convert-content-to-blocks
参数: {
  "content_type": "markdown",
  "content": "{{user_provided_content}}"
}
```

**错误处理：**
- 如果转换失败：停止执行，告知用户"内容转换失败，错误信息：[具体错误]，可能原因：1) Markdown格式错误 2) 内容过长 3) 包含不支持的元素"
- 如果转换结果为空：告知用户"转换结果为空，请检查内容格式是否正确"

### 5. 保存内容到文档

使用 `create-document-blocks` 工具将blocks保存到新创建的文档：
```
工具: create-document-blocks
参数: {
  "document_id": "{{new_document_obj_token}}",
  "index": 0,
  "blocks": "{{converted_blocks}}"
}
```

**重要：保持块顺序一致性**

1. **从转换结果中提取正确顺序**：`convert-content-to-blocks` 返回的 `first_level_block_ids` 数组包含了顶层块的正确顺序
2. **按ID重新排序blocks**：根据 `first_level_block_ids` 的顺序，从 `blocks` 数组中按序提取对应的block对象
3. **保持原始内容结构**：确保blocks数组的顺序严格遵循原始内容的结构

**错误处理：**
- 如果保存失败：停止执行，告知用户"保存文档内容失败，错误信息：[具体错误]，可能原因：1) 文档编辑权限不足 2) 文档已被锁定 3) blocks格式错误"
- 如果文档不存在：告知用户"目标文档不存在或已被删除，文档ID：[document_id]"

### 6. 在多维表格中插入记录

使用 `create-bitable-record` 工具在Daily Note多维表格中插入记录：
```
工具: create-bitable-record
参数: {
  "app_token": "WGHcbBFFEaXV9qsZN6ecbCmCnfh",
  "table_id": "tbljmyT87cIlcMBz",
  "fields": {
    "日期": {{current_date_timestamp}},
    "内容": "{{record_summary_or_title}}",
    "文档链接": "{{document_url}}"
  }
}
```

**字段说明：**
- `日期`：当前日期的时间戳（毫秒）
- `内容`：用户提供的摘要，如未提供则使用文档标题
- `文档链接`：新创建文档的URL

**错误处理：**
- 如果插入记录失败：警告用户"文档已创建，但多维表格记录创建失败，错误信息：[具体错误]"
- 如果多维表格不存在或字段名称错误：提供详细的错误信息和解决建议
- 即使此步骤失败，文档已成功创建，应告知用户文档URL

**重要提示：** 即使多维表格记录创建失败，文档创建是成功的，应向用户提供文档链接

### 7. 输出结果

返回包含以下信息的成功消息：
```
✅ 内容已成功保存到飞书！

📄 文档信息：
- 标题：{{document_title}}
- URL：{{document_url}}
- 父文档：{{parent_document_title}}
- 所属空间：{{space_name}}

📊 多维表格记录：
- 表格：Daily Note
- 记录ID：{{record_id}}
- 记录时间：{{current_datetime}}

🔗 快速访问：
- 文档链接：{{document_url}}
- 表格链接：https://c16lk2ssrm.feishu.cn/wiki/BCZqwHTeAiJcqukfuSbc75z5nMh
```

如果多维表格记录创建失败，仍然提供文档信息和URL。

## 错误处理总结

### 权限问题
- 检查用户是否有相关空间、文档和表格的访问和编辑权限
- 提供获取权限的指导

### API调用失败
- 每个关键步骤都包含错误处理
- 提供清晰的错误信息和可能的解决方案
- 部分失败（如多维表格记录）不影响核心功能（文档创建）

### 用户输入问题
- 验证用户提供的标题和内容
- 处理空值和特殊字符
- 提供友好的提示和示例

## 最佳实践

1. **智能路径选择**
   - 优先使用用户指定的保存位置
   - 如未指定，提供知识空间列表供选择
   - 提供默认选项（2025文档）以提高效率

2. **内容格式**
   - 支持Markdown格式，提供更好的排版
   - 自动转换为飞书文档blocks
   - 保持内容结构的一致性

3. **双重记录**
   - 文档：完整的内容保存
   - 多维表格：快速检索和管理的记录
   - 两者通过URL关联

4. **用户体验**
   - 提供清晰的步骤指引
   - 在每个关键决策点征询用户意见
   - 提供详细的成功/失败状态反馈
   - 即使部分功能失败，也确保核心功能可用

5. **容错性**
   - 优雅处理各类错误
   - 部分失败不影响整体流程
   - 提供明确的补救措施建议
