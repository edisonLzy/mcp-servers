import { z } from 'zod';
import { runWithExceptionHandler } from '../../utils/errorHandler.js';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { GetBoardNodesResponse } from '../../types/feishu.js';

// 获取画板节点工具的schema
const getBoardNodesSchema = z.object({
  whiteboard_id: z.string().min(1).describe('画板ID，可通过获取文档块接口获得，block_type为43的block.token即为whiteboard_id'),
  user_id_type: z.enum(['open_id', 'union_id', 'user_id']).optional().default('open_id').describe('用户ID类型')
});

export interface GetBoardNodesArgs {
  whiteboard_id: string;
  user_id_type?: 'open_id' | 'union_id' | 'user_id';
}

export async function getBoardNodes(
  client: FeishuClient,
  args: GetBoardNodesArgs
): Promise<GetBoardNodesResponse> {
  return await client.getBoardNodes(args.whiteboard_id, args.user_id_type);
}

// 构建节点树结构的辅助函数
function buildNodeTree(nodes: any[]) {
  const nodeMap = new Map();
  const rootNodes: any[] = [];
  const parentChildMap = new Map();

  // 创建节点映射
  nodes.forEach(node => {
    nodeMap.set(node.id, { ...node, children: [] });
  });

  // 建立父子关系
  nodes.forEach(node => {
    if (node.parent_id && nodeMap.has(node.parent_id)) {
      const parent = nodeMap.get(node.parent_id);
      const child = nodeMap.get(node.id);
      parent.children.push(child);

      // 记录父子关系用于统计
      if (!parentChildMap.has(node.parent_id)) {
        parentChildMap.set(node.parent_id, []);
      }
      parentChildMap.get(node.parent_id).push(node.id);
    } else {
      // 根节点（没有父节点或父节点不存在）
      rootNodes.push(nodeMap.get(node.id));
    }
  });

  return {
    rootNodes,
    parentChildMap,
    nodeMap
  };
}

// 分析节点类型分布
function analyzeNodeTypes(nodes: any[]) {
  const typeCount = new Map();
  nodes.forEach(node => {
    const count = typeCount.get(node.type) || 0;
    typeCount.set(node.type, count + 1);
  });
  return Object.fromEntries(typeCount);
}

export function registerGetBoardNodesTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'get-board-nodes',
    'Get all nodes from a Feishu whiteboard. Returns nodes with their parent-child relationships that can be used to reconstruct the board content structure.',
    getBoardNodesSchema.shape,
    async ({ whiteboard_id, user_id_type }) => {
      return runWithExceptionHandler(
        async () => {
          const result = await getBoardNodes(client, { whiteboard_id, user_id_type });

          // 构建节点树和分析
          const { rootNodes, parentChildMap } = buildNodeTree(result.nodes);
          const nodeTypes = analyzeNodeTypes(result.nodes);

          // 计算层级深度
          function calculateMaxDepth(node: any, currentDepth = 0): number {
            if (!node.children || node.children.length === 0) {
              return currentDepth;
            }
            return Math.max(...node.children.map((child: any) =>
              calculateMaxDepth(child, currentDepth + 1)
            ));
          }

          const maxDepth = rootNodes.length > 0 ? Math.max(...rootNodes.map(node => calculateMaxDepth(node))) : 0;

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                operation: 'get-board-nodes',
                whiteboard_id,
                summary: {
                  total_nodes: result.nodes.length,
                  root_nodes_count: rootNodes.length,
                  max_hierarchy_depth: maxDepth,
                  node_type_distribution: nodeTypes
                },
                nodes: result.nodes,
                hierarchy_analysis: {
                  root_node_ids: rootNodes.map(node => node.id),
                  parent_child_relationships: Object.fromEntries(parentChildMap),
                  nodes_with_children: Array.from(parentChildMap.keys()),
                  leaf_nodes: result.nodes
                    .filter(node => !parentChildMap.has(node.id))
                    .map(node => node.id)
                },
                usage_guide: {
                  description: 'Use parent_id field to identify child-parent relationships',
                  reconstruction_tip: 'Root nodes have no parent_id. Build tree by grouping nodes by parent_id',
                  coordinate_system: 'x,y coordinates are in pixels relative to canvas or parent container'
                }
              }, null, 2)
            }]
          };
        }
      );
    }
  );
}