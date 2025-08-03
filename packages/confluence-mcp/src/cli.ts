#!/usr/bin/env node

import { Command } from 'commander';
import { createInstallCommand } from '@mcp-servers/core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const program = new Command();

program
  .name('confluence-mcp')
  .description('Confluence MCP Server CLI')
  .version('0.0.1');

// Add install command with confluence-specific configuration
const installCommand = createInstallCommand({
  name: 'confluence-mcp',
  entryPath: path.resolve(path.dirname(fileURLToPath(import.meta.url)),'index.ts'),
  beforeInstall: async (options) => {
    console.log('🔧 Installing Confluence MCP Server...');
    console.log(`Client: ${options.client}, Global: ${options.global}`);
    
    // Check for required environment variables
    const requiredEnvVars = ['CONFLUENCE_BASE_URL', 'CONFLUENCE_USERNAME', 'CONFLUENCE_PASSWORD'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log('❌ 检测到缺少必需的环境变量');
      console.log(`   缺少: ${missingVars.join(', ')}`);
      console.log('\n📝 请设置以下环境变量:');
      console.log('   CONFLUENCE_BASE_URL - Confluence 服务器地址');
      console.log('   CONFLUENCE_USERNAME - 用户名');
      console.log('   CONFLUENCE_PASSWORD - 密码或 API Token');
      console.log('\n💡 建议在 .env 文件中设置这些变量');
      return false;
    }
    
    console.log('✅ 环境变量配置检查通过');
    console.log(`   Base URL: ${process.env.CONFLUENCE_BASE_URL}`);
    console.log(`   Username: ${process.env.CONFLUENCE_USERNAME}`);
    console.log(`   Password: ${process.env.CONFLUENCE_PASSWORD ? '***' : '未设置'}`);
    
    return true;
  }
});

program.addCommand(installCommand);

program.parse();