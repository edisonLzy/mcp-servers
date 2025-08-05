# MCP Servers 仓库

一个包含多个 Model Context Protocol (MCP) 服务器的 monorepo，为各种第三方平台提供无缝集成能力。

## 🎯 项目概览

本项目提供了一系列高质量的 MCP 服务器，让 AI 助手能够与各种外部服务和平台进行交互。每个服务器都经过精心设计，提供类型安全、错误处理和用户友好的体验。

### 🚀 支持的服务器

| 服务器 | 描述 | 主要功能 |
|--------|------|----------|
| **[Confluence MCP](./packages/confluence-mcp/)** | Confluence 页面交互工具 | 页面内容获取和管理 |
| **[Feishu MCP](./packages/feishu-mcp/)** | 飞书/Lark 集成服务器 | Wiki 管理、文档操作、OAuth 认证 |
| **[Weapons MCP](./packages/weapons-mcp/)** | Weapons API 文档平台集成 | API 文档获取、端点详情查询 |
| **[Core](./packages/core/)** | 核心工具包 | CLI 工具、共享组件和类型定义 |

## ✨ 特性

- 🔧 **TypeScript 优先**: 完整的类型支持和 IntelliSense
- 🏗️ **模块化架构**: 每个服务器都是独立的包，可单独安装和使用
- 🔐 **安全认证**: 内置安全的凭据管理和 OAuth 流程
- 🛠️ **开发友好**: 热重载、测试套件和代码检查
- 📱 **多客户端支持**: 兼容 Cursor、Gemini CLI 等 MCP 客户端
- 🎯 **错误处理**: 全面的错误处理和用户友好的错误消息

## 🚀 快速开始

### 系统要求

- Node.js 18+
- pnpm 包管理器

### 安装依赖

```bash
# 克隆仓库
git clone <repository-url>
cd mcp-servers

# 安装依赖
pnpm install

# 构建所有包
pnpm build
```

### 选择并配置服务器

根据你的需求选择相应的服务器：

#### Feishu MCP 服务器
```bash
cd packages/feishu-mcp

# 配置认证
pnpm run cli -- login

# 安装到 MCP 客户端
pnpm run cli -- install --client cursor
```

#### Weapons MCP 服务器
```bash
cd packages/weapons-mcp

# 交互式配置和安装
weapons-mcp install --client cursor --global
```

#### Confluence MCP 服务器
```bash
cd packages/confluence-mcp

# 构建并启动
pnpm build
pnpm start
```

## 📦 各服务器详细介绍

### 🔗 Confluence MCP

简单实用的 Confluence 页面交互工具。

**主要功能:**
- 获取 Confluence 页面内容
- 页面管理操作

**[查看详细文档 →](./packages/confluence-mcp/README.md)**

### 📱 Feishu MCP

功能完整的飞书/Lark 集成服务器，支持 Wiki 和文档管理。

**主要功能:**
- **Wiki 管理**: 列表、浏览和创建 wiki 空间和节点
- **文档操作**: 创建、读取和更新飞书文档
- **认证管理**: 安全的令牌管理和自动 OAuth 流程
- **CLI 工具**: 完整的命令行界面

**可用工具:**
- `list-wiki-spaces`: 获取所有可访问的 wiki 空间
- `get-space-nodes`: 获取 wiki 空间中的文档
- `create-wiki-node`: 在 wiki 空间中创建新节点
- `create-document`: 创建新的飞书文档
- `get-document-content`: 获取文档内容
- `update-document`: 更新文档内容

**[查看详细文档 →](./packages/feishu-mcp/README.md)**

### ⚔️ Weapons MCP

专为 Weapons API 文档平台设计的集成服务器。

**主要功能:**
- **API 文档访问**: 从 Weapons 平台获取 API 端点和文档
- **分类检索**: 获取特定分类下的所有端点
- **详细信息**: 获取单个 API 端点的详细信息
- **结构化数据**: 清洁、结构化的 API 信息和请求/响应模式
- **配置管理**: 安全的凭据管理和环境配置

**可用工具:**
- `get-endpoints`: 获取分类下的所有 API 端点
- `get-endpoint-detail`: 获取特定端点的详细信息

**[查看详细文档 →](./packages/weapons-mcp/README.md)**

### 🔧 Core

为其他 MCP 服务器提供核心功能和工具的基础包。

**提供功能:**
- CLI 框架和工具
- 共享类型定义
- 通用工具函数
- 安装和配置助手

## 🛠️ 开发指南

### 项目结构

```
mcp-servers/
├── packages/
│   ├── confluence-mcp/     # Confluence 集成
│   ├── feishu-mcp/         # 飞书集成
│   ├── weapons-mcp/        # Weapons 集成
│   └── core/               # 核心工具包
├── scripts/                # 构建和工具脚本
├── package.json            # 根级依赖和脚本
├── pnpm-workspace.yaml     # pnpm 工作空间配置
└── tsconfig.json           # TypeScript 配置
```

### 开发命令

```bash
# 安装所有依赖
pnpm install

# 构建所有包
pnpm build

# 运行所有测试
pnpm test

# 运行代码检查
pnpm lint

# 修复代码格式
pnpm lint:fix

# 生成测试覆盖率报告
pnpm coverage
```

### 开发单个包

```bash
# 进入特定包目录
cd packages/feishu-mcp

# 开发模式（热重载）
pnpm dev

# 使用 MCP inspector 调试
pnpm inspector

# 运行包测试
pnpm test

# 构建包
pnpm build
```

### 创建新的 MCP 服务器

1. 在 `packages/` 目录下创建新目录
2. 参考现有服务器的结构和模式
3. 确保包含必要的文件：
   - `package.json`
   - `tsconfig.json`
   - `README.md`
   - `src/index.ts`
   - `tests/`

## 🏗️ 技术栈

- **语言**: TypeScript
- **包管理**: pnpm (workspace)
- **构建工具**: TSX
- **测试框架**: Vitest
- **代码检查**: ESLint + TypeScript ESLint
- **格式化**: Stylistic ESLint Plugin
- **Git 钩子**: Husky + lint-staged
- **提交规范**: Commitlint

## 🔧 支持的 MCP 客户端

本项目的服务器兼容以下 MCP 客户端：

- **Cursor**: 项目级和全局安装
- **Gemini CLI**: 项目级和全局安装
- **Claude Desktop**: 通过手动配置支持

### 配置示例

#### Cursor

```json
{
  "mcpServers": {
    "feishu": {
      "command": "tsx",
      "args": ["/path/to/feishu-mcp/src/index.ts"],
      "type": "stdio"
    }
  }
}
```

#### Claude Desktop

```json
{
  "mcpServers": {
    "weapons": {
      "command": "node",
      "args": ["/path/to/weapons-mcp/dist/index.js"],
      "env": {
        "WEAPONS_TOKEN": "your_token",
        "WEAPONS_UID": "your_uid"
      }
    }
  }
}
```

## 🤝 贡献指南

我们欢迎任何形式的贡献！请遵循以下步骤：

1. **Fork 项目**
2. **创建功能分支**: `git checkout -b feature/amazing-feature`
3. **遵循代码规范**: 确保通过 ESLint 检查
4. **添加测试**: 为新功能添加相应的测试用例
5. **提交更改**: 使用规范的提交信息
6. **推送分支**: `git push origin feature/amazing-feature`
7. **创建 Pull Request**

### 提交信息规范

本项目使用 [Conventional Commits](https://conventionalcommits.org/) 规范：

```bash
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加或修改测试
chore: 构建过程或辅助工具的变动
```

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 配置
- 保持测试覆盖率
- 添加必要的文档和注释
- 使用有意义的变量和函数名

## 📄 许可证

本项目使用 [MIT](LICENSE) 许可证。

## 🆘 获取帮助

- **问题报告**: [GitHub Issues](https://github.com/your-repo/issues)
- **功能请求**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **文档**: 查看各个包的 README 文件

## 🔄 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本更新历史。

---

**🎉 感谢使用 MCP Servers！** 

如果这个项目对你有帮助，请考虑给我们一个 ⭐ Star！

