import { registerGetBitableRecordsTool } from './getBitableRecords.js';
import { registerCreateBitableRecordTool } from './createBitableRecord.js';
import { registerUpdateBitableRecordTool } from './updateBitableRecord.js';
import { registerDeleteBitableRecordTool } from './deleteBitableRecord.js';
import { registerBatchDeleteBitableRecordsTool } from './batchDeleteBitableRecords.js';
import { registerListBitableTablesTool } from './listBitableTables.js';
import { registerListBitableFieldsTool } from './listBitableFields.js';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerBitableTools(server: McpServer, client: FeishuClient) {
  registerGetBitableRecordsTool(server, client);
  registerCreateBitableRecordTool(server, client);
  registerUpdateBitableRecordTool(server, client);
  registerDeleteBitableRecordTool(server, client);
  registerBatchDeleteBitableRecordsTool(server, client);
  registerListBitableTablesTool(server, client);
  registerListBitableFieldsTool(server, client);
}

export {
  registerGetBitableRecordsTool,
  registerCreateBitableRecordTool,
  registerUpdateBitableRecordTool,
  registerDeleteBitableRecordTool,
  registerBatchDeleteBitableRecordsTool,
  registerListBitableTablesTool,
  registerListBitableFieldsTool
};