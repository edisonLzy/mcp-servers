# Prompts MCP Server

Prompts MCP Server for dynamic prompt generation

## Installation

Install the MCP server to your MCP client:

```bash
# Install globally
prompts-mcp install -c cursor -g

# Install for current project
prompts-mcp install -c cursor
```

## Usage

Use the MCP inspector to test this server:

```bash
pnpm inspector
```

## CLI Commands

- `install`: Install MCP server to your MCP client
  - `-c, --client <client>`: Target MCP client (cursor, gemini-cli)
  - `-g, --global`: Install globally (optional)

## Prompts

- `example-prompt`: 示例提示词生成器 