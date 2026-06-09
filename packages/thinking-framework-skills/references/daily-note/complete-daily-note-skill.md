# Complete Daily Note

## Goal

完善今日日报:从 Records 章节提取内容,生成 NotebookLM 风格的 speech-text 和今日总结,使用 mmx-cli 生成音频,并更新到日报 Overview 章节。

## Input

- 今日日报文件路径

## Execution Steps

### 1. Get Dates & Locate Daily Note

1. Run `bun scripts/get-dates.ts` to get today date
2. Parse JSON output to extract `today` in YYYY-MM-DD format
3. 定位今日日报: `vault_path/Daily/<year>/<MM-DD>.md`

### 2. Sync Feishu Records

> **⚠️ 重要**: 在完善日报之前，必须先同步飞书记录到今日日报。

Dispatch a sub-agent to execute the [Sync Feishu Records Skill](sync-feishu-records-skill.md):

**Agent Prompt:**
```
请执行 Sync Feishu Records skill，将飞书多维表格的今日记录同步到今日日报。

执行步骤:
1. 使用 lark-cli base +record-list 获取今日记录（Base Token: WGHcbBFFEaXV9qsZN6ecbCmCnfh, Table ID: tbljmyT87cIlcMBz, View ID: vewrWFYjCc）
2. 筛选日期为今日的记录
3. 根据记录内容关联到对应 topic（如 topic 不存在则创建）
4. 将记录以 callout 格式追加到今日日报的 Records 章节

等待子 agent 完成后再继续后续步骤。
```

### 3. Read Records Section

从今日日报中提取 Records 章节内容,包括所有 record 条目的:
- 标题
- 内容
- 来源
- Topic

### 4. Generate Speech-Text

使用 LLM 将 Records 内容转换为 NotebookLM 风格的 speech-text:

**要求:**
- 第一人称叙述 ("我今天...")
- 口语化、自然流畅
- 长度: 中文约 1000-1500 字（**上限 10,000 字符**）
- 按时间线或主题组织内容

**内容完整度要求 (⚠️ 重要):**
- 覆盖所有 Records 条目，不能遗漏
- 每条 Record 的具体细节都要展开，不能泛泛而谈
- 例如：如果 Record 提到了"Error Cause 链"，必须说明它"能帮助追踪完整的错误传播路径"；如果提到了"transform 缩放"，必须说明它"会同时缩放 margin 导致间距错乱"
- 知识点要有来源或上下文支撑（不是孤立的结论）
- 用户明确拒绝过的内容形式（如 Q&A 采访格式），不要使用

**Prompt 示例:**
```
你是一个个人日报助手。请将以下_records 内容转换为一个自然流畅的口语化总结,
类似 NotebookLM 的音频概述风格。用第一人称叙述,让内容听起来像是
在向他人讲述你今天的工作和学习。

Records 内容:
[提取的 Records 内容]

请生成 speech-text:
```

### 5. Generate Daily Summary

使用 LLM 从 Records 生成今日要点总结:

**Prompt 示例:**
```
请从以下_records 内容中提取核心要点,用列表形式呈现今日的主要工作和学习内容。

Records 内容:
[提取的 Records 内容]

请生成要点总结:
```

### 6. Generate TTS Audio

使用 mmx-cli 生成语音音频:

```bash
# 检查 mmx-cli 是否可用
which mmx || npm install -g mmx-cli

# 生成 TTS 音频（使用默认 voice）
mmx speech synthesize \
  --text "<生成的 speech-text>" \
  --format mp3 \
  --out <vault_path>/attachments/audio/<MM-DD>.mp3 \
  --quiet
```

**参数说明:**
- `--text`: 要合成语音的文本（上限 10,000 字符）
- `--format mp3`: 输出格式
- `--out`: 音频保存路径
- `--quiet`: 静默模式，减少输出

**voice 可选参数（默认即可）:**
- 默认 voice 适用于中文语音合成
- 可通过 `mmx speech synthesize --text "测试" --out /tmp/test.mp3` 测试

**音频完整性保证:**
- 若文本超过 10,000 字符，分段合成后再拼接
- 使用 `speech-2.8-hd` 模型以保证高质量（默认模型）

将生成的音频文件保存到: `attachments/audio/<MM-DD>.mp3`

### 7. Update Overview Section

使用 [Update Daily Note Skill](update-daily-note-skill.md) 将 Overview 章节更新为:

- 摘要: 生成的要点总结
- 音频引用: `![[attachments/audio/<MM-DD>.mp3]]`

### 8. Output Result

```
✅ 日报已完善: Daily/<year>/<MM-DD>.md

📝 Speech-Text:
[生成的口语化总结预览...]

🎙️ 音频文件:
attachments/audio/<MM-DD>.mp3

📋 今日总结:
- [要点1]
- [要点2]
- [要点3]
```

## Acceptance Criteria

- [ ] 正确提取 Records 章节内容
- [ ] Speech-text 符合 NotebookLM 风格 (第一人称、口语化)
- [ ] TTS 音频成功生成
- [ ] Overview 章节正确更新 (摘要 + 音频引用)
- [ ] 日报格式保持一致

## Helper Tools

- **mmx-cli**: `mmx speech synthesize --text "<text>" --format mp3 --out <path> --quiet`
- **文件路径**: `attachments/audio/<MM-DD>.mp3`
