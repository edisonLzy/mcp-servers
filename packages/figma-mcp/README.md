# Figma MCP Server

A powerful MCP (Model Context Protocol) server for Figma integration, enabling AI assistants to interact with Figma files, nodes, teams, and projects through the Figma REST API.

## ✨ Features

- **File Management**: Access and retrieve detailed information about Figma files
- **Node Operations**: Get specific nodes or multiple nodes with detailed properties
- **Team & Project Management**: List teams and their projects
- **Authentication**: Secure Personal Access Token (PAT) based authentication
- **CLI Tool**: Interactive setup for API token configuration
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm package manager
- Figma Personal Access Token (get one from [Figma Developer Portal](https://www.figma.com/developers/api#access-tokens))

### Installation

1. **Clone and install dependencies**:
```bash
cd packages/figma-mcp
pnpm install
```

2. **Set up authentication**:
```bash
pnpm cli -- login
```

3. **Test your setup**:
```bash
pnpm cli -- whoami
```

4. **Start the MCP server**:
```bash
pnpm dev
```

### MCP Client Configuration

#### Cursor

Add to your Cursor MCP configuration:

```json
{
  "mcpServers": {
    "figma": {
      "command": "tsx",
      "args": ["/path/to/figma-mcp/src/index.ts"],
      "env": {
        "FIGMA_PAT": "your_figma_personal_access_token"
      }
    }
  }
}
```

#### Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "figma": {
      "command": "tsx",
      "args": ["/path/to/figma-mcp/src/index.ts"],
      "env": {
        "FIGMA_PAT": "your_figma_personal_access_token"
      }
    }
  }
}
```

## 🛠️ Available Tools

### File Operations

#### `get-file`
Get detailed information about a Figma file including its document structure.

**Parameters:**
- `file_key` (string): The unique identifier for the Figma file (found in the URL)

**Example:**
```json
{
  "file_key": "ABC123XYZ456"
}
```

#### `list-files`
List Figma files accessible to the authenticated user, with optional filtering.

**Parameters:**
- `team_id` (string, optional): Filter files by team ID
- `project_id` (string, optional): Filter files by project ID

**Example:**
```json
{
  "team_id": "123456789"
}
```

### Node Operations

#### `get-node`
Get detailed information about a specific node in a Figma file.

**Parameters:**
- `file_key` (string): The unique identifier for the Figma file
- `node_id` (string): The ID of the node to retrieve

**Example:**
```json
{
  "file_key": "ABC123XYZ456",
  "node_id": "1:2"
}
```

#### `get-nodes`
Get detailed information about multiple nodes in a Figma file.

**Parameters:**
- `file_key` (string): The unique identifier for the Figma file
- `node_ids` (array): Array of node IDs to retrieve

**Example:**
```json
{
  "file_key": "ABC123XYZ456",
  "node_ids": ["1:2", "1:3", "1:4"]
}
```

### Team & Project Operations

#### `list-teams`
Get list of all teams accessible to the authenticated user.

**Parameters:** None

#### `list-projects`
Get list of all projects for a specific team.

**Parameters:**
- `team_id` (string): The ID of the team to list projects for

**Example:**
```json
{
  "team_id": "123456789"
}
```

## 📋 CLI Commands

### Authentication
```bash
# Set up Figma API authentication
pnpm cli -- login

# Show current user information
pnpm cli -- whoami

# Clear stored credentials
pnpm cli -- logout
```

### Installation
```bash
# Install to MCP client
pnpm cli -- install --client cursor
pnpm cli -- install --client claude-desktop --global
```

## 🔧 Development

### Project Structure
```
packages/figma-mcp/
├── src/
│   ├── index.ts                 # MCP server entry point
│   ├── figmaClient.ts           # Figma API client
│   ├── cli.ts                   # CLI tool
│   ├── auth/
│   │   ├── configStore.ts       # Configuration management
│   │   └── types.ts             # Authentication types
│   ├── tools/
│   │   ├── files/               # File-related tools
│   │   ├── nodes/               # Node-related tools
│   │   └── teams/               # Team/Project tools
│   └── types/
│       └── figma.ts             # Figma API types
├── tests/
│   └── index.test.ts            # Test suite
└── README.md                    # This file
```

### Development Commands
```bash
# Development mode
pnpm dev

# Run tests
pnpm test

# Run MCP inspector for debugging
pnpm inspector

# Run CLI commands
pnpm cli -- [command]

# Type checking
npx tsc --noEmit
```

### Testing
```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test --coverage

# Run tests in watch mode
pnpm test --watch
```

## 🔐 Authentication

The Figma MCP server uses Personal Access Tokens (PAT) for authentication. To get your token:

1. Go to [Figma Developer Portal](https://www.figma.com/developers/api#access-tokens)
2. Click "Generate new token"
3. Copy your personal access token (it should start with `figd_`)
4. Use the CLI to save it: `pnpm cli -- login`

The token is stored securely in `~/.figma-mcp-config.json`.

## 🛡️ Security

- Personal Access Tokens are stored locally and never transmitted to third parties
- All API requests are made over HTTPS
- Token validation is performed during setup
- Tokens can be easily revoked in the Figma developer portal

## 📊 Error Handling

The server provides comprehensive error handling with:

- Authentication error messages
- Rate limiting awareness
- Network timeout handling
- Invalid token detection
- Detailed error responses for debugging

## 🔄 API Rate Limits

The Figma API has rate limits that vary by account type. The server handles:
- Rate limit detection
- Automatic retry with exponential backoff
- Graceful error messages when limits are exceeded

## 🚀 Use Cases

### Design System Analysis
```json
{
  "tool": "get-file",
  "params": {
    "file_key": "design-system-file-key"
  }
}
```

### Component Documentation
```json
{
  "tool": "get-node",
  "params": {
    "file_key": "component-library-key",
    "node_id": "component-id"
  }
}
```

### Team File Management
```json
{
  "tool": "list-files",
  "params": {
    "team_id": "design-team-id"
  }
}
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow the existing code style**
4. **Add tests for new functionality**
5. **Ensure all tests pass**: `pnpm test`
6. **Commit your changes**: `git commit -m 'feat: add amazing feature'`
7. **Push to the branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: [Figma API Docs](https://www.figma.com/developers/api)
- **Token Help**: [Figma Access Tokens](https://www.figma.com/developers/api#access-tokens)

## 🎉 Acknowledgments

- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- Powered by the [Figma REST API](https://www.figma.com/developers/api)
- Inspired by the existing MCP server ecosystem

---

**⭐ If you find this project helpful, please consider giving it a star!**