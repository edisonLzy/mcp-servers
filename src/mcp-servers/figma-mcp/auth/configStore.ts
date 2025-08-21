import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import type { FigmaConfig } from './types.js';

export class ConfigStore {
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || path.join(os.homedir(), '.figma-mcp-config.json');
  }

  static create(configPath?: string): ConfigStore {
    return new ConfigStore(configPath);
  }

  async getConfig(): Promise<FigmaConfig | null> {
    try {
      const configData = await fs.readFile(this.configPath, 'utf-8');
      return JSON.parse(configData);
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async saveConfig(config: FigmaConfig): Promise<void> {
    try {
      await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      throw new Error(`Failed to save config: ${error}`);
    }
  }

  async clearConfig(): Promise<void> {
    try {
      await fs.unlink(this.configPath);
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  getConfigPath(): string {
    return this.configPath;
  }
}