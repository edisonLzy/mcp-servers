import fs from 'fs';
import path from 'path';
import os from 'os';
import { Command } from 'commander';
import z from 'zod';

const installOptionsSchema = z.object({
  client: z.enum(['cursor', 'gemini-cli']),
  global: z.boolean().optional().default(false),
  server: z.string().optional(),
});

export type InstallOptions = z.infer<typeof installOptionsSchema>;

export interface CreateInstallCommandOptions {
  name: string;
  entryPath: string;
  beforeInstall?: (options: InstallOptions) => Promise<boolean>;
}

export function createInstallCommand(_options: CreateInstallCommandOptions): Command {
  return new Command('install')
    .description('Install MCP Servers To Your MCP Client')
    .option('-g, --global', 'Install MCP Servers Globally', false)
    .requiredOption('-c, --client <client>', 'Install MCP Servers To Your MCP Client')
    .action(async (cmdOptions) => {
      const parsedOptions = installOptionsSchema.parse(cmdOptions);
      
      if (_options.beforeInstall) {
        const result = await _options.beforeInstall(parsedOptions);
        if (!result) return;
      }
      
      await installMCPServer({
        clientType: parsedOptions.client,
        isGlobal: parsedOptions.global,
        entryPath: _options.entryPath,
        name: _options.name,
      });
    });
}

interface InstallMCPServerOptions {
  clientType: InstallOptions['client'];
  isGlobal: boolean;
  entryPath: string;
  name: string;
}

async function installMCPServer(options: InstallMCPServerOptions): Promise<void> {

  const { clientType, isGlobal, entryPath, name } = options;

  const clientConfig = MCP_CLIENTS[clientType];
  if (!clientConfig) {
    throw new Error(`不支持的客户端: ${clientType}`);
  }

  const configPath = isGlobal ? clientConfig.configPath.global : clientConfig.configPath.project;
  
  console.log('📝 开始配置 MCP 服务器...');
  console.log(`📂 配置文件路径: ${configPath}`);

  try {
    // 确保配置目录存在
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      console.log(`📁 创建配置目录: ${configDir}`);
      fs.mkdirSync(configDir, { recursive: true });
    }

    // 读取或创建配置文件
    let config: any = {};
    if (fs.existsSync(configPath)) {
      console.log('📖 读取现有配置文件...');
      const content = fs.readFileSync(configPath, 'utf8');
      config = JSON.parse(content);
    } else {
      console.log('📝 创建新的配置文件...');
    }

    // 合并 MCP 服务器配置
    const template = clientConfig.getTemplate(entryPath, name);
    
    if (!config.mcpServers) {
      config.mcpServers = {};
    }
    
    config.mcpServers[name] = template.mcpServers[name];

    // 写入配置文件
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    
    console.log('\n✅ MCP 服务器安装成功！');
    console.log('=====================================');
    console.log(`📱 客户端: ${clientConfig.name}`);
    console.log(`📂 配置文件: ${configPath}`);
    console.log(`🌍 安装范围: ${isGlobal ? '全局' : '项目级别'}`);
    
    console.log('\n📋 配置详情:');
    console.log(JSON.stringify({ mcpServers: { [name]: config.mcpServers[name] } }, null, 2));

    console.log('\n🎉 安装完成！接下来的步骤:');
    
    if (clientType === 'cursor') {
      console.log('1. 重启 Cursor 编辑器');
      console.log('2. 打开 MCP 设置页面，确认服务器已添加');
      console.log('3. 开始使用 MCP 功能');
    } else if (clientType === 'gemini-cli') {
      console.log('1. 重启 Gemini CLI');
      console.log('2. 验证 MCP 服务器连接正常');
      console.log('3. 开始使用 MCP 功能');
    }

  } catch (error) {
    throw new Error(`配置文件操作失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

interface MCPClientConfig {
  name: string;
  configPath: {
    global: string;
    project: string;
  };
  getTemplate: (entryPath: string, name: string) => any;
}

const MCP_CLIENTS: Record<InstallOptions['client'], MCPClientConfig> = {
  cursor: {
    name: 'Cursor',
    configPath: {
      global: path.join(os.homedir(), '.cursor', 'mcp.json'),
      project: path.join(process.cwd(), '.cursor', 'mcp.json')
    },
    getTemplate: (entryPath, name) => ({
      mcpServers: {
        [name]: {
          command: 'tsx',
          args: [entryPath],
          type: 'stdio'
        }
      }
    })
  },
  'gemini-cli': {
    name: 'Gemini CLI',
    configPath: {
      global: path.join(os.homedir(), '.gemini', 'settings.json'),
      project: path.join(process.cwd(), '.gemini', 'settings.json')
    },
    getTemplate: (entryPath, name) => ({
      mcpServers: {
        [name]: {
          command: 'tsx',
          args: [entryPath]
        }
      }
    })
  },
};