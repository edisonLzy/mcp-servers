import { TokenStore } from '../auth/tokenStore.js';
import { FeishuClient } from '../feishuClient.js';

export async function whoamiCommand(): Promise<void> {
  console.log('👤 Feishu MCP Server - Whoami');
  console.log('=====================================\n');

  try {
    const tokenStore = TokenStore.create();
    const appIds = await tokenStore.getAllAppIds();
    
    if (appIds.length === 0) {
      console.log('❌ No login credentials found.');
      console.log('💡 Please run the login command first: npm run feishu-mcp login');
      process.exit(1);
    }

    // Use the first available app
    const appId = appIds[0];
    console.log(`📱 Using app: ${appId}`);
    
    const client = new FeishuClient(tokenStore);
    const userInfo = await client.getCurrentUser();
    
    console.log('✅ Current User Information:');
    console.log('=====================================');
    console.log(`👤 Name: ${userInfo.name}`);
    console.log(`🆔 User ID: ${userInfo.user_id}`);
    console.log(`📧 Email: ${userInfo.email || 'N/A'}`);
    console.log(`📱 Mobile: ${userInfo.mobile || 'N/A'}`);
    console.log(`🏢 Employee ID: ${userInfo.employee_id || 'N/A'}`);
    console.log(`🌐 Status: ${userInfo.status?.is_frozen ? '冻结' : '正常'}`);
    console.log(`👔 Employee Type: ${userInfo.employee_type || 'N/A'}`);
    
    if (userInfo.avatar?.avatar_72) {
      console.log(`🖼️  Avatar URL: ${userInfo.avatar.avatar_72}`);
    }
    
    if (userInfo.department_ids && userInfo.department_ids.length > 0) {
      console.log(`🏛️  Department IDs: ${userInfo.department_ids.join(', ')}`);
    }
    
    console.log('=====================================\n');
    
  } catch (error) {
    console.error('\n❌ Failed to get user information:');
    
    let errorMessage = '';
    if (error instanceof Error) {
      console.error('Error:', error.message);
      errorMessage = error.message;
    } else {
      const errorStr = JSON.stringify(error, null, 2);
      console.error('Error:', errorStr);
      errorMessage = errorStr;
    }
    
    // Provide helpful suggestions
    if (errorMessage.includes('99991679') || errorMessage.includes('contact:contact')) {
      console.log('\n💡 解决方案:');
      console.log('  • 您的飞书应用缺少通讯录相关权限');
      console.log('  • 请在飞书开放平台管理后台为您的应用添加以下权限之一:');
      console.log('    - contact:contact.base:readonly (通讯录基础信息)');
      console.log('    - contact:contact:readonly (通讯录信息)');
      console.log('  • 添加权限后，请重新授权应用');
      console.log('  • 参考文档: https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-resolve-error-99991679');
    } else if (errorMessage.includes('401') || errorMessage.includes('invalid_token')) {
      console.log('\n💡 Suggestions:');
      console.log('  • Your login session may have expired');
      console.log('  • Please try logging in again: pnpm run login');
    } else if (errorMessage.includes('403') || errorMessage.includes('permission')) {
      console.log('\n💡 Suggestions:');
      console.log('  • Your app may not have permission to access user information');
      console.log('  • Please check the app permissions in Feishu Admin Console');
    } else if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('network')) {
      console.log('\n💡 Suggestions:');
      console.log('  • Check your internet connection');
      console.log('  • Verify the API base URL is correct');
    }
    
    process.exit(1);
  }
} 