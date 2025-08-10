# 飞书 MCP 服务器综合指南

## 📖 概述

飞书 MCP 服务器是一个基于 Model Context Protocol (MCP) 的飞书集成工具，提供了完整的飞书知识库和文档操作功能。该服务器支持获取知识库列表、管理文档内容、编辑文档块等核心功能。

## 🎯 核心功能

### 知识库管理
- **获取知识库列表**: 列出所有可访问的知识库空间
- **获取知识库节点**: 获取指定知识库下的所有文档节点
- **创建知识库节点**: 在知识库中创建新的文档节点

### 文档内容操作
- **获取文档内容**: 支持结构化块数据和纯文本两种格式
- **创建文档块**: 在文档中插入新的内容块
- **更新文档块**: 修改现有块的内容和样式
- **删除文档块**: 删除指定范围的子块

### 内容转换
- **Markdown/HTML 转换**: 将 Markdown 或 HTML 内容转换为飞书文档块
- **智能内容检测**: 自动识别内容格式并选择合适的处理方式

## 🛠️ 工具详细说明

### Wiki 工具

#### `list-wiki-spaces`
获取所有可访问的知识库空间列表。

**参数**: 无

**返回示例**:
```json
{
  "spaces": [
    {
      "space_id": "7034502641455497244",
      "name": "知识库名称",
      "description": "知识库描述"
    }
  ]
}
```

#### `get-space-nodes`
获取指定知识库下的所有文档节点。

**参数**:
- `space_id` (必需): 知识库空间ID
- `recursive` (可选, 默认: false): 是否递归获取所有子节点

**返回示例**:
```json
{
  "nodes": [
    {
      "node_token": "wikcnpJLIzbAptN4cMQrQoewaLc",
      "obj_token": "doccnULnB44EMMPSYa3rIb4eJCf",
      "obj_type": "docx",
      "title": "文档标题",
      "has_child": true
    }
  ]
}
```

#### `create-wiki-node`
在知识库中创建新的节点。

**参数**:
- `space_id` (必需): 知识库空间ID
- `obj_type` (必需): 节点类型 (docx, sheet, mindnote, bitable, file, slides)
- `title` (必需): 节点标题
- `parent_node_token` (可选): 父节点token

### 文档内容工具

#### `get-document-blocks`
获取文档的结构化块数据。

**参数**:
- `document_id` (必需): 文档ID
- `include_children` (可选, 默认: true): 是否包含子块

**返回示例**:
```json
{
  "success": true,
  "document_id": "doccnULnB44EMMPSYa3rIb4eJCf",
  "blocks": [
    {
      "block_id": "doxcnAJ9VRRJqVMYZ1MyKnayXWe",
      "block_type": 1,
      "text": {
        "elements": [
          {
            "text_run": {
              "content": "文档内容..."
            }
          }
        ]
      }
    }
  ],
  "block_count": 10,
  "total_blocks": 15
}
```

#### `get-document-raw-content`
获取文档的纯文本内容。

**参数**:
- `document_id` (必需): 文档ID
- `lang` (可选, 默认: 0): 语言代码 (0=默认, 1=中文, 2=英文等)

**返回示例**:
```json
{
  "success": true,
  "document_id": "doccnULnB44EMMPSYa3rIb4eJCf",
  "lang": 0,
  "content": "文档标题\n\n这是文档的纯文本内容...",
  "content_length": 1234
}
```

### 文档编辑工具

#### `create-document-blocks`
在文档中创建新的内容块。

**参数**:
- `document_id` (必需): 文档ID
- `block_id` (必需): 父块ID
- `index` (必需): 插入位置索引 (0-based)
- `blocks` (必需): 要创建的块数组 (通常来自 convert-content-to-blocks)
- `document_revision_id` (可选, 默认: -1): 文档版本ID

**使用示例**:
```javascript
// 1. 先转换内容为块
const convertResult = await convertContentToBlocks({
  content_type: "markdown",
  content: "# 标题\n\n这是段落内容。"
});

// 2. 创建块到文档中
const createResult = await createDocumentBlocks({
  document_id: "doccnULnB44EMMPSYa3rIb4eJCf",
  block_id: "doxcnParentBlock",
  index: 0,
  blocks: convertResult.blocks
});
```

#### `update-document-block`
更新文档中特定块的内容和样式。

**参数**:
- `document_id` (必需): 文档ID
- `block_id` (必需): 要更新的块ID
- `content` (可选): 新内容
- `text_style` (可选): 文本样式
- `block_style` (可选): 块样式
- `document_revision_id` (可选, 默认: -1): 文档版本ID
- `auto_detect_content_type` (可选, 默认: true): 自动检测内容类型

**样式选项**:
```json
{
  "text_style": {
    "bold": true,
    "italic": false,
    "strikethrough": false,
    "underline": false,
    "inline_code": false,
    "background_color": 1,
    "text_color": 1,
    "link_url": "https://example.com"
  },
  "block_style": {
    "align": 1,
    "folded": false,
    "background_color": 1,
    "indent_level": 0
  }
}
```

#### `delete-document-blocks`
删除文档中指定范围的子块。

**参数**:
- `document_id` (必需): 文档ID
- `parent_block_id` (必需): 父块ID
- `start_index` (必需): 开始索引 (包含)
- `end_index` (必需): 结束索引 (不包含)
- `document_revision_id` (可选, 默认: -1): 文档版本ID

### 内容转换工具

#### `convert-content-to-blocks`
将 Markdown 或 HTML 内容转换为飞书文档块。

**参数**:
- `content_type` (必需): 内容格式 ("markdown" | "html")
- `content` (必需): 要转换的内容 (1-10485760 字符)

**返回示例**:
```json
{
  "success": true,
  "content_type": "markdown",
  "converted_blocks": 5,
  "first_level_block_ids": ["block1", "block2"],
  "blocks": [
    {
      "block_id": "block1",
      "block_type": 2,
      "text": {
        "elements": [
          {
            "text_run": {
              "content": "转换后的内容..."
            }
          }
        ]
      }
    }
  ]
}
```

## 🔄 重构历史

### 文档工具重构 (REFACTOR_SUMMARY.md)
将原有的 `get-wiki-document-content` 工具拆分为两个专门工具：

1. **`get-document-blocks`**: 专门获取文档的结构化块数据
2. **`get-document-raw-content`**: 专门获取文档的纯文本内容

**重构优势**:
- 功能分离，职责单一
- 参数简化，更易使用
- 性能优化，按需选择
- 类型安全，更好的 TypeScript 支持

### 文档编辑工具重构 (EDIT_DOCUMENT_REFACTOR_SUMMARY.md)
将复杂的 `edit-wiki-document` 工具拆分为三个专门工具：

1. **`create-document-blocks`**: 创建文档块
2. **`update-document-block`**: 更新文档块
3. **`delete-document-blocks`**: 删除文档块

**重构优势**:
- 单一职责原则
- 参数简化
- 性能优化
- 更好的扩展性
- 测试友好

### 内容转换重构 (REFACTOR_CONTENT_CONVERSION.md)
优化了内容转换逻辑，利用飞书官方的 `convertContentToBlocks` API：

**改进内容**:
- 智能检测 Markdown 和 HTML 内容
- 使用官方 API 进行内容转换
- 保留手动创建逻辑作为后备方案
- 移除冗余的内容检测和清理函数

## 📋 块类型说明

飞书文档由不同类型的块组成：

| 块类型 | 说明 |
|--------|------|
| 1 | 页面块 (Page Block) |
| 2 | 文本块 (Text Block) |
| 3 | 一级标题 (Heading 1) |
| 4 | 二级标题 (Heading 2) |
| 5 | 三级标题 (Heading 3) |
| 13 | 有序列表 (Ordered List) |
| 14 | 无序列表 (Unordered List) |
| 23 | 文件块 (File Block) |
| 27 | 图片块 (Image Block) |
| 30 | 电子表格块 (Sheet Block) |
| 31 | 表格块 (Table Block) |
| 32 | 表格单元格块 (Table Cell Block) |

## 🔐 认证与权限

### 认证模式
- **应用认证** (tenant_access_token): 适用于应用级操作
- **用户认证** (user_access_token): 适用于用户级操作

### 权限要求
- **Wiki 操作**: `wiki:wiki` 或 `wiki:wiki.readonly`
- **文档操作**: `drive:drive` 和 `docs:doc`

### 环境变量配置
```bash
# 必需的应用认证
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret

# 可选的 API 端点
FEISHU_API_BASE_URL=https://open.feishu.cn/open-apis

# 可选的调试模式
FEISHU_DEBUG=true
```

## 🚀 使用示例

### 完整的工作流程

1. **获取知识库列表**
```json
{
  "tool": "list-wiki-spaces",
  "params": {}
}
```

2. **获取知识库节点**
```json
{
  "tool": "get-space-nodes",
  "params": {
    "space_id": "7123456789012345678"
  }
}
```

3. **获取文档内容**
```json
{
  "tool": "get-document-blocks",
  "params": {
    "document_id": "doccnULnB44EMMPSYa3rIb4eJCf"
  }
}
```

4. **转换并创建内容**
```json
{
  "tool": "convert-content-to-blocks",
  "params": {
    "content_type": "markdown",
    "content": "# 新章节\n\n这是新内容。"
  }
}
```

5. **插入到文档**
```json
{
  "tool": "create-document-blocks",
  "params": {
    "document_id": "doccnULnB44EMMPSYa3rIb4eJCf",
    "block_id": "doxcnParentBlock",
    "index": 0,
    "blocks": [/* 来自转换结果 */]
  }
}
```

## ⚠️ 注意事项

1. **权限要求**: 确保应用有相应资源的访问权限
2. **API 限制**: 受飞书开放平台 API 频率限制约束
3. **文档版本**: 建议使用最新版本 (`document_revision_id: -1`)
4. **并发操作**: 避免同时对同一文档进行多个编辑操作
5. **内容长度**: 注意飞书 API 对内容长度的限制 (最大 10,485,760 字符)

## 🛠️ 错误处理

所有工具都返回标准化的错误响应：

```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "权限不足，无法访问此资源",
    "details": {}
  }
}
```

### 常见错误码
- `AUTHENTICATION_FAILED`: 无效或过期的令牌
- `PERMISSION_DENIED`: 权限不足
- `RESOURCE_NOT_FOUND`: 请求的资源不存在
- `RATE_LIMITED`: 请求过于频繁
- `INVALID_PARAMETERS`: 无效的输入参数

## 📊 性能优化

### API 频率限制
- 每分钟 100 次请求
- 每小时 1000 次请求

### 客户端优化
- 自动处理频率限制
- 指数退避重试机制
- 令牌自动刷新

## 🔧 开发与测试

### 安装依赖
```bash
pnpm install
```

### 运行测试
```bash
pnpm test
```

### 使用 MCP Inspector 调试
```bash
pnpm inspector
```

### Claude Desktop 配置
```json
{
  "mcpServers": {
    "feishu": {
      "command": "node",
      "args": ["/path/to/feishu-mcp/src/index.js"],
      "env": {
        "FEISHU_APP_ID": "your_app_id",
        "FEISHU_APP_SECRET": "your_app_secret"
      }
    }
  }
}
```

## 📚 相关文档

- [API 参考文档](./api-reference.md)
- [Wiki 文档内容使用指南](./wiki-document-content-usage.md)
- [创建文档块工具说明](./CREATE_DOCUMENT_BLOCKS_TOOL.md)
- [编辑文档工具说明](./EDIT_DOCUMENT_TOOL.md)
- [内容转换工具总结](./CONVERT_CONTENT_TOOL_SUMMARY.md)
- [可行性研究报告](./feasibility-study.md)

## 🎯 总结

飞书 MCP 服务器提供了完整的飞书知识库和文档操作功能，通过模块化设计和智能内容转换，为用户提供了强大而易用的文档管理解决方案。该服务器遵循 MCP 协议标准，具有良好的扩展性和维护性。
