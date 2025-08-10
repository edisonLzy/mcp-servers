# Feishu MCP Server

A Model Context Protocol (MCP) server for integrating with Feishu/Lark Wiki and Document management.

## Features

- **Wiki Management**: List, browse, and create wiki spaces and nodes
- **Document Operations**: Create, read, and update Feishu documents
- **Authentication**: Secure token management with automatic OAuth flow
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Extensible Architecture**: Modular design for easy feature expansion

## Available Tools

### Wiki Tools

- `list-wiki-spaces`: Get all accessible wiki spaces
- `get-space-nodes`: Get documents in a wiki space (with recursive option)
- `get-node-info`: Get detailed information about a specific wiki node
- `create-wiki-node`: Create new nodes in wiki spaces
- `search-wiki`: Search Wiki documents by keyword (supports filtering by space and node)

### Document Tools

- `create-document`: Create new Feishu documents
- `get-document-content`: Retrieve document content (rich or plain text)
- `update-document`: Update document content
- `get-document-blocks`: Get structured blocks from a document
- `get-document-raw-content`: Get raw document content
- `update-document-block`: Update a specific document block
- `delete-document-blocks`: Delete document blocks
- `convert-content-to-blocks`: Convert Markdown/HTML content to Feishu blocks
- `create-document-blocks`: Create new blocks in a document from converted content

## Installation

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build
```

## CLI Usage

The Feishu MCP server includes a command-line interface for easy management:

### Login

Store your Feishu app credentials securely:

```bash
# Interactive login (recommended)
npm run cli -- login

# The login command will prompt for your App ID and App Secret
# and handle OAuth authentication automatically
```

### Start Server

Start the MCP server after logging in:

```bash
# Start with stdio transport (default, for Claude Desktop)
npm run cli -- serve

# Start with HTTP transport
npm run cli -- serve --http --port 3000

# Development mode with inspector
npm run cli -- serve --dev
```

### Logout

Clear stored credentials:

```bash
# Logout from current app
npm run cli -- logout

# Logout from specific app
npm run cli -- logout --app-id your_app_id

# Clear all stored credentials
npm run cli -- logout --all
```

### Whoami

Display information about the currently logged-in user:

```bash
# Show current user information
pnpm run whoami
```

This command displays:
- User name and ID
- Email and mobile (if available)
- Employee ID and type
- Account status
- Avatar URL
- Department associations

**Note**: This command requires your Feishu app to have contact permissions. If you see a permission error (99991679), you need to add one of these permissions to your app in the Feishu Admin Console:
- `contact:contact.base:readonly` (Contact basic information)
- `contact:contact:readonly` (Contact information)

After adding permissions, you may need to re-authorize the app by logging in again.

## Configuration

### Environment Variables (Optional)

```bash
# Only required during login, not for runtime
FEISHU_APP_SECRET=your_app_secret

# Optional
FEISHU_API_BASE_URL=https://open.feishu.cn/open-apis
FEISHU_DEBUG=true
```

## Usage

### Development

```bash
# Run in development mode
pnpm dev

# Run with MCP inspector
pnpm inspector

# Run tests
pnpm test
```

### Production

```bash
# Build and start
pnpm build
pnpm start
```

### With Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "feishu": {
      "command": "node",
      "args": ["/path/to/feishu-mcp/dist/index.js"],
      "env": {
        "FEISHU_APP_ID": "your_app_id",
        "FEISHU_APP_SECRET": "your_app_secret"
      }
    }
  }
}
```

## Permissions Required

Your Feishu app needs the following permissions:

- `wiki:wiki`: Full wiki access (read, write, manage)
- `drive:drive`: Drive access for document operations

## API Reference

See [docs/api-reference.md](./docs/api-reference.md) for detailed API documentation.

## Architecture

```
src/
├── index.ts              # Main server entry point
├── client/
│   └── feishuClient.ts   # Feishu API client
├── tools/
│   ├── wiki/             # Wiki-related tools
│   └── docs/             # Document-related tools
├── types/
│   └── feishu.ts         # Type definitions
└── utils/                # Utility functions
```

## Development

This project follows the MCP server patterns established in the mcp-servers monorepo:

- TypeScript for type safety
- Zod for schema validation
- Vitest for testing
- ESLint for code quality

## Contributing

1. Follow the existing code patterns
2. Add tests for new features
3. Update documentation as needed
4. Ensure all linting passes

## License

MIT