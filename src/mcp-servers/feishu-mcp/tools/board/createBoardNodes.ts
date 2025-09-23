import { z } from 'zod';
import { runWithExceptionHandler } from '../../utils/errorHandler.js';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CreateBoardNodesRequest, CreateBoardNodesResponse } from '../../types/feishu.js';

// 文本样式schema
const boardNodeTextSchema = z.object({
  text: z.string().optional(),
  font_weight: z.enum(['regular', 'bold']).optional(),
  font_size: z.number().optional(),
  horizontal_align: z.enum(['left', 'center', 'right']).optional(),
  vertical_align: z.enum(['top', 'mid', 'bottom']).optional(),
  text_color: z.string().optional(),
  text_background_color: z.string().optional(),
  line_through: z.boolean().optional(),
  underline: z.boolean().optional(),
  italic: z.boolean().optional(),
  angle: z.enum([0, 90, 180, 270]).optional(),
  theme_text_color_code: z.number().optional(),
  theme_text_background_color_code: z.number().optional()
});

// 图形样式schema
const boardNodeStyleSchema = z.object({
  fill_color: z.string().optional(),
  fill_opacity: z.number().min(0).max(100).optional(),
  border_style: z.enum(['solid', 'none', 'dashed', 'dotted']).optional(),
  border_width: z.enum(['narrow', 'thin', 'medium', 'bold']).optional(),
  border_opacity: z.number().min(0).max(100).optional(),
  h_flip: z.boolean().optional(),
  v_flip: z.boolean().optional(),
  border_color: z.string().optional(),
  theme_fill_color_code: z.number().optional(),
  theme_border_color_code: z.number().optional()
});

// 画板节点schema
const boardNodeSchema = z.object({
  id: z.string().describe('节点唯一标识ID'),
  type: z.string().describe('节点图形类型，如: text, composite_shape, image, connector等'),
  parent_id: z.string().optional().describe('父节点ID，用于建立父子关系'),
  x: z.number().optional().describe('X轴坐标位置，单位px'),
  y: z.number().optional().describe('Y轴坐标位置，单位px'),
  angle: z.number().min(-180).max(180).optional().describe('旋转角度，单位度'),
  height: z.number().positive().optional().describe('高度，单位px'),
  width: z.number().positive().optional().describe('宽度，单位px'),
  text: boardNodeTextSchema.optional().describe('文本属性'),
  style: boardNodeStyleSchema.optional().describe('图形样式'),
  locked: z.boolean().optional().describe('是否锁定节点'),
  z_index: z.number().min(0).max(10000).optional().describe('图层索引，数值越大越在上层'),
  composite_shape: z.object({
    type: z.string().describe('基础图形具体类型'),
    pie: z.object({
      start_radial_line_angle: z.number(),
      central_angle: z.number(),
      radius: z.number(),
      sector_ratio: z.number().optional()
    }).optional()
  }).optional().describe('基础图形属性'),
  image: z.object({
    token: z.string().describe('图片token，通过上传素材接口获得')
  }).optional().describe('图片属性')
});

// 创建画板节点工具的schema
const createBoardNodesSchema = z.object({
  whiteboard_id: z.string().min(1).describe('画板ID，可通过获取文档块接口获得，block_type为43的block.token即为whiteboard_id'),
  nodes: z.array(boardNodeSchema).min(1).max(3000).describe('要创建的节点数组，支持批量创建和父子关系'),
  client_token: z.string().optional().describe('操作唯一标识，用于幂等操作'),
  user_id_type: z.enum(['open_id', 'union_id', 'user_id']).optional().default('open_id').describe('用户ID类型')
});

export interface CreateBoardNodesArgs {
  whiteboard_id: string;
  nodes: Array<{
    id: string;
    type: string;
    parent_id?: string;
    x?: number;
    y?: number;
    angle?: number;
    height?: number;
    width?: number;
    text?: any;
    style?: any;
    locked?: boolean;
    z_index?: number;
    composite_shape?: any;
    image?: any;
  }>;
  client_token?: string;
  user_id_type?: 'open_id' | 'union_id' | 'user_id';
}

export async function createBoardNodes(
  client: FeishuClient,
  args: CreateBoardNodesArgs
): Promise<CreateBoardNodesResponse> {
  const request: CreateBoardNodesRequest = {
    nodes: args.nodes
  };

  return await client.createBoardNodes(
    args.whiteboard_id,
    request,
    args.client_token,
    args.user_id_type
  );
}

export function registerCreateBoardNodesTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'create-board-nodes',
    'Create nodes in a Feishu whiteboard. Supports batch creation and parent-child node relationships. You can create various types of nodes like text, shapes, images, connectors, etc.',
    createBoardNodesSchema.shape,
    async ({ whiteboard_id, nodes, client_token, user_id_type }) => {
      return runWithExceptionHandler(
        async () => {
          const result = await createBoardNodes(client, {
            whiteboard_id,
            nodes,
            client_token,
            user_id_type
          });

          // 分析父子关系
          const parentChildMap = new Map();
          const rootNodes = [];

          nodes.forEach(node => {
            if (node.parent_id) {
              if (!parentChildMap.has(node.parent_id)) {
                parentChildMap.set(node.parent_id, []);
              }
              parentChildMap.get(node.parent_id).push(node.id);
            } else {
              rootNodes.push(node.id);
            }
          });

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                operation: 'create-board-nodes',
                whiteboard_id,
                created_nodes: {
                  total_count: result.ids.length,
                  ids: result.ids,
                  root_nodes: rootNodes,
                  parent_child_relationships: Object.fromEntries(parentChildMap),
                  hierarchy_depth: parentChildMap.size > 0 ? Math.max(...Array.from(parentChildMap.keys()).map(pid =>
                    nodes.filter(n => n.parent_id === pid).length
                  )) : 0
                },
                client_token: result.client_token,
                message: `Successfully created ${result.ids.length} board nodes${parentChildMap.size > 0 ? ' with parent-child relationships' : ''}.`
              }, null, 2)
            }]
          };
        }
      );
    }
  );
}