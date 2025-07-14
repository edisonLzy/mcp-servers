import fs from 'fs';
import path from 'path';
import os from 'os';
import type { TokenInfo, StoredTokenData } from './types.js';

export class TokenStore {
  private storageFile: string;
  private cache: StoredTokenData = { tokens: {}, appTokens: {} };
  private initialized = false;

  constructor(storagePath?: string) {
    const dataDir = storagePath || path.join(os.homedir(), '.feishu-mcp');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.storageFile = path.join(dataDir, 'tokens.json');
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    
    try {
      if (fs.existsSync(this.storageFile)) {
        const data = fs.readFileSync(this.storageFile, 'utf-8');
        this.cache = JSON.parse(data);
      }
      await this.clearExpiredTokens();
      this.initialized = true;
    } catch (error) {
      console.warn('Failed to load token storage, starting with empty cache:', error);
      this.cache = { tokens: {}, appTokens: {} };
      this.initialized = true;
    }
  }

  private async saveToFile(): Promise<void> {
    try {
      fs.writeFileSync(this.storageFile, JSON.stringify(this.cache, null, 2));
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  }

  private async clearExpiredTokens(): Promise<void> {
    const now = Date.now() / 1000;
    let hasExpired = false;

    // Clear expired tokens
    for (const [tokenKey, token] of Object.entries(this.cache.tokens)) {
      if (token.expiresAt && token.expiresAt < now) {
        delete this.cache.tokens[tokenKey];
        hasExpired = true;
      }
    }

    // Clear orphaned app token references
    for (const [appId, tokenKey] of Object.entries(this.cache.appTokens)) {
      if (!this.cache.tokens[tokenKey]) {
        delete this.cache.appTokens[appId];
        hasExpired = true;
      }
    }

    if (hasExpired) {
      await this.saveToFile();
    }
  }

  async storeToken(tokenInfo: TokenInfo): Promise<void> {
    await this.ensureInitialized();
    
    const tokenKey = tokenInfo.accessToken;
    this.cache.tokens[tokenKey] = tokenInfo;
    this.cache.appTokens[tokenInfo.appId] = tokenKey;
    
    await this.saveToFile();
  }

  async getToken(appId: string): Promise<TokenInfo | null> {
    await this.ensureInitialized();
    
    const tokenKey = this.cache.appTokens[appId];
    if (!tokenKey) return null;
    
    const token = this.cache.tokens[tokenKey];
    if (!token) {
      // Clean up orphaned reference
      delete this.cache.appTokens[appId];
      await this.saveToFile();
      return null;
    }
    
    // Check if token is expired
    const now = Date.now() / 1000;
    if (token.expiresAt && token.expiresAt < now) {
      return token; // Return expired token so caller can refresh it
    }
    
    return token;
  }

  async getValidToken(appId: string): Promise<TokenInfo | null> {
    const token = await this.getToken(appId);
    if (!token) return null;
    
    const now = Date.now() / 1000;
    if (token.expiresAt && token.expiresAt < now) {
      return null; // Token is expired
    }
    
    return token;
  }

  async removeToken(appId: string): Promise<void> {
    await this.ensureInitialized();
    
    const tokenKey = this.cache.appTokens[appId];
    if (tokenKey) {
      delete this.cache.tokens[tokenKey];
      delete this.cache.appTokens[appId];
      await this.saveToFile();
    }
  }

  async removeAllTokens(): Promise<void> {
    await this.ensureInitialized();
    
    this.cache = { tokens: {}, appTokens: {} };
    await this.saveToFile();
  }

  async getAllAppIds(): Promise<string[]> {
    await this.ensureInitialized();
    return Object.keys(this.cache.appTokens);
  }

  async isTokenExpired(appId: string): Promise<boolean> {
    const token = await this.getToken(appId);
    if (!token) return true;
    
    const now = Date.now() / 1000;
    return token.expiresAt ? token.expiresAt < now : false;
  }
}