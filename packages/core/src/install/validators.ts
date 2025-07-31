import inquirer from 'inquirer';
import type { AuthValidator, OAuthValidatorConfig, PATValidatorConfig, NoAuthValidatorConfig } from './auth.js';

export class OAuthValidator implements AuthValidator {
  private config: OAuthValidatorConfig;

  constructor(config: OAuthValidatorConfig) {
    this.config = config;
  }

  async validate(): Promise<boolean> {
    return await this.config.checkExistingCredentials(this.config.tokenStore);
  }

  async getStatusMessage(): Promise<string> {
    const isValid = await this.validate();
    return isValid ? '✅ 已检测到有效的登录凭据' : '❌ 检测到您尚未登录或登录凭据已过期';
  }

  async promptConfiguration(): Promise<void> {
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

    console.log('🔄 开始登录流程...\n');
    await this.config.loginCommand();
    console.log('\n✅ 登录完成，继续安装流程...\n');
  }

  async getAuthConfig(): Promise<Record<string, any>> {
    return {}; // OAuth config is handled by token store
  }
}

export class PATValidator implements AuthValidator {
  private config: PATValidatorConfig;

  constructor(config: PATValidatorConfig) {
    this.config = config;
  }

  async validate(): Promise<boolean> {
    return await this.config.configStore.hasValidConfig?.() || false;
  }

  async getStatusMessage(): Promise<string> {
    const isValid = await this.validate();
    return isValid ? '✅ 已检测到有效的配置信息' : `❌ 检测到您尚未配置 ${this.config.tokenName} 访问凭据`;
  }

  async promptConfiguration(): Promise<void> {
    console.log(`❌ 检测到您尚未配置 ${this.config.tokenName} 访问凭据`);
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
      console.log('⚠️  安装已取消，请先运行配置命令');
      process.exit(1);
    }

    console.log('🔄 开始配置流程...\n');
    await this.handleConfigSetup();
    console.log('\n✅ 配置完成，继续安装流程...\n');
  }

  async getAuthConfig(): Promise<Record<string, any>> {
    const config = await this.config.configStore.getConfig();
    return config || {};
  }

  private async handleConfigSetup(): Promise<void> {
    // This will be overridden by specific MCP servers
    throw new Error('handleConfigSetup must be implemented by specific PAT validator');
  }
}

export class NoAuthValidator implements AuthValidator {
  private config: NoAuthValidatorConfig;

  constructor(config: NoAuthValidatorConfig) {
    this.config = config;
  }

  async validate(): Promise<boolean> {
    return true; // No authentication required
  }

  async getStatusMessage(): Promise<string> {
    return `✅ ${this.config.serverName} 无需身份验证`;
  }

  async promptConfiguration(): Promise<void> {
    // No configuration needed
  }

  async getAuthConfig(): Promise<Record<string, any>> {
    return {};
  }
}

export function createOAuthValidator(config: OAuthValidatorConfig): AuthValidator {
  return new OAuthValidator(config);
}

export function createPATValidator(config: PATValidatorConfig): AuthValidator {
  return new PATValidator(config);
}

export function createNoAuthValidator(config: NoAuthValidatorConfig): AuthValidator {
  return new NoAuthValidator(config);
}