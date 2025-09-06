
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

## 🔄 并行工作流管理 (新增功能)

本节提供管理多个并行 Worktree 的高级功能，支持同时处理多个任务。

### 📋 Worktree 管理命令

#### 列出所有活跃的 Worktree
```bash
echo "📋 当前所有 Worktree:"
git worktree list --porcelain | while IFS= read -r line; do
    if [[ $line == worktree* ]]; then
        path=${line#worktree }
        echo "📁 路径: $path"
    elif [[ $line == branch* ]]; then
        branch=${line#branch refs/heads/}
        echo "🌿 分支: $branch"
    elif [[ $line == HEAD* ]]; then
        commit=${line#HEAD }
        echo "📝 提交: $commit"
        echo "---"
    fi
done
```

#### 快速切换 Worktree
```bash
# 定义切换函数
switch_worktree() {
    local target_name="$1"
    local worktree_path=$(git worktree list | grep "$target_name" | awk '{print $1}')
    
    if [ -n "$worktree_path" ]; then
        cd "$worktree_path"
        echo "✅ 已切换到 Worktree: $target_name"
        echo "📍 当前位置: $(pwd)"
        echo "🌿 当前分支: $(git branch --show-current)"
    else
        echo "❌ 未找到 Worktree: $target_name"
        echo "📋 可用的 Worktree:"
        git worktree list
    fi
}

# 使用示例
# switch_worktree "fix-button-no-response"
```

#### 批量清理已完成的 Worktree
```bash
cleanup_merged_worktrees() {
    echo "🧹 开始批量清理已合并的 Worktree..."
    
    # 获取当前主分支名
    local main_branch=$(git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@')
    
    git worktree list --porcelain | while IFS= read -r line; do
        if [[ $line == worktree* ]]; then
            worktree_path=${line#worktree }
        elif [[ $line == branch* ]]; then
            branch_name=${line#branch refs/heads/}
            
            # 检查分支是否已合并到主分支
            if git merge-base --is-ancestor "$branch_name" "$main_branch" 2>/dev/null; then
                echo "🗑️ 清理已合并的 Worktree: $worktree_path (分支: $branch_name)"
                git worktree remove "$worktree_path" --force
                git branch -d "$branch_name" 2>/dev/null
            fi
        fi
    done
    
    echo "✅ 批量清理完成"
}
```

### 🎯 任务状态管理

#### 创建任务状态跟踪文件
```bash
# 在每个 worktree 中创建任务状态文件
create_task_status() {
    local task_desc="$1"
    local base_branch="$2"
    local status_file=".task-status.md"
    
    cat > "$status_file" << EOF
# 任务状态跟踪

## 基本信息
- **任务描述**: $task_desc
- **基线分支**: $base_branch
- **创建时间**: $(date '+%Y-%m-%d %H:%M:%S')
- **工作区路径**: $(pwd)
- **当前分支**: $(git branch --show-current)

## 进度状态
- [ ] 环境准备完成
- [ ] 需求分析完成  
- [ ] 代码实现完成
- [ ] 测试验证完成
- [ ] 代码审查完成
- [ ] 准备合并

## 注意事项
- 
- 

## 相关链接
- Pull Request: 
- Issue: 
- 文档: 
EOF

    echo "📝 任务状态文件已创建: $status_file"
}
```

#### 查看所有任务状态
```bash
view_all_task_status() {
    echo "📊 所有活跃任务状态:"
    echo "========================"
    
    git worktree list | while read worktree_info; do
        worktree_path=$(echo "$worktree_info" | awk '{print $1}')
        branch_name=$(echo "$worktree_info" | awk '{print $2}' | sed 's/\[//;s/\]//')
        
        if [ -f "$worktree_path/.task-status.md" ]; then
            echo "📁 Worktree: $(basename $worktree_path)"
            echo "🌿 分支: $branch_name"
            
            # 提取任务描述
            task_desc=$(grep "任务描述" "$worktree_path/.task-status.md" | cut -d':' -f2- | xargs)
            echo "📋 任务: $task_desc"
            
            # 统计完成的任务
            total_tasks=$(grep -c "- \[" "$worktree_path/.task-status.md")
            completed_tasks=$(grep -c "- \[x\]" "$worktree_path/.task-status.md")
            echo "📈 进度: $completed_tasks/$total_tasks"
            
            echo "---"
        fi
    done
}
```

### 🔧 高级工作流操作

#### 任务暂停与恢复
```bash
# 暂停当前任务
pause_task() {
    local reason="$1"
    
    echo "⏸️ 暂停当前任务..."
    
    # 保存当前工作状态
    git add . 2>/dev/null
    git stash push -m "Pause task: $reason ($(date '+%Y-%m-%d %H:%M:%S'))"
    
    # 更新状态文件
    if [ -f ".task-status.md" ]; then
        echo "- ⏸️ 任务暂停: $reason ($(date '+%Y-%m-%d %H:%M:%S'))" >> .task-status.md
    fi
    
    echo "✅ 任务已暂停，工作状态已保存"
    echo "🔄 恢复命令: git stash pop"
}

# 恢复暂停的任务
resume_task() {
    echo "▶️ 恢复任务..."
    
    # 恢复工作状态
    git stash pop
    
    if [ $? -eq 0 ]; then
        echo "✅ 任务已恢复"
        
        # 更新状态文件
        if [ -f ".task-status.md" ]; then
            echo "- ▶️ 任务恢复: $(date '+%Y-%m-%d %H:%M:%S')" >> .task-status.md
        fi
    else
        echo "❌ 任务恢复失败，请检查暂存状态"
        git stash list
    fi
}
```

#### 任务优先级调整
```bash
# 设置任务优先级（通过分支命名前缀）
set_task_priority() {
    local priority="$1"  # high, medium, low
    local current_branch=$(git branch --show-current)
    local new_branch
    
    case "$priority" in
        "high")
            new_branch="urgent/${current_branch#*/}"
            ;;
        "medium")
            new_branch="normal/${current_branch#*/}"
            ;;
        "low")
            new_branch="later/${current_branch#*/}"
            ;;
        *)
            echo "❌ 无效的优先级: $priority (支持: high, medium, low)"
            return 1
            ;;
    esac
    
    echo "🔄 调整任务优先级为: $priority"
    git branch -m "$current_branch" "$new_branch"
    echo "✅ 分支已重命名: $current_branch → $new_branch"
}
```

## ⚡ 快速命令参考

### 日常操作快捷命令
```bash
# 快速创建新的开发任务
alias new-task='function _new_task() { 
    local desc="$1"
    local base="${2:-develop}"
    local name=$(echo "$desc" | tr "[:upper:]" "[:lower:]" | tr " " "-" | tr -cd "[:alnum:]-")
    git worktree add "../$name" "$base" && cd "../$name" && git checkout -b "feature/$name"
}; _new_task'

# 快速查看所有任务状态
alias task-status='git worktree list && echo "---" && view_all_task_status'

# 快速切换到主工作区
alias main-workspace='cd $(git rev-parse --show-toplevel)'

# 快速清理已合并的分支和 worktree
alias cleanup='cleanup_merged_worktrees'
```

### 使用示例
```bash
# 创建新任务
new-task "修复登录问题" "main"

# 查看所有任务
task-status

# 暂停当前任务
pause_task "需要等待 API 文档"

# 切换到其他任务
switch_worktree "fix-login-issue"

# 恢复之前的任务
resume_task

# 设置高优先级
set_task_priority "high"

# 批量清理
cleanup
```

-----

## ⚙️ 工作流执行步骤

### 阶段 0: 预检查和环境验证 (新增)

**目标**: 确保环境满足工作流程要求，避免中途出错。

1.  **Git 环境检查**:

    ```bash
    # 检查是否在 Git 仓库中
    git rev-parse --git-dir >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "❌ 错误: 当前目录不是 Git 仓库"
        exit 1
    fi
    
    # 检查工作区状态
    git status --porcelain
    if [ -n "$(git status --porcelain)" ]; then
        echo "⚠️ 警告: 当前工作区有未提交的变更，建议先提交或暂存"
        git status
    fi
    ```

2.  **基线分支验证**:

    ```bash
    # 检查基线分支是否存在（本地或远程）
    git show-ref --verify --quiet refs/heads/qa || \
    git show-ref --verify --quiet refs/remotes/origin/qa
    if [ $? -ne 0 ]; then
        echo "❌ 错误: 基线分支 'qa' 不存在"
        echo "可用分支列表："
        git branch -a
        exit 1
    fi
    ```

3.  **现有 Worktree 检查**:

    ```bash
    # 列出现有的 worktree
    echo "📋 当前活跃的 Worktree："
    git worktree list
    
    # 检查是否存在同名工作区
    if [ -d "../fix-button-no-response" ]; then
        echo "⚠️ 警告: 目标工作区目录已存在"
        echo "选项："
        echo "1. 选择不同的工作区名称"
        echo "2. 清理现有工作区: git worktree remove ../fix-button-no-response"
        echo "3. 重用现有工作区（需要手动检查状态）"
    fi
    ```

### 阶段 1: 环境准备 (创建 Worktree)

**目标**: 基于用户指定的基线分支，在项目父目录创建一个独立的、干净的工作区。

1.  **解析用户输入**:

      * **任务**: `修复按钮点击没反应`
      * **基线分支**: `qa`

2.  **生成工作区名称**:

      * 根据任务描述生成一个语义化的短横线命名 (`kebab-case`)。
      * 添加时间戳避免冲突: `fix-button-no-response-$(date +%m%d-%H%M)`
      * `修复按钮点击没反应` -\> `fix-button-no-response` 或 `fix-button-no-response-1206-1430`

3.  **执行 `git worktree` 命令**:

    ```bash
    # 在当前目录的上一级创建名为 'fix-button-no-response' 的工作区，并检出 'qa' 分支
    WORKTREE_NAME="fix-button-no-response"
    BASE_BRANCH="qa"
    
    # 如果基线分支不在本地，先获取
    if ! git show-ref --verify --quiet refs/heads/$BASE_BRANCH; then
        echo "📥 获取远程分支 $BASE_BRANCH..."
        git fetch origin $BASE_BRANCH:$BASE_BRANCH
    fi
    
    # 创建 worktree
    git worktree add ../$WORKTREE_NAME $BASE_BRANCH
    
    # 验证创建成功
    if [ $? -eq 0 ]; then
        echo "✅ Worktree 创建成功: ../$WORKTREE_NAME"
        echo "📁 工作区路径: $(pwd)/../$WORKTREE_NAME"
    else
        echo "❌ Worktree 创建失败"
        exit 1
    fi
    ```

    > **说明**: 此操作为你创建了一个全新的工作目录，与当前工作区完全隔离，但共享同一个 Git 仓库历史。

### 阶段 2: 分支隔离 (创建需求分支)

**目标**: 在新的 Worktree 中，为本次需求创建一个专门的分支，以隔离变更。

1.  **进入 Worktree 目录**:

    ```bash
    cd ../$WORKTREE_NAME
    
    # 验证当前位置和分支状态
    echo "📍 当前位置: $(pwd)"
    echo "🌿 当前分支: $(git branch --show-current)"
    echo "📊 工作区状态:"
    git status --short
    ```

2.  **创建并切换到需求分支**:

      * 根据任务类型和描述，创建分支名，格式为 `[type]/[short-description]`。
      * 支持的分支类型:
        - `修复` → `hotfix/` 或 `fix/`
        - `功能` → `feature/` 或 `feat/`
        - `重构` → `refactor/`
        - `文档` → `docs/`
        - `测试` → `test/`
      * 示例:
        - `修复: 按钮点击没反应` → `hotfix/button-click-fix`
        - `功能: 开发用户登录页面` → `feature/user-login-page`
        - `重构: 优化支付模块性能` → `refactor/payment-performance`

    ```bash
    # 基于当前分支（qa）创建新的需求分支
    TASK_TYPE="hotfix"  # 根据任务类型确定
    BRANCH_NAME="$TASK_TYPE/button-click-fix"
    
    # 检查分支名是否已存在
    if git show-ref --verify --quiet refs/heads/$BRANCH_NAME; then
        echo "⚠️ 警告: 分支 '$BRANCH_NAME' 已存在"
        echo "选项："
        echo "1. 使用不同的分支名称"
        echo "2. 删除现有分支: git branch -D $BRANCH_NAME"
        echo "3. 切换到现有分支: git checkout $BRANCH_NAME"
    else
        git checkout -b $BRANCH_NAME
        echo "✅ 分支创建成功: $BRANCH_NAME"
    fi
    
    # 确保分支与远程基线分支同步
    git fetch origin $BASE_BRANCH
    if ! git merge-base --is-ancestor origin/$BASE_BRANCH HEAD; then
        echo "🔄 更新分支以同步远程基线分支..."
        git merge origin/$BASE_BRANCH --no-edit
    fi
    ```

    > **说明**: 所有代码修改都将在此分支进行，不会污染基线分支。分支名遵循团队约定，便于识别和管理。

### 阶段 3: 需求实现与变更确认

**目标**: 完成编码任务，并将最终的变更内容呈现给用户，等待确认。

1.  **实现需求**:

      * (此步骤为实际的编码工作)
      * ...进行代码修改、添加、删除等操作...
      * 例如: `vim src/components/MyButton.jsx`
      * **建议**: 阶段性提交，便于回滚和追踪变更历史

2.  **代码质量检查** (新增):

    ```bash
    # 运行代码检查工具（如果项目配置了）
    if [ -f "package.json" ] && grep -q "lint" package.json; then
        echo "🔍 运行代码检查..."
        npm run lint 2>/dev/null || echo "⚠️ 代码检查工具未配置或执行失败"
    fi
    
    # 运行测试（如果项目配置了）
    if [ -f "package.json" ] && grep -q "test" package.json; then
        echo "🧪 运行相关测试..."
        npm test 2>/dev/null || echo "⚠️ 测试未配置或执行失败"
    fi
    ```

3.  **提交变更**:

    ```bash
    # 检查变更内容
    echo "📝 当前变更内容:"
    git status
    git diff --stat
    
    # 智能暂存变更
    git add .
    
    # 生成符合规范的提交信息
    COMMIT_MSG="Fix: 修复按钮点击事件未触发的问题"
    
    # 提交变更
    git commit -m "$COMMIT_MSG"
    
    # 验证提交成功
    if [ $? -eq 0 ]; then
        echo "✅ 变更已提交"
        echo "📊 提交信息: $COMMIT_MSG"
        echo "🔍 提交 Hash: $(git rev-parse --short HEAD)"
    else
        echo "❌ 提交失败，请检查错误信息"
        exit 1
    fi
    ```

4.  **生成变更预览 (Diff)**:

    ```bash
    echo "📋 生成变更预览..."
    
    # 显示当前分支相较于基线分支的所有变更
    echo "🔍 变更统计:"
    git diff --stat $BASE_BRANCH...HEAD
    
    echo ""
    echo "📄 详细变更内容:"
    git diff $BASE_BRANCH...HEAD
    
    # 生成变更摘要
    echo ""
    echo "📊 变更摘要:"
    echo "- 基线分支: $BASE_BRANCH"
    echo "- 当前分支: $(git branch --show-current)"
    echo "- 变更文件数: $(git diff --name-only $BASE_BRANCH...HEAD | wc -l)"
    echo "- 新增行数: $(git diff --numstat $BASE_BRANCH...HEAD | awk '{add+=$1} END {print add+0}')"
    echo "- 删除行数: $(git diff --numstat $BASE_BRANCH...HEAD | awk '{del+=$2} END {print del+0}')"
    ```

5.  🛑 **等待用户确认**:

      * **输出**: (上面命令产生的 diff 内容和变更摘要)
      * **提问**: "以上是相较于 `$BASE_BRANCH` 分支的所有代码变更，请确认是否符合预期？"
      * **选项**: 
        - "是" 或 "Yes" → 继续到阶段 4
        - "否" 或 "No" → 返回修改代码
        - "查看详细" → 显示更详细的 diff 信息
        - "暂存" → 暂停流程，保留工作区状态

### 阶段 4: 合并与清理

**目标**: 在用户确认后，将代码安全地合并到基线分支，并清理本次任务创建的临时环境。

1.  **[当用户确认为 '是' 或 'Yes' 后执行]**

2.  **预合并检查** (新增):

    ```bash
    echo "🔍 执行预合并检查..."
    
    # 检查基线分支是否有新的更新
    git fetch origin $BASE_BRANCH
    BEHIND_COUNT=$(git rev-list --count HEAD..origin/$BASE_BRANCH)
    
    if [ $BEHIND_COUNT -gt 0 ]; then
        echo "⚠️ 警告: 基线分支有 $BEHIND_COUNT 个新提交"
        echo "建议先合并最新变更:"
        echo "git merge origin/$BASE_BRANCH --no-edit"
        
        # 自动尝试合并
        git merge origin/$BASE_BRANCH --no-edit
        if [ $? -ne 0 ]; then
            echo "❌ 自动合并失败，存在冲突"
            echo "请手动解决冲突后再继续"
            echo "🔧 冲突解决步骤:"
            echo "1. 编辑冲突文件"
            echo "2. git add <解决冲突的文件>"
            echo "3. git commit"
            echo "4. 重新运行合并流程"
            exit 1
        fi
    fi
    ```

3.  **合并代码到基线分支**:

    ```bash
    # 1. 切换回基线分支
    git checkout $BASE_BRANCH
    
    # 验证当前分支
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "$BASE_BRANCH" ]; then
        echo "❌ 错误: 未能切换到基线分支 $BASE_BRANCH"
        exit 1
    fi
    
    echo "✅ 已切换到基线分支: $BASE_BRANCH"
    
    # 2. 确保基线分支是最新的
    git pull origin $BASE_BRANCH --no-edit
    
    # 3. 合并需求分支，--no-ff 保留合并记录，使历史更清晰
    echo "🔄 合并分支 $BRANCH_NAME 到 $BASE_BRANCH..."
    git merge --no-ff $BRANCH_NAME -m "Merge $BRANCH_NAME into $BASE_BRANCH"
    
    if [ $? -eq 0 ]; then
        echo "✅ 分支合并成功"
    else
        echo "❌ 分支合并失败"
        echo "🔧 可能的解决方案:"
        echo "1. 检查是否存在冲突"
        echo "2. 手动解决冲突后重试"
        echo "3. 使用 git merge --abort 取消合并"
        exit 1
    fi
    
    # 4. 推送到远程仓库
    echo "📤 推送更新到远程仓库..."
    git push origin $BASE_BRANCH
    
    if [ $? -eq 0 ]; then
        echo "✅ 推送成功"
        echo "🔗 远程分支已更新: origin/$BASE_BRANCH"
    else
        echo "❌ 推送失败"
        echo "🔧 可能的解决方案:"
        echo "1. 检查网络连接"
        echo "2. 确认推送权限"
        echo "3. 手动执行: git push origin $BASE_BRANCH"
        # 不退出，允许继续清理
    fi
    ```

4.  **清理环境**:

    ```bash
    echo "🧹 开始清理工作环境..."
    
    # 1. 返回到项目的主工作区目录
    cd ../$(basename $(git rev-parse --show-toplevel))
    
    echo "📍 已返回主工作区: $(pwd)"
    
    # 2. 安全地移除 worktree 目录及其 Git 管理信息
    echo "🗑️ 移除 Worktree: $WORKTREE_NAME"
    git worktree remove $WORKTREE_NAME --force
    
    if [ $? -eq 0 ]; then
        echo "✅ Worktree 已移除"
    else
        echo "⚠️ Worktree 移除失败，可能需要手动清理"
        echo "手动清理命令: git worktree remove $WORKTREE_NAME --force"
    fi
    
    # 3. 删除已合并的本地需求分支
    echo "🗑️ 清理本地分支: $BRANCH_NAME"
    git branch -d $BRANCH_NAME 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ 本地分支已删除"
    else
        echo "💡 本地分支保留（可能包含未推送的提交或未完全合并）"
        echo "如需强制删除: git branch -D $BRANCH_NAME"
    fi
    
    # 4. 显示清理后状态
    echo ""
    echo "📊 清理完成后的状态:"
    echo "🌿 当前分支: $(git branch --show-current)"
    echo "📋 剩余 Worktree:"
    git worktree list
    echo "🌿 本地分支:"
    git branch
    ```

5.  **任务完成总结** (新增):

    ```bash
    echo ""
    echo "🎉 任务完成总结:"
    echo "✅ 任务: $TASK_DESCRIPTION"
    echo "🎯 基线分支: $BASE_BRANCH"
    echo "🌿 功能分支: $BRANCH_NAME (已合并并清理)"
    echo "📦 工作区: $WORKTREE_NAME (已清理)"
    echo "🔗 远程仓库: 已更新"
    echo ""
    echo "🔍 验证合并结果:"
    echo "git log --oneline -5"
    git log --oneline -5
    ```

✅ **任务完成**: 代码已合并，临时工作环境已清理。你的主工作区状态未受任何干扰。

---

## 🛠️ 故障排除和恢复

### 常见问题处理

#### 1. Worktree 创建失败
```bash
# 检查是否存在同名目录
ls -la ../fix-button-no-response

# 清理遗留的 worktree 记录
git worktree prune

# 强制删除目录后重试
rm -rf ../fix-button-no-response
git worktree add ../fix-button-no-response qa
```

#### 2. 分支合并冲突
```bash
# 查看冲突文件
git status

# 手动解决冲突后
git add <冲突文件>
git commit -m "Resolve merge conflicts"

# 继续合并流程
git merge --continue
```

#### 3. 推送失败
```bash
# 检查远程仓库状态
git remote -v
git fetch origin

# 如果远程分支有新提交
git pull origin qa --rebase
git push origin qa
```

#### 4. 工作区意外中断
```bash
# 列出所有 worktree
git worktree list

# 手动清理特定 worktree
git worktree remove <worktree-name> --force

# 如果目录仍存在
rm -rf ../<worktree-name>
git worktree prune
```

### 紧急恢复流程

#### 如果需要紧急回滚合并
```bash
# 查看最近的合并提交
git log --oneline --merges -5

# 回滚到合并前状态
git reset --hard HEAD~1

# 强制推送（谨慎使用）
git push --force-with-lease origin qa
```

#### 保存未完成的工作
```bash
# 暂存当前工作
git stash push -m "Work in progress on task: 修复按钮点击没反应"

# 查看暂存列表
git stash list

# 恢复暂存的工作
git stash pop
```