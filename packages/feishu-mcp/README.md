# Feishu MCP Server

A Model Context Protocol (MCP) server for integrating with Feishu/Lark Wiki and Document management.

## Features

- **Wiki Management**: List, browse, and create wiki spaces and nodes
- **Document Operations**: Create, read, and update Feishu documents
- **Authentication**: Support for both app and user tokens
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Extensible Architecture**: Modular design for easy feature expansion

## Available Tools

### Wiki Tools

- `list-wiki-spaces`: Get all accessible wiki spaces
- `get-space-nodes`: Get documents in a wiki space (with recursive option)
- `create-wiki-node`: Create new nodes in wiki spaces

### Document Tools

- `create-document`: Create new Feishu documents
- `get-document-content`: Retrieve document content (rich or plain text)
- `update-document`: Update document content

## Installation

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build
```

## Configuration

Set the following environment variables:

```bash
# Required
FEISHU_APP_ID=your_app_id
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