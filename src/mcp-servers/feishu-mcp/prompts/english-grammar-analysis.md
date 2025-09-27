# English Grammar Analysis and Color Marking Workflow

## 工作流概述

这个工作流用于分析飞书文档中的英语句子，识别语法成分，并使用不同颜色标记各个词性，同时添加中文翻译。

## 适用场景

- 英语学习文档的语法分析
- 语言教学材料的可视化标记
- 英语句子结构分析和翻译

## 工作流步骤

### 1. 获取文档内容

```typescript
// 从URL提取文档token
const documentToken = extractTokenFromUrl(feishuUrl);

// 获取节点信息
const nodeInfo = await getNodeInfo(documentToken, 'wiki');

// 获取文档原始内容
const rawContent = await getDocumentRawContent(nodeInfo.obj_token);
```

### 2. 语法分析

分析英语句子的语法结构，识别以下成分：

- **主语 (Subject)** - 红色标记
- **谓语动词 (Predicate/Verb)** - 蓝色标记
- **宾语 (Object)** - 绿色标记
- **修饰词 (Modifiers)** - 橙色标记（形容词、副词、物主代词等）
- **介词短语 (Prepositional Phrases)** - 紫色标记
- **其他词汇** - 黑色（冠词、连词等）

### 3. 颜色编码方案

```typescript
const colorScheme = {
  subject: 1,        // 红色 - 主语
  verb: 2,          // 蓝色 - 谓语动词
  object: 3,        // 绿色 - 宾语
  modifier: 4,      // 橙色 - 修饰词
  prepositional: 5, // 紫色 - 介词短语
  other: 0          // 黑色 - 其他
};
```

### 4. 获取文档结构

```typescript
// 获取文档的结构化块内容
const blocks = await getDocumentBlocks(documentId, true);
```

### 5. 创建彩色标记文本

为英语句子的每个语法成分应用相应颜色：

```typescript
const coloredSentence = {
  block_type: 2,
  text: {
    elements: [
      {
        text_run: {
          content: "Jack",
          text_element_style: {
            bold: true,
            text_color: 1 // 红色 - 主语
          }
        }
      },
      {
        text_run: {
          content: " ",
          text_element_style: {}
        }
      },
      {
        text_run: {
          content: "was putting",
          text_element_style: {
            bold: true,
            text_color: 2 // 蓝色 - 谓语动词
          }
        }
      },
      // ... 其他元素
    ]
  }
};
```

### 6. 删除原有内容

```typescript
// 删除需要替换的文本块
await deleteDocumentBlocks(documentId, parentBlockId, startIndex, endIndex);
```

### 7. 插入彩色标记内容

```typescript
// 创建带有颜色标记的新文本块
await createDocumentBlocks(documentId, index, [coloredSentence]);
```

### 8. 添加中文翻译引用块

```typescript
// 创建引用块格式的中文翻译
const translationQuote = {
  block_type: 2,
  text: {
    elements: [
      {
        text_run: {
          content: "> 杰克正在戴眼镜。",
          text_element_style: {
            italic: true
          }
        }
      }
    ]
  }
};

await createDocumentBlocks(documentId, insertIndex, [translationQuote]);
```

## 完整工作流实现示例

### 输入
- 飞书文档URL：`https://c16lk2ssrm.feishu.cn/wiki/RwjUwKyQuiJoOVkzYAHcWAz3nlF`
- 原始英语句子：`"Jack was putting his glasses into place."`

### 处理过程
1. 提取文档token：`RwjUwKyQuiJoOVkzYAHcWAz3nlF`
2. 获取文档对象token：`YNUTdYjnxovXz7x2pvwcshzTnWd`
3. 分析语法结构：
   - Jack (主语) → 红色
   - was putting (谓语动词) → 蓝色
   - his (物主代词) → 橙色
   - glasses (宾语) → 绿色
   - into place (介词短语) → 紫色

### 输出
```
test

Jack was putting his glasses into place.
[彩色标记：Jack(红) was putting(蓝) his(橙) glasses(绿) into place(紫)]

> 杰克正在戴眼镜。

```

## 技术要点

### Feishu API 使用
- `get-node-info`: 获取节点信息
- `get-document-raw-content`: 获取原始文本内容
- `get-document-blocks`: 获取结构化文档块
- `delete-document-blocks`: 删除指定文档块
- `create-document-blocks`: 创建新的文档块
- `update-document-block`: 更新文档块内容

### 文本样式控制
```typescript
text_element_style: {
  bold: boolean,
  italic: boolean,
  text_color: number, // 1-7对应不同颜色
  underline: boolean,
  strikethrough: boolean,
  inline_code: boolean
}
```

### 错误处理
- 确保文档token正确提取
- 验证API调用返回状态
- 处理权限和访问限制
- 保持文档结构完整性

## 扩展功能

1. **支持更复杂的语法结构**
   - 复合句分析
   - 从句标记
   - 时态和语态识别

2. **多语言支持**
   - 其他语言的语法分析
   - 多种翻译目标语言

3. **批量处理**
   - 处理多个句子或段落
   - 整篇文档的语法分析

4. **交互式标记**
   - 用户自定义颜色方案
   - 选择性语法成分标记

## 使用场景

- **英语教学**: 帮助学生理解句子结构
- **语言学习**: 可视化语法成分
- **文档翻译**: 提供结构化的翻译对照
- **语法研究**: 分析和标记语言特征