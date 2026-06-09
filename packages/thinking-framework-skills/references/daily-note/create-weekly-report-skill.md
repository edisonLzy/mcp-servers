# Create Weekly Report

## Goal

创建本周周报文件，聚合本周所有日报的 Records 内容，按照日报模板格式生成周报，并放置到 `Daily/summary` 目录。

## Input

- 本周日期范围（自动计算：周一 00:00 ~ 周日 23:59）
- 日报模板路径：`vault_path/templates/日报.md`
- 周报存放目录：`vault_path/Daily/summary`

## Execution Steps

### 1. Calculate This Week's Date Range

1. Run `bun scripts/get-dates.ts` to get today date
2. Parse JSON output to extract `today` in YYYY-MM-DD format
3. 计算本周周一和周日：
   - 周一 = today - (weekday of today - 1) 天（周一为1，周日为7）
   - 周日 = 周一 + 6 天
4. 输出格式：`YYYY-(MM-DD~MM-DD).md`

### 2. Locate Daily Notes

扫描 `vault_path/Daily/<year>/` 目录，匹配本周日期范围的日报文件：

- `vault_path/Daily/<year>/<MM-DD>.md`
- 例如：`Daily/2026/04-13.md`, `Daily/2026/04-14.md` ...

### 3. Read and Extract Records

对每个存在的日报文件：

1. 读取文件内容
2. 提取 `## Records` 章节中的所有 `> [!record]` 条目
3. 每条 record 包含：
   - 标题
   - 内容（**内容**）
   - 来源（**来源**）
   - Topic（**Topic**）
   - 路径（**路径**）

### 4. Read Weekly Report Template

读取 `vault_path/templates/日报.md` 作为模板结构参考。

### 5. Generate Speech-Text

使用 LLM 将本周**所有日报的完整内容**转换为 NotebookLM 风格的 speech-text：

**要求:**
- 第一人称叙述 ("我这周...")
- 口语化、自然流畅
- 长度: 中文约 1500-2500 字（**上限 10,000 字符**）
- 按主题或时间线组织内容

**内容完整度要求 (⚠️ 重要):**
- 覆盖**本周所有日报的完整内容**，不能遗漏任何日报
- 每条 Record 的具体细节都要展开，不能泛泛而谈
- 知识点要有来源或上下文支撑（不是孤立的结论）
- 用户明确拒绝过的内容形式（如 Q&A 采访格式），不要使用
- 即使某日日报无 Records 内容，也需提及该日有/无记录

**Prompt 示例:**
```
你是一个个人周报助手。请将以下本周所有日报的完整内容转换为一个自然流畅的口语化总结，
类似 NotebookLM 的音频概述风格。用第一人称叙述，让内容听起来像是
在向他人讲述你这一周的工作和学习。

本周日报内容:
[按日期顺序排列的完整日报内容]

请生成 speech-text:
```

### 6. Generate TTS Audio

使用 mmx-cli 生成语音音频：

```bash
# 检查 mmx-cli 是否可用
which mmx || npm install -g mmx-cli

# 生成 TTS 音频
mmx speech synthesize \
  --text "<生成的 speech-text>" \
  --format mp3 \
  --out <vault_path>/attachments/audio/<MM-DD~MM-DD>.mp3 \
  --quiet
```

**参数说明:**
- `--text`: 要合成语音的文本（上限 10,000 字符）
- `--format mp3`: 输出格式
- `--out`: 音频保存路径（文件名格式：04-13~04-19.mp3）
- `--quiet`: 静默模式，减少输出

**音频完整性保证:**
- 若文本超过 10,000 字符，分段合成后再拼接
- 使用 `speech-2.8-hd` 模型以保证高质量（默认模型）

将生成的音频文件保存到: `attachments/audio/<MM-DD~MM-DD>.mp3`

### 7. Generate Weekly Report Content

按照模板格式组装周报：

1. **Overview 摘要**: 从所有 Records 内容中提取核心要点，生成 3-5 条摘要
2. **音频引用**: `![[attachments/audio/<MM-DD~MM-DD>.mp3]]`
3. **Records**: 按日期顺序排列所有 record 条目，每条保留原文格式
4. **TODO**:
   - 从各日报中提取"今日待办"已完成项 → 本周完成
   - 从各日报中提取"明日待办" → 下周待办
5. **Daily Notes Reference**: 引用本周各天日报文件路径

### 8. Determine Output Path

周报文件命名格式：`YYYY-(MM-DD~MM-DD).md`

完整路径：`vault_path/Daily/summary/YYYY-(MM-DD~MM-DD).md`

### 9. Create Summary Directory

如果 `Daily/summary` 目录不存在，创建它。

### 10. Write Weekly Report File

将生成的周报内容写入目标文件。

### 11. Output Result

```
✅ 周报已创建: Daily/summary/YYYY-(MM-DD~MM-DD).md

📝 Speech-Text:
[生成的口语化总结预览...]

🎙️ 音频文件:
attachments/audio/<MM-DD~MM-DD>.mp3

📊 本周汇总:
- 日报数量: N 篇
- 记录总数: M 条

📋 本周完成:
- [x] 待办1
- [x] 待办2

📌 下周待办:
- [ ] 待办1
- [ ] 待办2
```

## Acceptance Criteria

- [ ] 周报文件命名格式正确：`YYYY-(MM-DD~MM-DD).md`
- [ ] 周报放置路径正确：`vault_path/Daily/summary/`
- [ ] 覆盖本周所有存在日报的内容
- [ ] Records 条目保留原始内容，不遗漏
- [ ] 遵循日报模板的格式结构
- [ ] Speech-text 符合 NotebookLM 风格 (第一人称、口语化)
- [ ] TTS 音频成功生成
- [ ] Overview 章节包含音频引用

## Helper Tools

- 日期计算: `bun scripts/get-dates.ts` 获取今日日期，手动计算周一/周日
- 目录创建: `mkdir -p`
- 文件扫描: `glob` 匹配 `Daily/<year>/<MM-DD>.md`
- 路径: `path.join()` 构建跨平台路径
- **mmx-cli**: `mmx speech synthesize --text "<text>" --format mp3 --out <path> --quiet`
- **音频路径**: `attachments/audio/<MM-DD~MM-DD>.mp3`
