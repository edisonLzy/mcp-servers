import path from 'node:path';
import { fileURLToPath } from 'node:url';
import inquirer from 'inquirer';
import { createInstallCommand } from '@mcp-servers/core';
import { ConfigStore } from '../auth/configStore';
 
export const installCommand = createInstallCommand({
  name: 'weapons-mcp',
  entryPath: path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','index.ts'),
  beforeInstall: async () => {
     
    const configStore = ConfigStore.create();
    const hasValidConfig = await configStore.hasValidConfig();
    
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

    return true;
  },
});

async function handleConfigSetup(configStore: ConfigStore): Promise<void> {
  console.log('📝 请提供您的 Weapons 访问信息:');
  console.log('   这些信息来自浏览器登录 Weapons 平台后的 Cookie\n');
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'baseURL',
      message: 'Weapons 平台 Base URL (例如: https://weapons.xx.com):',
      required: true,
      validate: (input: string) => {
        const trimmed = input.trim();
        if (trimmed.length === 0) return 'Base URL 是必需的';
        try {
          new URL(trimmed);
          return true;
        } catch {
          return '请输入有效的 URL 格式';
        }
      }
    },
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

  const { baseURL, token, uid } = answers;

  console.log('\n💾 保存配置信息...');
  console.log(`   Base URL: ${baseURL}`);
  console.log(`   Token: ${token.substring(0, 8)}...`);
  console.log(`   UID: ${uid}`);

  await configStore.storeConfig({
    baseURL,
    token,
    uid,
    createdAt: Date.now()
  });
  
  console.log('\n✅ 配置保存成功!');
  
  // Show storage info
  const storageInfo = configStore.getStorageInfo();
  console.log(`   配置文件: ${storageInfo.path}`);
}