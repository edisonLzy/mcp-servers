# Bitable (多维表格) 工具

这个目录包含了用于操作飞书多维表格的MCP工具。

## 可用工具

### list-bitable-tables

列出指定多维表格文档中的所有数据表。

#### 参数

- `app_token` (必需): 多维表格的app token
- `page_token` (可选): 分页标记，用于获取下一页数据
- `page_size` (可选): 每页返回的表数量，最大100

#### 使用示例

```json
{
  "app_token": "NQRxbRkBMa6OnZsjtERcxhNWnNh",
  "page_size": 50
}
```

#### 返回格式

```json
{
  "success": true,
  "app_token": "NQRxbRkBMa6OnZsjtERcxhNWnNh",
  "tables": [
    {
      "table_id": "tbl0xe5g8PP3U3cS",
      "name": "表格1",
      "revision": 1
    },
    {
      "table_id": "tbl1234567890",
      "name": "表格2",
      "revision": 2
    }
  ],
  "total": 2,
  "has_more": false,
  "page_token": null
}
```

### list-bitable-fields

列出指定多维表格数据表中的所有字段。

#### 参数

- `app_token` (必需): 多维表格的app token
- `table_id` (必需): 数据表ID
- `view_id` (可选): 视图ID，用于过滤字段
- `text_field_as_array` (可选): 控制字段描述数据的返回格式，默认为 false
- `page_token` (可选): 分页标记，第一次请求不填
- `page_size` (可选): 分页大小，默认20，最大100

#### 使用示例

```json
{
  "app_token": "NQRxbRkBMa6OnZsjtERcxhNWnNh",
  "table_id": "tbl0xe5g8PP3U3cS",
  "page_size": 50
}
```

#### 返回格式

```json
{
  "success": true,
  "app_token": "NQRxbRkBMa6OnZsjtERcxhNWnNh",
  "table_id": "tbl0xe5g8PP3U3cS",
  "fields": [
    {
      "field_id": "fldXXXXXXXXXXXX",
      "field_name": "标题",
      "type": 1,
      "ui_type": "Text",
      "is_primary": true,
      "is_hidden": false,
      "property": {},
      "description": []
    },
    {
      "field_id": "fldYYYYYYYYYYYY",
      "field_name": "内容",
      "type": 1,
      "ui_type": "Text",
      "is_primary": false,
      "is_hidden": false,
      "property": {},
      "description": []
    }
  ],
  "total": 2,
  "has_more": false,
  "page_token": null
}
```

### get-bitable-records

查看指定多维表格文档的记录（支持分页）。

#### 参数

- `app_token` (必需): 多维表格的app token
- `table_id` (必需): 数据表ID
- `view_id` (可选): 视图ID，用于过滤记录
- `field_names` (可选): 指定返回的字段名称数组
- `page_size` (可选): 每页返回的记录数，默认20，最大500
- `page_token` (可选): 分页标记，首次查询留空，后续查询使用返回的page_token
- `include_automatic_fields` (可选): 是否包含自动字段（创建时间、修改时间等），默认false
- `sort_field` (可选): 排序字段名
- `sort_desc` (可选): 是否降序排序，默认false
- `filter_field` (可选): 过滤字段名
- `filter_operator` (可选): 过滤操作符，支持：
  - `is`: 等于
  - `isNot`: 不等于
  - `contains`: 包含
  - `doesNotContain`: 不包含
  - `isEmpty`: 为空
  - `isNotEmpty`: 不为空
  - `isGreater`: 大于
  - `isGreaterEqual`: 大于等于
  - `isLess`: 小于
  - `isLessEqual`: 小于等于
- `filter_value` (可选): 过滤值

#### 使用示例

**首次查询（第一页）：**
```json
{
  "app_token": "NQRxbRkBMa6OnZsjtERcxhNWnNh",
  "table_id": "tbl0xe5g8PP3U3cS",
  "page_size": 50,
  "include_automatic_fields": true,
  "sort_field": "创建时间",
  "sort_desc": true
}
```

**后续查询（使用page_token）：**
```json
{
  "app_token": "NQRxbRkBMa6OnZsjtERcxhNWnNh",
  "table_id": "tbl0xe5g8PP3U3cS",
  "page_token": "eVQrYzJBNDNONlk4VFZBZVlSdzlKdFJ4bVVHVExENDNKVHoxaVdiVnViQT0=",
  "page_size": 50
}
```

#### 返回格式

```json
{
  "success": true,
  "app_token": "NQRxbRkBMa6OnZsjtERcxhNWnNh",
  "table_id": "tbl0xe5g8PP3U3cS",
  "records": [
    {
      "record_id": "recyOaMB2F",
      "fields": {
        "字段1": "值1",
        "字段2": "值2"
      },
      "created_time": 1691049973000,
      "last_modified_time": 1702455191000
    }
  ],
  "has_more": true,
  "page_token": "eVQrYzJBNDNONlk4VFZBZVlSdzlKdFJ4bVVHVExENDNKVHoxaVdiVnViQT0=",
  "total": 150,
  "request_params": {
    "page_size": 50,
    "page_token": null,
    "include_automatic_fields": true,
    "sort_field": "创建时间",
    "sort_desc": true
  }
}
```

#### 分页说明

- `has_more`: 是否还有更多记录
- `page_token`: 下一页的分页标记，当has_more为true时返回
- `total`: 记录总数
- 要获取下一页数据，使用返回的`page_token`作为下次请求的参数

## 获取app_token和table_id

### app_token获取方式

1. **多维表格URL以feishu.cn/base开头**：
   - URL格式：`https://feishu.cn/base/NQRxbRkBMa6OnZsjtERcxhNWnNh`
   - `NQRxbRkBMa6OnZsjtERcxhNWnNh` 就是app_token

2. **多维表格URL以feishu.cn/wiki开头**：
   - 需要调用知识库API获取节点信息
   - 当obj_type为bitable时，obj_token就是app_token

### table_id获取方式

1. **从多维表格URL获取**：
   - URL格式：`https://feishu.cn/base/NQRxbRkBMa6OnZsjtERcxhNWnNh?table=tbl0xe5g8PP3U3cS`
   - `tbl0xe5g8PP3U3cS` 就是table_id

2. **通过API获取**：
   - 调用"列出数据表"接口获取所有table_id

### create-bitable-record

创建多维表格中的新记录。

#### 参数

- `app_token` (必需): 多维表格的app token
- `table_id` (必需): 数据表ID
- `fields` (必需): 记录字段数据，键为字段名，值为字段值
- `user_id_type` (可选): 用户ID类型，默认为open_id
- `client_token` (可选): 客户端生成的唯一标识，用于幂等性控制

#### 使用示例

```json
{
  "app_token": "NQRxbRkBMa6OnZsjtERcxhNWnNh",
  "table_id": "tbl0xe5g8PP3U3cS",
  "fields": {
    "姓名": "张三",
    "年龄": 25,
    "邮箱": "zhangsan@example.com"
  }
}
```

### update-bitable-record

更新多维表格中的记录（增量更新）。

#### 参数

- `app_token` (必需): 多维表格的app token
- `table_id` (必需): 数据表ID
- `record_id` (必需): 要更新的记录ID
- `fields` (必需): 要更新的字段数据，键为字段名，值为字段值。设置为null可清空字段
- `user_id_type` (可选): 用户ID类型，默认为open_id

#### 使用示例

```json
{
  "app_token": "NQRxbRkBMa6OnZsjtERcxhNWnNh",
  "table_id": "tbl0xe5g8PP3U3cS",
  "record_id": "recyOaMB2F",
  "fields": {
    "年龄": 26,
    "邮箱": "zhangsan_new@example.com"
  }
}
```

### delete-bitable-record

删除多维表格中的单条记录。

#### 参数

- `app_token` (必需): 多维表格的app token
- `table_id` (必需): 数据表ID
- `record_id` (必需): 要删除的记录ID

#### 使用示例

```json
{
  "app_token": "NQRxbRkBMa6OnZsjtERcxhNWnNh",
  "table_id": "tbl0xe5g8PP3U3cS",
  "record_id": "recyOaMB2F"
}
```

### batch-delete-bitable-records

批量删除多维表格中的记录。

#### 参数

- `app_token` (必需): 多维表格的app token
- `table_id` (必需): 数据表ID
- `record_ids` (必需): 要删除的记录ID列表，最多支持500条记录

#### 使用示例

```json
{
  "app_token": "NQRxbRkBMa6OnZsjtERcxhNWnNh",
  "table_id": "tbl0xe5g8PP3U3cS",
  "record_ids": ["recyOaMB2F", "recABC123", "recDEF456"]
}
```

## 权限要求

使用这些工具需要以下权限：

**列出数据表 (list-bitable-tables)**：
- 查看、评论、编辑和管理多维表格
- 查看、评论和导出多维表格

**查询记录 (get-bitable-records)**：
- 根据条件搜索记录
- 查看、评论、编辑和管理多维表格
- 查看、评论和导出多维表格

**创建记录 (create-bitable-record)**：
- 查看、评论、编辑和管理多维表格

**更新记录 (update-bitable-record)**：
- 查看、评论、编辑和管理多维表格

**删除记录 (delete-bitable-record, batch-delete-bitable-records)**：
- 查看、评论、编辑和管理多维表格

如果多维表格开启了高级权限，需要确保调用身份拥有多维表格的可管理权限。