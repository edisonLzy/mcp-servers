import path from 'path';
import { fileURLToPath } from 'url';
import { validateClient, installMCPServer, showInstallationInstructions, type InstallOptions } from './clients.js';
import type { AuthValidator } from './auth.js';

export interface InstallConfig {
  serverName: string;
  entryPath?: string;
  authValidator: AuthValidator;
  installMode: 'auto' | 'instructions';
  description?: string;
}

export interface InstallResult {
  success: boolean;
  message: string;
  configPath?: string;
}

export class InstallHandler {
  private config: InstallConfig;

  constructor(config: InstallConfig) {
    this.config = config;
  }

  async handleInstall(options: InstallOptions): Promise<InstallResult> {
    try {
      console.log(`🚀 ${this.config.serverName} MCP Server - Install`);
      console.log('=====================================\n');

      // 1. 检查客户端参数
      if (!validateClient(options.client)) {
        console.error(`❌ 不支持的客户端: ${options.client}`);
        console.log('💡 支持的客户端:', this.getSupportedClients().join(', '));
        return {
          success: false,
          message: `不支持的客户端: ${options.client}`
        };
      }

      console.log(`📱 目标客户端: ${options.client}`);
      console.log(`🌍 安装范围: ${options.global ? '全局' : '项目级别'}\n`);

      // 2. 检查身份验证
      const authStatus = await this.config.authValidator.getStatusMessage();
      console.log(authStatus);

      const isValid = await this.config.authValidator.validate();
      if (!isValid) {
        await this.config.authValidator.promptConfiguration();
      } else {
        console.log('');
      }

      // 3. 获取身份验证配置
      const authConfig = await this.config.authValidator.getAuthConfig();

      // 4. 执行安装逻辑
      if (this.config.installMode === 'auto') {
        await this.handleAutoInstall(options, authConfig);
      } else {
        await this.handleInstructionsOnly(options, authConfig);
      }

      return {
        success: true,
        message: '安装成功'
      };

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

      return {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async handleAutoInstall(options: InstallOptions, authConfig: Record<string, any>): Promise<void> {
    const entryPath = this.getEntryPath();
    await installMCPServer(
      options.client,
      options.global,
      this.config.serverName,
      entryPath,
      authConfig
    );
  }

  private async handleInstructionsOnly(options: InstallOptions, authConfig: Record<string, any>): Promise<void> {
    const entryPath = this.getEntryPath();
    showInstallationInstructions(
      options.client,
      this.config.serverName,
      entryPath,
      authConfig
    );
  }

  private getEntryPath(): string {
    if (this.config.entryPath) {
      return this.config.entryPath;
    }
    
    // 默认从调用文件的相对路径获取 entryPath
    const currentFile = fileURLToPath(import.meta.url);
    return path.resolve(path.dirname(currentFile), '..', 'index.ts');
  }

  private getSupportedClients(): string[] {
    return ['cursor', 'claude-desktop', 'gemini-cli'];
  }
}

export function createInstallHandler(config: InstallConfig): InstallHandler {
  return new InstallHandler(config);
}

export async function createInstallCommand(
  config: InstallConfig,
  commandName: string = 'install'
): Promise<any> {
  const { Command } = await import('commander');
  const handler = createInstallHandler(config);

  return new Command(commandName)
    .description(config.description || `安装 ${config.serverName} MCP Server 到指定的 MCP 客户端`)
    .requiredOption('-c, --client <client>', '指定 MCP 客户端 (cursor, claude-desktop, gemini-cli)')
    .option('-g, --global', '全局安装 (默认为项目级别)', false)
    .addHelpText('after', `
使用示例:
  $ ${commandName} --client cursor
  $ ${commandName} --client claude-desktop --global

支持的客户端:
  cursor          - Cursor 编辑器
  claude-desktop  - Claude Desktop
  gemini-cli      - Gemini CLI
`)
    .action(async (options: InstallOptions) => {
      const result = await handler.handleInstall(options);
      if (!result.success) {
        process.exit(1);
      }
    });
}