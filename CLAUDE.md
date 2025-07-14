# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for MCP (Model Context Protocol) Servers using pnpm workspaces. The repository contains individual MCP server implementations and a core CLI tool for managing them.

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

### MCP Server Development
- `pnpm inspector` - Run MCP inspector for testing servers (available in individual MCP server packages)
- Use `scripts/mcp_logger.ts` for debugging MCP communication (logs I/O to `mcp_io.log`)

## Architecture

### Monorepo Structure
- `packages/` - Contains all MCP server implementations and core utilities
- `packages/core/` - CLI tool and shared utilities for MCP server management
- `packages/confluence-mcp/` - Example MCP server for Confluence integration
- `scripts/` - Utility scripts including MCP I/O logger

### MCP Server Pattern
All MCP servers follow a standardized structure:
```
packages/{server-name}/
├── src/
│   ├── index.ts                 # Main entry with McpServer setup
│   ├── tools/                   # Tool implementations
│   │   └── {toolName}.ts        # Individual tool files
│   └── {clientName}.ts          # External service clients (optional)
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

### MCP Server Implementation Pattern
1. Create `McpServer` instance with name/version and capabilities
2. Register tools using `server.tools()` method with Zod schemas
3. Connect using `StdioServerTransport`
4. Tool functions return `{ content: [{ type: 'text', text: string }], isError?: boolean }`

## Key Dependencies
- `@modelcontextprotocol/sdk` - Core MCP functionality
- `zod` - Schema validation (managed via pnpm catalog)
- `vitest` - Testing framework
- `tsx` - TypeScript execution

## Cursor Rules Integration
The repository includes MCP server generation rules in `.cursor/rules/mcp-server-generator.mdc` that provide templates for quickly scaffolding new MCP servers following the established patterns.

## Testing
- All packages use Vitest for testing
- Root-level `vitest.workspace.ts` configures workspace testing
- Individual packages have their own `vitest.config.ts`
- Run tests with coverage using `pnpm coverage`

## CLI Tool
The `@mcp-servers/core` package provides a CLI tool (`clirk`) for managing MCP servers with commands like `install` for server management.