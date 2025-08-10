import { readFile } from 'node:fs/promises';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerGitCommitWorkflowPrompt(server: McpServer) {
  server.prompt(
    'git-commit-workflow',
    'Git 提交信息生成 - 根据暂存区的变更生成符合 Conventional Commits 规范的提交信息',
    async () => {

      // 读取工作流程定义
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const workflowPath = join(__dirname, '../workflows/git-commit-workflow.md');
      
      try {
        const workflowContent = await readFile(workflowPath, 'utf-8');
        
        return { 
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `请按照以下工作流程生成 Git 提交信息：

工作流程定义：
${workflowContent}

请严格按照工作流程中的步骤执行：
1. 分析暂存区的变更（用户需要提供 git diff --staged 的输出）
2. 确定变更类型和范围
3. 编写简洁的祈使句描述
4. 根据需要添加正文和脚注
5. 输出最终的提交信息

**重要**: 生成的提交信息必须：
- 遵循 Conventional Commits 规范
- 使用中文
- 为纯文本格式
- 不包含额外的解释或格式

请指导用户如何获取 git diff --staged 的输出，然后分析并提供提交信息。`,
              },
            },
          ],
        };
      } catch {
        // 如果无法读取工作流程文件，使用内联的工作流程
        return { 
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `请生成符合 Conventional Commits 规范的 Git 提交信息。

请按照以下步骤生成提交信息：

1. **分析 Diff**: 仔细审查暂存的变更，理解修改的目的和范围
2. **确定类型**: 选择以下类型之一：
   - feat: 新功能
   - fix: Bug 修复
   - docs: 只修改了文档
   - style: 不影响代码含义的修改
   - refactor: 代码重构
   - perf: 性能优化
   - test: 测试相关
   - build: 构建系统修改
   - ci: CI 配置修改
   - chore: 其他变更
   - revert: 撤销提交
3. **编写描述**: 用简洁的祈使句式编写变更描述（中文，不大写首字母，不以句号结尾）
4. **添加正文和脚注**（可选）

输出格式：
\`\`\`
<类型>[可选 范围]: <描述>

[可选 正文]

[可选 脚注]
\`\`\`

请指导用户如何获取 git diff --staged 的输出，然后分析并提供提交信息。`,
              },
            },
          ],
        };
      }
    },
  );
}
