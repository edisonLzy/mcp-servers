# 迭代需求工作区创建 Workflow

## 概述

这个工作流程用于基于排期文档创建迭代开发工作区，通过 tmux 为每个需求创建独立的开发环境，并使用 git worktree 实现零成本的上下文切换。

## 输入参数

- **排期文档地址** (`filePath`): 排期文档的绝对路径
- **迭代号** (`iteration`): 对应 Excel 文件中的 sheet 名称
- **筛选条件** (`conditions`): 需求筛选条件，使用英文逗号分隔，例如 `"FE = 李志宇, 优先级 = P0"`

## 工作流程

### 阶段 0: 环境校验

**目标**: 确保 tmux 环境可用且符合工作流要求，避免后续步骤失败

**执行步骤**:

1. **检查当前是否已在 tmux session 中**:
   ```bash
   if [ -n "$TMUX" ]; then
       echo "错误：当前已在 tmux session 中运行"
       echo "请先退出 tmux session 后重新运行此工作流"
       echo "退出命令：exit 或 Ctrl+d"
       exit 1
   fi
   ```

2. **检查 tmux 是否安装**:
   ```bash
   if ! command -v tmux &> /dev/null; then
       echo "错误：tmux 未安装"
       echo "请安装 tmux 后重新运行："
       echo "  macOS: brew install tmux"
       echo "  Ubuntu/Debian: sudo apt-get install tmux"
       echo "  CentOS/RHEL: sudo yum install tmux"
       exit 1
   fi
   ```

3. **检查 tmux 版本兼容性**:
   ```bash
   tmux_version=$(tmux -V | grep -oE '[0-9]+\.[0-9]+')
   if [ -z "$tmux_version" ]; then
       echo "错误：无法获取 tmux 版本信息"
       exit 1
   fi
   echo "✓ 检测到 tmux 版本：$tmux_version"
   ```

4. **验证必要的 tmux 功能**:
   - 测试 session 创建功能
   - 测试窗格分割功能
   - 测试命令执行功能

**成功标准**:
- 当前不在 tmux session 中
- tmux 已正确安装且版本兼容
- 所有必要功能可正常使用

---

### 阶段 1: 需求筛选

**目标**: 从排期文档中筛选出符合条件的需求

**执行步骤**:
1. 使用 xlsx-mcp 的 `get-records-from-sheet` 工具
2. 参数设置：
   - `filePath`: 使用输入的排期文档地址
   - `sheetName`: 使用输入的迭代号
   - `conditions`: 使用输入的筛选条件（逗号分隔字符串）
3. 解析返回的需求记录
4. 提取关键信息：
   - 需求名称
   - 需求ID（从PRD地址中提取）
   - PRD地址（如果有）
   - Keones地址（如果有）
   - 负责人信息
5. **需求ID提取规则**：
   - 从PRD地址中提取：
     - 匹配模式：`https://ones.ke.com/project/requirement/{需求ID}?currentKey=1`
     - 示例：`https://ones.ke.com/project/requirement/50503288?currentKey=1` → `50503288`

**输出**: 筛选后的需求列表

---

### 阶段 2: 开发仓库澄清

**目标**: 向用户确认每个需求的开发仓库信息

**执行步骤**:
1. 为每个筛选出的需求询问用户：
   - 开发仓库路径
2. 自动生成需求的英文名称摘要：
   - 将需求名称转换为英文（使用翻译或提取关键词）
   - 转换为 kebab-case 格式
   - 确保分支名称符合 Git 规范
3. 构建需求信息结构：
   ```json
   {
     "name": "需求名称",
     "id": "需求ID",
     "prd": "PRD地址",
     "keones": "Keones地址",
     "repository": "开发仓库路径",
     "englishSummary": "自动生成的英文摘要",
     "branchName": "feat/需求id/自动生成的英文摘要(kebab-case)"
   }
   ```
4. 让用户确认所有需求信息

**输出**: 完整的需求信息列表

---

### 阶段 3: 工作区规划与环境配置

**目标**: 在当前 tmux session 中为每个需求创建独立窗格，每个窗格都已自动初始化并启动 Claude

**执行步骤**:

1. **构建每个需求的系统提示符**:
   为每个需求生成包含以下信息的系统提示符：
   ```
   ## 当前开发需求

   **需求名称**: ${需求名称}
   **需求ID**: ${需求ID}
   **PRD地址**: ${PRD地址}
   **Keones地址**: ${Keones地址}
   **开发仓库**: ${开发仓库}
   **当前分支**: ${需求分支名称}
   **工作目录**: ${worktree路径}
   ```

2. **为所有需求创建新窗格**:
   对每个需求（包括第一个）执行：
   ```bash
   # 分割当前窗口创建新窗格，并直接执行完整的初始化序列
   tmux split-window "cd ${需求仓库路径} && git fetch origin && git worktree add .worktree/${需求英文名称} -b ${需求分支名称} origin/master && cd .worktree/${需求英文名称} && claude --append-system-prompt '${需求系统提示符}'"
   ```

3. **优化窗格布局**:
   ```bash
   # 自动调整所有窗格布局为网格排列
   tmux select-layout tiled
   ```

4. **窗格标记**:
   - 使用 `tmux rename-window` 为当前窗口设置迭代标识
   - 每个窗格会显示对应需求的目录路径作为标识

5. **输出窗格摘要信息**:
   ```bash
   echo "=========================================="
   echo "迭代工作区创建完成！"
   echo "=========================================="
   echo ""
   echo "📋 窗格摘要信息："
   echo ""
   printf "%-8s %-20s %-12s %-30s\n" "窗格ID" "需求名称" "需求ID" "工作目录"
   echo "----------------------------------------"

   # 为每个需求输出摘要信息
   for 需求 in ${需求列表}; do
       pane_id=$(tmux list-panes -F "#{pane_id}" | tail -n +2 | head -n 1)  # 获取对应窗格ID
       printf "%-8s %-20s %-12s %-30s\n" \
           "${pane_id}" \
           "${需求名称}" \
           "${需求ID}" \
           ".worktree/${需求英文名称}"
   done

   echo ""
   echo "🎯 快速切换指南："
   echo "  Ctrl+b + q     显示窗格编号"
   echo "  Ctrl+b + 数字  切换到指定窗格"
   echo "  Ctrl+b + 方向键 在窗格间导航"
   echo "  Ctrl+b + z     最大化/恢复当前窗格"
   echo ""
   echo "✅ 所有需求环境已就绪，可以开始开发！"
   ```

**核心优势**:
- **主窗格保持独立**: 当前窗格保持为工作流控制台，不被任何需求占用
- **统一的窗格创建**: 所有需求都通过相同的 `tmux split-window` 流程创建
- **一步到位**: 每个窗格创建时就已经完成了目录切换、git worktree 创建和 Claude 启动
- **环境隔离**: 每个需求都有独立的 git worktree 和 Claude 实例

**输出**: 在当前 tmux session 中完全配置好的多窗格工作区，主窗格作为控制台，所有需求窗格都已准备就绪

---


## 使用示例

工作流程执行完成后，您将看到类似如下的摘要信息：

```bash
==========================================
迭代工作区创建完成！
==========================================

📋 窗格摘要信息：

窗格ID   需求名称               需求ID       工作目录
----------------------------------------
%1       用户登录优化           50503288     .worktree/user-login-optimization
%2       支付流程重构           50503289     .worktree/payment-process-refactor
%3       商品搜索性能提升       50503290     .worktree/product-search-performance

🎯 快速切换指南：
  Ctrl+b + q     显示窗格编号
  Ctrl+b + 数字  切换到指定窗格
  Ctrl+b + 方向键 在窗格间导航
  Ctrl+b + z     最大化/恢复当前窗格

✅ 所有需求环境已就绪，可以开始开发！
```

### 工作区布局说明：
- **主窗格（当前）**：保持为工作流控制台，显示摘要信息
- **需求窗格**：每个需求对应一个独立的开发环境

### 每个需求窗格都已经：
1. 切换到对应的 worktree 目录
2. 启动了注入需求上下文的 Claude 实例
3. 准备好开始开发工作

### 主窗格可用于：
- 查看工作区摘要信息
- 执行跨需求的操作
- 管理整个迭代开发流程

## 错误处理

### 环境相关错误

1. **已在 tmux session 中**:
   - **错误信息**: "当前已在 tmux session 中运行"
   - **解决方案**: 使用 `exit` 或 `Ctrl+d` 退出当前 tmux session 后重新运行

2. **tmux 未安装**:
   - **错误信息**: "tmux 未安装"
   - **解决方案**: 根据操作系统安装 tmux
     - macOS: `brew install tmux`
     - Ubuntu/Debian: `sudo apt-get install tmux`
     - CentOS/RHEL: `sudo yum install tmux`

3. **tmux 版本兼容性问题**:
   - **错误信息**: "无法获取 tmux 版本信息"
   - **解决方案**: 确认 tmux 正确安装并可执行

### 数据处理错误

4. **Excel 文件读取失败**:
   - 检查文件路径是否正确
   - 确认文件权限可读
   - 验证文件格式是否为有效的 Excel 文件

5. **需求数据格式错误**:
   - 检查 sheet 名称是否存在
   - 验证筛选条件格式是否正确
   - 确认必要字段（需求名称、PRD地址等）是否存在

### 开发环境错误

6. **Git 仓库不存在**:
   - 提示用户确认仓库路径
   - 检查仓库访问权限

7. **Git worktree 创建失败**:
   - 检查分支名称是否冲突
   - 确认 Git 仓库权限
   - 验证 `.worktree` 目录是否可写

8. **Claude 启动失败**:
   - 检查 Claude 是否正确安装
   - 验证 Claude 配置是否正确
   - 确认系统提示符格式是否有效

### 窗格管理错误

9. **窗格创建失败**:
   - 验证 `tmux split-window` 命令语法是否正确
   - 检查目录路径是否存在
   - 确认当前 tmux session 状态正常

10. **窗格布局调整失败**:
    - 检查 `tmux select-layout` 命令是否可用
    - 确认窗格数量适合所选布局
