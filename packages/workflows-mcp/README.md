# Workflows MCP Server

MCP Server for workflow management and automation

## Usage

Use the MCP inspector to test this server:

```bash
pnpm inspector
```

## Tools

- `create-workflow`: 创建新的工作流定义文件
- `list-workflows`: 列出所有可用的工作流

## Available Workflows

### 创建 MCP Server (create-mcp-server)

这个工作流帮助你快速创建标准的 MCP (Model Context Protocol) Server 项目。它基于 `.cursor/rules/mcp-server-generator.mdc` 中定义的规则，自动生成完整的项目结构。

**功能特性：**
- 自动创建标准的 MCP Server 项目结构
- 支持认证系统和服务客户端配置
- 生成 CLI 工具和安装命令
- 包含完整的 TypeScript 配置和测试框架
- 遵循 monorepo 架构模式

**使用示例：**
```bash
# 列出所有工作流
pnpm cli list-workflows

# 查看 MCP Server 创建工作流
pnpm cli list-workflows --search "mcp-server"
```

**工作流输入参数：**
- `server_name`: 服务器名称 (kebab-case)
- `server_display_name`: 服务器显示名称
- `server_description`: 服务器功能描述
- `service_name`: 集成的服务名称
- `needs_auth`: 是否需要认证系统
- `needs_client`: 是否需要服务客户端类
- `tool_names`: 要创建的工具名称列表

## Installation

Install the MCP server:

```bash
pnpm cli install
```

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Test with inspector
pnpm inspector
```