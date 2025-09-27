import fs from 'fs-extra';
import XLSX from 'xlsx';

export class XlsxManager {
  private workbook: XLSX.WorkBook;

  constructor(filePath: string) {
    // 验证文件路径
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }

    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      throw new Error(`路径不是一个文件: ${filePath}`);
    }

    // 初始化 workbook
    this.workbook = XLSX.readFile(filePath);
  }

  loadWorksheet(sheetName: string): SheetManager {
    if (!this.workbook.SheetNames.includes(sheetName)) {
      throw new Error(`Sheet "${sheetName}" 不存在，可用的 sheets: ${this.workbook.SheetNames.join(', ')}`);
    }

    const worksheet = this.workbook.Sheets[sheetName];
    return new SheetManager(worksheet, sheetName);
  }

  getAvailableSheets(): string[] {
    return this.workbook.SheetNames;
  }
}

class SheetManager {
  private sheetName: string;
  private headers: Array<string | string[]>;
  private records: any[][];

  constructor(worksheet: XLSX.WorkSheet, sheetName: string) {
    this.sheetName = sheetName;

    this.headers = this.extractHeadersFromSheet(worksheet);
    this.records = this.extractRecordsFromSheet(worksheet);
  }

  get name() {
    return this.sheetName;
  }

  get table(){
    return {
      headers: this.headers,
      records: this.records
    };
  }

  private calculateHeaderRowCount(worksheet: XLSX.WorkSheet): number {
    const mergedCells = worksheet['!merges'] || [];
    let maxHeaderRow = 0;

    // 通过分析合并单元格确定表头行数
    for (const merge of mergedCells) {
      // 如果合并单元格从第0行开始，说明涉及表头
      if (merge.s.r === 0) {
        maxHeaderRow = Math.max(maxHeaderRow, merge.e.r);
      }
    }

    // 表头行数至少为1行，最大为maxHeaderRow+1
    return Math.max(1, maxHeaderRow + 1);
  }

  private extractHeadersFromSheet(worksheet: XLSX.WorkSheet): Array<string | string[]> {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const headers: Array<string | string[]> = [];
    const mergedCells = worksheet['!merges'] || [];

    // 动态计算表头行数
    const headerRowCount = this.calculateHeaderRowCount(worksheet);

    // 创建合并单元格映射
    const mergeMap = new Map<string, string>();
    for (const merge of mergedCells) {
      // 只处理涉及表头区域的合并单元格
      if (merge.s.r < headerRowCount) {
        // 找到合并区域的实际值
        let mergeValue = '';
        for (let row = merge.s.r; row <= Math.min(merge.e.r, headerRowCount - 1) && !mergeValue; row++) {
          for (let col = merge.s.c; col <= merge.e.c && !mergeValue; col++) {
            const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = worksheet[cellAddr];
            if (cell && cell.v !== undefined && cell.v !== null) {
              mergeValue = String(cell.v).trim();
            }
          }
        }

        // 将合并区域内与表头相关的单元格都标记为这个值
        for (let row = merge.s.r; row <= Math.min(merge.e.r, headerRowCount - 1); row++) {
          for (let col = merge.s.c; col <= merge.e.c; col++) {
            const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
            mergeMap.set(cellAddr, mergeValue);
          }
        }
      }
    }

    // 处理每个列的表头
    for (let col = range.s.c; col <= range.e.c; col++) {
      const columnValues: string[] = [];

      // 收集该列从第0行到第2行的所有值
      for (let row = 0; row < headerRowCount; row++) {
        const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
        let value = '';

        // 先检查是否有合并单元格值
        if (mergeMap.has(cellAddr)) {
          value = mergeMap.get(cellAddr)!;
        } else {
          // 否则使用原始单元格值
          const cell = worksheet[cellAddr];
          if (cell && cell.v !== undefined && cell.v !== null) {
            value = String(cell.v).trim();
          }
        }

        if (value !== '' && !columnValues.includes(value)) {
          columnValues.push(value);
        }
      }

      // 根据值的数量决定返回格式
      if (columnValues.length === 0) {
        headers.push('');
      } else if (columnValues.length === 1) {
        headers.push(columnValues[0]);
      } else {
        headers.push(columnValues);
      }
    }

    return headers;
  }

  private extractRecordsFromSheet(worksheet: XLSX.WorkSheet): any[][] {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const records: any[][] = [];

    // 动态计算表头行数
    const headerRowCount = this.calculateHeaderRowCount(worksheet);

    // 从表头之后的行开始读取数据
    for (let row = range.s.r + headerRowCount; row <= range.e.r; row++) {
      const rowData: any[] = [];
      let hasData = false;

      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddr];
        const value = cell && cell.v !== undefined ? cell.v : null;

        rowData.push(value);
        if (value !== null && value !== undefined && value !== '') {
          hasData = true;
        }
      }

      // 只添加非空行
      if (hasData) {
        records.push(rowData);
      }
    }

    // 移除空列（但保留有表头的列）
    if (records.length > 0 && this.headers.length > 0) {
      const columnsToKeep: boolean[] = new Array(this.headers.length).fill(false);

      // 标记有表头的列
      for (let i = 0; i < this.headers.length; i++) {
        const header = this.headers[i];
        if (Array.isArray(header)) {
          // 合并表头，检查是否有非空值
          if (header.some(h => h && h.trim() !== '')) {
            columnsToKeep[i] = true;
          }
        } else {
          // 普通表头
          if (header && header.trim() !== '') {
            columnsToKeep[i] = true;
          }
        }
      }

      // 标记有数据的列
      for (const record of records) {
        for (let col = 0; col < record.length; col++) {
          if (record[col] !== null && record[col] !== undefined && record[col] !== '') {
            columnsToKeep[col] = true;
          }
        }
      }

      // 过滤掉空列
      const filteredRecords = records.map(record =>
        record.filter((_, index) => columnsToKeep[index])
      );

      return filteredRecords;
    }

    return records;
  }

  getHeaderIndex(predicate: (header: string | string[]) => boolean): number {
    return this.headers.findIndex(predicate);
  }

  /**
   * 创建SQL风格的查询构建器
   * @returns QueryBuilder实例，支持链式调用
   */
  query(): QueryBuilder {
    return new QueryBuilder(this);
  }
}

/**
 * SQL风格的查询构建器
 */
class QueryBuilder {
  private sheet: SheetManager;
  private selectedColumns?: string[];
  private conditions: ((record: any[], index: number) => boolean)[] = [];

  constructor(sheet: SheetManager) {
    this.sheet = sheet;
  }

  /**
   * 选择列（类似SQL的SELECT）
   * @param columns 列名数组，如果为空则选择所有列
   */
  select(...columns: string[]): QueryBuilder {
    if (columns.length > 0) {
      this.selectedColumns = columns;
    }
    return this;
  }

  /**
   * 添加WHERE条件
   * @param condition 条件函数或简单的列名=值的字符串
   */
  where(condition: string | ((record: any[], index: number) => boolean)): QueryBuilder {
    if (typeof condition === 'string') {
      // 解析简单的条件字符串，如 "FE===李志宇"
      const parsed = this.parseCondition(condition);
      if (parsed) {
        this.conditions.push(parsed);
      }
    } else {
      this.conditions.push(condition);
    }
    return this;
  }

  /**
   * 解析简单的条件字符串
   */
  private parseCondition(condition: string): ((record: any[], index: number) => boolean) | null {
    // 支持的操作符：!=, = (order matters - check != before =)
    const operators = ['!=', '='];

    for (const op of operators) {
      if (condition.includes(op)) {
        const [left, right] = condition.split(op).map(s => s.trim());
        const columnName = left.replace(/['"]/g, ''); // 移除引号
        const value = right.replace(/['"]/g, ''); // 移除引号

        const columnIndex = this.sheet.getHeaderIndex(header => {
          if (Array.isArray(header)) {
            return header.some(h => h && h.includes(columnName));
          }
          return header.includes(columnName);
        });

        if (columnIndex === -1) {
          console.warn(`列 "${columnName}" 未找到`);
          return null;
        }

        return (record: any[]) => {
          const cellValue = record[columnIndex];
          switch (op) {
            case '=':
              return cellValue === value;
            case '!=':
              return cellValue !== value;
            default:
              return false;
          }
        };
      }
    }
    return null;
  }

  /**
   * 执行查询并返回结果
   */
  execute(): { headers: Array<string | string[]>; records: any[][] } {
    let result = this.sheet.table;

    // 应用WHERE条件
    if (this.conditions.length > 0) {
      const combinedCondition = (record: any[], index: number) =>
        this.conditions.every(condition => condition(record, index));

      // 直接实现过滤逻辑，不依赖select方法
      const filteredRecords = result.records.filter((record, index) =>
        combinedCondition(record, index)
      );

      result = {
        headers: result.headers,
        records: filteredRecords
      };
    }

    // 应用列选择
    if (this.selectedColumns && this.selectedColumns.length > 0) {
      const columnIndices: number[] = [];
      const selectedHeaders: Array<string | string[]> = [];

      this.selectedColumns.forEach(columnName => {
        const index = this.sheet.getHeaderIndex(header => {
          if (Array.isArray(header)) {
            return header.some(h => h && h.includes(columnName));
          }
          return header.includes(columnName);
        });

        if (index !== -1) {
          columnIndices.push(index);
          selectedHeaders.push(result.headers[index]);
        }
      });

      const selectedRecords = result.records.map(record =>
        columnIndices.map(index => record[index])
      );

      return {
        headers: selectedHeaders,
        records: selectedRecords
      };
    }

    return result;
  }
}