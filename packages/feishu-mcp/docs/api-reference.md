# Feishu MCP Server API Reference

## Overview

This document provides detailed API reference for the Feishu MCP Server tools.

## Authentication

The server supports two authentication modes:

### App Authentication (tenant_access_token)
- Used for app-level operations
- Requires app credentials (app_id, app_secret)
- Suitable for server-side operations

### User Authentication (user_access_token)  
- Used for user-level operations
- Requires OAuth flow completion
- Suitable for user-specific operations

## Tools

### Wiki Tools

#### `list-wiki-spaces`
Get list of all Wiki spaces accessible to the authenticated user/app.

**Parameters**: None

**Returns**:
```json
{
  "spaces": [
    {
      "space_id": "7034502641455497244",
      "name": "Knowledge Base Name",
      "description": "Knowledge base description"
    }
  ]
}
```

#### `get-space-nodes`
Get all document nodes in a specific Wiki space.

**Parameters**:
- `space_id` (required): The Wiki space ID
- `recursive` (optional, default: false): Whether to get all child nodes recursively

**Returns**:
```json
{
  "nodes": [
    {
      "node_token": "wikcnpJLIzbAptN4cMQrQoewaLc",
      "obj_token": "doccnULnB44EMMPSYa3rIb4eJCf",
      "obj_type": "doc",
      "title": "Document Title",
      "has_child": true
    }
  ]
}
```

#### `create-wiki-node`
Create a new node in a Wiki space.

**Parameters**:
- `space_id` (required): The Wiki space ID
- `obj_type` (required): Node type (doc, folder, sheet, etc.)
- `title` (required): Node title
- `parent_node_token` (optional): Parent node token

**Returns**:
```json
{
  "node_token": "wikcnpJLIzbAptN4cMQrQoewaLc",
  "obj_token": "doccnULnB44EMMPSYa3rIb4eJCf"
}
```

#### `get-wiki-document-content`
Get the content of a Feishu knowledge base document.

**Parameters**:
- `document_id` (required): The document ID (obj_token when obj_type is docx)
- `include_children` (optional, default: true): Whether to include child blocks
- `format` (optional, default: "structured"): Output format (structured|text)

**Returns**:
```json
{
  "success": true,
  "document_id": "doccnULnB44EMMPSYa3rIb4eJCf",
  "format": "structured",
  "blocks": [
    {
      "block_id": "doxcnAJ9VRRJqVMYZ1MyKnayXWe",
      "block_type": 1,
      "text": {
        "elements": [
          {
            "text_run": {
              "content": "Document content..."
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

### Document Tools

#### `create-document`
Create a new Feishu document.

**Parameters**:
- `title` (required): Document title
- `content` (optional): Initial document content
- `folder_token` (optional): Folder to create document in

**Returns**:
```json
{
  "document_token": "doccnULnB44EMMPSYa3rIb4eJCf",
  "url": "https://xxx.feishu.cn/docs/doccnULnB44EMMPSYa3rIb4eJCf"
}
```

#### `get-document-content`
Get the content of a Feishu document.

**Parameters**:
- `document_token` (required): The document token
- `format` (optional, default: "rich"): Content format (rich|plain)

**Returns**:
```json
{
  "title": "Document Title",
  "content": "Document content...",
  "revision": 123
}
```

#### `update-document`
Update the content of a Feishu document.

**Parameters**:
- `document_token` (required): The document token
- `content` (required): New document content
- `revision` (optional): Current document revision for conflict detection

**Returns**:
```json
{
  "success": true,
  "revision": 124
}
```

#### `get-document-blocks`
Get structured blocks from a Feishu document.

**Parameters**:
- `document_id` (required): The document ID
- `page_token` (optional): Pagination token for large documents

**Returns**:
```json
{
  "success": true,
  "document_id": "doccnULnB44EMMPSYa3rIb4eJCf",
  "blocks": [
    {
      "block_id": "doxcnAJ9VRRJqVMYZ1MyKnayXWe",
      "block_type": 2,
      "text": {
        "elements": [
          {
            "text_run": {
              "content": "Block content..."
            }
          }
        ]
      }
    }
  ],
  "has_more": false
}
```

#### `convert-content-to-blocks`
Convert Markdown or HTML content to Feishu document blocks.

**Parameters**:
- `content_type` (required): Content format ("markdown" | "html")
- `content` (required): Content to convert (1-10485760 characters)

**Returns**:
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
              "content": "Converted content..."
            }
          }
        ]
      }
    }
  ]
}
```

#### `create-document-blocks`
Create new blocks in a Feishu document at the specified position.

**Parameters**:
- `document_id` (required): The document ID where blocks will be created
- `block_id` (required): The parent block ID where new blocks will be inserted
- `index` (required): The position index where blocks will be inserted (0-based)
- `blocks` (required): Array of block objects to create (usually from convert-content-to-blocks)
- `document_revision_id` (optional, default: -1): Document revision ID for conflict detection

**Returns**:
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

**Usage Example**:
```javascript
// First convert content to blocks
const convertResult = await convertContentToBlocks({
  content_type: "markdown",
  content: "# Hello\n\nThis is a paragraph."
});

// Then create blocks in document
 const createResult = await createDocumentBlocks({
   document_id: "doccnULnB44EMMPSYa3rIb4eJCf",
   block_id: "doxcnParentBlock",
   index: 0,
   blocks: convertResult.blocks
 });
 ```

#### `update-document-block`
Update the content of a specific block in a Feishu document.

**Parameters**:
- `document_id` (required): The document ID
- `block_id` (required): The block ID to update
- `block` (required): The updated block content
- `document_revision_id` (optional, default: -1): Document revision ID for conflict detection

**Returns**:
```json
{
  "success": true,
  "document_id": "doccnULnB44EMMPSYa3rIb4eJCf",
  "block_id": "doxcnAJ9VRRJqVMYZ1MyKnayXWe",
  "document_revision_id": 126
}
```

#### `delete-document-blocks`
Delete specific blocks from a Feishu document.

**Parameters**:
- `document_id` (required): The document ID
- `block_ids` (required): Array of block IDs to delete
- `document_revision_id` (optional, default: -1): Document revision ID for conflict detection

**Returns**:
```json
{
  "success": true,
  "document_id": "doccnULnB44EMMPSYa3rIb4eJCf",
  "deleted_blocks_count": 2,
  "deleted_block_ids": ["doxcnBlock1", "doxcnBlock2"],
  "document_revision_id": 127
}
```

#### `get-document-raw-content`
Get the raw content of a Feishu document in text format.

**Parameters**:
- `document_id` (required): The document ID
- `lang` (optional, default: 0): Language preference (0=auto, 1=zh, 2=en, 3=ja)

**Returns**:
```json
{
  "success": true,
  "document_id": "doccnULnB44EMMPSYa3rIb4eJCf",
  "content": "Document title\n\nDocument content in plain text format..."
}
```

## Error Handling

All tools return standardized error responses:

```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Insufficient permissions to access this resource",
    "details": {}
  }
}
```

Common error codes:
- `AUTHENTICATION_FAILED`: Invalid or expired token
- `PERMISSION_DENIED`: Insufficient permissions  
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `RATE_LIMITED`: Too many requests
- `INVALID_PARAMETERS`: Invalid input parameters

## Permissions Required

### Wiki Operations
- `wiki:wiki`: Full wiki access (read, write, manage)
- `wiki:wiki.readonly`: Read-only wiki access

### Document Operations  
- `drive:drive`: Full drive access
- `docs:doc`: Document-specific permissions

## Configuration

The server requires the following environment variables:

```bash
# Required for app authentication
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret

# Optional: specify API endpoint
FEISHU_API_BASE_URL=https://open.feishu.cn/open-apis

# Optional: enable debug logging
FEISHU_DEBUG=true
```

## Usage Examples

### Using with Claude Desktop

Add to your Claude Desktop configuration:

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

### Command Line Testing

```bash
# Install dependencies
pnpm install

# Run with MCP inspector
pnpm inspector

# Run tests
pnpm test
```

## Rate Limits

Feishu API has the following rate limits:
- 100 requests per minute per app
- 1000 requests per hour per app

The client automatically handles rate limiting with exponential backoff retry.