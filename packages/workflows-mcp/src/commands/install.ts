import fs from 'fs';
import path from 'path';
import os from 'os';
import inquirer from 'inquirer';

interface InstallOptions {
  client: string;
  global: boolean;
}

export async function installCommand(options: InstallOptions) {
  console.log('🔧 Installing Workflows MCP Server...');
  
  try {
    const { client, global: isGlobal } = options;
    
    // 确认安装
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: `Install Workflows MCP Server for ${client}?`,
        default: true
      }
    ]);
    
    if (!confirmed) {
      console.log('❌ Installation cancelled.');
      return;
    }
    
    // 根据客户端类型配置
    if (client === 'cursor') {
      await installForCursor(isGlobal);
    } else if (client === 'gemini-cli') {
      await installForGeminiCLI(isGlobal);
    } else {
      console.error(`❌ Unsupported client: ${client}`);
      process.exit(1);
    }
    
    console.log('✅ Workflows MCP Server installed successfully!');
    console.log('\n📖 Usage:');
    console.log('  Use the MCP inspector to test: pnpm inspector');
    
  } catch (error) {
    console.error('❌ Installation failed:', error);
    process.exit(1);
  }
}

async function installForCursor(isGlobal: boolean) {
  const configPath = isGlobal 
    ? path.join(os.homedir(), '.cursor', 'mcp_settings.json')
    : path.join(process.cwd(), '.cursor', 'mcp_settings.json');
    
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  let config: any = {};
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(content);
  }
  
  if (!config.mcpServers) {
    config.mcpServers = {};
  }
  
  config.mcpServers['workflows-mcp'] = {
    command: 'tsx',
    args: [path.resolve(process.cwd(), 'src/index.ts')]
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`📝 Updated Cursor config: ${configPath}`);
}

async function installForGeminiCLI(isGlobal: boolean) {
  const configPath = isGlobal
    ? path.join(os.homedir(), '.config', 'gemini-cli', 'mcp_settings.json')
    : path.join(process.cwd(), '.gemini-cli', 'mcp_settings.json');
    
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  let config: any = {};
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(content);
  }
  
  if (!config.mcpServers) {
    config.mcpServers = {};
  }
  
  config.mcpServers['workflows-mcp'] = {
    command: 'tsx',
    args: [path.resolve(process.cwd(), 'src/index.ts')]
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`📝 Updated Gemini CLI config: ${configPath}`);
}