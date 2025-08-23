import { ConfigStore } from '../../../config-store.js';
import type { TokenInfo, StoredTokenData } from './types.js';

const CONFIG_KEY = 'feishu-mcp-tokens';

export class TokenStore {
  private configStore: ConfigStore;
  private cache: StoredTokenData | null = null;
  private initialized = false;

  constructor() {
    this.configStore = ConfigStore.get();
  }

  static create(): TokenStore {
    return new TokenStore();     
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    
    try {
      this.cache = await this.configStore.getConfig<StoredTokenData>(CONFIG_KEY);
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
      await this.configStore.setConfig(CONFIG_KEY, this.cache);
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
    return this.configStore.getStorageInfo();
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