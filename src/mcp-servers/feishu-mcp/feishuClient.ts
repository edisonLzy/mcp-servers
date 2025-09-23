import axios from 'axios';
import { FEISHU_API_BASE_URL } from './constant.js';
import { getTokenInfoFromStore, saveTokenInfoToStore } from './auth/tokenStore.js';
import { OAuthServer } from './auth/oauthServer.js';
import type { 
  FeishuResponse, 
  FeishuError,
  ListSpacesResponse,
  ListNodesResponse,
  Document,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  UserInfo,
  WikiNode,
  ListDocumentBlocksResponse,
  DocumentRawContentResponse,
  CreateBlocksRequest,
  CreateBlocksResponse,
  UpdateBlockRequest,
  UpdateBlockResponse,
  DeleteBlocksRequest,
  DeleteBlocksResponse,
  ConvertContentToBlocksRequest,
  ConvertContentToBlocksResponse,
  SearchWikiRequest,
  SearchWikiResponse,
  BitableSearchRecordsRequest,
  BitableSearchRecordsResponse,
  BitableCreateRecordRequest,
  BitableCreateRecordResponse,
  BitableUpdateRecordRequest,
  BitableUpdateRecordResponse,
  BitableDeleteRecordResponse,
  BitableBatchDeleteRecordsRequest,
  BitableBatchDeleteRecordsResponse,
  BitableListTablesResponse,
  BitableListFieldsResponse,
  WikiNodeInfoResponse,
  BoardThemeResponse,
  CreateBoardNodesRequest,
  CreateBoardNodesResponse,
  GetBoardNodesResponse
} from './types/feishu.js';
import type { AxiosInstance, AxiosError } from 'axios';

export class FeishuClient {
  private httpClient: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {

    this.httpClient = axios.create({
      baseURL: `${FEISHU_API_BASE_URL}/open-apis`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add response interceptor for error handling and token refresh
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
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        
        // Check if this is a token expiration error and we haven't retried yet
        if (this.isTokenExpiredError(error) && !originalRequest._retry) {
          // If we're already refreshing, queue this request
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              if (originalRequest.headers && token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.httpClient(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshTokens();
            
            this.processFailedQueue(null, newToken!);
            
            // Update the original request with new token and retry
            if (originalRequest.headers && newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            
            return this.httpClient(originalRequest);
          } catch (refreshError) {
            this.processFailedQueue(refreshError, null);
            
            // If refresh fails, throw authentication error
            throw new Error('Authentication failed. Please re-authenticate using the login command.');
          } finally {
            this.isRefreshing = false;
          }
        }

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

  /**
   * Check if error is due to token expiration
   */
  private isTokenExpiredError(error: AxiosError): boolean {
    if (error.response?.status === 401) {
      return true;
    }
    
    if (error.response?.data) {
      const data = error.response.data as any;
      // Common Feishu token expiration error codes
      const tokenErrorCodes = [
        '99991672', // Invalid token
        '99991671', // Token expired  
        '99991673', // Token not found
        '99991674', // Token invalid
        '20037', // Refresh token expired
        '20026' // Invalid refresh token
      ];
      
      return tokenErrorCodes.includes(data.code?.toString());
    }
    
    return false;
  }

  /**
   * Process failed queue after token refresh
   */
  private processFailedQueue(error?: any, token?: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  /**
   * Refresh tokens using stored refresh token
   */
  private async refreshTokens(): Promise<string | null> {
    const tokenInfo = await getTokenInfoFromStore();
    
    if (!tokenInfo?.refreshToken) {
      throw new Error('No refresh token available');
    }

    if (!tokenInfo.appSecret || !tokenInfo.appId) {
      throw new Error('App credentials not available in token store');
    }

    const refreshResponse = await OAuthServer.refreshUserAccessToken({
      clientId: tokenInfo.appId,
      clientSecret: tokenInfo.appSecret,
      refreshToken: tokenInfo.refreshToken
    });

    if (!refreshResponse) {
      throw new Error('Token refresh failed');
    }

    // Update token store with new tokens
    const expiresAt = Math.floor(Date.now() / 1000) + refreshResponse.expires_in - 300; // 5 minutes buffer
    await saveTokenInfoToStore({
      accessToken: refreshResponse.access_token,
      refreshToken: refreshResponse.refresh_token || tokenInfo.refreshToken,
      expiresAt,
      scopes: tokenInfo.scopes,
      appId: tokenInfo.appId,
      appSecret: tokenInfo.appSecret,
      clientId: tokenInfo.clientId
    });

    return refreshResponse.access_token;
  }

  // Token management methods
  private async getValidUserToken(): Promise<string> {
    const tokenInfo = await getTokenInfoFromStore();
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
    node_type: string;
    title?: string;
    parent_node_token?: string;
    origin_node_token?: string;
  }): Promise<WikiNode> {
    const headers = await this.getAuthHeaders();
    
    interface CreateNodeResponse extends FeishuResponse {
      data: { node: WikiNode };
    }
    
    const response = await this.httpClient.post<CreateNodeResponse>(
      `/wiki/v2/spaces/${spaceId}/nodes`,
      data,
      { headers }
    );

    return response.data.data.node;
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

  async getDocumentBlocks(documentId: string, pageToken?: string): Promise<ListDocumentBlocksResponse> {
    const headers = await this.getAuthHeaders();
    const params: Record<string, any> = {};
    
    if (pageToken) {
      params.page_token = pageToken;
    }

    interface GetDocumentBlocksResponse extends FeishuResponse {
      data: ListDocumentBlocksResponse;
    }

    const response = await this.httpClient.get<GetDocumentBlocksResponse>(
      `/docx/v1/documents/${documentId}/blocks`,
      { headers, params }
    );

    return response.data.data;
  }

  async getCurrentUser(): Promise<UserInfo> {
    const headers = await this.getAuthHeaders();
    
    interface GetCurrentUserResponse extends FeishuResponse {
      data: {
        user: UserInfo;
      };
    }

    const response = await this.httpClient.get<GetCurrentUserResponse>('/contact/v3/users/me', {
      headers
    });

    return response.data.data.user;
  }

  async getDocumentRawContent(documentId: string, lang: number = 0): Promise<DocumentRawContentResponse> {
    const headers = await this.getAuthHeaders();
    
    interface GetDocumentRawContentResponse extends FeishuResponse {
      data: DocumentRawContentResponse;
    }

    const response = await this.httpClient.get<GetDocumentRawContentResponse>(
      `/docx/v1/documents/${documentId}/raw_content`,
      {
        headers,
        params: { lang }
      }
    );

    return response.data.data;
  }

  // Document editing methods
  async createDocumentBlocks(documentId: string, blockId: string, data: CreateBlocksRequest, documentRevisionId: number = -1): Promise<CreateBlocksResponse> {
    const headers = await this.getAuthHeaders();
    
    interface CreateBlocksApiResponse extends FeishuResponse {
      data: CreateBlocksResponse;
    }
    
    const response = await this.httpClient.post<CreateBlocksApiResponse>(
      `/docx/v1/documents/${documentId}/blocks/${blockId}/children`,
      data,
      {
        headers,
        params: { document_revision_id: documentRevisionId }
      }
    );

    return response.data.data;
  }

  async updateDocumentBlock(documentId: string, blockId: string, data: UpdateBlockRequest, documentRevisionId: number = -1): Promise<UpdateBlockResponse> {
    const headers = await this.getAuthHeaders();
    
    interface UpdateBlockApiResponse extends FeishuResponse {
      data: UpdateBlockResponse;
    }
    
    const response = await this.httpClient.patch<UpdateBlockApiResponse>(
      `/docx/v1/documents/${documentId}/blocks/${blockId}`,
      data,
      {
        headers,
        params: { document_revision_id: documentRevisionId }
      }
    );

    return response.data.data;
  }

  async deleteDocumentBlocks(documentId: string, blockId: string, data: DeleteBlocksRequest, documentRevisionId: number = -1): Promise<DeleteBlocksResponse> {
    const headers = await this.getAuthHeaders();
    
    interface DeleteBlocksApiResponse extends FeishuResponse {
      data: DeleteBlocksResponse;
    }
    
    const response = await this.httpClient.delete<DeleteBlocksApiResponse>(
      `/docx/v1/documents/${documentId}/blocks/${blockId}/children/batch_delete`,
      {
        headers,
        params: { document_revision_id: documentRevisionId },
        data
      }
    );

    return response.data.data;
  }

  async convertContentToBlocks(data: ConvertContentToBlocksRequest): Promise<ConvertContentToBlocksResponse> {
    const headers = await this.getAuthHeaders();
    
    interface ConvertContentResponse extends FeishuResponse {
      data: ConvertContentToBlocksResponse;
    }

    const response = await this.httpClient.post<ConvertContentResponse>(
      'docx/v1/documents/blocks/convert',
      data,
      { headers }
    );

    return response.data.data;
  }

  async searchWiki(data: SearchWikiRequest, pageToken?: string, pageSize?: number): Promise<SearchWikiResponse> {
    const headers = await this.getAuthHeaders();
    
    interface SearchWikiApiResponse extends FeishuResponse {
      data: SearchWikiResponse;
    }

    const params = new URLSearchParams();
    if (pageToken) {
      params.append('page_token', pageToken);
    }
    if (pageSize) {
      params.append('page_size', pageSize.toString());
    }

    const url = `wiki/v1/nodes/search${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await this.httpClient.post<SearchWikiApiResponse>(
      url,
      data,
      { headers }
    );

    return response.data.data;
  }

  // Bitable API methods
  async searchBitableRecords(
    appToken: string, 
    tableId: string, 
    data: BitableSearchRecordsRequest = {}, 
    pageToken?: string, 
    pageSize: number = 20
  ): Promise<BitableSearchRecordsResponse> {
    const headers = await this.getAuthHeaders();
    
    const params: Record<string, any> = {
      page_size: pageSize
    };
    
    if (pageToken) {
      params.page_token = pageToken;
    }
    
    const response = await this.httpClient.post(
      `/bitable/v1/apps/${appToken}/tables/${tableId}/records/search`,
      data,
      {
        headers,
        params,
      }
    );
    
    return response.data.data;
  }

  async createBitableRecord(
    appToken: string,
    tableId: string,
    data: BitableCreateRecordRequest,
    userIdType?: string,
    clientToken?: string
  ): Promise<BitableCreateRecordResponse> {
    const headers = await this.getAuthHeaders();
    
    const params: Record<string, any> = {};
    if (userIdType) params.user_id_type = userIdType;
    if (clientToken) params.client_token = clientToken;

    const response = await this.httpClient.post(
      `/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
      data,
      {
        headers,
        params
      }
    );
    
    return response.data.data;
  }

  async updateBitableRecord(
    appToken: string,
    tableId: string,
    recordId: string,
    data: BitableUpdateRecordRequest,
    userIdType?: string
  ): Promise<BitableUpdateRecordResponse> {
    const headers = await this.getAuthHeaders();
    
    const params: Record<string, any> = {};
    if (userIdType) params.user_id_type = userIdType;

    const response = await this.httpClient.put(
      `/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`,
      data,
      {
        headers,
        params
      }
    );
    
    return response.data.data;
  }

  async deleteBitableRecord(
    appToken: string,
    tableId: string,
    recordId: string
  ): Promise<BitableDeleteRecordResponse> {
    const headers = await this.getAuthHeaders();
    
    const response = await this.httpClient.delete(
      `/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`,
      { headers }
    );
    
    return response.data.data;
  }

  async batchDeleteBitableRecords(
    appToken: string,
    tableId: string,
    data: BitableBatchDeleteRecordsRequest
  ): Promise<BitableBatchDeleteRecordsResponse> {
    const headers = await this.getAuthHeaders();
    
    const response = await this.httpClient.post(
      `/bitable/v1/apps/${appToken}/tables/${tableId}/records/batch_delete`,
      data,
      { headers }
    );
    
    return response.data.data;
  }

  async listBitableTables(
    appToken: string,
    pageToken?: string,
    pageSize?: number
  ): Promise<BitableListTablesResponse> {
    const headers = await this.getAuthHeaders();
    
    const params: Record<string, any> = {};
    if (pageToken) {
      params.page_token = pageToken;
    }
    if (pageSize) {
      params.page_size = pageSize;
    }
    
    const response = await this.httpClient.get(
      `/bitable/v1/apps/${appToken}/tables`,
      {
        headers,
        params
      }
    );
    
    return response.data.data;
  }

  async listBitableFields(
    appToken: string,
    tableId: string,
    viewId?: string,
    textFieldAsArray?: boolean,
    pageToken?: string,
    pageSize?: number
  ): Promise<BitableListFieldsResponse> {
    const headers = await this.getAuthHeaders();
    
    const params: Record<string, any> = {};
    if (viewId) params.view_id = viewId;
    if (textFieldAsArray !== undefined) params.text_field_as_array = textFieldAsArray;
    if (pageToken) params.page_token = pageToken;
    if (pageSize) params.page_size = pageSize;
    
    const response = await this.httpClient.get(
      `/bitable/v1/apps/${appToken}/tables/${tableId}/fields`,
      { 
        headers,
        params
      }
    );
    
    return response.data.data;
  }

  async getWikiNodeInfo(
    token: string,
    objType?: 'doc' | 'docx' | 'sheet' | 'mindnote' | 'bitable' | 'file' | 'slides' | 'wiki'
  ): Promise<WikiNodeInfoResponse> {
    const headers = await this.getAuthHeaders();
    
    const params: Record<string, any> = {
      token
    };
    
    if (objType && objType !== 'wiki') {
      params.obj_type = objType;
    }

    const response = await this.httpClient.get(
      '/wiki/v2/spaces/get_node',
      {
        headers,
        params
      }
    );
    
    return response.data.data;
  }

  // Board API methods
  async getBoardTheme(whiteboardId: string): Promise<BoardThemeResponse> {
    const headers = await this.getAuthHeaders();

    interface GetBoardThemeResponse extends FeishuResponse {
      data: BoardThemeResponse;
    }

    const response = await this.httpClient.get<GetBoardThemeResponse>(
      `/board/v1/whiteboards/${whiteboardId}/theme`,
      { headers }
    );

    return response.data.data;
  }

  async createBoardNodes(
    whiteboardId: string,
    data: CreateBoardNodesRequest,
    clientToken?: string,
    userIdType?: string
  ): Promise<CreateBoardNodesResponse> {
    const headers = await this.getAuthHeaders();

    const params: Record<string, any> = {};
    if (clientToken) params.client_token = clientToken;
    if (userIdType) params.user_id_type = userIdType;

    interface CreateBoardNodesApiResponse extends FeishuResponse {
      data: CreateBoardNodesResponse;
    }

    const response = await this.httpClient.post<CreateBoardNodesApiResponse>(
      `/board/v1/whiteboards/${whiteboardId}/nodes`,
      data,
      { headers, params }
    );

    return response.data.data;
  }

  async getBoardNodes(
    whiteboardId: string,
    userIdType?: string
  ): Promise<GetBoardNodesResponse> {
    const headers = await this.getAuthHeaders();

    const params: Record<string, any> = {};
    if (userIdType) params.user_id_type = userIdType;

    interface GetBoardNodesApiResponse extends FeishuResponse {
      data: GetBoardNodesResponse;
    }

    const response = await this.httpClient.get<GetBoardNodesApiResponse>(
      `/board/v1/whiteboards/${whiteboardId}/nodes`,
      { headers, params }
    );

    return response.data.data;
  }
}