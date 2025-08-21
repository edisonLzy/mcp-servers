#!/usr/bin/env node

import { getMCPServer } from './mcp-servers/index.js';

async function main() {
  const serverName = process.argv[2];
  
  if (!serverName) {
    console.error('❌ 请提供服务器名称');
    console.error('用法: node runner.js <server-name>');
    process.exit(1);
  }

  try {
    const server = await getMCPServer(serverName);
    
    if (!server) {
      console.error(`❌ 未找到服务器: ${serverName}`);
      process.exit(1);
    }
    
    // 直接运行MCP服务器，不输出任何日志到stdout
    await server.run();
  } catch (error) {
    console.error('❌ 启动服务器时出错:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ 程序执行出错:', error);
  process.exit(1);
});