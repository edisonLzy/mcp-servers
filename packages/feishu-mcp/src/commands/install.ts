import inquirer from 'inquirer';
import { TokenStore } from '../auth/tokenStore.js';
import { loginCommand, checkExistingCredentials } from './login.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

export interface InstallOptions {
  client: string;
  global: boolean;
}

// 支持的 MCP 客户端配置
const MCP_CLIENTS = {
  cursor: {
    name: 'Cursor',
    configPath: {
      global: path.join(os.homedir(), '.cursor', 'mcp.json'),
      project: path.join(process.cwd(), '.cursor', 'mcp.json')
    },
    getTemplate: (entryPath: string) => ({
      "mcpServers": {
        "feishu": {
          "command": "tsx",
          "args": [entryPath],
          "type": "stdio"
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
    getTemplate: (entryPath: string) => ({
      "servers": {
        "feishu": {
          "command": "tsx",
          "args": [entryPath]
        }
      }
    })
  }
} as const;

type MCPClientType = keyof typeof MCP_CLIENTS;

export async function installCommand(options: InstallOptions): Promise<void> {
  console.log('🚀 Feishu MCP Server - Install');
  console.log('=====================================\n');

  try {
    // 1. 检查客户端参数
    const clientType = options.client as MCPClientType;
    if (!MCP_CLIENTS[clientType]) {
      console.error(`❌ 不支持的客户端: ${options.client}`);
      console.log('💡 支持的客户端: cursor, gemini-cli');
      process.exit(1);
    }

    const clientConfig = MCP_CLIENTS[clientType];
    console.log(`📱 目标客户端: ${clientConfig.name}`);
    console.log(`🌍 安装范围: ${options.global ? '全局' : '项目级别'}\n`);

    // 2. 检查用户是否已登录
    const tokenStore = TokenStore.create();
    const hasValidCredentials = await checkExistingCredentials(tokenStore);
    
    if (!hasValidCredentials) {
      console.log('❌ 检测到您尚未登录或登录凭据已过期');
      console.log('🔑 需要先完成登录才能继续安装\n');
      
      const { shouldLogin } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldLogin',
          message: '是否现在进行登录？',
          default: true
        }
      ]);

      if (!shouldLogin) {
        console.log('⚠️  安装已取消，请先运行登录命令：');
        console.log('   pnpm run login');
        process.exit(1);
      }

      // 执行登录
      console.log('🔄 开始登录流程...\n');
      await loginCommand();
      console.log('\n✅ 登录完成，继续安装流程...\n');
    } else {
      console.log('✅ 已检测到有效的登录凭据\n');
    }

    // 3. 执行安装逻辑
    await installMCPServer(clientType, options.global);

  } catch (error) {
    console.error('\n❌ 安装失败:', error instanceof Error ? error.message : String(error));
    
    // 提供帮助建议
    if (error instanceof Error) {
      if (error.message.includes('ENOENT') || error.message.includes('permission')) {
        console.log('\n💡 建议:');
        console.log('  • 检查目录权限');
        console.log('  • 确保目标目录存在');
        console.log('  • 尝试使用管理员权限运行');
      } else if (error.message.includes('配置文件')) {
        console.log('\n💡 建议:');
        console.log('  • 检查客户端是否正确安装');
        console.log('  • 确认配置文件路径是否正确');
        console.log('  • 手动创建配置目录');
      }
    }
    
    process.exit(1);
  }
}

async function installMCPServer(clientType: MCPClientType, isGlobal: boolean): Promise<void> {
  const clientConfig = MCP_CLIENTS[clientType];
  const configPath = isGlobal ? clientConfig.configPath.global : clientConfig.configPath.project;
  const entryPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.ts');
  
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

    // 合并 Feishu MCP 配置
    if (clientType === 'cursor') {
      // Cursor 配置格式
      const template = clientConfig.getTemplate(entryPath);
      if (!config.mcpServers) {
        config.mcpServers = {};
      }
      config.mcpServers.feishu = (template as any).mcpServers.feishu;
    } else if (clientType === 'gemini-cli') {
      // Gemini CLI 配置格式
      const template = clientConfig.getTemplate(entryPath);
      if (!config.servers) {
        config.servers = {};
      }
      config.servers.feishu = (template as any).servers.feishu;
    }

    // 写入配置文件
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    
    console.log('\n✅ MCP 服务器安装成功！');
    console.log('=====================================');
    console.log(`📱 客户端: ${clientConfig.name}`);
    console.log(`📂 配置文件: ${configPath}`);
    console.log(`🌍 安装范围: ${isGlobal ? '全局' : '项目级别'}`);
    
    console.log('\n📋 配置详情:');
    if (clientType === 'cursor') {
      console.log(JSON.stringify({ mcpServers: { feishu: config.mcpServers.feishu } }, null, 2));
    } else if (clientType === 'gemini-cli') {
      console.log(JSON.stringify({ servers: { feishu: config.servers.feishu } }, null, 2));
    }

    console.log('\n🎉 安装完成！接下来的步骤:');
    
    if (clientType === 'cursor') {
      console.log('1. 重启 Cursor 编辑器');
      console.log('2. 打开 MCP 设置页面，确认 Feishu 服务器已添加');
      console.log('3. 开始使用 Feishu MCP 功能');
    } else if (clientType === 'gemini-cli') {
      console.log('1. 重启 Gemini CLI 或 Claude Desktop');
      console.log('2. 验证 MCP 服务器连接正常');
      console.log('3. 开始使用 Feishu MCP 功能');
    }
    
    console.log('\n💡 如需帮助，请查看文档或运行: pnpm run whoami');

    process.exit(0);

  } catch (error) {
    throw new Error(`配置文件操作失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

 