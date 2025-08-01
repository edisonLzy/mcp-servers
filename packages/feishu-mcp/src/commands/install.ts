import { createInstallCommand } from '@mcp-servers/core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TokenStore } from '../auth/tokenStore';
import { checkExistingCredentials, loginCommand } from './login';
import inquirer from 'inquirer';

export const installCommand = createInstallCommand({
    name: 'feishu-mcp',
    entryPath: path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'index.ts'),
    beforeInstall: async (options) => {
      console.log('🔧 Installing Feishu MCP Server...');
      console.log(`Client: ${options.client}, Global: ${options.global}`);
      
      // Check if user is authenticated
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
          console.log('   feishu-mcp login');
          return false;
        }
  
        // Execute login
        console.log('🔄 开始登录流程...\n');
        await loginCommand();
        console.log('\n✅ 登录完成，继续安装流程...\n');
      } else {
        console.log('✅ 已检测到有效的登录凭据\n');
      }
  
      return true;
    },
  });
  