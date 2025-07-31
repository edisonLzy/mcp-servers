import fs from 'fs';
import path from 'path';
import os from 'os';

export interface MCPClientConfig {
  name: string;
  configPath: {
    global: string;
    project: string;
  };
  getTemplate: (entryPath: string, authConfig?: Record<string, any>) => any;
}

export interface InstallOptions {
  client: string;
  global: boolean;
}

export const MCP_CLIENTS: Record<string, MCPClientConfig> = {
  cursor: {
    name: 'Cursor',
    configPath: {
      global: path.join(os.homedir(), '.cursor', 'mcp.json'),
      project: path.join(process.cwd(), '.cursor', 'mcp.json')
    },
    getTemplate: (entryPath: string, authConfig?: Record<string, any>) => ({
      mcpServers: {
        [getServerNameFromPath(entryPath)]: {
          command: 'tsx',
          args: [entryPath],
          type: 'stdio',
          ...(authConfig && { env: authConfig })
        }
      }
    })
  },
  'claude-desktop': {
    name: 'Claude Desktop',
    configPath: {
      global: path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'),
      project: path.join(process.cwd(), '.claude', 'claude_desktop_config.json')
    },
    getTemplate: (entryPath: string, authConfig?: Record<string, any>) => ({
      mcpServers: {
        [getServerNameFromPath(entryPath)]: {
          command: 'tsx',
          args: [entryPath],
          ...(authConfig && { env: authConfig })
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
    getTemplate: (entryPath: string, authConfig?: Record<string, any>) => ({
      mcpServers: {
        [getServerNameFromPath(entryPath)]: {
          command: 'tsx',
          args: [entryPath],
          ...(authConfig && { env: authConfig })
        }
      }
    })
  }
};

export function getSupportedClients(): string[] {
  return Object.keys(MCP_CLIENTS);
}

export function getClientConfig(clientType: string): MCPClientConfig | null {
  return MCP_CLIENTS[clientType] || null;
}

export function validateClient(clientType: string): boolean {
  return clientType in MCP_CLIENTS;
}

export async function installMCPServer(
  clientType: string,
  isGlobal: boolean,
  serverName: string,
  entryPath: string,
  authConfig?: Record<string, any>
): Promise<void> {
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
    const template = clientConfig.getTemplate(entryPath, authConfig);
    const serverKey = serverName || getServerNameFromPath(entryPath);
    
    if (!config.mcpServers) {
      config.mcpServers = {};
    }
    
    config.mcpServers[serverKey] = template.mcpServers[serverKey];

    // 写入配置文件
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    
    console.log('\n✅ MCP 服务器安装成功！');
    console.log('=====================================');
    console.log(`📱 客户端: ${clientConfig.name}`);
    console.log(`📂 配置文件: ${configPath}`);
    console.log(`🌍 安装范围: ${isGlobal ? '全局' : '项目级别'}`);
    
    console.log('\n📋 配置详情:');
    console.log(JSON.stringify({ mcpServers: { [serverKey]: config.mcpServers[serverKey] } }, null, 2));

    console.log('\n🎉 安装完成！接下来的步骤:');
    
    if (clientType === 'cursor') {
      console.log('1. 重启 Cursor 编辑器');
      console.log('2. 打开 MCP 设置页面，确认服务器已添加');
      console.log('3. 开始使用 MCP 功能');
    } else if (clientType === 'claude-desktop') {
      console.log('1. 重启 Claude Desktop');
      console.log('2. 验证 MCP 服务器连接正常');
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

export function getServerNameFromPath(entryPath: string): string {
  const packageName = path.basename(path.dirname(entryPath));
  return packageName.replace('-mcp', '');
}

export function showInstallationInstructions(
  clientType: string,
  serverName: string,
  entryPath: string,
  authConfig?: Record<string, any>
): void {
  const clientConfig = MCP_CLIENTS[clientType];
  if (!clientConfig) {
    console.error(`❌ 不支持的客户端: ${clientType}`);
    return;
  }

  console.log(`\n📋 Installation instructions for ${clientConfig.name}:`);
  
  const template = clientConfig.getTemplate(entryPath, authConfig);
  const serverKey = serverName || getServerNameFromPath(entryPath);
  
  if (clientType === 'cursor') {
    console.log('\nAdd the following to your Cursor MCP configuration:');
    console.log(JSON.stringify({
      mcpServers: {
        [serverKey]: template.mcpServers[serverKey]
      }
    }, null, 2));
  } else if (clientType === 'claude-desktop') {
    console.log('\nAdd the following to your Claude Desktop configuration:');
    console.log(JSON.stringify({
      mcpServers: {
        [serverKey]: template.mcpServers[serverKey]
      }
    }, null, 2));
  } else if (clientType === 'gemini-cli') {
    console.log('\nAdd the following to your Gemini CLI configuration:');
    console.log(JSON.stringify({
      mcpServers: {
        [serverKey]: template.mcpServers[serverKey]
      }
    }, null, 2));
  }
  
  console.log('\nMake sure tsx is installed: npm install -g tsx');
}