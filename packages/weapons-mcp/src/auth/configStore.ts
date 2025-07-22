import fs from 'fs';
import path from 'path';
import os from 'os';
import type { WeaponsConfigInfo, StoredConfigData } from './types.js';

const CONFIG_STORAGE_FILE = 'weapons-config.json';
const STORAGE_DIR = path.join(os.homedir(), '.weapons-mcp');

export class ConfigStore {
  private storageDir: string;
  private storageFile: string;
  private cache: StoredConfigData | null = null;
  private initialized = false;

  constructor() {
    this.storageDir = STORAGE_DIR;
    this.storageFile = path.join(this.storageDir, CONFIG_STORAGE_FILE);
  }

  static create(): ConfigStore {
    return new ConfigStore();
  }

  private ensureStorageDir(): void {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true, mode: 0o700 }); // Only user can access
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    
    try {
      this.ensureStorageDir();
      
      if (fs.existsSync(this.storageFile)) {
        const data = fs.readFileSync(this.storageFile, 'utf8');
        const parsed = JSON.parse(data);
        this.cache = parsed || null;
      } else {
        this.cache = null;
      }
      
      this.initialized = true;
    } catch (error) {
      console.warn('Failed to load config storage, starting with empty cache:', error);
      this.cache = null;
      this.initialized = true;
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      this.ensureStorageDir();
      
      const jsonData = JSON.stringify(this.cache, null, 2);
      
      // Write to temp file first, then rename for atomic operation
      const tempFile = this.storageFile + '.tmp';
      fs.writeFileSync(tempFile, jsonData, { mode: 0o600 }); // Only user can read/write
      fs.renameSync(tempFile, this.storageFile);
    } catch (error) {
      console.error('Failed to save config:', error);
      throw error;
    }
  }

  async storeConfig(configInfo: WeaponsConfigInfo): Promise<void> {
    await this.ensureInitialized();
    
    this.cache = configInfo;
    await this.saveToStorage();
  }

  async getConfig(): Promise<WeaponsConfigInfo | null> {
    await this.ensureInitialized();
    return this.cache;
  }

  async hasValidConfig(): Promise<boolean> {
    const config = await this.getConfig();
    return !!(config && config.token && config.uid);
  }

  async removeConfig(): Promise<void> {
    await this.ensureInitialized();
    
    this.cache = null;
    await this.saveToStorage();
  }

  /**
   * Get storage directory for debugging purposes
   */
  getStorageInfo(): { path: string; exists: boolean; readable: boolean } {
    return {
      path: this.storageFile,
      exists: fs.existsSync(this.storageFile),
      readable: fs.existsSync(this.storageFile) && fs.statSync(this.storageFile).isFile()
    };
  }

  /**
   * Export config (for backup purposes)
   */
  async exportConfig(): Promise<StoredConfigData | null> {
    await this.ensureInitialized();
    return this.cache;
  }

  /**
   * Import config (for restore purposes)
   */
  async importConfig(data: StoredConfigData | null): Promise<void> {
    await this.ensureInitialized();
    this.cache = data;
    await this.saveToStorage();
  }
} 