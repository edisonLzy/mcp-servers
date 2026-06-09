# Create Daily Note

## Goal

使用日报模板创建当日的日报文件。如果昨日日报中存在"明日待办"内容,自动将其迁移到今日日报的"今日待办"。

## Input

- 今日日期 (自动获取)
- 昨日日报的"明日待办"内容 (从昨日日报中提取)

## Execution Steps

### 1. Get Dates

1. Run `bun scripts/get-dates.ts` to get today and yesterday dates
2. Parse JSON output to extract `{ today, yesterday }` in YYYY-MM-DD format

### 2. Calculate Date Paths

1. 从 `today` 获取年月: `<year>/<MM-DD>.md`
2. 确定日报存储路径: `vault_path/Daily/<year>/<MM-DD>.md`

### 3. Check Yesterday's Daily Note

检查昨日日报是否存在:

```
[ vault_path ]/Daily/<year>/<yesterday>.md
```

如果存在:
1. 读取昨日日报内容
2. 提取`明日待办`章节中的待办事项
3. 记录待办列表供步骤 5 使用

### 4. Create Directory Structure

如果目录不存在,创建:

```
Daily/
└── <year>/
```

### 5. Create Daily Note from Template

使用 `resources/Daily-Note-template.md` 作为模板创建日报:

1. 复制 `resources/Daily-Note-template.md` 模板内容
2. 替换日期占位符
3. 如有昨日"明日待办",填入"今日待办"章节

### 6. Output Result

```
✅ 今日日报已创建: Daily/<year>/<MM-DD>.md

📋 从昨日迁移的待办:
- [ ] 待办事项1
- [ ] 待办事项2
```

## Acceptance Criteria

- [ ] 今日日报文件路径正确: `Daily/<year>/<MM-DD>.md`
- [ ] 日报内容遵循模板格式
- [ ] 如昨日有"明日待办",正确迁移到今日"今日待办"
- [ ] 目录结构按年创建

## Helper Tools

- 日期计算: `bun scripts/get-dates.ts` 获取今日和昨日日期
- 目录创建: `mkdir -p`
- 路径: `path.join()` 构建跨平台路径
