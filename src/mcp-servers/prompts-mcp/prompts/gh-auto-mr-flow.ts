import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerGhAutoMrFlowPrompt(server: McpServer) {
  server.prompt(
    'gh-auto-mr-flow',
    'GitHub 自动 Merge Request 创建和代码审查完整工作流程',
    async () => {
      return { 
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `我需要完成一个完整的 GitHub Merge Request 工作流程，包括创建 MR 和进行代码审查。请按照以下完整工作流程指导我：

## 完整工作流程说明

这个工作流程将帮助你完成从创建 MR 到代码审查的全过程：

### 第一阶段：创建 Merge Request
首先，请使用 'gh-create-mr' prompt 来指导我完成 Merge Request 的创建过程。这个阶段包括：
1. **环境准备**：检查 GitHub CLI 安装和认证状态
2. **创建 MR**：按照标准流程创建高质量的 Merge Request
3. **获取 MR 信息**：确保获得新创建的 MR URL 和编号

### 第二阶段：代码审查
在成功创建 MR 后，请使用 'gh-code-review' prompt 来对刚创建的 MR 进行代码审查。这个阶段包括：
4. **代码审查**：对创建的 MR 进行自动化代码审查
5. **质量保证**：确保代码质量和最佳实践
6. **审查反馈**：提供详细的审查报告和改进建议

### 第三阶段：质量保证和后续操作
7. **质量验证**：确保所有检查通过，验证代码符合项目标准
8. **后续操作指导**：提供合并建议、部署流程指导和后续监控建议

## 执行指导

请按照以下步骤执行：

1. **启动创建 MR 流程**：首先使用 'gh-create-mr' prompt 的完整工作流程
2. **记录 MR 信息**：在 MR 创建成功后，记录下 MR URL 和编号
3. **启动代码审查**：使用 'gh-code-review' prompt，传入刚创建的 MR URL
4. **整合结果**：将两个阶段的结果整合，提供完整的质量报告
5. **后续指导**：基于审查结果，提供合并和部署的最终建议

请开始执行这个完整的工作流程，首先指导我完成 Merge Request 的创建！`
            },
          },
        ] 
      };
    },
  );
} 