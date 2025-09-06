import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

describe('Git Worktree Workflow', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  it('should have enhanced workflow markdown file', async () => {
    const workflowPath = path.join(__dirname, '../src/mcp-servers/prompts-mcp/workflows/git-worktree-development.md');
    const content = await readFile(workflowPath, 'utf-8');
    
    // Check for new enhanced sections
    expect(content).toContain('阶段 0: 预检查和环境验证');
    expect(content).toContain('并行工作流管理');
    expect(content).toContain('故障排除和恢复');
    expect(content).toContain('快速命令参考');
    
    // Check for enhanced error handling
    expect(content).toContain('预合并检查');
    expect(content).toContain('代码质量检查');
    expect(content).toContain('任务完成总结');
    
    // Check for parallel workflow features
    expect(content).toContain('Worktree 管理命令');
    expect(content).toContain('任务状态管理');
    expect(content).toContain('高级工作流操作');
  });

  it('should validate workflow structure and completeness', async () => {
    const workflowPath = path.join(__dirname, '../src/mcp-servers/prompts-mcp/workflows/git-worktree-development.md');
    const content = await readFile(workflowPath, 'utf-8');
    
    // Check that all stages are present
    const stages = [
      '阶段 0: 预检查和环境验证',
      '阶段 1: 环境准备',
      '阶段 2: 分支隔离',
      '阶段 3: 需求实现与变更确认',
      '阶段 4: 合并与清理'
    ];
    
    stages.forEach(stage => {
      expect(content).toContain(stage);
    });
    
    // Check for critical workflow elements
    expect(content).toContain('git worktree add');
    expect(content).toContain('git checkout -b');
    expect(content).toContain('git merge --no-ff');
    expect(content).toContain('git worktree remove');
  });

  it('should include proper error handling scenarios', async () => {
    const workflowPath = path.join(__dirname, '../src/mcp-servers/prompts-mcp/workflows/git-worktree-development.md');
    const content = await readFile(workflowPath, 'utf-8');
    
    // Check for common error scenarios
    const errorScenarios = [
      'Worktree 创建失败',
      '分支合并冲突',
      '推送失败',
      '工作区意外中断'
    ];
    
    errorScenarios.forEach(scenario => {
      expect(content).toContain(scenario);
    });
    
    // Check for recovery procedures
    expect(content).toContain('紧急恢复流程');
    expect(content).toContain('git stash');
    expect(content).toContain('git reset');
  });

  it('should include parallel workflow management features', async () => {
    const workflowPath = path.join(__dirname, '../src/mcp-servers/prompts-mcp/workflows/git-worktree-development.md');
    const content = await readFile(workflowPath, 'utf-8');
    
    // Check for parallel workflow features
    const parallelFeatures = [
      'switch_worktree',
      'cleanup_merged_worktrees',
      'create_task_status',
      'view_all_task_status',
      'pause_task',
      'resume_task'
    ];
    
    parallelFeatures.forEach(feature => {
      expect(content).toContain(feature);
    });
    
    // Check for quick commands
    expect(content).toContain('快速命令参考');
    expect(content).toContain('alias new-task');
    expect(content).toContain('alias task-status');
  });

  it('should have enhanced prompt schema with new options', async () => {
    const promptPath = path.join(__dirname, '../src/mcp-servers/prompts-mcp/prompts/git-worktree-development.ts');
    const content = await readFile(promptPath, 'utf-8');
    
    // Check for enhanced schema options
    expect(content).toContain('priority');
    expect(content).toContain('enableAdvancedFeatures');
    expect(content).toContain('文档');
    expect(content).toContain('测试');
    
    // Check for branch prefix logic
    expect(content).toContain('getBranchPrefix');
    expect(content).toContain('getPriorityPrefix');
    
    // Check for advanced features support
    expect(content).toContain('增强模式');
    expect(content).toContain('并行工作流支持');
  });

  it('should provide proper branch naming conventions', async () => {
    const promptPath = path.join(__dirname, '../src/mcp-servers/prompts-mcp/prompts/git-worktree-development.ts');
    const content = await readFile(promptPath, 'utf-8');
    
    // Check for task type to branch prefix mapping
    const mappings = [
      ['功能', 'feature'],
      ['修复', 'fix'],
      ['重构', 'refactor'],
      ['文档', 'docs'],
      ['测试', 'test']
    ];
    
    mappings.forEach(([taskType, prefix]) => {
      expect(content).toContain(`'${taskType}': return '${prefix}'`);
    });
    
    // Check for priority prefix mapping
    const priorityMappings = [
      ['高', 'urgent'],
      ['中', 'normal'],
      ['低', 'later']
    ];
    
    priorityMappings.forEach(([priority, prefix]) => {
      expect(content).toContain(`'${priority}': return '${prefix}'`);
    });
  });

  it('should include comprehensive guidance and examples', async () => {
    const workflowPath = path.join(__dirname, '../src/mcp-servers/prompts-mcp/workflows/git-worktree-development.md');
    const content = await readFile(workflowPath, 'utf-8');
    
    // Check for user guidance elements
    const guidanceElements = [
      '使用示例',
      '注意事项', 
      '选项：',
      '手动清理命令',
      '验证创建成功',
      '任务完成总结'
    ];
    
    guidanceElements.forEach(element => {
      expect(content).toContain(element);
    });
    
    // Check for practical examples
    expect(content).toContain('# 使用示例');
    expect(content).toContain('new-task');
    expect(content).toContain('task-status');
  });
});