#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import { createInstallCommand } from '@mcp-servers/core';
import { FigmaClient } from './figmaClient.js';
import { ConfigStore } from './auth/configStore.js';
import type { FigmaConfig } from './auth/types.js';

const program = new Command();
const client = new FigmaClient();

program
  .name('figma-mcp')
  .description('CLI for Figma MCP Server')
  .version('0.1.0');

program
  .command('login')
  .description('Set up Figma API authentication')
  .action(async () => {
    try {
      console.log('Welcome to Figma MCP Server setup!');
      console.log('To get your Figma Personal Access Token:');
      console.log('1. Go to https://www.figma.com/developers/api#access-tokens');
      console.log('2. Click "Generate new token"');
      console.log('3. Copy your personal access token\n');

      const { token } = await inquirer.prompt([
        {
          type: 'password',
          name: 'token',
          message: 'Enter your Figma Personal Access Token:',
          validate: (input: string) => {
            if (!input.trim()) {
              return 'Token is required';
            }
            if (!input.startsWith('figd_')) {
              return 'Figma tokens should start with "figd_"';
            }
            return true;
          },
        },
      ]);

      const config: FigmaConfig = {
        personalAccessToken: token.trim(),
      };

      await client.setConfig(config);
      
      // Test the token
      try {
        const user = await client.getCurrentUser();
        console.log('\n✅ Authentication successful!');
        console.log(`Hello, ${user.handle} (${user.email})`);
      } catch (error) {
        console.log('\n❌ Authentication failed. Please check your token.');
        await client.clearConfig();
        process.exit(1);
      }
    } catch (error) {
      console.error('Error during login:', error);
      process.exit(1);
    }
  });

program
  .command('logout')
  .description('Clear stored Figma credentials')
  .action(async () => {
    try {
      await client.clearConfig();
      console.log('✅ Figma credentials cleared successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      process.exit(1);
    }
  });

program
  .command('whoami')
  .description('Show current Figma user information')
  .action(async () => {
    try {
      const user = await client.getCurrentUser();
      console.log(`User: ${user.handle} (${user.email})`);
      console.log(`ID: ${user.id}`);
      console.log(`Avatar: ${user.img_url}`);
    } catch (error) {
      console.error('Error getting user info:', error);
      process.exit(1);
    }
  });

// Create custom PAT validator for Figma
class FigmaPATValidator {
  private configStore: ConfigStore;
  private client: FigmaClient;

  constructor(configStore: ConfigStore, client: FigmaClient) {
    this.configStore = configStore;
    this.client = client;
  }

  async validate(): Promise<boolean> {
    try {
      return this.client.isConfigured();
    } catch {
      return false;
    }
  }

  async getStatusMessage(): Promise<string> {
    const isValid = await this.validate();
    return isValid ? '✅ 已检测到有效的 Figma 配置' : '❌ 检测到您尚未配置 Figma 访问凭据';
  }

  async promptConfiguration(): Promise<void> {
    console.log('❌ 检测到您尚未配置 Figma 访问凭据');
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
      console.log('   figma-mcp login');
      process.exit(1);
    }

    console.log('🔄 开始配置流程...\n');
    await this.handleConfigSetup();
    console.log('\n✅ 配置完成，继续安装流程...\n');
  }

  async getAuthConfig(): Promise<Record<string, any>> {
    const config = await this.configStore.getConfig();
    if (!config) {
      return {};
    }
    return {
      FIGMA_PAT: config.personalAccessToken
    };
  }

  private async handleConfigSetup(): Promise<void> {
    console.log('Welcome to Figma MCP Server setup!');
    console.log('To get your Figma Personal Access Token:');
    console.log('1. Go to https://www.figma.com/developers/api#access-tokens');
    console.log('2. Click "Generate new token"');
    console.log('3. Copy your personal access token\n');

    const { token } = await inquirer.prompt([
      {
        type: 'password',
        name: 'token',
        message: 'Enter your Figma Personal Access Token:',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Token is required';
          }
          if (!input.startsWith('figd_')) {
            return 'Figma tokens should start with "figd_"';
          }
          return true;
        },
      },
    ]);

    const config: FigmaConfig = {
      personalAccessToken: token.trim(),
    };

    await this.client.setConfig(config);
    
    // Test the token
    try {
      const user = await this.client.getCurrentUser();
      console.log('\n✅ Authentication successful!');
      console.log(`Hello, ${user.handle} (${user.email})`);
    } catch (error) {
      console.log('\n❌ Authentication failed. Please check your token.');
      await this.client.clearConfig();
      process.exit(1);
    }
  }
}

// Create install command synchronously
const configStore = ConfigStore.create();
const authValidator = new FigmaPATValidator(configStore, client);

// Create install command and then parse
createInstallCommand({
  serverName: 'figma',
  authValidator: authValidator as any,
  installMode: 'instructions',
  description: 'Install Figma MCP server to MCP client'
}).then(installCommand => {
  program.addCommand(installCommand);
  program.parse();
});