import inquirer from 'inquirer';
import { TokenStore } from '../auth/tokenStore.js';
import { OAuthServer } from '../auth/oauthServer.js';
import { FEISHU_API_BASE_URL } from '../constant.js';

export async function loginCommand(): Promise<void> {
  console.log('🚀 Feishu MCP Server - Login');
  console.log('=====================================\n');

  try {
    const tokenStore = TokenStore.create();
    
    // Check if we already have valid credentials
    const hasValidCredentials = await checkExistingCredentials(tokenStore);
    
    if (hasValidCredentials) {
      console.log('✅ Found valid credentials! You are already logged in.');
      return;
    }
    
    // No valid credentials found, proceed with OAuth login
    await handleOAuthLogin(tokenStore);
    
  } catch (error) {
    console.error('\n❌ Login failed:', error instanceof Error ? error.message : String(error));
    
    // Provide helpful suggestions
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('network')) {
        console.log('\n💡 Suggestions:');
        console.log('  • Check your internet connection');
        console.log('  • Verify the API base URL is correct');
        console.log('  • Check if there are any firewall restrictions');
      } else if (error.message.includes('401') || error.message.includes('invalid_client')) {
        console.log('\n💡 Suggestions:');
        console.log('  • Double-check your App ID and App Secret');
        console.log('  • Ensure the app is enabled in Feishu Admin Console');
        console.log('  • Verify the app has the required permissions');
      } else if (error.message.includes('OAuth')) {
        console.log('\n💡 Suggestions:');
        console.log('  • Make sure port 3000 is available');
        console.log('  • Check your browser settings and popup blockers');
        console.log('  • Try restarting the login process');
      }
    }
    
    process.exit(1);
  }
}

export async function checkExistingCredentials(tokenStore: TokenStore): Promise<boolean> {
  const appIds = await tokenStore.getAllAppIds();
  
  if (appIds.length === 0) {
    return false;
  }
  
  // Check if any of the stored tokens are valid (not expired)
  for (const appId of appIds) {
    const token = await tokenStore.getToken(appId);
    if (token) {
      const isExpired = await tokenStore.isTokenExpired(appId);
      if (!isExpired) {
        return true; // Found at least one valid token
      }
    }
  }
  
  return false; // No valid tokens found
}

export async function handleOAuthLogin(tokenStore: TokenStore): Promise<void> {

  console.log('📝 Please provide your Feishu App credentials:');
  console.log('   These are used to authenticate your application\n');
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'appId',
      message: 'App ID:',
      validate: (input: string) => {
        const trimmed = input.trim();
        if (trimmed.length === 0) return 'App ID is required';
        if (!/^cli_[a-zA-Z0-9]+$/.test(trimmed)) return 'App ID should start with "cli_"';
        return true;
      }
    },
    {
      type: 'password',
      name: 'appSecret',
      message: 'App Secret:',
      mask: '*',
      validate: (input: string) => input.trim().length > 0 || 'App Secret is required'
    },
  ]);

  const { appId, appSecret } = answers;

  console.log('\n🔄 Starting OAuth flow...');
  console.log(`   App ID: ${appId}`);
  console.log(`   Region: ${FEISHU_API_BASE_URL}`);

  const oauthServer = new OAuthServer(tokenStore, {
    appId,
    appSecret,
    domain: FEISHU_API_BASE_URL,
    host: 'localhost',
    port: 3000,
    scopes: ['wiki:wiki', 'wiki:wiki:readonly', 'docx:document']
  });

  // Start the OAuth server
  console.log('\n🌐 Starting local OAuth server...');
  await oauthServer.startServer();

  try {
    const authResult = await oauthServer.authorize();
    
    if (!authResult.needsAuthorization) {
      console.log('✅ Already have valid user token!');
      console.log(`📱 App ID: ${appId}`);
      return;
    }

    console.log('\n🔐 Opening browser for authorization...');
    console.log(`Please open the following URL in your browser:`);
    console.log(`\n${authResult.authorizeUrl}\n`);
    console.log('⏳ Waiting for authorization (timeout: 5 minutes)...');
    
    // Wait for the callback
    const state = new URL(authResult.authorizeUrl!).searchParams.get('state')!;
    await oauthServer.waitForAuthorization(state, 300000); // 5 minutes timeout
    
    console.log('\n✅ OAuth login successful!');
    console.log(`📱 App ID: ${appId}`);
    console.log('🔑 User permissions obtained');
    
    console.log('\n💾 User credentials saved successfully!');
    
    // Show storage info
    const storageInfo = tokenStore.getStorageInfo();
    console.log(`   Storage location: ${storageInfo.path}`);
    
    console.log('\n✨ You can now use the Feishu MCP server with user permissions');
  } finally {
    // Always stop the OAuth server
    console.log('\n🛑 Stopping OAuth server...');
    await oauthServer.stopServer();
  }
} 