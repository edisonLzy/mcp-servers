# 飞书 Markdown/HTML 内容转换工具

## 概述

新增了 `convert-content-to-blocks` 工具，用于将 Markdown 或 HTML 内容转换为飞书文档块。该工具基于飞书开放平台的 "Markdown/HTML 内容转换为文档块" API 实现。

## 功能特性

### 支持的内容格式
- **Markdown**: 支持标准 Markdown 语法
- **HTML**: 支持有效的 HTML 标记

### 内容限制
- 最大内容长度: 10,485,760 字符
- 最小内容长度: 1 字符
- 内容不能为空

### 输入参数
- `content_type`: 内容格式，必须是 "markdown" 或 "html"
- `content`: 要转换的内容字符串

### 输出结果
转换成功时返回:
- `first_level_block_ids`: 顶级块 ID 数组
- `blocks`: 转换后的文档块数组，包含:
  - `block_id`: 块 ID
  - `block_type`: 块类型
  - `parent_id`: 父块 ID
  - 其他块特定属性（如文本内容、样式等）

## 技术实现

### 文件结构
```
src/tools/docx/convertContentToBlocks.ts
├── 类型定义 (ConvertContentToBlocksRequest, ConvertContentToBlocksResponse)
├── 参数验证 (zod schema)
├── 核心转换函数 (convertContentToBlocks)
└── 工具注册函数 (registerConvertContentToBlocksTool)
```

### API 集成
- **API 端点**: `/docx/v1/documents/content/blocks`
- **HTTP 方法**: POST
- **认证**: 使用飞书应用 token
- **请求体**: `{ content_type, content }`

### 错误处理
- 内容为空验证
- 内容类型验证
- 内容长度限制检查
- API 调用错误处理
- 详细错误信息返回

## 使用场景

1. **文档导入**: 将外部 Markdown 或 HTML 内容导入到飞书文档
2. **内容转换**: 将富文本内容转换为结构化的文档块
3. **批量处理**: 配合其他工具实现内容的批量转换和插入
4. **格式标准化**: 将不同格式的内容统一转换为飞书文档格式

## 与其他工具的配合

该工具可以与现有的文档操作工具配合使用:

1. **转换 + 创建**: 先使用 `convert-content-to-blocks` 转换内容，再使用 `create-document-blocks` 插入到文档
2. **转换 + 更新**: 转换内容后使用 `update-document-block` 更新现有块
3. **批量操作**: 转换多个内容片段后批量插入到文档中

## 代码质量

- ✅ TypeScript 类型安全
- ✅ Zod 参数验证
- ✅ 完整的错误处理
- ✅ 符合 MCP 协议规范
- ✅ 与现有代码风格一致
- ✅ 详细的 JSDoc 注释

## 测试建议

1. **基础功能测试**:
   - 测试 Markdown 内容转换
   - 测试 HTML 内容转换
   - 测试空内容处理
   - 测试超长内容处理

2. **集成测试**:
   - 与 `create-document-blocks` 工具配合
   - 与 `update-document-block` 工具配合
   - 端到端文档创建流程

3. **错误场景测试**:
   - 无效的 content_type
   - 网络错误处理
   - API 权限错误处理

## 总结

新增的 `convert-content-to-blocks` 工具为飞书 MCP 服务器提供了强大的内容转换能力，支持将 Markdown 和 HTML 内容转换为飞书文档块。该工具设计完善，错误处理全面，可以与现有工具良好配合，为用户提供完整的文档操作解决方案。