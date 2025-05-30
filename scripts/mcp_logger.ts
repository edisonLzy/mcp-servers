#!/usr/bin/env node

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';

// --- 配置 ---
const LOG_FILE = path.join(path.dirname(__filename), 'mcp_io.log');

// --- 参数解析 ---
if (process.argv.length <= 2) {
  console.error('错误: 未提供命令。');
  console.error('用法: node mcp_logger.js <command> [args...]');
  process.exit(1);
}

// 获取要执行的命令和参数
const targetCommand = process.argv[2];
const targetArgs = process.argv.slice(3);

// 清空日志文件
fs.writeFileSync(LOG_FILE, '');

// --- 主执行部分 ---
let childProcess: ChildProcessWithoutNullStreams | null = null;
let exitCode = 1; // 默认退出代码，以防提前失败

try {
  // 打开日志文件进行追加
  const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a', encoding: 'utf8' });

  // 启动目标进程
  childProcess = spawn(targetCommand, targetArgs, {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // 处理标准输入转发
  process.stdin.on('data', (data: Buffer) => {
    try {
      // 记录输入
      let inputStr: string;
      try {
        inputStr = data.toString('utf-8');
      } catch {
        inputStr = `[Non-UTF8 data, ${data.length} bytes]\n`;
      }
      logStream.write(`输入: ${inputStr}`);

      // 转发到目标进程
      if (childProcess?.stdin) {
        childProcess.stdin.write(data);
      }
    } catch (e) {
      try {
        logStream.write(`!!! STDIN 转发错误: ${e}\n`);
      } catch {
        console.error(`!!! STDIN 转发错误: ${e}\n`);
      }
    }
  });

  // 当标准输入结束时，关闭目标进程的标准输入
  process.stdin.on('end', () => {
    try {
      if (childProcess?.stdin) {
        childProcess.stdin.end();
      }
      logStream.write('--- STDIN 流已关闭 ---\n');
    } catch (e) {
      try {
        logStream.write(`!!! 关闭目标 STDIN 时出错: ${e}\n`);
      } catch {
        console.error(`!!! 关闭目标 STDIN 时出错: ${e}\n`);
      }
    }
  });

  // 处理标准输出转发
  if (childProcess.stdout) {
    childProcess.stdout.on('data', (data: Buffer) => {
      try {
        // 记录输出
        let outputStr: string;
        try {
          outputStr = data.toString('utf-8');
        } catch {
          outputStr = `[Non-UTF8 data, ${data.length} bytes]\n`;
        }
        logStream.write(`输出: ${outputStr}`);

        // 转发到实际输出
        process.stdout.write(data);
      } catch (e) {
        try {
          logStream.write(`!!! STDOUT 转发错误: ${e}\n`);
        } catch {
          console.error(`!!! STDOUT 转发错误: ${e}\n`);
        }
      }
    });
  }

  // 处理标准错误转发
  if (childProcess.stderr) {
    childProcess.stderr.on('data', (data: Buffer) => {
      try {
        // 记录错误输出
        let errorStr: string;
        try {
          errorStr = data.toString('utf-8');
        } catch {
          errorStr = `[Non-UTF8 data, ${data.length} bytes]\n`;
        }
        logStream.write(`STDERR: ${errorStr}`);

        // 转发到实际错误输出
        process.stderr.write(data);
      } catch (e) {
        try {
          logStream.write(`!!! STDERR 转发错误: ${e}\n`);
        } catch {
          console.error(`!!! STDERR 转发错误: ${e}\n`);
        } // 忽略记录错误时的错误
      }
    });
  }

  // 处理子进程退出
  childProcess.on('exit', (code: number | null) => {
    exitCode = code !== null ? code : 1;
    
    try {
      logStream.write(`进程退出，代码: ${exitCode}\n`);
      logStream.end();
    } catch {
      console.error('!!! 记录错误时的错误\n');
    } // 忽略记录错误时的错误
    
    // 使用子进程的退出代码退出
    process.exit(exitCode);
  });

  // 捕获错误
  childProcess.on('error', (err: Error) => {
    console.error(`MCP Logger 错误: ${err.message}`);
    try {
      logStream.write(`!!! MCP Logger 错误: ${err.message}\n`);
    } catch {
      console.error(`!!! 记录错误时的错误: ${err.message}\n`);
    } // 忽略记录错误时的错误
    
    try {
      logStream.end();
    } catch {
      console.error('!!! 关闭日志时的错误\n');
    } // 忽略关闭日志时的错误
    
    process.exit(1); // 指示日志记录器失败
  });

} catch (err) {
  const error = err as Error;
  console.error(`MCP Logger 主要错误: ${error.message}`);
  
  // 确保进程终止
  if (childProcess && !childProcess.killed) {
    try {
      childProcess.kill();
    } catch {
      console.error('!!! 终止错误\n');
    } // 忽略终止错误
  }
  
  process.exit(exitCode);
}

// 处理进程信号
process.on('SIGINT', () => {
  if (childProcess && !childProcess.killed) {
    childProcess.kill('SIGINT');
  }
});

process.on('SIGTERM', () => {
  if (childProcess && !childProcess.killed) {
    childProcess.kill('SIGTERM');
  }
}); 