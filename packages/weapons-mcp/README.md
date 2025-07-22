# Weapons MCP Server

A Model Context Protocol (MCP) server for integrating with Weapons API documentation platform.

## Features

- **API Documentation Access**: Get API endpoints and documentation from Weapons platform
- **Category-based Retrieval**: Fetch all endpoints in a specific category
- **Structured Data**: Clean, structured API information with request/response schemas
- **Environment Configuration**: Secure credential management

## Available Tools

### `get-endpoints`
Get all API endpoints from a Weapons category.

**Parameters:**
- `catid` (required): The category ID extracted from the Weapons URL

**Example:**
```
input URL: https://weapons.ke.com/project/21048/interface/api/cat_316848
catid: 316848
```

## Installation

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build
```

## Configuration

Set the following environment variables in your `.env` file:

```bash
_yapi_token=your_yapi_token
_yapi_uid=your_yapi_uid
```

You can get these values from your browser cookies when logged into the Weapons platform.

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

### With Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "weapons": {
      "command": "node",
      "args": ["/path/to/weapons-mcp/src/index.js"],
      "env": {
        "_yapi_token": "your_yapi_token",
        "_yapi_uid": "your_yapi_uid"
      }
    }
  }
}
```

## API Reference

The server connects to the Weapons platform API to retrieve:

- Interface lists by category
- Detailed interface information including request/response schemas
- API metadata and documentation

## Architecture

```
src/
├── index.ts              # Main server entry point
├── weaponsClient.ts      # Weapons API client
├── tools/
│   └── getEndpoints.ts   # Get endpoints tool
├── types/
│   └── weapons.ts        # Type definitions
└── constant.ts           # Constants
```

## Development

This project follows the MCP server patterns established in the mcp-servers monorepo:

- TypeScript for type safety
- Zod for schema validation
- Vitest for testing
- ESLint for code quality

## License

MIT 