
# 🚀 MCP-Prompt: Git Worktree 高效需求处理工作流

本工作流旨在通过 `git worktree` 实现零成本的上下文切换，以标准、清晰的流程处理新的开发需求或 Bug 修复，并通过变更集确认（diff）确保操作的准确性。

## 📝 输入格式

请使用以下格式清晰地描述你的需求，**必须包含任务描述和基线分支**。

**格式模板：**
`[任务类型]: [任务简短描述], 基于 [基线分支]`

**示例：**

  * `修复: 按钮点击没反应, 基于 qa`
  * `功能: 开发用户登录页面, 基于 develop`
  * `重构: 优化支付模块性能, 基于 main`

-----

## ⚙️ 工作流执行步骤

### 阶段 1: 环境准备 (创建 Worktree)

**目标**: 基于用户指定的基线分支，在项目父目录创建一个独立的、干净的工作区。

1.  **解析用户输入**:

      * **任务**: `修复按钮点击没反应`
      * **基线分支**: `qa`

2.  **生成工作区名称**:

      * 根据任务描述生成一个语义化的短横线命名 (`kebab-case`)。
      * `修复按钮点击没反应` -\> `fix-button-no-response`

3.  **执行 `git worktree` 命令**:

    ```bash
    # 在当前目录的上一级创建名为 'fix-button-no-response' 的工作区，并检出 'qa' 分支
    git worktree add ../fix-button-no-response qa
    ```

    > **说明**: 此操作为你创建了一个全新的工作目录，与当前工作区完全隔离，但共享同一个 Git 仓库历史。

### 阶段 2: 分支隔离 (创建需求分支)

**目标**: 在新的 Worktree 中，为本次需求创建一个专门的分支，以隔离变更。

1.  **进入 Worktree 目录**:

    ```bash
    cd ../fix-button-no-response
    ```

2.  **创建并切换到需求分支**:

      * 根据任务类型和描述，创建分支名，格式为 `[type]/[short-description]`。
      * `修复: 按钮点击没反应` -\> `hotfix/button-click-fix`
      * `功能: 开发用户登录页面` -\> `feature/user-login-page`

    <!-- end list -->

    ```bash
    # 基于当前分支（qa）创建新的需求分支
    git checkout -b hotfix/button-click-fix
    ```

    > **说明**: 所有代码修改都将在此分支进行，不会污染基线分支。

### 阶段 3: 需求实现与变更确认

**目标**: 完成编码任务，并将最终的变更内容呈现给用户，等待确认。

1.  **实现需求**:

      * (此步骤为实际的编码工作)
      * ...进行代码修改、添加、删除等操作...
      * 例如: `vim src/components/MyButton.jsx`

2.  **提交变更**:

    ```bash
    git add .
    git commit -m "Fix: 修复按钮点击事件未触发的问题"
    ```

3.  **生成变更预览 (Diff)**:

    ```bash
    # 显示当前分支 (hotfix/button-click-fix) 相较于基线分支 (qa) 的所有变更
    git diff qa...hotfix/button-click-fix
    ```

4.  🛑 **等待用户确认**:

      * **输出**: (上面命令产生的 diff 内容)
      * **提问**: "以上是相较于 `qa` 分支的所有代码变更，请确认是否符合预期？"

### 阶段 4: 合并与清理

**目标**: 在用户确认后，将代码安全地合并到基线分支，并清理本次任务创建的临时环境。

1.  **[当用户确认为 '是' 或 'Yes' 后执行]**

2.  **合并代码到基线分支**:

    ```bash
    # 1. 切换回基线分支 'qa'
    git checkout qa

    # 2. 合并需求分支，--no-ff 保留合并记录，使历史更清晰
    git merge --no-ff hotfix/button-click-fix

    # 3. 将更新后的 'qa' 分支推送到远程仓库
    git push origin qa
    ```

3.  **清理环境**:

    ```bash
    # 1. 返回到项目的主工作区目录
    cd ../my-original-project-directory

    # 2. 安全地移除 worktree 目录及其 Git 管理信息
    git worktree remove fix-button-no-response

    # 3. (可选) 删除已合并的本地需求分支
    git branch -d hotfix/button-click-fix
    ```

✅ **任务完成**: 代码已合并，临时工作环境已清理。你的主工作区状态未受任何干扰。