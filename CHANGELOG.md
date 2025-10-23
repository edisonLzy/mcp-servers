# Changelog

## [0.5.0] - 2025-10-23

### Features

- test release (267baa5)

### Bug Fixes

- **feishu-mcp**: 修复 createDocumentBlocks 超过 50 个 blocks 创建失败问题 (c68d2a9)

## [0.4.0] - 2025-09-27

### Features

- **feishu-mcp**: 增加学习笔记整理和英语语法分析工作流 (ee1ba2a)
- **feishu-mcp**: 更新每日笔记工作流，优化执行步骤和输出格式 (ae0516d)
- **mcp-servers**: 新增 xlsx-mcp 服务器和需求管理 prompts (4a8d28a)

### Bug Fixes

- **cli**: update version retrieval to use package.json (38a3a97)

## [0.3.0] - 2025-09-25

### Features

- **feishu-mcp**: 优化 Daily Note 工作流并集成 MCP 配置 (4c1b602)
- **feishu-mcp**: 新增 prompts 功能和 Daily Note 汇总工作流 (d554e24)

## [0.2.0] - 2025-09-23

### Features

- **feishu-mcp**: 新增画板节点管理工具 (52308cb)
- add mcp config (e97d78b)
- **scripts**: 在CI环境下通过 NODE_AUTH_TOKEN 跳过 npm 登录检查 (428b7f1)

## [0.1.2] - 2025-08-28

### Bug Fixes

- **release**: update release script path in GitHub Actions workflow (119c61d)
- **feishu-mcp**: update OAuthServer authorization logic and add offline access scope (52b5775)

## [0.1.1] - 2025-08-27

### Features

- **ci**: integrate GitHub Actions auto-release with enhanced release script (d3c94e1)
- **scripts**: add automated release script with simple-git style API (7b9b131)
- **WIP**: refactor (3e47b27)
- 添加统一日志系统和配置管理，优化运行架构 (e97366f)
- **feishu-mcp**: update entry path and add command configuration (25d15a0)
- **docx**: make block_id optional in createDocumentBlocks (1cd50bf)
- **feishu**: todo 统一移除消息处理. createDocumentBlocksSchema block_id参数调整 (ee607b7)
- 添加飞书多维表格和 Wiki 节点信息工具 (3d83864)
- **feishu-mcp**: 添加 Wiki 文档搜索功能 (b9a9f3b)
- **prompts**: add Git Commit Workflow prompt and documentation (fe0347f)
- **prompts**: add git commit workflow (5d7ccee)
- **feishu-mcp**: add document blocks creation tools and documentation (319a598)
- **feishu-client**: update API endpoint for content conversion (f982e50)
- add Git Worktree development prompt and workflow documentation (cda8e95)
- **wiki**: WIP create document blocks (f2f6438)
- **wiki**: create docx (d899a97)
- **wiki**: 新增获取文档节点内容的工具 (e525550)
- **wiki**: 调整 createNode tools参数 (7674222)
- remove unused mcp (5d9f165)
- enhance gh-code-review workflow to output MR URL and overview (aca3b5c)
- enhance gh-code-review prompt with dynamic workflow path resolution (fe5b3e5)
- add settings configuration for prompts MCP server (23106d0)
- add gh workflows (519e693)
- init (7239968)
- **mcp-server-generator**: add MCP server generation rule with comprehensive templates (492c74e)
- **mcp-server-generator**: enhance MCP server generation rules with tools and prompts support (6064bec)
- add core dependency to Confluence and Feishu MCP packages, enhance CLI environment variable checks (2b02d9f)
- update commander dependency to version 14.0.0 and enhance MCP server installation commands (d2fef1b)
- **core**: enhance MCP server installation utilities and add authentication support (404241e)
- **figma-mcp**: add Figma MCP server with CLI and API integration (8883a59)
- **weapons-mcp**: 移除 WEAPONS_API_BASE_URL 常量并更新配置逻辑 (8eae614)
- **weapons-mcp**: 增加获取单个接口详细信息的功能 (0f51e11)
- 更新 pnpm-lock.yaml 文件，升级多个依赖项版本，包括 @commitlint、@eslint、@typescript-eslint 等，新增 weapons-mcp 包及其依赖，确保项目依赖的最新性和兼容性。 (b719e51)
- **husky**: add commit-msg and pre-commit hooks for linting (d94ac26)
- **feishu-mcp**: implement install command for MCP server configuration (18c9d91)
- **feishu-mcp**: add whoami command to display current user information (332f258)
- **feishu**: add feishu mcp (364e2f6)
- 调整prompt (4ef4557)
- rename cli -> core (5a66e39)
- **WIP**: add cli pkg (04124a4)
- 添加 mcp-server cursor rule (85b1585)
- 添加 confluence mcp server (76ac793)
- 调整项目结构 (0414867)
- init (ed10eea)
- add 调试日志 (988b133)
- demo (e47ef5a)
- init (60cb216)
- demo (503374c)

### Bug Fixes

- **release**: specify npm registry in authentication check (0c8eff2)
- **feishu-mcp**: listSpaces改为content\n\n- listSpaces返回调整为content文本，符合MCP工具输出\n- 将CallToolResult导入从sdk/types改为sdk/types.d.ts修复类型问题 (1580621)
- resolve ESLint issues across MCP servers (aba5f0a)
- **feishu-mcp**: 修复 install.ts 文件中的配置项命名错误 (9cd2084)
- update server tool registration method and correct import path for runAction (bab0266)

