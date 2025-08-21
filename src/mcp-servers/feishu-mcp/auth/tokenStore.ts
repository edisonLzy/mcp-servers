import fs from 'fs';
import path from 'path';
import os from 'os';
import type { TokenInfo, StoredTokenData } from './types.js';

const TOKEN_STORAGE_FILE = 'tokens.json';
const STORAGE_DIR = path.join(os.homedir(), '.feishu-mcp');

export class TokenStore {
  private storageDir: string;
  private storageFile: string;
  private cache: StoredTokenData | null = null;
  private initialized = false;

  constructor() {
    this.storageDir = STORAGE_DIR;
    this.storageFile = path.join(this.storageDir, TOKEN_STORAGE_FILE);
  }

  static create(): TokenStore {
    return new TokenStore();     
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
      
      await this.clearExpiredTokens();
      this.initialized = true;
    } catch (error) {
      console.warn('Failed to load token storage, starting with empty cache:', error);
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
      console.error('Failed to save tokens:', error);
      throw error;
    }
  }

  private async clearExpiredTokens(): Promise<void> {
    if (!this.cache) return;
    
    const now = Date.now() / 1000;
    
    // Check if current token is expired
    if (this.cache.expiresAt && this.cache.expiresAt < now) {
      this.cache = null;
      await this.saveToStorage();
    }
  }

  async storeToken(tokenInfo: TokenInfo): Promise<void> {
    await this.ensureInitialized();
    
    this.cache = tokenInfo;
    await this.saveToStorage();
  }

  async getToken(appId?: string): Promise<TokenInfo | null> {
    await this.ensureInitialized();
    
    if (!this.cache) return null;
    
    // If appId is provided, check if it matches
    if (appId && this.cache.appId !== appId) {
      return null;
    }
    
    return this.cache;
  }

  async getValidToken(appId?: string): Promise<TokenInfo | null> {
    const token = await this.getToken(appId);
    if (!token) return null;
    
    const now = Date.now() / 1000;
    if (token.expiresAt && token.expiresAt < now) {
      return null; // Token is expired
    }
    
    return token;
  }

  async removeToken(appId?: string): Promise<void> {
    await this.ensureInitialized();
    
    if (!this.cache) return;
    
    // If appId is provided, only remove if it matches
    if (appId && this.cache.appId !== appId) {
      return;
    }
    
    this.cache = null;
    await this.saveToStorage();
  }

  async removeAllTokens(): Promise<void> {
    await this.ensureInitialized();
    
    this.cache = null;
    await this.saveToStorage();
  }

  async getAllAppIds(): Promise<string[]> {
    await this.ensureInitialized();
    return this.cache ? [this.cache.appId] : [];
  }

  async isTokenExpired(appId?: string): Promise<boolean> {
    const token = await this.getToken(appId);
    if (!token) return true;
    
    const now = Date.now() / 1000;
    return token.expiresAt ? token.expiresAt < now : false;
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
   * Export all tokens (for backup purposes)
   */
  async exportTokens(): Promise<StoredTokenData | null> {
    await this.ensureInitialized();
    return this.cache;
  }

  /**
   * Import tokens (for restore purposes)
   */
  async importTokens(data: StoredTokenData | null): Promise<void> {
    await this.ensureInitialized();
    this.cache = data;
    await this.clearExpiredTokens();
    await this.saveToStorage();
  }
}