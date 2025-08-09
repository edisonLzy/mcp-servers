import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const GitWorktreeDevelopmentSchema = z.object({
  taskDescription: z.string().min(1, {
    message: '任务描述不能为空',
  }),
  baseBranch: z.string().min(1, {
    message: '基线分支不能为空',
  }),
  taskType: z.enum(['功能', '修复', '重构'], {
    message: '任务类型必须是: 功能、修复、重构',
  }).optional(),
});

export function registerGitWorktreeDevelopmentPrompt(server: McpServer) {
  server.prompt(
    'git-worktree-development',
    'Git Worktree 高效需求处理工作流 - 通过 git worktree 实现零成本的上下文切换',
    GitWorktreeDevelopmentSchema.shape,
    async (args) => {
      const validated = GitWorktreeDevelopmentSchema.parse(args);
      const { taskDescription, baseBranch, taskType } = validated;

      // 读取工作流程定义
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const workflowPath = join(__dirname, '../workflows/git-worktree-development.md');
      const workflowContent = await readFile(workflowPath, 'utf-8');
      
      return { 
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `请按照 Git Worktree 高效需求处理工作流来处理以下开发任务：

任务信息：
- 任务描述: ${taskDescription}
- 基线分支: ${baseBranch}
${taskType ? `- 任务类型: ${taskType}` : ''}

工作流程定义：
${workflowContent}

请严格按照工作流程中的 4 个阶段执行：

**阶段 1: 环境准备 (创建 Worktree)**
1. 解析任务信息并生成语义化的工作区名称
2. 执行 git worktree 命令在项目父目录创建独立工作区

**阶段 2: 分支隔离 (创建需求分支)**
1. 进入新的 Worktree 目录
2. 基于任务类型和描述创建专门的需求分支

**阶段 3: 需求实现与变更确认**
1. 完成编码任务
2. 提交变更
3. 生成变更预览 (diff)
4. 等待用户确认变更

**阶段 4: 合并与清理**
1. 在用户确认后，将代码合并到基线分支
2. 推送到远程仓库
3. 清理临时工作环境

**重要说明**:
- 在阶段 3 完成后，必须显示完整的 diff 内容并等待用户确认
- 只有在用户明确确认后才能执行阶段 4 的合并操作
- 所有操作都应在新的 worktree 环境中进行，保持主工作区的干净状态

请开始执行 Git Worktree 开发流程。`,
            },
          },
        ],
      };
    },
  );
}