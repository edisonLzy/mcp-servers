import { readFile } from 'node:fs/promises';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const GitWorktreeDevelopmentSchema = z.object({
  taskDescription: z.string().min(1, {
    message: '任务描述不能为空',
  }),
  baseBranch: z.string().min(1, {
    message: '基线分支不能为空',
  }),
  taskType: z.enum(['功能', '修复', '重构', '文档', '测试'], {
    message: '任务类型必须是: 功能、修复、重构、文档、测试',
  }).optional(),
  priority: z.enum(['高', '中', '低'], {
    message: '任务优先级必须是: 高、中、低',
  }).optional(),
  enableAdvancedFeatures: z.boolean({
    message: '是否启用高级功能（并行工作流管理）',
  }).optional().default(false),
});

export function registerGitWorktreeDevelopmentPrompt(server: McpServer) {
  server.prompt(
    'git-worktree-development',
    'Git Worktree 高效需求处理工作流 - 通过 git worktree 实现零成本的上下文切换，支持并行开发',
    GitWorktreeDevelopmentSchema.shape,
    async (args) => {
      const validated = GitWorktreeDevelopmentSchema.parse(args);
      const { taskDescription, baseBranch, taskType, priority, enableAdvancedFeatures } = validated;

      // 读取工作流程定义
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const workflowPath = join(__dirname, '../workflows/git-worktree-development.md');
      const workflowContent = await readFile(workflowPath, 'utf-8');

      // 根据任务类型确定分支前缀
      const getBranchPrefix = (type?: string) => {
        switch (type) {
          case '功能': return 'feature';
          case '修复': return 'fix';
          case '重构': return 'refactor';
          case '文档': return 'docs';
          case '测试': return 'test';
          default: return 'feature';
        }
      };

      // 根据优先级确定前缀
      const getPriorityPrefix = (priorityLevel?: string) => {
        switch (priorityLevel) {
          case '高': return 'urgent';
          case '中': return 'normal';
          case '低': return 'later';
          default: return 'normal';
        }
      };

      const branchPrefix = getBranchPrefix(taskType);
      const priorityPrefix = getPriorityPrefix(priority);
      
      return { 
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `请按照 Git Worktree 高效需求处理工作流来处理以下开发任务：

## 📋 任务信息
- **任务描述**: ${taskDescription}
- **基线分支**: ${baseBranch}
- **任务类型**: ${taskType || '未指定'} (分支前缀: ${branchPrefix})
${priority ? `- **优先级**: ${priority} (前缀: ${priorityPrefix})` : ''}
${enableAdvancedFeatures ? '- **高级功能**: 已启用（支持并行工作流管理）' : '- **高级功能**: 已禁用（使用基础工作流）'}

## 🎯 工作流程定义
${workflowContent}

## 🚀 执行指引

请严格按照工作流程执行，特别注意以下几点：

### 📋 执行阶段
${enableAdvancedFeatures ? `
**🔄 增强模式 - 包含所有阶段**：
- **阶段 0**: 预检查和环境验证（新增）
- **阶段 1**: 环境准备 (创建 Worktree)
- **阶段 2**: 分支隔离 (创建需求分支)
- **阶段 3**: 需求实现与变更确认
- **阶段 4**: 合并与清理

**🎯 并行工作流支持**：
- 支持多个并行 Worktree 管理
- 任务状态跟踪和切换
- 批量清理和维护工具
- 高级故障排除功能
` : `
**📝 标准模式 - 核心四阶段**：
- **阶段 1**: 环境准备 (创建 Worktree)
- **阶段 2**: 分支隔离 (创建需求分支)  
- **阶段 3**: 需求实现与变更确认
- **阶段 4**: 合并与清理
`}

### 🎨 分支命名建议
- **基础格式**: \`${branchPrefix}/[简短描述]\`
${priority ? `- **带优先级**: \`${priorityPrefix}/${branchPrefix}/[简短描述]\`` : ''}
- **示例**: \`${branchPrefix}/button-click-fix\`

### ⚠️ 重要提醒
1. **阶段 3 完成后必须等待用户确认** - 显示完整的 diff 内容
2. **只有用户明确确认后才执行阶段 4** - 合并和清理操作
3. **所有操作在新 worktree 中进行** - 保持主工作区干净
4. **遇到错误时参考故障排除章节** - 提供恢复方案
${enableAdvancedFeatures ? '5. **利用并行工作流功能** - 管理多个同时进行的任务' : ''}

${enableAdvancedFeatures ? `
### 🔧 高级功能使用建议
- 使用 \`create_task_status\` 创建任务跟踪文件
- 定期执行 \`view_all_task_status\` 查看所有任务进度
- 使用 \`pause_task\` 和 \`resume_task\` 管理任务中断
- 完成后使用 \`cleanup_merged_worktrees\` 批量清理
` : ''}

🎯 **开始执行 Git Worktree 开发流程**`,
            },
          },
        ],
      };
    },
  );
}