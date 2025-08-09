# Create Document Blocks Tool

## Overview

The `create-document-blocks` tool allows you to create new blocks in a Feishu document at a specified position. This tool is typically used in conjunction with the `convert-content-to-blocks` tool to insert formatted content into documents.

## Tool Name

`create-document-blocks`

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `document_id` | string | Yes | - | The document ID where blocks will be created |
| `block_id` | string | Yes | - | The parent block ID where new blocks will be inserted |
| `index` | number | Yes | - | The position index where blocks will be inserted (0-based) |
| `blocks` | array | Yes | - | Array of block objects to create (usually from convert-content-to-blocks) |
| `document_revision_id` | number | No | -1 | Document revision ID for conflict detection |

## Return Value

```json
{
  "success": true,
  "document_id": "doccnULnB44EMMPSYa3rIb4eJCf",
  "parent_block_id": "doxcnAJ9VRRJqVMYZ1MyKnayXWe",
  "insertion_index": 0,
  "created_blocks_count": 3,
  "document_revision_id": 125,
  "created_blocks": [
    {
      "block_id": "doxcnNewBlock1",
      "block_type": 2,
      "parent_id": "doxcnAJ9VRRJqVMYZ1MyKnayXWe"
    }
  ]
}
```

## Usage Examples

### Basic Usage

```javascript
// Create blocks directly
const result = await createDocumentBlocks({
  document_id: "doccnULnB44EMMPSYa3rIb4eJCf",
  block_id: "doxcnParentBlock",
  index: 0,
  blocks: [
    {
      "block_type": 2,
      "text": {
        "elements": [
          {
            "text_run": {
              "content": "Hello, World!"
            }
          }
        ]
      }
    }
  ]
});
```

### Combined with Convert Content to Blocks

```javascript
// Step 1: Convert Markdown content to blocks
const convertResult = await convertContentToBlocks({
  content_type: "markdown",
  content: `# New Section

This is a paragraph with **bold** text.

- List item 1
- List item 2

## Subsection

Another paragraph.`
});

// Step 2: Create blocks in document
const createResult = await createDocumentBlocks({
  document_id: "doccnULnB44EMMPSYa3rIb4eJCf",
  block_id: "doxcnParentBlock",
  index: 0,
  blocks: convertResult.blocks
});

console.log(`Created ${createResult.created_blocks_count} blocks`);
```

### Insert at Specific Position

```javascript
// Insert blocks at the end of existing content
const result = await createDocumentBlocks({
  document_id: "doccnULnB44EMMPSYa3rIb4eJCf",
  block_id: "doxcnParentBlock",
  index: 5, // Insert after the 5th existing block
  blocks: convertedBlocks,
  document_revision_id: 123 // Ensure document hasn't changed
});
```

## Common Use Cases

### 1. Adding Content to Document

Use this tool to append new content to an existing document:

```javascript
// Convert new content
const newContent = await convertContentToBlocks({
  content_type: "markdown",
  content: "## New Chapter\n\nThis is additional content."
});

// Add to document
const result = await createDocumentBlocks({
  document_id: documentId,
  block_id: rootBlockId,
  index: 999, // Large number to append at end
  blocks: newContent.blocks
});
```

### 2. Inserting Content at Beginning

```javascript
// Insert content at the beginning of document
const result = await createDocumentBlocks({
  document_id: documentId,
  block_id: rootBlockId,
  index: 0, // Insert at beginning
  blocks: headerBlocks
});
```

### 3. Building Document Programmatically

```javascript
// Build a document section by section
const sections = [
  "# Introduction",
  "## Overview\n\nThis document covers...",
  "## Features\n\n- Feature 1\n- Feature 2",
  "## Conclusion\n\nIn summary..."
];

let currentIndex = 0;
for (const section of sections) {
  const converted = await convertContentToBlocks({
    content_type: "markdown",
    content: section
  });
  
  const result = await createDocumentBlocks({
    document_id: documentId,
    block_id: rootBlockId,
    index: currentIndex,
    blocks: converted.blocks
  });
  
  currentIndex += result.created_blocks_count;
}
```

## Error Handling

```javascript
try {
  const result = await createDocumentBlocks({
    document_id: "invalid_id",
    block_id: "invalid_block",
    index: 0,
    blocks: []
  });
} catch (error) {
  if (error.code === 'PERMISSION_DENIED') {
    console.error('No permission to edit this document');
  } else if (error.code === 'RESOURCE_NOT_FOUND') {
    console.error('Document or block not found');
  } else if (error.code === 'INVALID_PARAMETERS') {
    console.error('Invalid parameters provided');
  }
}
```

## Best Practices

1. **Use with Convert Tool**: Always use `convert-content-to-blocks` first to ensure proper block formatting.

2. **Check Permissions**: Ensure you have write permissions to the target document.

3. **Handle Large Content**: For large content, consider breaking it into smaller chunks.

4. **Use Revision ID**: When possible, provide `document_revision_id` to prevent conflicts.

5. **Validate Block Structure**: Ensure blocks have the correct structure before creating.

## Related Tools

- [`convert-content-to-blocks`](./api-reference.md#convert-content-to-blocks): Convert Markdown/HTML to Feishu blocks
- [`get-document-blocks`](./api-reference.md#get-document-blocks): Get existing document blocks
- [`update-document-block`](./api-reference.md#update-document-block): Update existing blocks
- [`delete-document-blocks`](./api-reference.md#delete-document-blocks): Delete blocks

## Limitations

- Maximum 500 blocks can be created in a single request
- Document must exist and be accessible
- Parent block must exist
- Index must be within valid range (0 to number of existing children)
- Requires appropriate permissions on the document

## Troubleshooting

### Common Issues

1. **"Block not found" error**: Verify the `block_id` exists and is accessible
2. **"Invalid index" error**: Ensure index is within the valid range (0 to children count)
3. **"Permission denied" error**: Check document permissions and authentication
4. **"Invalid block structure" error**: Validate block format using convert tool first

### Debug Tips

1. Use `get-document-blocks` to inspect document structure first
2. Start with small, simple blocks to test
3. Check the Feishu API documentation for block type specifications
4. Verify authentication and permissions