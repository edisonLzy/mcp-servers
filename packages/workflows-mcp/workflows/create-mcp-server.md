# MCP Server 快速生成规则

这个规则用于快速创建标准的 MCP (Model Context Protocol) Server 项目结构。

## 使用方法

当用户请求创建新的 MCP server 时，按照以下目录结构和文件模板进行创建：

## 项目结构

```
packages/{server-name}/
├── src/
│   ├── index.ts                 # 主入口文件
│   ├── cli.ts                   # CLI 入口文件（可选）
│   ├── tools/                   # 工具函数目录
│   │   ├── exampleTool.ts       # 示例工具文件
│   │   └── anotherTool.ts       # 其他工具文件
│   ├── auth/                    # 认证相关（可选）
│   │   ├── configStore.ts       # 配置存储
│   │   └── types.ts             # 认证类型定义
│   ├── commands/                # CLI 命令（可选）
│   │   └── install.ts           # 安装命令
│   ├── types/                   # 类型定义目录
│   │   └── {service}.ts         # 服务相关类型
│   └── {service}Client.ts       # 服务客户端文件
├── tests/                       # 测试目录
│   └── index.test.ts            # 测试文件
├── package.json                 # 包配置文件
├── tsconfig.json               # TypeScript 配置
├── vitest.config.ts            # 测试配置
└── README.md                   # 文档说明
```

## 文件模板

### package.json 模板
```json
{
  "name": "@mcp-servers/{server-name}",
  "version": "0.1.0",
  "description": "{Server Description}",
  "type": "module",
  "main": "src/index.ts",
  "bin": {
    "{server-name}-mcp": "src/cli.ts"
  },
  "files": [
    "src"
  ],
  "scripts": {
    "test": "vitest",
    "inspector": "pnpx @modelcontextprotocol/inspector tsx src/index.ts",
    "dev": "tsx src/index.ts",
    "cli": "tsx src/cli.ts",
    "postinstall": "pnpm link --global"
  },
  "keywords": [
    "mcp",
    "{service-name}",
    "api",
    "typescript"
  ],
  "author": "MCP Servers Team",
  "license": "MIT",
  "dependencies": {
    "@modelcontextprotocol/sdk": "catalog:",
    "commander": "^12.0.0",
    "inquirer": "^10.0.0",
    "zod": "catalog:"
  },
  "devDependencies": {
    "@types/inquirer": "^9.0.0",
    "@types/node": "^20.0.0",
    "tsx": "^4.19.4",
    "typescript": "^5.8.2",
    "vitest": "^3.0.9"
  },
  "engines": {
    "node": ">=18"
  }
}
```

### src/index.ts 模板
```typescript
#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { {ServiceName}Client } from './{serviceName}Client.js';
import { registerExampleTool } from './tools/exampleTool.js';
import { registerAnotherTool } from './tools/anotherTool.js';

async function main() {
  // Create an MCP server
  const server = new McpServer({
    name: '{server-name}',
    version: '0.1.0'
  }, {
    capabilities: {
      tools: {}
    }
  });

  // Initialize service client
  const serviceClient = new {ServiceName}Client();

  // Register all tools
  registerExampleTool(server, serviceClient);
  registerAnotherTool(server, serviceClient);

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('{Server Name} MCP Server started successfully! Use available tools to interact with {Service Name} API.');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
```

### src/tools/exampleTool.ts 模板
```typescript
import { z } from 'zod';
import type { {ServiceName}Client } from '../{serviceName}Client.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const exampleToolSchema = z.object({
  param1: z.string().describe('参数1的描述'),
  param2: z.string().optional().describe('可选参数2的描述')
});

export function registerExampleTool(server: McpServer, client: {ServiceName}Client) {
  server.tool(
    'example-tool',
    '示例工具的描述',
    exampleToolSchema.shape,
    async ({ param1, param2 }) => {
      try {
        // 调用客户端方法
        const result = await client.exampleMethod(param1, param2);

        return {
          content: [
            {
              type: 'text',
              mimeType: 'application/json',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: {
                  code: error.code || 'UNKNOWN_ERROR',
                  message: error.message || `Failed to execute example tool`
                }
              }, null, 2)
            },
          ],
          isError: true
        };
      }
    },
  );
}
```

### src/cli.ts 模板（必需）
```typescript
#!/usr/bin/env -S pnpm tsx

import { Command } from 'commander';
import { installCommand } from './commands/install.js';

const program = new Command();

program
  .name('{server-name}-mcp')
  .description('{Server Name} MCP Server - Command Line Interface')
  .version('0.1.0');

// Install command
program
  .command('install')
  .description('配置 {Service Name} 访问凭据并安装 MCP Server')
  .option('-c, --client <client>', '目标 MCP 客户端 (cursor, gemini-cli)', 'cursor')
  .option('-g, --global', '全局安装 (默认为项目级别)', false)
  .action(installCommand);

// Parse command line arguments
program.parse();
```

### src/{serviceName}Client.ts 模板
```typescript
import { ConfigStore } from './auth/configStore.js';
import type {
  {ServiceName}Config,
  {ServiceName}Error,
  // 其他类型定义
} from './types/{serviceName}.js';

export class {ServiceName}Client {
  private token: string = '';
  private baseURL: string = '';
  private configStore: ConfigStore;

  constructor(config?: Partial<{ServiceName}Config>) {
    this.configStore = ConfigStore.create();
    this.baseURL = config?.baseURL || '';
  }

  private async initializeFromStoredConfig(): Promise<void> {
    try {
      const storedConfig = await this.configStore.getConfig();
      if (storedConfig) {
        this.token = this.token || storedConfig.token;
        this.baseURL = this.baseURL || storedConfig.baseURL;
      }
    } catch (error) {
      console.warn('Failed to load stored config:', error);
    }
  }

  async ensureInitialized(): Promise<void> {
    if (!this.token || !this.baseURL) {
      await this.initializeFromStoredConfig();
    }
    
    if (!this.token) {
      throw new Error(
        'Missing required credentials. Please run "{server-name}-mcp install" to configure your credentials.'
      );
    }
    
    if (!this.baseURL) {
      throw new Error(
        'Missing required base URL. Please run "{server-name}-mcp install" to configure your base URL.'
      );
    }
  }

  private handleError(error: any): {ServiceName}Error {
    if (error.response?.data) {
      const data = error.response.data;
      return {
        code: data.errno || 'UNKNOWN_ERROR',
        message: data.errmsg || 'Unknown error occurred',
        details: data
      };
    }

    return {
      code: 'NETWORK_ERROR',
      message: error.message || 'Network error occurred',
      details: { originalError: error }
    };
  }

  /**
   * 示例方法
   */
  async exampleMethod(param1: string, param2?: string): Promise<any> {
    await this.ensureInitialized();
    
    try {
      // 实现具体的 API 调用逻辑
      const response = await fetch(`${this.baseURL}/api/example`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
```

### src/types/{serviceName}.ts 模板
```typescript
// {Service Name} API 类型定义

// 通用接口响应结构
export interface ApiResponse<T> {
  errcode: number;
  errmsg: string;
  data: T;
}

// 客户端配置
export interface {ServiceName}Config {
  token: string;
  baseURL: string;
}

// 错误类型
export interface {ServiceName}Error {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// 其他业务相关类型定义...
```

### src/auth/types.ts 模板（认证时必需）
```typescript
export interface {ServiceName}ConfigInfo {
  token: string;
  baseURL: string;
  createdAt: number;
}

export type StoredConfigData = {ServiceName}ConfigInfo;
```

### src/auth/configStore.ts 模板（认证时必需）
```typescript
import fs from 'fs';
import path from 'path';
import os from 'os';
import type { {ServiceName}ConfigInfo, StoredConfigData } from './types.js';

const CONFIG_STORAGE_FILE = '{serviceName}-config.json';
const STORAGE_DIR = path.join(os.homedir(), '.{server-name}');

export class ConfigStore {
  private storageDir: string;
  private storageFile: string;
  private cache: StoredConfigData | null = null;
  private initialized = false;

  constructor() {
    this.storageDir = STORAGE_DIR;
    this.storageFile = path.join(this.storageDir, CONFIG_STORAGE_FILE);
  }

  static create(): ConfigStore {
    return new ConfigStore();
  }

  private ensureStorageDir(): void {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true, mode: 0o700 });
    }
  }

  async storeConfig(configInfo: {ServiceName}ConfigInfo): Promise<void> {
    this.ensureStorageDir();
    this.cache = configInfo;
    
    const jsonData = JSON.stringify(this.cache, null, 2);
    const tempFile = this.storageFile + '.tmp';
    fs.writeFileSync(tempFile, jsonData, { mode: 0o600 });
    fs.renameSync(tempFile, this.storageFile);
  }

  async getConfig(): Promise<{ServiceName}ConfigInfo | null> {
    if (!this.initialized) {
      try {
        if (fs.existsSync(this.storageFile)) {
          const data = fs.readFileSync(this.storageFile, 'utf8');
          this.cache = JSON.parse(data);
        }
        this.initialized = true;
      } catch (error) {
        console.warn('Failed to load config:', error);
        this.cache = null;
        this.initialized = true;
      }
    }
    return this.cache;
  }

  async hasValidConfig(): Promise<boolean> {
    const config = await this.getConfig();
    return !!(config && config.token && config.baseURL);
  }
}
```

### tsconfig.json 模板
```json
{
  "extends": "../../tsconfig.json",
  "include": ["src/**/*", "tests/**/*"]
}
```

### vitest.config.ts 模板
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
});
```

### README.md 模板
```markdown
# {Server Name} MCP Server

{Server Description}

## Usage

Use the MCP inspector to test this server:

\`\`\`bash
pnpm inspector
\`\`\`

## Tools

- `example-tool`: Example tool description
```

## 规则要点

1. **使用 pnpm 包管理器**: 所有命令使用 `pnpm` 而不是 `npm` 或 `yarn`
2. **Monorepo 结构**: 所有 MCP server 放在 `packages/` 目录下
3. **TypeScript 支持**: 所有文件使用 TypeScript
4. **标准化命名**: 
   - 包名使用 scoped name: `@mcp-servers/example-mcp`
   - 工具名使用 kebab-case: `example-tool`
   - 文件名使用 camelCase: `exampleTool.ts`
   - 客户端类名使用 PascalCase: `ExampleClient`
   - 类型名使用 PascalCase: `ExampleConfig`
5. **依赖管理**: 
   - 使用 catalog 模式管理通用依赖版本
   - MCP SDK 版本统一管理
   - 包含 CLI 相关依赖: commander, inquirer
6. **架构模式**:
   - 每个 MCP server 包含独立的客户端类
   - 支持配置存储和认证机制
   - **必须提供 CLI 工具**：包含 install 命令用于安装和配置
   - 工具函数接收客户端实例作为参数
   - **重点关注项目结构**：确保目录结构完整，**不实现任何工具的具体逻辑**
7. **测试支持**: 每个 MCP server 都包含 vitest 测试配置
8. **开发工具**: 包含 inspector 脚本用于调试和 CLI 脚本用于配置

## 生成步骤

当创建新的 MCP server 时：

1. **创建项目结构**:
   - 在 `packages/` 目录下创建新的服务器目录
   - 根据模板创建所有必要文件和目录结构
   - **仅创建文件结构，不实现任何工具的具体逻辑**

2. **替换占位符**:
   - `{server-name}`: 服务器名称 (kebab-case)
   - `{Server Name}`: 服务器显示名称
   - `{Service Name}`: 服务名称 (用于显示)
   - `{ServiceName}`: 服务名称 (PascalCase，用于类名)
   - `{serviceName}`: 服务名称 (camelCase，用于文件名)
   - `{service-name}`: 服务名称 (kebab-case)

3. **必需组件**:
   - **必须包含 CLI 功能**：创建 `cli.ts`、`commands/` 目录
   - **必须包含 install 命令**：每个 MCP server 都必须提供 install 命令用于配置和安装
   - 如果需要认证，创建 `auth/` 目录和相关文件
   - 根据实际需求调整客户端和工具结构（仅关注项目结构，**不实现任何工具逻辑**）

4. **安装和测试**:
   - 提示用户运行 `pnpm install` 安装依赖
   - 提示用户可以使用 `pnpm inspector` 测试服务器
   - 如果包含 CLI，提示用户可以使用 `pnpm cli` 进行配置
   - **注意：此阶段不实现工具的具体功能，仅确保结构完整**

5. **文档更新**:
   - 更新 README.md 包含具体的工具说明
   - 添加使用示例和配置说明

这个规则确保所有 MCP server 都遵循统一的架构模式和最佳实践，支持完整的生命周期管理。