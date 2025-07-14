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