import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getMCPServerEntry } from '../mcp-servers/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function runAction(serverName: string, verbose: boolean = false): Promise<void> {
  console.log(`🚀 启动 MCP 服务器: ${serverName}`);
  console.log('✅ 找到服务器配置，正在启动...');
  console.log('');
  
  // 获取服务器入口文件路径
  const entryFile = await getMCPServerEntry(serverName);
  
  if (!entryFile) {
    console.error(`❌ 未找到服务器入口文件: ${serverName}`);
    process.exit(1);
  }
  
  console.log(`📂 入口文件: ${entryFile}`);
  
  // 使用专门的MCP服务器启动器
  const serverRunnerPath = path.join(__dirname, '..', 'runner.ts');
  
  let spawnArgs: string[];
  if (verbose) {
    const loggerPath = path.join(__dirname, '..', 'logger.ts');
    spawnArgs = ['tsx', loggerPath, 'tsx', serverRunnerPath, serverName];
    console.log('📝 启用详细日志记录');
  } else {
    spawnArgs = ['tsx', serverRunnerPath, serverName];
  }
  
  const child = spawn('npx', spawnArgs, {
    stdio: 'inherit', // 直接继承stdio，让MCP服务器直接与客户端通信
  });
  
  // 处理进程事件
  child.on('error', (error) => {
    console.error('❌ 启动服务器时出错:', error.message);
    process.exit(1);
  });
  
  child.on('exit', (code, signal) => {
    if (code !== null) {
      console.log(`\n👋 服务器已退出，退出码: ${code}`);
    } else if (signal !== null) {
      console.log(`\n👋 服务器被信号终止: ${signal}`);
    }
  });
  
  // 处理用户中断
  process.on('SIGINT', () => {
    console.log('\n🛑 收到中断信号，正在停止服务器...');
    child.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 收到终止信号，正在停止服务器...');
    child.kill('SIGTERM');
  });
}