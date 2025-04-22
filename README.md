# MCP Logger TypeScript实现

这是一个用TypeScript实现的MCP日志工具，它可以包装任何命令，记录标准输入/输出/错误信息，同时将它们传递给原始命令。

## 功能特点

- 执行任何命令并透明地传递输入输出
- 记录所有标准输入/输出/错误到日志文件
- 以原始命令的退出代码退出
- 处理非UTF-8数据
- 处理进程信号

## 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/mcp-confluence.git
cd mcp-confluence

# 安装依赖
npm install

# 编译TypeScript
npm run build
```

## 使用方法

```bash
# 基本使用方式
npm start <command> [args...]

# 例如
npm start ls -la

# 或者直接使用编译后的JavaScript
node dist/mcp_logger.js ls -la

# 开发模式下运行(直接使用TypeScript)
npm run dev ls -la
```

## 日志文件

所有输入输出将被记录到`mcp_io.log`文件中，该文件位于项目根目录。

## 环境要求

- Node.js 14+
- TypeScript 4.7+