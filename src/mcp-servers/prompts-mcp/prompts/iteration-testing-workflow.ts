import { readWorkflowFile } from '../utils.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerIterationTestingWorkflowPrompt(server: McpServer) {
  server.prompt(
    'iteration-testing-workflow',
    '迭代测试工作流 - 分析迭代分支变更并修复提测阶段发现的问题',
    async () => {
      try {
        const workflowContent = await readWorkflowFile('iteration-testing-workflow.md');
        
        return { 
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `请按照以下工作流程分析代码变更并修复问题：

工作流程定义：
${workflowContent}

请严格按照工作流程中的步骤执行：
1. 确认环境信息（当前分支、基线分支、问题描述）
2. 分析代码变更（获取变更文件列表和详细内容）
3. 问题定位（关联分析变更内容与问题描述）
4. 提供修复方案（详细的修复步骤和代码示例）
5. 风险评估（评估修复的影响范围）

**重要提示**：
- 修复方案必须基于实际的代码变更分析
- 需要提供详细的问题定位过程
- 修复方案要包含具体的代码修改示例
- 必须评估修复可能带来的影响

现在，请告诉我你遇到的问题描述，我会帮你分析并提供修复方案。`,
              },
            },
          ],
        };
      } catch {
        // 如果无法读取工作流程文件，使用简化的内联工作流程
        return { 
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `# 迭代测试工作流

我会帮助你在迭代开发的提测阶段分析代码变更并修复问题。

## 工作流程

### 1. 确认环境信息
- 获取当前分支：\`git branch --show-current\`
- 确认基线分支（默认 master）
- 确认问题描述

### 2. 分析代码变更
- 获取变更文件：\`git diff --name-status <基线分支>...<当前分支>\`
- 查看详细变更：\`git diff <基线分支>...<当前分支> -- <文件路径>\`
- 识别与问题相关的关键变更

### 3. 问题定位
- 分析变更内容与问题的关联性
- 确定问题根因
- 定位具体的问题代码

### 4. 提供修复方案
- 详细的修复步骤
- 具体的代码修改示例
- 修复验证方法

### 5. 风险评估
- 影响范围分析
- 回归测试建议

## 开始使用

请提供以下信息：
1. **问题描述**（必需）：详细描述测试中发现的问题
2. **迭代分支**（可选）：默认为当前分支
3. **基线分支**（可选）：默认为 master

示例：
\`\`\`
问题描述: 用户登录后，个人中心页面显示的用户名为空
迭代分支: feature/user-center-optimization
基线分支: master
\`\`\`

请告诉我你的问题描述，我会开始分析！`,
              },
            },
          ],
        };
      }
    },
  );
}
