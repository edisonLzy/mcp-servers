import { ConfigStore } from '../../../config-store.js';
import type { TokenInfo } from './types.js';

const CONFIG_KEY = 'feishu-mcp-tokens';

/**
 * Save token information to store
 * @param tokenInfo Token information to save
 */
export async function saveTokenInfoToStore(tokenInfo: TokenInfo): Promise<void> {
  const configStore = ConfigStore.get();
  
  try {
    await configStore.setConfig(CONFIG_KEY, tokenInfo);
  } catch (error) {
    console.error('Failed to save token info:', error);
    throw error;
  }
}

/**
 * Get token information from store
 * @returns Token information or null if not found
 */
export async function getTokenInfoFromStore(): Promise<TokenInfo | null> {
  const configStore = ConfigStore.get();
  
  try {
    const tokenInfo = await configStore.getConfig<TokenInfo>(CONFIG_KEY);
    return tokenInfo || null;
  } catch (error) {
    console.warn('Failed to load token info:', error);
    return null;
  }
}