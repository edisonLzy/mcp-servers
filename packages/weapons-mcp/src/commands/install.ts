import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import { ConfigStore } from '../auth/configStore.js';
import { WEAPONS_API_BASE_URL } from '../constant.js';

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
      'mcpServers': {
        'weapons': {
          'command': 'tsx',
          'args': [entryPath],
          'type': 'stdio'
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
      'mcpServers': {
        'weapons': {
          'command': 'tsx',
          'args': [entryPath]
        }
      }
    })
  }
} as const;

type MCPClientType = keyof typeof MCP_CLIENTS;

export async function installCommand(options: InstallOptions): Promise<void> {
  console.log('🚀 Weapons MCP Server - Install');
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

    // 2. 检查用户配置
    const configStore = ConfigStore.create();
    const hasValidConfig = await checkExistingConfig(configStore);
    
    if (!hasValidConfig) {
      console.log('❌ 检测到您尚未配置 Weapons 访问凭据');
      console.log('🔑 需要先完成配置才能继续安装\n');
      
      const { shouldConfigure } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldConfigure',
          message: '是否现在进行配置？',
          default: true
        }
      ]);

      if (!shouldConfigure) {
        console.log('⚠️  安装已取消，请先运行配置命令：');
        console.log('   weapons-mcp install');
        process.exit(1);
      }

      // Execute configuration
      console.log('🔄 开始配置流程...\n');
      await handleConfigSetup(configStore);
      console.log('\n✅ 配置完成，继续安装流程...\n');
    } else {
      console.log('✅ 已检测到有效的配置信息\n');
    }

    // 3. 执行 MCP 客户端安装逻辑
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

    // 合并 Weapons MCP 配置
    if (clientType === 'cursor') {
      // Cursor 配置格式
      const template = clientConfig.getTemplate(entryPath);
      if (!config.mcpServers) {
        config.mcpServers = {};
      }
      config.mcpServers.weapons = (template as any).mcpServers.weapons;
    } else if (clientType === 'gemini-cli') {
      // Gemini CLI 配置格式
      const template = clientConfig.getTemplate(entryPath);
      if (!config.mcpServers) {
        config.mcpServers = {};
      }
      config.mcpServers.weapons = (template as any).mcpServers.weapons;
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
      console.log(JSON.stringify({ mcpServers: { weapons: config.mcpServers.weapons } }, null, 2));
    } else if (clientType === 'gemini-cli') {
      console.log(JSON.stringify({ mcpServers: { weapons: config.mcpServers.weapons } }, null, 2));
    }

    console.log('\n🎉 安装完成！接下来的步骤:');
    
    if (clientType === 'cursor') {
      console.log('1. 重启 Cursor 编辑器');
      console.log('2. 打开 MCP 设置页面，确认 Weapons 服务器已添加');
      console.log('3. 开始使用 Weapons MCP 功能');
    } else if (clientType === 'gemini-cli') {
      console.log('1. 重启 Gemini CLI 或 Claude Desktop');
      console.log('2. 验证 MCP 服务器连接正常');
      console.log('3. 开始使用 Weapons MCP 功能');
    }
    
    console.log('\n💡 如需帮助，请查看文档或检查配置文件');

    process.exit(0);

  } catch (error) {
    throw new Error(`配置文件操作失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function checkExistingConfig(configStore: ConfigStore): Promise<boolean> {
  return await configStore.hasValidConfig();
}

async function handleConfigSetup(configStore: ConfigStore): Promise<void> {
  console.log('📝 请提供您的 Weapons 访问凭据:');
  console.log('   这些信息来自浏览器登录 Weapons 平台后的 Cookie\n');
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'token',
      message: '_yapi_token:',
      validate: (input: string) => {
        const trimmed = input.trim();
        if (trimmed.length === 0) return '_yapi_token 是必需的';
        return true;
      }
    },
    {
      type: 'input',
      name: 'uid',
      message: '_yapi_uid:',
      validate: (input: string) => {
        const trimmed = input.trim();
        if (trimmed.length === 0) return '_yapi_uid 是必需的';
        return true;
      }
    },
  ]);

  const { token, uid } = answers;

  console.log('\n💾 保存配置信息...');
  console.log(`   Token: ${token.substring(0, 8)}...`);
  console.log(`   UID: ${uid}`);
  console.log(`   Base URL: ${WEAPONS_API_BASE_URL}`);

  await configStore.storeConfig({
    token,
    uid,
    baseURL: WEAPONS_API_BASE_URL,
    createdAt: Date.now()
  });
  
  console.log('\n✅ 配置保存成功!');
  
  // Show storage info
  const storageInfo = configStore.getStorageInfo();
  console.log(`   配置文件: ${storageInfo.path}`);
} 