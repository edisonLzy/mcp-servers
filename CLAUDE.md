# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for MCP (Model Context Protocol) Servers using pnpm workspaces. The repository contains individual MCP server implementations and a core CLI tool for managing them. The project provides high-quality MCP servers for integrating with external services like Confluence, Feishu/Lark, and Weapons API documentation platform.

## Development Commands

### Root Level Commands
- `pnpm lint` - Run ESLint across all packages
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm test` - Run all tests using Vitest workspace
- `pnpm coverage` - Run tests with coverage reports
- `pnpm cli` - Run the CLI tool (equivalent to `pnpm --filter @mcp-servers/core run start`)

### Package-Specific Commands
- `pnpm --filter <package-name> <command>` - Run commands in specific packages
- `pnpm --filter confluence-mcp test` - Run tests for confluence MCP server
- `pnpm --filter @mcp-servers/core test` - Run tests for core package
- `pnpm --filter feishu-mcp dev` - Development mode with hot reload for feishu-mcp
- `pnpm --filter weapons-mcp dev` - Development mode with hot reload for weapons-mcp

### MCP Server Development
- `pnpm inspector` - Run MCP inspector for testing servers (available in individual MCP server packages)
- Use `scripts/mcp_logger.ts` for debugging MCP communication (logs I/O to `mcp_io.log`)

## Architecture

### Monorepo Structure
- `packages/` - Contains all MCP server implementations and core utilities
- `packages/core/` - CLI tool and shared utilities for MCP server management (@mcp-servers/core)
- `packages/confluence-mcp/` - Example MCP server for Confluence integration (@mcp-servers/confluence)
- `packages/feishu-mcp/` - Feishu/Lark integration with OAuth and CLI (feishu-mcp)
- `packages/weapons-mcp/` - Weapons API documentation platform integration (@mcp-servers/weapons)
- `scripts/` - Utility scripts including MCP I/O logger

### MCP Server Pattern
All MCP servers follow a standardized structure:
```
packages/{server-name}/
├── src/
│   ├── index.ts                 # Main entry with McpServer setup
│   ├── tools/                   # Tool implementations
│   │   └── {toolName}.ts        # Individual tool files
│   ├── {clientName}.ts          # External service clients
│   ├── auth/                    # Authentication modules (optional)
│   ├── types/                   # Type definitions (optional)
│   └── cli.ts                   # CLI entry point (optional)
├── tests/
│   └── index.test.ts            # Tests
├── package.json                 # Package config with inspector script
├── tsconfig.json               # Extends root tsconfig
└── vitest.config.ts            # Test configuration
```

### Code Conventions
- Use TypeScript throughout
- Package names: kebab-case (`confluence-mcp`)
- Tool names: kebab-case (`get-page-content`)
- File names: camelCase (`getPageContent.ts`)
- Use Zod for schema validation
- Follow ESLint configuration (single quotes, 2-space indent, stylistic rules)
- Entry points should use `#!/usr/bin/env node` shebang for CLI tools

### MCP Server Implementation Pattern
1. Create `McpServer` instance with name/version and capabilities
2. Initialize external service clients (FeishuClient, WeaponsClient, etc.)
3. Register tools using `server.tools()` method with Zod schemas
4. Connect using `StdioServerTransport`
5. Tool functions return `{ content: [{ type: 'text', text: string }], isError?: boolean }`

## Key Dependencies
- `@modelcontextprotocol/sdk` - Core MCP functionality (managed via pnpm catalog)
- `@modelcontextprotocol/inspector` - MCP debugging tool (managed via pnpm catalog)
- `zod` - Schema validation (managed via pnpm catalog)
- `vitest` - Testing framework
- `tsx` - TypeScript execution
- `commander` - CLI framework (for servers with CLI tools)
- `axios` - HTTP client for external API integrations

## Server-Specific Patterns

### Feishu MCP Server
- Includes OAuth authentication with token management
- Has comprehensive CLI with login/logout/install commands
- Supports both wiki and document management
- Uses `TokenStore` for secure credential management
- Binary name: `feishu-mcp`

### Weapons MCP Server
- Simple authentication with config store
- API documentation focused tools
- Binary name: `weapons-mcp`
- Includes interactive CLI for setup

### Confluence MCP Server
- Basic Confluence page interaction
- Uses HTML parsing with unified/rehype/remark
- No separate CLI, uses inspector for testing

## Testing
- All packages use Vitest for testing
- Root-level `vitest.workspace.ts` configures workspace testing
- Individual packages have their own `vitest.config.ts`
- Run tests with coverage using `pnpm coverage`
- Test files should be in `tests/` directory with `.test.ts` extension

## CLI Tool
The `@mcp-servers/core` package provides a CLI tool (`clirk`) for managing MCP servers with commands like `install` for server management.

## Build and Development
- Use `tsx` for direct TypeScript execution during development
- TypeScript config: ESNext target, ES modules, strict mode, declaration only
- No build step required for development - run directly with `tsx`
- Each package can have its own development scripts (`dev`, `inspector`, etc.)