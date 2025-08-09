# 获取知识库文档内容工具使用指南

## 工具概述

`get-wiki-document-content` 工具用于获取飞书知识库中文档的详细内容。该工具基于飞书开放平台的文档块（Block）API，可以获取文档的结构化内容或纯文本内容。

## 参数说明

### 必需参数

- **document_id** (string): 文档ID
  - 对于知识库中的文档，这是 `obj_token` 字段的值（当 `obj_type` 为 `docx` 时）
  - 可以通过 `get-space-nodes` 工具获取知识库节点信息来获得此ID

### 可选参数

- **include_children** (boolean, 默认: true): 是否包含子块
  - `true`: 返回所有块，包括嵌套的子块
  - `false`: 只返回顶级块

- **format** (string, 默认: "structured"): 输出格式
  - `"structured"`: 返回完整的块结构数据，包含所有元数据
  - `"text"`: 返回提取的纯文本内容

## 使用示例

### 1. 获取结构化内容

```json
{
  "document_id": "doccnULnB44EMMPSYa3rIb4eJCf",
  "include_children": true,
  "format": "structured"
}
```

**返回示例:**
```json
{
  "success": true,
  "document_id": "doccnULnB44EMMPSYa3rIb4eJCf",
  "format": "structured",
  "blocks": [
    {
      "block_id": "doxcnAJ9VRRJqVMYZ1MyKnayXWe",
      "block_type": 1,
      "children": ["doxcnC4cO4qUui6isgnpofh5edc"],
      "text": {
        "elements": [
          {
            "text_run": {
              "content": "文档标题",
              "text_element_style": {}
            }
          }
        ],
        "style": {}
      }
    },
    {
      "block_id": "doxcnC4cO4qUui6isgnpofh5edc",
      "block_type": 2,
      "parent_id": "doxcnAJ9VRRJqVMYZ1MyKnayXWe",
      "text": {
        "elements": [
          {
            "text_run": {
              "content": "这是文档的正文内容...",
              "text_element_style": {}
            }
          }
        ]
      }
    }
  ],
  "block_count": 2,
  "total_blocks": 2
}
```

### 2. 获取纯文本内容

```json
{
  "document_id": "doccnULnB44EMMPSYa3rIb4eJCf",
  "format": "text"
}
```

**返回示例:**
```json
{
  "success": true,
  "document_id": "doccnULnB44EMMPSYa3rIb4eJCf",
  "format": "text",
  "content": "文档标题\n\n这是文档的正文内容...",
  "block_count": 2
}
```

## 块类型说明

飞书文档由不同类型的块组成，常见的块类型包括：

- **1**: 页面块（Page Block）
- **2**: 文本块（Text Block）
- **3**: 一级标题（Heading 1）
- **4**: 二级标题（Heading 2）
- **5**: 三级标题（Heading 3）
- **13**: 有序列表（Ordered List）
- **14**: 无序列表（Unordered List）
- **23**: 文件块（File Block）
- **27**: 图片块（Image Block）
- **30**: 电子表格块（Sheet Block）
- **31**: 表格块（Table Block）
- **32**: 表格单元格块（Table Cell Block）

## 工作原理

该工具通过以下流程获取文档内容：

1. **文本格式**: 使用高效的 `/open-apis/docx/v1/documents/{document_id}/raw_content` API 直接获取纯文本内容
2. **结构化格式**: 使用 `/open-apis/docx/v1/documents/{document_id}/blocks` API 获取包含完整元数据的所有块
3. **处理分页**: 对于结构化格式，自动处理分页响应以获取所有块
4. **过滤内容**: 对于结构化格式，根据 `include_children` 参数可选择性地过滤子块

## 工作流程示例

### 完整的获取知识库文档内容流程：

1. **获取知识库列表**
   ```json
   // 使用 list-wiki-spaces 工具
   {}
   ```

2. **获取知识库节点**
   ```json
   // 使用 get-space-nodes 工具
   {
     "space_id": "7123456789012345678"
   }
   ```

3. **获取文档内容**
   ```json
   // 使用 get-wiki-document-content 工具
   {
     "document_id": "doccnULnB44EMMPSYa3rIb4eJCf",
     "format": "text"
   }
   ```

## 注意事项

1. **权限要求**: 需要有相应知识库的访问权限
2. **文档类型**: 目前主要支持 `docx` 类型的文档
3. **API限制**: 受飞书开放平台API频率限制约束
4. **大文档处理**: 对于包含大量块的文档，API会自动分页处理
5. **文本提取**: 在 `text` 格式下，会自动提取各种元素的文本内容，包括@用户、公式等
6. **性能优化**: 对于纯文本提取，工具现在使用优化的原始内容API以获得更好的性能

## 错误处理

如果调用失败，工具会返回错误信息：

```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Insufficient permissions to access this resource"
  }
}
```

常见错误码：
- `PERMISSION_DENIED`: 权限不足
- `NOT_FOUND`: 文档不存在
- `INVALID_PARAM`: 参数无效
- `RATE_LIMIT_EXCEEDED`: 超出API调用频率限制