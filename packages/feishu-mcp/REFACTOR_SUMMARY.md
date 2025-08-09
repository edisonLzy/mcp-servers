# 文档工具重构总结

## 重构概述

本次重构将原有的 `get-wiki-document-content` 工具拆分为两个专门的工具，以提供更清晰的功能分离和更好的用户体验。

## 变更详情

### 🔄 重构的工具

#### 原工具: `get-wiki-document-content`
- **文件**: `getDocumentContent.ts`
- **功能**: 获取文档内容，支持结构化和纯文本两种格式
- **问题**: 功能混合，参数复杂

#### 新工具 1: `get-document-blocks`
- **文件**: `getDocumentBlocks.ts`
- **功能**: 专门获取文档的结构化块数据
- **参数**:
  - `document_id`: 文档ID
  - `include_children`: 是否包含子块（默认 true）
- **返回**: 结构化的文档块数据，包含块类型、内容、层级关系等

#### 新工具 2: `get-document-raw-content`
- **文件**: `getDocumentRawContent.ts`
- **功能**: 专门获取文档的纯文本内容
- **参数**:
  - `document_id`: 文档ID
  - `lang`: 语言代码（数字类型，0=默认，1=中文，2=英文等）
- **返回**: 纯文本内容和内容长度

## 🎯 重构优势

### 1. **功能分离**
- 结构化数据获取和纯文本获取分离
- 每个工具职责单一，更易理解和使用

### 2. **参数简化**
- 移除了复杂的 `format` 参数
- 每个工具的参数更加专注和简洁

### 3. **性能优化**
- 用户可以根据需求选择合适的工具
- 避免不必要的数据处理和传输

### 4. **类型安全**
- 修复了语言参数的类型错误
- 更好的 TypeScript 支持

## 📋 使用示例

### 获取文档结构化块数据
```json
{
  "tool": "get-document-blocks",
  "params": {
    "document_id": "your_document_id",
    "include_children": true
  }
}
```

**返回示例**:
```json
{
  "success": true,
  "document_id": "your_document_id",
  "blocks": [...],
  "block_count": 15,
  "total_blocks": 15
}
```

### 获取文档纯文本内容
```json
{
  "tool": "get-document-raw-content",
  "params": {
    "document_id": "your_document_id",
    "lang": 0
  }
}
```

**返回示例**:
```json
{
  "success": true,
  "document_id": "your_document_id",
  "lang": 0,
  "content": "这是文档的纯文本内容...",
  "content_length": 1234
}
```

## 🔧 技术细节

### 文件变更
- ✅ 重命名: `getDocumentContent.ts` → `getDocumentBlocks.ts`
- ✅ 新建: `getDocumentRawContent.ts`
- ✅ 更新: `index.ts` 中的工具注册

### API 映射
- `get-document-blocks` → `client.getDocumentBlocks()`
- `get-document-raw-content` → `client.getDocumentRawContent()`

### 错误处理
- 保持一致的错误处理格式
- 提供清晰的错误信息和错误码

## 🚀 迁移指南

### 对于现有用户
如果您之前使用 `get-wiki-document-content` 工具：

1. **获取结构化数据**（原 `format: 'structured'`）:
   ```json
   // 旧方式
   {
     "tool": "get-wiki-document-content",
     "params": {
       "document_id": "xxx",
       "format": "structured"
     }
   }
   
   // 新方式
   {
     "tool": "get-document-blocks",
     "params": {
       "document_id": "xxx"
     }
   }
   ```

2. **获取纯文本内容**（原 `format: 'text'`）:
   ```json
   // 旧方式
   {
     "tool": "get-wiki-document-content",
     "params": {
       "document_id": "xxx",
       "format": "text"
     }
   }
   
   // 新方式
   {
     "tool": "get-document-raw-content",
     "params": {
       "document_id": "xxx"
     }
   }
   ```

## ✅ 验证结果

- ✅ 代码编译成功
- ✅ 服务器启动正常
- ✅ 两个新工具已成功注册
- ✅ 类型错误已修复
- ✅ 功能测试通过

这次重构提升了工具的可用性和维护性，为用户提供了更清晰、更专注的文档内容获取方式。