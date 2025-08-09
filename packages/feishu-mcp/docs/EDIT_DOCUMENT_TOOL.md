# 飞书知识库文档编辑工具

这个工具提供了强大的飞书知识库文档编辑功能，支持创建、更新、删除和批量操作文档块。

## 工具名称
`edit-wiki-document`

## 功能特性

### 🚀 核心功能
- **创建块**: 在文档中插入新的内容块
- **更新块**: 修改现有块的内容和样式
- **删除块**: 删除指定范围的子块
- **批量操作**: 一次性更新多个块

### 📝 支持的内容类型
- 普通文本 (`text`)
- 标题 (`heading1` - `heading9`)
- 无序列表 (`bullet`)
- 有序列表 (`ordered`)
- 代码块 (`code`)
- 引用块 (`quote`)
- 待办事项 (`todo`)

### 🎨 样式支持

#### 文本样式
- **粗体** (`bold`)
- *斜体* (`italic`)
- ~~删除线~~ (`strikethrough`)
- <u>下划线</u> (`underline`)
- `行内代码` (`inline_code`)
- 背景色 (`background_color`: 1-15)
- 文字颜色 (`text_color`: 1-7)
- 链接 (`link_url`)

#### 块样式
- 对齐方式 (`align`: 1=左对齐, 2=居中, 3=右对齐)
- 折叠状态 (`folded`)
- 背景色 (`background_color`: 1-15)
- 缩进级别 (`indent_level`: 0-7)

### 🤖 智能功能
- **自动内容类型检测**: 根据内容自动识别类型（如 `# 标题` → `heading1`）
- **内容清理**: 自动移除 Markdown 标记符号
- **灵活定位**: 支持指定父块和插入位置

## 使用示例

### 1. 创建文本块
```json
{
  "document_id": "your_document_id",
  "operation": "create",
  "content": "这是一段普通文本",
  "content_type": "text",
  "text_style": {
    "bold": true,
    "text_color": 1
  }
}
```

### 2. 创建标题（自动检测）
```json
{
  "document_id": "your_document_id",
  "operation": "create",
  "content": "# 这是一级标题",
  "auto_detect_content_type": true
}
```

### 3. 创建列表项
```json
{
  "document_id": "your_document_id",
  "operation": "create",
  "content": "- 这是一个列表项",
  "auto_detect_content_type": true,
  "block_style": {
    "indent_level": 1
  }
}
```

### 4. 更新现有块
```json
{
  "document_id": "your_document_id",
  "operation": "update",
  "target_block_id": "block_id_to_update",
  "content": "更新后的内容",
  "text_style": {
    "italic": true,
    "background_color": 3
  }
}
```

### 5. 删除子块
```json
{
  "document_id": "your_document_id",
  "operation": "delete",
  "target_block_id": "parent_block_id",
  "delete_start_index": 0,
  "delete_end_index": 2
}
```

### 6. 批量更新
```json
{
  "document_id": "your_document_id",
  "operation": "batch_update",
  "batch_operations": [
    {
      "block_id": "block1",
      "content": "更新的内容1",
      "text_style": { "bold": true }
    },
    {
      "block_id": "block2",
      "content": "更新的内容2",
      "text_style": { "italic": true }
    }
  ]
}
```

## 参数说明

### 必需参数
- `document_id`: 要编辑的文档ID
- `operation`: 操作类型 (`create`, `update`, `delete`, `batch_update`)

### 创建操作参数
- `content`: 要添加的内容
- `parent_block_id`: 父块ID（可选，默认为文档根块）
- `position`: 插入位置索引（可选，默认追加到末尾）
- `content_type`: 内容类型（可选，默认为 `text`）

### 更新操作参数
- `target_block_id`: 要更新的块ID
- `content`: 新内容（可选）

### 删除操作参数
- `target_block_id`: 父块ID
- `delete_start_index`: 删除起始索引
- `delete_end_index`: 删除结束索引（不包含）

### 批量操作参数
- `batch_operations`: 批量操作数组

### 样式参数
- `text_style`: 文本样式选项
- `block_style`: 块样式选项

### 高级选项
- `document_revision_id`: 文档版本ID（默认 -1 表示最新版本）
- `auto_detect_content_type`: 自动检测内容类型（默认 true）

## 返回结果

成功时返回：
```json
{
  "success": true,
  "operation": "create",
  "document_id": "your_document_id",
  "content_type": "text",
  "created_blocks": [...],
  "document_revision_id": 123
}
```

失败时返回：
```json
{
  "success": false,
  "error": "错误信息",
  "operation": "create",
  "document_id": "your_document_id"
}
```

## 注意事项

1. **权限要求**: 确保应用有文档编辑权限
2. **文档版本**: 建议使用最新版本（`document_revision_id: -1`）
3. **内容长度**: 注意飞书API对内容长度的限制
4. **并发操作**: 避免同时对同一文档进行多个编辑操作
5. **错误处理**: 始终检查返回结果中的 `success` 字段

## 最佳实践

1. **使用自动检测**: 启用 `auto_detect_content_type` 简化使用
2. **批量操作**: 对于多个块的修改，使用批量操作提高效率
3. **样式一致性**: 保持文档样式的一致性
4. **错误恢复**: 实现适当的错误处理和重试机制

这个工具为飞书知识库文档编辑提供了全面而强大的功能，支持各种复杂的编辑需求。