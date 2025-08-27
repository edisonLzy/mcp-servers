# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a unified MCP (Model Context Protocol) Servers CLI that provides high-quality MCP servers for integrating with external services like Feishu/Lark, Figma, and development prompts. All MCP servers are organized as modules within a single package architecture.

## Development Commands

### Root Level Commands
- `pnpm lint` - Run ESLint across all code
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm test` - Run all tests using Vitest
- `pnpm coverage` - Run tests with coverage reports
- `pnpm dev:cli` - Run CLI tool in development mode

### CLI Usage
- `mcp-servers list` - List all available MCP servers
- `mcp-servers <server-name>` - Run specified MCP server
- `mcp-servers auth <server-name>` - Authenticate specified server
- `mcp-servers inspector <server-name>` - Run server with MCP inspector

### MCP Server Development
- Use `scripts/mcp_logger.ts` for debugging MCP communication (logs I/O to `mcp_io.log`)

## Architecture

### Single Package Structure
- `src/` - All source code
- `src/cli.ts` - Main CLI entry point
- `src/commands/` - CLI command implementations
- `src/mcp-servers/` - All MCP server modules
- `src/mcp-servers/{server-name}/` - Individual MCP server implementations
- `src/types.ts` - Shared type definitions
- `tests/` - Test files
- `scripts/` - Utility scripts including MCP I/O logger

### MCP Server Module Pattern
All MCP server modules follow a standardized structure:
```
src/mcp-servers/{server-name}/
├── index.ts                 # Module entry exporting MCPServerOptions
├── tools/                   # Tool implementations
│   └── {toolName}.ts        # Individual tool files
├── {clientName}.ts          # External service clients
├── auth/                    # Authentication modules (optional)
├── types/                   # Type definitions (optional)
└── commands/                # CLI commands (optional)
```

### Code Conventions
- Use TypeScript throughout
- Server module names: kebab-case (`feishu-mcp`)
- Tool names: kebab-case (`get-page-content`)
- File names: camelCase (`getPageContent.ts`)
- Use Zod for schema validation
- Follow ESLint configuration (single quotes, 2-space indent, stylistic rules)
- Entry points should use `#!/usr/bin/env -S pnpx tsx` shebang for CLI tools

### MCP Server Module Interface
Each MCP server module exports a default `MCPServerOptions` object:
```typescript
interface MCPServerOptions {
  name: string;
  description?: string;
  run: () => Promise<void>;
  auth?: () => Promise<void>;
  requiresAuth?: boolean;
}
```

### MCP Server Implementation Pattern
1. Create `McpServer` instance with name/version and capabilities
2. Initialize external service clients (FeishuClient, FigmaClient, etc.)
3. Register tools using `server.tools()` method with Zod schemas
4. Connect using `StdioServerTransport`
5. Tool functions return `{ content: [{ type: 'text', text: string }], isError?: boolean }`

## Key Dependencies
- `@modelcontextprotocol/sdk` - Core MCP functionality
- `@modelcontextprotocol/inspector` - MCP debugging tool
- `zod` - Schema validation
- `vitest` - Testing framework
- `tsx` - TypeScript execution
- `commander` - CLI framework
- `axios` - HTTP client for external API integrations

## Server-Specific Patterns

### Feishu MCP Server
- Includes OAuth authentication with token management
- Has comprehensive CLI with login/logout/install commands
- Supports both wiki and document management
- Uses `TokenStore` for secure credential management
- Module name: `feishu-mcp`

### Figma MCP Server
- Simple authentication with config store
- File, node, and team management tools
- Module name: `figma-mcp`
- Includes interactive CLI for setup

### Prompts MCP Server
- Git and GitHub workflow prompts
- No authentication required
- Module name: `prompts-mcp`

## Testing
- Uses Vitest for testing with coverage support  
- Test files: `src/**/*.test.ts` and `tests/**/*.test.ts`
- Run tests: `pnpm test` or `vitest run`
- Coverage reports: `pnpm coverage` or `vitest run --coverage`

## Code Quality and Git Workflow
- Follows Conventional Commits specification (see COMMIT_CONVENTION.md)
- Uses Husky for Git hooks with lint-staged pre-commit checks
- ESLint with comprehensive rules: stylistic formatting, unused imports cleanup, import ordering
- TypeScript strict mode with declaration-only compilation

## CLI Tool
The main CLI tool (`mcp-servers`) provides unified access to all MCP servers with commands for running, authentication, and debugging.

## Build and Development
- Use `tsx` for direct TypeScript execution during development
- TypeScript config: ESNext target, ES modules, strict mode, declaration only  
- No build step required for development - run directly with `tsx`
- Single package architecture (migrated from monorepo) simplifies dependency management
- Package manager: pnpm with global linking (`pnpm link --global` on postinstall)

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.