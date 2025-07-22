import inquirer from 'inquirer';
import { ConfigStore } from '../auth/configStore.js';
import { WEAPONS_API_BASE_URL } from '../constant.js';

export async function installCommand(): Promise<void> {
  console.log('🚀 Weapons MCP Server - Install');
  console.log('=====================================\n');

  try {
    const configStore = ConfigStore.create();
    
    // Check if we already have valid configuration
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

    // Show success message
    console.log('🎉 Weapons MCP Server 安装成功！');
    console.log('=====================================');
    console.log('💡 使用提示:');
    console.log('1. 在 Claude Desktop 或其他 MCP 客户端中添加此服务器');
    console.log('2. 使用 get-endpoints 工具获取 API 接口信息');
    console.log('3. 如需重新配置凭据，请删除配置文件后重新运行 install');
    
    const storageInfo = configStore.getStorageInfo();
    console.log(`\n📂 配置文件位置: ${storageInfo.path}`);

  } catch (error) {
    console.error('\n❌ 安装失败:', error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error) {
      if (error.message.includes('ENOENT') || error.message.includes('permission')) {
        console.log('\n💡 建议:');
        console.log('  • 检查目录权限');
        console.log('  • 确保用户目录可写');
      }
    }
    
    process.exit(1);
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