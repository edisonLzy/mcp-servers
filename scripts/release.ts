#!/usr/bin/env -S pnpx tsx

import { execSync, exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';
import inquirer from 'inquirer';
import picocolors from 'picocolors';

const execAsync = promisify(exec);

// 简化版 Git 操作，兼容 simple-git 风格的 API
const git = {
  async status() {
    const { stdout } = await execAsync('git status --porcelain');
    return {
      isClean: () => !stdout.trim(),
    };
  },

  async branch() {
    const { stdout } = await execAsync('git branch --show-current');
    return {
      current: stdout.trim(),
    };
  },

  async tags() {
    try {
      const { stdout } = await execAsync('git describe --tags --abbrev=0');
      return { latest: stdout.trim() };
    } catch {
      return { latest: null };
    }
  },

  async log(options?: { from?: string; to?: string }) {
    let command = 'git log --pretty=format:"%H|%s"';
    if (options?.from && options?.to) {
      command += ` ${options.from}..${options.to}`;
    } else if (options?.from) {
      command += ` ${options.from}..HEAD`;
    }

    const { stdout } = await execAsync(command);
    if (!stdout.trim()) {
      return { all: [] };
    }

    const commits = stdout.trim().split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [hash, message] = line.split('|');
        return { hash, message };
      });

    return { all: commits };
  },

  async add(files: string[]) {
    const relativePaths = files.map(file => path.join('..', file));
    await execAsync(`git add ${relativePaths.join(' ')}`);
  },

  async commit(message: string) {
    await execAsync(`git commit -m "${message}"`);
  },

  async addAnnotatedTag(tag: string, message: string) {
    await execAsync(`git tag -a ${tag} -m "${message}"`);
  },

  async push(remote: string, branch: string) {
    await execAsync(`git push ${remote} ${branch}`);
  },

  async pushTags(remote: string) {
    await execAsync(`git push ${remote} --tags`);
  },
};

// 日志符号 - 兼容不同平台
const logSymbols = {
  info: process.platform === 'win32' ? 'i' : 'ℹ',
  success: process.platform === 'win32' ? '√' : '✔',
  warning: process.platform === 'win32' ? '‼' : '⚠',
  error: process.platform === 'win32' ? '×' : '✖',
};

// 创建日志实例
const logger = {
  info: (msg: string) => console.log(picocolors.blue(logSymbols.info), msg),
  success: (msg: string) => console.log(picocolors.green(logSymbols.success), msg),
  warn: (msg: string) => console.log(picocolors.yellow(logSymbols.warning), msg),
  error: (msg: string) => console.log(picocolors.red(logSymbols.error), msg),
  start: (msg: string) => console.log(picocolors.cyan('→'), msg),
};

// 类型定义
interface ReleaseConfig {
  dryRun: boolean;
  skipChecks: boolean;
  versionType?: VersionType;
  noGit: boolean;
  help: boolean;
  nonInteractive: boolean;
}

interface PackageJson {
  name: string;
  version: string;
  [key: string]: any;
}

interface CommitInfo {
  hash: string;
  message: string;
  type: string;
  scope?: string;
  description: string;
  breaking: boolean;
}

interface ChangelogEntry {
  version: string;
  date: string;
  features: CommitInfo[];
  fixes: CommitInfo[];
  breaking: CommitInfo[];
  others: CommitInfo[];
}

type VersionType = 'patch' | 'minor' | 'major' | 'custom';

// 预检查模块
class PreflightChecks {
  private config: ReleaseConfig;

  constructor(config: ReleaseConfig) {
    this.config = config;
  }

  async runAll(): Promise<void> {
    if (this.config.skipChecks) {
      logger.warn('跳过预检查');
      return;
    }

    logger.start('运行预检查...');
    
    await this.checkGitStatus();
    await this.checkCurrentBranch();
    await this.checkNpmAuth();
    await this.runTests();
    await this.runLint();
    
    logger.success('所有预检查通过');
  }

  private async checkGitStatus(): Promise<void> {
    try {
      const status = await git.status();
      if (!status.isClean()) {
        throw new Error('工作目录不干净，请先提交或暂存更改');
      }
      logger.info('Git 工作目录干净');
    } catch (error) {
      logger.error(`Git 状态检查失败: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  private async checkCurrentBranch(): Promise<void> {
    try {
      const branch = await git.branch();
      const currentBranch = branch.current;
      const allowedBranches = ['main', 'master'];
      
      if (!allowedBranches.includes(currentBranch)) {
        if (this.config.nonInteractive) {
          logger.warn(`当前分支是 "${currentBranch}"，不是主分支，但在非交互模式下继续执行`);
        } else {
          const { proceed } = await inquirer.prompt([{
            type: 'confirm',
            name: 'proceed',
            message: `当前分支是 "${currentBranch}"，不是主分支。是否继续？`,
            default: false,
          }]);
          
          if (!proceed) {
            process.exit(0);
          }
        }
      }
      
      logger.info(`当前分支: ${currentBranch}`);
    } catch (error) {
      logger.error(`分支检查失败: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  private async checkNpmAuth(): Promise<void> {
    try {
      await execAsync('npm whoami');
      logger.info('npm 已登录');
    } catch (error) {
      logger.error('npm 未登录，请先运行 npm login');
      process.exit(1);
    }
  }

  private async runTests(): Promise<void> {
    try {
      logger.start('运行测试...');
      if (this.config.dryRun) {
        logger.info('[DRY RUN] 跳过测试');
        return;
      }
      
      execSync('pnpm test', { stdio: 'inherit' });
      logger.success('测试通过');
    } catch (error) {
      logger.error('测试失败');
      process.exit(1);
    }
  }

  private async runLint(): Promise<void> {
    try {
      logger.start('运行代码检查...');
      if (this.config.dryRun) {
        logger.info('[DRY RUN] 跳过代码检查');
        return;
      }
      
      execSync('pnpm lint', { stdio: 'inherit' });
      logger.success('代码检查通过');
    } catch (error) {
      logger.error('代码检查失败');
      process.exit(1);
    }
  }
}

// 版本管理模块
class VersionManager {
  private packageJson: PackageJson;
  private packagePath: string;

  constructor() {
    this.packagePath = path.join(process.cwd(), '..', 'package.json');
    this.packageJson = this.loadPackageJson();
  }

  private loadPackageJson(): PackageJson {
    try {
      const content = fs.readFileSync(this.packagePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      logger.error('无法读取 package.json');
      process.exit(1);
    }
  }

  getCurrentVersion(): string {
    return this.packageJson.version;
  }

  private bumpVersion(version: string, type: VersionType): string {
    const [major, minor, patch] = version.split('.').map(Number);
    
    switch (type) {
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'major':
        return `${major + 1}.0.0`;
      default:
        throw new Error(`不支持的版本类型: ${type}`);
    }
  }

  async selectVersion(config?: ReleaseConfig): Promise<string> {
    const currentVersion = this.getCurrentVersion();
    const patchVersion = this.bumpVersion(currentVersion, 'patch');
    const minorVersion = this.bumpVersion(currentVersion, 'minor');
    const majorVersion = this.bumpVersion(currentVersion, 'major');

    // 如果指定了版本类型，直接返回
    if (config?.versionType) {
      return this.bumpVersion(currentVersion, config.versionType);
    }

    // 非交互模式默认使用 patch
    if (config?.nonInteractive) {
      logger.info(`非交互模式，使用默认的 patch 版本: ${patchVersion}`);
      return patchVersion;
    }

    const { versionChoice } = await inquirer.prompt([{
      type: 'list',
      name: 'versionChoice',
      message: `当前版本: ${currentVersion}，选择新版本:`,
      choices: [
        { name: `Patch (${patchVersion}) - 补丁版本`, value: 'patch' },
        { name: `Minor (${minorVersion}) - 功能版本`, value: 'minor' },
        { name: `Major (${majorVersion}) - 主版本`, value: 'major' },
        { name: '自定义版本', value: 'custom' },
      ],
    }]);

    if (versionChoice === 'custom') {
      const { customVersion } = await inquirer.prompt([{
        type: 'input',
        name: 'customVersion',
        message: '输入自定义版本号:',
        validate: (input: string) => {
          const versionRegex = /^\d+\.\d+\.\d+/;
          return versionRegex.test(input) || '请输入有效的版本号 (如: 1.0.0)';
        },
      }]);
      return customVersion;
    }

    return this.bumpVersion(currentVersion, versionChoice as VersionType);
  }

  updatePackageVersion(newVersion: string, dryRun: boolean = false): void {
    if (dryRun) {
      logger.info(`[DRY RUN] 将版本更新为: ${newVersion}`);
      return;
    }

    this.packageJson.version = newVersion;
    fs.writeFileSync(this.packagePath, JSON.stringify(this.packageJson, null, 2) + '\n');
    logger.success(`版本已更新为: ${newVersion}`);
  }
}

// Git 操作模块
class GitManager {
  private config: ReleaseConfig;

  constructor(config: ReleaseConfig) {
    this.config = config;
  }

  async getCommitsSinceLastTag(): Promise<CommitInfo[]> {
    try {
      const tags = await git.tags();
      const latestTag = tags.latest;
      
      let logs;
      if (latestTag) {
        logs = await git.log({ from: latestTag, to: 'HEAD' });
      } else {
        logs = await git.log();
      }
      
      return logs.all.map((commit: any) => this.parseCommitMessage(commit.hash, commit.message));
    } catch (error) {
      logger.warn('无法获取提交历史，可能是首次发布');
      return [];
    }
  }

  private parseCommitMessage(hash: string, message: string): CommitInfo {
    // 解析 conventional commit 格式
    const conventionalRegex = /^(\w+)(\(([^)]+)\))?: (.+)$/;
    const match = message.match(conventionalRegex);
    
    const breaking = message.includes('BREAKING CHANGE') || message.includes('!');
    
    if (match) {
      return {
        hash: hash.substring(0, 7),
        message,
        type: match[1],
        scope: match[3],
        description: match[4],
        breaking,
      };
    }

    return {
      hash: hash.substring(0, 7),
      message,
      type: 'other',
      description: message,
      breaking,
    };
  }

  async commitAndTag(version: string): Promise<void> {
    if (this.config.noGit || this.config.dryRun) {
      logger.info('[DRY RUN] 跳过 Git 操作');
      return;
    }

    try {
      await git.add(['package.json', 'CHANGELOG.md']);
      await git.commit(`chore(release): ${version}`);
      await git.addAnnotatedTag(`v${version}`, `Release v${version}`);
      
      logger.success(`已创建提交和标签: v${version}`);
    } catch (error) {
      logger.error(`Git 操作失败: ${(error as Error).message}`);
      throw error;
    }
  }

  async pushToRemote(): Promise<void> {
    if (this.config.noGit || this.config.dryRun) {
      logger.info('[DRY RUN] 跳过推送到远程仓库');
      return;
    }

    try {
      await git.push('origin', 'HEAD');
      await git.pushTags('origin');
      logger.success('已推送到远程仓库');
    } catch (error) {
      logger.error(`推送失败: ${(error as Error).message}`);
      throw error;
    }
  }
}

// 变更日志生成模块
class ChangelogGenerator {
  private commits: CommitInfo[];

  constructor(commits: CommitInfo[]) {
    this.commits = commits;
  }

  generateEntry(version: string): ChangelogEntry {
    const entry: ChangelogEntry = {
      version,
      date: new Date().toISOString().split('T')[0],
      features: [],
      fixes: [],
      breaking: [],
      others: [],
    };

    this.commits.forEach(commit => {
      if (commit.breaking) {
        entry.breaking.push(commit);
      } else if (commit.type === 'feat') {
        entry.features.push(commit);
      } else if (commit.type === 'fix') {
        entry.fixes.push(commit);
      } else {
        entry.others.push(commit);
      }
    });

    return entry;
  }

  updateChangelog(entry: ChangelogEntry, dryRun: boolean = false): void {
    const changelogPath = path.join(process.cwd(), '..', 'CHANGELOG.md');
    const newSection = this.formatChangelogEntry(entry);

    if (dryRun) {
      logger.info('[DRY RUN] 变更日志内容:');
      console.log(newSection);
      return;
    }

    let existingContent = '';
    if (fs.existsSync(changelogPath)) {
      existingContent = fs.readFileSync(changelogPath, 'utf-8');
    }

    const header = '# Changelog\n\n';
    const content = existingContent.startsWith(header)
      ? existingContent.replace(header, header + newSection)
      : header + newSection + existingContent;

    fs.writeFileSync(changelogPath, content);
    logger.success('变更日志已更新');
  }

  private formatChangelogEntry(entry: ChangelogEntry): string {
    let content = `## [${entry.version}] - ${entry.date}\n\n`;

    if (entry.breaking.length > 0) {
      content += '### BREAKING CHANGES\n\n';
      entry.breaking.forEach(commit => {
        content += `- ${commit.description} (${commit.hash})\n`;
      });
      content += '\n';
    }

    if (entry.features.length > 0) {
      content += '### Features\n\n';
      entry.features.forEach(commit => {
        const scope = commit.scope ? `**${commit.scope}**: ` : '';
        content += `- ${scope}${commit.description} (${commit.hash})\n`;
      });
      content += '\n';
    }

    if (entry.fixes.length > 0) {
      content += '### Bug Fixes\n\n';
      entry.fixes.forEach(commit => {
        const scope = commit.scope ? `**${commit.scope}**: ` : '';
        content += `- ${scope}${commit.description} (${commit.hash})\n`;
      });
      content += '\n';
    }

    return content;
  }
}

// 包发布模块
class PackagePublisher {
  private config: ReleaseConfig;

  constructor(config: ReleaseConfig) {
    this.config = config;
  }

  async publish(): Promise<void> {
    if (this.config.dryRun) {
      logger.info('[DRY RUN] 跳过发布包');
      return;
    }

    try {
      logger.start('发布包到 npm...');
      execSync('npm publish', { stdio: 'inherit' });
      logger.success('包已成功发布到 npm');
    } catch (error) {
      logger.error('发布失败');
      throw error;
    }
  }
}

// 主要发布类
class ReleaseManager {
  private config: ReleaseConfig;
  private versionManager: VersionManager;
  private gitManager: GitManager;
  private packagePublisher: PackagePublisher;

  constructor(config: ReleaseConfig) {
    this.config = config;
    this.versionManager = new VersionManager();
    this.gitManager = new GitManager(config);
    this.packagePublisher = new PackagePublisher(config);
  }

  async run(): Promise<void> {
    try {
      console.log(picocolors.cyan('\n🚀 开始发布流程\n'));

      // 预检查
      const preflightChecks = new PreflightChecks(this.config);
      await preflightChecks.runAll();

      // 获取提交历史
      const commits = await this.gitManager.getCommitsSinceLastTag();
      
      // 选择版本
      const newVersion = await this.versionManager.selectVersion(this.config);

      // 确认发布
      if (!this.config.dryRun && !this.config.nonInteractive) {
        const { confirm } = await inquirer.prompt([{
          type: 'confirm',
          name: 'confirm',
          message: `确认发布版本 ${newVersion}？`,
          default: true,
        }]);

        if (!confirm) {
          logger.info('发布已取消');
          process.exit(0);
        }
      } else if (this.config.nonInteractive) {
        logger.info(`非交互模式，自动确认发布版本 ${newVersion}`);
      }

      // 更新版本
      this.versionManager.updatePackageVersion(newVersion, this.config.dryRun);

      // 生成变更日志
      const changelogGenerator = new ChangelogGenerator(commits);
      const changelogEntry = changelogGenerator.generateEntry(newVersion);
      changelogGenerator.updateChangelog(changelogEntry, this.config.dryRun);

      // Git 操作
      await this.gitManager.commitAndTag(newVersion);

      // 发布包
      await this.packagePublisher.publish();

      // 推送到远程
      await this.gitManager.pushToRemote();

      console.log(picocolors.green(`\n✨ 发布完成！版本: ${newVersion}\n`));

    } catch (error) {
      logger.error(`发布失败: ${(error as Error).message}`);
      process.exit(1);
    }
  }
}

// CLI 参数解析
function parseArgs(): ReleaseConfig {
  const args = process.argv.slice(2);
  const config: ReleaseConfig = {
    dryRun: false,
    skipChecks: false,
    noGit: false,
    help: false,
    nonInteractive: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--dry-run':
        config.dryRun = true;
        config.nonInteractive = true; // dry-run 模式自动启用非交互
        break;
      case '--skip-checks':
        config.skipChecks = true;
        break;
      case '--version':
        config.versionType = args[++i] as VersionType;
        break;
      case '--no-git':
        config.noGit = true;
        break;
      case '--non-interactive':
        config.nonInteractive = true;
        break;
      case '--help':
      case '-h':
        config.help = true;
        break;
    }
  }

  return config;
}

function showHelp(): void {
  console.log(`
${picocolors.cyan('发布工具')}

用法:
  pnpx tsx scripts/release.ts [选项]

选项:
  --dry-run          模拟运行，不执行实际操作
  --skip-checks      跳过预检查
  --version <type>   指定版本类型 (patch|minor|major)
  --no-git           跳过 git 操作
  --non-interactive  非交互模式
  --help, -h         显示帮助信息

示例:
  pnpx tsx scripts/release.ts
  pnpx tsx scripts/release.ts --dry-run
  pnpx tsx scripts/release.ts --version patch
  pnpx tsx scripts/release.ts --non-interactive --version minor
`);
}

// 主函数
async function main(): Promise<void> {
  const config = parseArgs();

  if (config.help) {
    showHelp();
    process.exit(0);
  }

  const releaseManager = new ReleaseManager(config);
  await releaseManager.run();
}

// 错误处理
process.on('uncaughtException', (error) => {
  logger.error(`未捕获的异常: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`未处理的 Promise 拒绝: ${reason}`);
  process.exit(1);
});

// 运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}