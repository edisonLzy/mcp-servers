# XLSX MCP Server

XLSX MCP Server is a Model Context Protocol (MCP) server for reading and querying Excel (XLSX) files with advanced querying capabilities.

## Features

- 📊 Read data from specified sheets in XLSX files
- 🔗 Support for merged cell handling and recognition
- 🔍 SQL-style querying with WHERE conditions
- ✅ Requires absolute file paths for accuracy
- 🛡️ Comprehensive error handling and validation

## Tools

### list-sheet-from-file

Get all sheet names from a specified .xlsx file.

#### Parameters

- `filePath` (string): Path to the Excel file to read sheet names from

#### Return Format

```json
{
  "success": true,
  "filePath": "/path/to/file.xlsx",
  "totalSheets": 2,
  "sheetNames": ["Sheet1", "Sheet2"]
}
```

### get-records-from-sheet

Query records from an Excel sheet that match specified conditions. Returns all columns for matching records.

#### Parameters

- `filePath` (string): Path to the Excel file to read
- `sheetName` (string): Name of the sheet to query
- `conditions` (string[], optional): Array of filter conditions (e.g., `["FE = 李志宇", "优先级 = P0"]`). Supports operators: `=`, `!=`

#### Return Format

```json
{
  "success": true,
  "sheetName": "Sheet1",
  "totalRecords": 10,
  "headers": ["Column1", "Column2", ["Merged", "Header"]],
  "records": [
    ["value1", "value2", "value3"],
    ["value4", "value5", "value6"]
  ]
}
```

#### Merged Header Handling

- Headers can be strings or arrays of strings
- Array headers indicate multi-row merged headers
- Example: `["9月", "7.18版本", "23（封）"]` represents a 3-row merged header

#### Query Conditions

Conditions support simple comparison operators:

- `=` - Equals (e.g., `"FE = 李志宇"`)
- `!=` - Not equals (e.g., `"优先级 != P0"`)

Multiple conditions are combined with AND logic.

## Usage Examples

### List all sheets

```typescript
{
  "filePath": "/Users/username/Documents/example.xlsx"
}
```

### Query all records

```typescript
{
  "filePath": "/Users/username/Documents/example.xlsx",
  "sheetName": "数据"
}
```

### Query with conditions

```typescript
{
  "filePath": "/Users/username/Documents/example.xlsx",
  "sheetName": "数据",
  "conditions": ["FE = 李志宇", "优先级 = P0"]
}
```

## Error Handling

The server provides detailed error information:

- `FILE_NOT_FOUND`: File does not exist
- `NOT_A_FILE`: Path is not a file (possibly a directory)
- `SHEET_NOT_FOUND`: Sheet does not exist, returns available sheet list
- `UNKNOWN_ERROR`: Other unknown errors

## Dependencies

- `xlsx`: For reading and parsing Excel files
- `fs-extra`: Enhanced file system operations
- `@modelcontextprotocol/sdk`: MCP SDK
- `zod`: Parameter validation

## Development

This server follows the standard MCP server structure:

```
xlsx-mcp/
├── index.ts              # Main server file
├── XlsxManager.ts        # Core Excel processing logic
├── tools/                # Tool implementations
│   ├── getRecordsFromSheet.ts
│   └── listSheetFromFile.ts
├── tests/                # Test files
│   └── XlsxManager.test.ts
└── README.md            # Documentation
```

## Advanced Features

### Dynamic Header Row Detection

The `XlsxManager` automatically detects the number of header rows by analyzing merged cells, ensuring accurate data extraction from complex Excel files with multi-row headers.

### SQL-Style Query Builder

Internal `QueryBuilder` provides SQL-like query capabilities:

- `select()` - Select specific columns
- `where()` - Filter rows with conditions
- `execute()` - Execute query and return results

This enables flexible data extraction without loading the entire file into memory.
