import inquirer from 'inquirer';
import { ConfigStore } from '../../../config-store.js';
import { FEISHU_API_BASE_URL, FEISHU_SCOPES } from '../constant.js';
import { OAuthServer } from './oauthServer.js';

/**
 * Handle OAuth login flow
 */
async function handleOAuthLogin(): Promise<void> {
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

  const oauthServer = new OAuthServer({
    appId,
    appSecret,
    domain: FEISHU_API_BASE_URL,
    host: 'localhost',
    port: 3000,
    scopes: FEISHU_SCOPES
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
    console.log('Please open the following URL in your browser:');
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
    const configStore = ConfigStore.get();
    const storageInfo = configStore.getStorageInfo();
    console.log(`   Storage location: ${storageInfo.path}`);
    
    console.log('\n✨ You can now use the Feishu MCP server with user permissions');
  } finally {
    // Always stop the OAuth server
    console.log('\n🛑 Stopping OAuth server...');
    await oauthServer.stopServer();
  }
}

/**
 * Main authentication entry point for Feishu MCP
 * Always performs a fresh authentication flow
 */
export async function authFeishuMCP(): Promise<void> {
  console.log('🚀 Feishu MCP Server - Authentication');
  console.log('=====================================\n');
  
  try {
    // Show setup instructions first
    console.log('🔧 First, configure your Feishu application:');
    console.log('1. Visit: https://open.feishu.cn/app');
    console.log('2. Create or select your application');
    console.log('3. Configure OAuth redirect URI: http://localhost:3000/callback');
    console.log('4. Note down your App ID and App Secret\n');
    
    // Ask if user wants to proceed
    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Have you configured your Feishu app and ready to authenticate?',
        default: true
      }
    ]);

    if (!proceed) {
      console.log('\n📖 Please complete the setup and run the auth command again.');
      console.log('You can also set environment variables:');
      console.log('- FEISHU_APP_ID=your_app_id');
      console.log('- FEISHU_APP_SECRET=your_app_secret');
      return;
    }
    
    // Start fresh OAuth login flow
    await handleOAuthLogin();
    
  } catch (error) {
    console.error('\n❌ Authentication failed:', error instanceof Error ? error.message : String(error));
    
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
        console.log('  • Try restarting the authentication process');
      } else if (error.message.includes('timeout')) {
        console.log('\n💡 Suggestions:');
        console.log('  • The authorization process timed out');
        console.log('  • Please try the authentication process again');
        console.log('  • Make sure to complete the browser authorization quickly');
      }
    }
    
    process.exit(1);
  }
}