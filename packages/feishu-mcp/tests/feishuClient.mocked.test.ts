import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { AxiosInstance } from 'axios';
import { FeishuClient } from '../src/feishuClient.js';

// Mock TokenStore
class MockTokenStore {
  async getValidToken() {
    return {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
      scopes: ['docx:document', 'wiki:wiki', 'wiki:wiki:readonly'],
      appId: 'cli_test_app'
    };
  }
}

// Mock axios
const getMock = vi.fn();
const postMock = vi.fn();
const patchMock = vi.fn();
const deleteMock = vi.fn();

const axiosInstanceMock: Partial<AxiosInstance> & { interceptors: any } = {
  get: getMock as any,
  post: postMock as any,
  patch: patchMock as any,
  delete: deleteMock as any,
  interceptors: {
    response: {
      use: vi.fn()
    }
  }
};

vi.mock('axios', async () => {
  return {
    default: {
      create: () => axiosInstanceMock
    }
  };
});

describe('FeishuClient (mocked)', () => {
  let client: FeishuClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new FeishuClient(new MockTokenStore() as any);
  });

  it('listWikiSpaces should return spaces list', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        code: 0,
        data: {
          items: [
            { space_id: 'spc_1', name: 'Space A', description: '' },
            { space_id: 'spc_2', name: 'Space B', description: 'Desc' }
          ],
          has_more: false
        }
      }
    });

    const result = await client.listWikiSpaces();

    expect(result.items.length).toBe(2);
    expect(result.items[0].space_id).toBe('spc_1');
    expect(getMock).toHaveBeenCalledWith('/wiki/v2/spaces', expect.any(Object));
  });

  it('getSpaceNodes should return nodes under space', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        code: 0,
        data: {
          items: [
            { node_token: 'wikcn_root', obj_token: 'docx1', obj_type: 'docx', title: 'Root', has_child: true },
          ],
          has_more: false
        }
      }
    });

    const result = await client.getSpaceNodes('spc_1');

    expect(result.items[0].node_token).toBe('wikcn_root');
    expect(getMock).toHaveBeenCalledWith('/wiki/v2/spaces/spc_1/nodes', expect.any(Object));
  });

  it('createWikiNode should return created node', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        code: 0,
        data: {
          node: {
            node_token: 'wikcn_new',
            obj_token: 'docx_new',
            obj_type: 'docx',
            title: 'New Node'
          }
        }
      }
    });

    const node = await client.createWikiNode('spc_1', { obj_type: 'docx', node_type: 'origin', title: 'New Node' });

    expect(node.node_token).toBe('wikcn_new');
    expect(postMock).toHaveBeenCalledWith('/wiki/v2/spaces/spc_1/nodes', expect.any(Object), expect.any(Object));
  });

  it('createDocument should map response to Document shape', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        code: 0,
        data: {
          document: { document_id: 'doccn_xxx', revision_id: 1, title: 'Title' }
        }
      }
    });

    const doc = await client.createDocument({ title: 'Title' } as any);

    expect(doc.document_token).toBe('doccn_xxx');
    expect(doc.revision).toBe(1);
    expect(postMock).toHaveBeenCalledWith('/open-apis/docx/v1/documents', expect.any(Object), expect.any(Object));
  });

  it('getDocumentBlocks should return blocks list', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        code: 0,
        data: {
          items: [ { block_id: 'blk_1', block_type: 1 } ],
          has_more: false
        }
      }
    });

    const res = await client.getDocumentBlocks('doccn_xxx');
    expect(res.items[0].block_id).toBe('blk_1');
    expect(getMock).toHaveBeenCalledWith('/docx/v1/documents/doccn_xxx/blocks', expect.any(Object));
  });
});
