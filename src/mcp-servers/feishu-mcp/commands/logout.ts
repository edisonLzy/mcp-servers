import { TokenStore } from '../auth/tokenStore.js';

export async function logoutCommand(): Promise<void> {
  console.log('🔐 Feishu MCP Server - Logout');
  console.log('=====================================\n');

  try {
    const tokenStore = TokenStore.create();
    const appIds = await tokenStore.getAllAppIds();

    if (appIds.length === 0) {
      console.log('ℹ️  No stored credentials found');
      console.log('   You are not currently logged in to any Feishu app');
      return;
    }

    // Show current stored credentials before clearing
    console.log('📋 Current stored credentials:');
    for (const appId of appIds) {
      const token = await tokenStore.getToken(appId);
      if (token) {
        const isExpired = await tokenStore.isTokenExpired(appId);
        const status = isExpired ? '⏰ EXPIRED' : '✅ VALID';
        const hasRefresh = token.refreshToken ? '🔄 Refreshable' : '🔑 App Token';
        console.log(`  • App ID: ${appId} [${status}] [${hasRefresh}]`);
      }
    }

    // Clear all tokens
    await tokenStore.removeAllTokens();
    
    console.log('\n✅ Successfully logged out from all apps');
    console.log('   All stored credentials have been removed');
    
    // Show storage info
    const storageInfo = tokenStore.getStorageInfo();
    console.log(`   Storage directory: ${storageInfo.path}`);

  } catch (error) {
    console.error('\n❌ Logout failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
} 