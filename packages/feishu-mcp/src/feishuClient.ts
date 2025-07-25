import axios from 'axios';
import { TokenStore } from './auth/tokenStore.js';
import type { TokenInfo } from './auth/types.js';
import type { 
  FeishuConfig, 
  FeishuResponse, 
  FeishuError,
  ListSpacesResponse,
  ListNodesResponse,
  Document,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  UserInfo
} from './types/feishu.js';
import type { AxiosInstance, AxiosError } from 'axios';
import { FEISHU_API_BASE_URL } from './constant.js';

export class FeishuClient {
  private httpClient: AxiosInstance;

  constructor(private tokenStore: TokenStore) {

    this.httpClient = axios.create({
      baseURL: `${FEISHU_API_BASE_URL}/open-apis`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => {
        // Check if response has Feishu API error
        if (response.data && typeof response.data === 'object' && 'code' in response.data) {
          const feishuResponse = response.data as any;
          if (feishuResponse.code !== 0) {
            const error: FeishuError = {
              code: feishuResponse.code.toString(),
              message: feishuResponse.msg || 'API request failed',
              details: feishuResponse
            };
            throw error;
          }
        }
        return response;
      },
      (error: AxiosError) => {
        throw this.handleError(error);
      }
    );
  }

  private handleError(error: AxiosError): FeishuError {
    if (error.response?.data) {
      const data = error.response.data as any;
      return {
        code: data.code?.toString() || 'UNKNOWN_ERROR',
        message: data.msg || data.message || 'Unknown error occurred',
        details: data
      };
    }

    return {
      code: 'NETWORK_ERROR',
      message: error.message || 'Network error occurred',
      details: { originalError: error }
    };
  }

  // Token management methods
  private async getValidUserToken(): Promise<string> {
    const tokenInfo = await this.tokenStore.getValidToken();
    if (!tokenInfo) {
      throw new Error('No valid user token found. Please authenticate first using login command.');
    }
    return tokenInfo.accessToken;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const accessToken = await this.getValidUserToken();
    return {
      'Authorization': `Bearer ${accessToken}`
    };
  }

  // Wiki API methods
  async listWikiSpaces(): Promise<ListSpacesResponse> {
    const headers = await this.getAuthHeaders();
    
    interface WikiSpacesResponse extends FeishuResponse {
      data: ListSpacesResponse;
    }
    
    const response = await this.httpClient.get<WikiSpacesResponse>('/wiki/v2/spaces', {
      headers
    });

    return response.data.data;
  }

  async getSpaceNodes(spaceId: string, parentNodeToken?: string): Promise<ListNodesResponse> {
    const headers = await this.getAuthHeaders();
    const params: Record<string, any> = {};
    
    if (parentNodeToken) {
      params.parent_node_token = parentNodeToken;
    }

    interface SpaceNodesResponse extends FeishuResponse {
      data: ListNodesResponse;
    }

    const response = await this.httpClient.get<SpaceNodesResponse>(
      `/wiki/v2/spaces/${spaceId}/nodes`,
      { headers, params }
    );

    return response.data.data;
  }

  async createWikiNode(spaceId: string, data: {
    obj_type: string;
    title: string;
    parent_node_token?: string;
  }): Promise<{ node_token: string; obj_token: string }> {
    const headers = await this.getAuthHeaders();
    
    interface CreateNodeResponse extends FeishuResponse {
      data: { node_token: string; obj_token: string };
    }
    
    const response = await this.httpClient.post<CreateNodeResponse>(
      `/wiki/v2/spaces/${spaceId}/nodes`,
      data,
      { headers }
    );

    return response.data.data;
  }

  // Document API methods
  async createDocument(data: CreateDocumentRequest): Promise<Document> {
    const headers = await this.getAuthHeaders();
    
    interface CreateDocumentResponse extends FeishuResponse {
      data: {
        document: {
          document_id: string;
          revision_id: number;
          title: string;
        };
      };
    }
    
    const response = await this.httpClient.post<CreateDocumentResponse>(
      '/open-apis/docx/v1/documents',
      data,
      { headers }
    );

    return {
      document_token: response.data.data.document.document_id,
      title: response.data.data.document.title,
      revision: response.data.data.document.revision_id,
      url: `https://docs.feishu.cn/docs/${response.data.data.document.document_id}`
    };
  }

  async getDocumentContent(documentToken: string, format: 'rich' | 'plain' = 'rich'): Promise<Document> {
    const headers = await this.getAuthHeaders();
    const endpoint = format === 'plain' ? 'raw_content' : 'content';
    
    interface GetDocumentContentResponse extends FeishuResponse {
      data: {
        document: {
          title: string;
          content: string;
          revision_id: number;
        };
      };
    }
    
    const response = await this.httpClient.get<GetDocumentContentResponse>(`/open-apis/docx/v1/documents/${documentToken}/${endpoint}`, {
      headers
    });

    return {
      document_token: documentToken,
      title: response.data.data.document.title,
      content: response.data.data.document.content,
      revision: response.data.data.document.revision_id
    };
  }

  async updateDocument(documentToken: string, data: UpdateDocumentRequest): Promise<{ revision: number }> {
    const headers = await this.getAuthHeaders();
    
    interface UpdateDocumentResponse extends FeishuResponse {
      data: {
        document: {
          revision_id: number;
        };
      };
    }

    const response = await this.httpClient.post<UpdateDocumentResponse>(
      `/docx/v1/documents/${documentToken}/batch_update`,
      data,
      { headers }
    );

    return { revision: response.data.data.document.revision_id };
  }

  async getCurrentUser(): Promise<UserInfo> {
    const headers = await this.getAuthHeaders();
    
    interface GetCurrentUserResponse extends FeishuResponse {
      data: {
        user: UserInfo;
      };
    }

    const response = await this.httpClient.get<GetCurrentUserResponse>(
      '/contact/v3/users/me',
      { headers }
    );

    return response.data.data.user;
  }
}