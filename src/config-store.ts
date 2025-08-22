import { promises as fs } from 'fs';
import { statSync } from 'fs';
import path from 'path';
import os from 'os';
import type { MCPServerOptions } from './types.js';

// 配置存储的值类型
type ConfigStoreValues = Record<MCPServerOptions['name'], any>;

export interface ConfigStoreOptions {
  storageDir: string;
  configFileName: string;
}

export class ConfigStore {
  private storageDir: string;
  private storageFile: string;

  constructor(options: ConfigStoreOptions) {
    this.storageDir = options.storageDir;
    this.storageFile = path.join(this.storageDir, options.configFileName);
    
    // 在创建实例时确保配置文件存在
    this.ensureConfigFile();
  }

  static get(): ConfigStore {
    return new ConfigStore({
      configFileName: 'config.json',
      storageDir: path.join(os.homedir(), '.codemons', 'mcp-servers')
    });
  }

  private async ensureStorageDir(): Promise<void> {
    try {
      await fs.mkdir(this.storageDir, { recursive: true, mode: 0o700 });
    } catch (error) {
      // 目录已存在时忽略错误
      if ((error as any).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  private async ensureConfigFile(): Promise<void> {
    try {
      await this.ensureStorageDir();
      
      // 检查配置文件是否存在
      try {
        await fs.access(this.storageFile);
      } catch {
        // 文件不存在，创建空的配置文件
        const emptyConfig: ConfigStoreValues = {};
        await this.writeConfigFile(emptyConfig);
      }
    } catch (error) {
      console.warn('Failed to ensure config file:', error);
    }
  }

  private async readConfigFile(): Promise<ConfigStoreValues> {
    try {
      const data = await fs.readFile(this.storageFile, 'utf8');
      return JSON.parse(data) || {};
    } catch (error) {
      console.warn('Failed to read config file:', error);
      return {};
    }
  }

  private async writeConfigFile(config: ConfigStoreValues): Promise<void> {
    try {
      await this.ensureStorageDir();
      
      const jsonData = JSON.stringify(config, null, 2);
      
      // 使用临时文件进行原子写入
      const tempFile = this.storageFile + '.tmp';
      await fs.writeFile(tempFile, jsonData, { mode: 0o600 });
      await fs.rename(tempFile, this.storageFile);
    } catch (error) {
      console.error('Failed to save config:', error);
      throw error;
    }
  }

  /**
   * 获取指定名称的配置
   */
  async getConfig<T>(name: MCPServerOptions['name']): Promise<T | null> {
    const config = await this.readConfigFile();
    return config[name] || null;
  }

  /**
   * 设置指定名称的配置
   */
  async setConfig<T>(name: MCPServerOptions['name'], value: T): Promise<void> {
    const config = await this.readConfigFile();
    config[name] = value;
    await this.writeConfigFile(config);
  }

  /**
   * 清除指定名称的配置
   */
  async clearConfig(name: MCPServerOptions['name']): Promise<void> {
    const config = await this.readConfigFile();
    delete config[name];
    await this.writeConfigFile(config);
  }

  /**
   * 获取存储信息（用于调试）
   */
  getStorageInfo(): { path: string; exists: boolean; readable: boolean } {
    try {
      const stats = statSync(this.storageFile);
      return {
        path: this.storageFile,
        exists: true,
        readable: stats.isFile()
      };
    } catch {
      return {
        path: this.storageFile,
        exists: false,
        readable: false
      };
    }
  }
}