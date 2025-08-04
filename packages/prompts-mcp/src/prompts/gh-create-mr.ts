import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readFile } from 'node:fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export function registerGhCreateMrPrompt(server: McpServer) {
  server.prompt(
    'gh-create-mr',
    '使用 GitHub CLI 创建 Merge Request',
    async () => {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const workflowPath = path.join(__dirname, '..', 'workflows', 'create-merge-request-gh.mdc');
      
      try {
        const workflowContent = await readFile(workflowPath, 'utf-8');
        
        return { 
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `我需要使用 GitHub CLI (gh) 创建一个 Merge Request。请按照以下工作流程指导我完成整个过程：

${workflowContent}

请根据这个工作流程，一步一步地帮助我创建 Merge Request。首先检查我的环境是否满足要求，然后收集必要的信息，最后执行创建操作。`
              },
            },
          ] 
        };
      } catch (error) {
        return { 
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `我需要使用 GitHub CLI (gh) 创建一个 Merge Request。请帮助我完成以下步骤：

1. 检查 gh 工具是否已安装
2. 验证 GitHub 认证状态
3. 确认当前在 Git 仓库中
4. 检查分支状态
5. 收集 Merge Request 信息（标题、描述、目标分支等）
6. 创建 Merge Request
7. 提供后续操作建议

请一步一步地指导我完成这个过程。`
              },
            },
          ] 
        };
      }
    },
  );
} 