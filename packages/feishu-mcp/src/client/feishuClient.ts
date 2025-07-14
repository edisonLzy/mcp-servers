import { spawn } from 'child_process';
import axios from 'axios';
import { TokenStore } from '../auth/tokenStore.js';
import { OAuthServer } from '../auth/oauthServer.js';
import type { 
  FeishuConfig, 
  AccessToken, 
  FeishuResponse, 
  FeishuError,
  ListSpacesResponse,
  ListNodesResponse,
  Document,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  OAuthAuthorizationOptions,
  OAuthCallbackParams,
  AuthenticationOptions
} from '../types/feishu.js';
import type { AxiosInstance, AxiosError } from 'axios';

export class FeishuClient {
  private config: FeishuConfig;
  private httpClient: AxiosInstance;
  private tokenStore: TokenStore;
  private oauthServer: OAuthServer | null = null;
  private userAccessToken?: AccessToken;

  constructor(config: FeishuConfig) {
    this.config = {
      oauthDomain: 'https://open.feishu.cn',
      oauthPort: 3000,
      oauthHost: 'localhost',
      scopes: ['wiki:space:retrieve','wiki:wiki', 'wiki:wiki:readonly'],
      autoStartOAuthServer: true,
      ...config
    };
    
    this.httpClient = axios.create({
      baseURL: config.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Initialize token store
    this.tokenStore = new TokenStore(this.config.tokenStoragePath);

    // Initialize OAuth server if needed
    if (this.config.autoStartOAuthServer) {
      this.initializeOAuthServer();
    }

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

  private initializeOAuthServer(): void {
    if (!this.oauthServer) {
      this.oauthServer = new OAuthServer(this.tokenStore, {
        appId: this.config.appId,
        appSecret: this.config.appSecret,
        domain: this.config.oauthDomain!,
        host: this.config.oauthHost!,
        port: this.config.oauthPort!,
        scopes: this.config.scopes
      });
    }
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

  // Enhanced OAuth methods
  generateOAuthUrl(options: OAuthAuthorizationOptions = {}): string {
    const redirectUri = this.config.redirectUri || 
      `http://${this.config.oauthHost}:${this.config.oauthPort}/callback`;

    const params = new URLSearchParams({
      client_id: this.config.appId,
      redirect_uri: redirectUri,
      response_type: 'code'
    });

    if (options.scope) {
      params.append('scope', options.scope);
    } else if (this.config.scopes && this.config.scopes.length > 0) {
      params.append('scope', this.config.scopes.join(' '));
    }

    if (options.state) {
      params.append('state', options.state);
    }

    if (options.codeChallenge) {
      params.append('code_challenge', options.codeChallenge);
      params.append('code_challenge_method', options.codeChallengeMethod || 'S256');
    }

    return `${this.config.oauthDomain}/open-apis/authen/v1/authorize?${params.toString()}`;
  }

  parseOAuthCallback(url: string): OAuthCallbackParams {
    const urlObj = new URL(url);
    const params: OAuthCallbackParams = {};

    if (urlObj.searchParams.has('code')) {
      params.code = urlObj.searchParams.get('code')!;
    }

    if (urlObj.searchParams.has('error')) {
      params.error = urlObj.searchParams.get('error')!;
    }

    if (urlObj.searchParams.has('state')) {
      params.state = urlObj.searchParams.get('state')!;
    }

    return params;
  }

  // Authentication methods with auto and manual modes
  async authenticate(options: AuthenticationOptions = {}): Promise<string> {
    const mode = options.mode || 'auto';
    const timeout = options.timeout || 120000;
    const openBrowser = options.openBrowser !== undefined ? options.openBrowser : (mode === 'auto');

    // Check if we have a valid token
    const existingToken = await this.tokenStore.getValidToken(this.config.appId);
    if (existingToken) {
      this.userAccessToken = {
        token: existingToken.accessToken,
        expires_at: existingToken.expiresAt * 1000 // Convert to milliseconds
      };
      return existingToken.accessToken;
    }

    // Try to refresh token if expired
    const expiredToken = await this.tokenStore.getToken(this.config.appId);
    if (expiredToken && this.oauthServer) {
      const refreshedToken = await this.oauthServer.refreshToken(this.config.appId);
      if (refreshedToken) {
        const tokenInfo = await this.tokenStore.getValidToken(this.config.appId);
        if (tokenInfo) {
          this.userAccessToken = {
            token: tokenInfo.accessToken,
            expires_at: tokenInfo.expiresAt * 1000
          };
          return tokenInfo.accessToken;
        }
      }
    }

    // Need fresh authorization
    if (mode === 'manual') {
      return this.authenticateManual();
    } else {
      return this.authenticateAuto(timeout, openBrowser);
    }
  }

  private async authenticateManual(): Promise<string> {
    const oauthUrl = this.generateOAuthUrl({
      scope: this.config.scopes?.join(' ')
    });
    
    throw new Error(`Manual authorization required. Please visit: ${oauthUrl}\nAfter authorization, extract the 'code' parameter from the callback URL and call getUserAccessToken(code).`);
  }

  private async authenticateAuto(timeout: number, openBrowser: boolean): Promise<string> {
    if (!this.oauthServer) {
      this.initializeOAuthServer();
    }

    try {
      // Start OAuth server
      await this.oauthServer!.startServer();

      // Get authorization URL
      const result = await this.oauthServer!.authorize();
      
      if (result.accessToken) {
        return result.accessToken;
      }

      if (!result.authorizeUrl) {
        throw new Error('Failed to generate authorization URL');
      }

      console.log('\n🔐 Starting OAuth authorization...');
      console.log(`📱 Authorization URL: ${result.authorizeUrl}`);
      
      if (openBrowser) {
        console.log('🌐 Opening browser for authorization...');
        this.openBrowser(result.authorizeUrl);
      } else {
        console.log('📋 Please open the above URL in your browser to complete authorization.');
      }

      console.log(`⏳ Waiting for authorization (timeout: ${timeout / 1000}s)...`);

      // Extract state from URL for tracking
      const url = new URL(result.authorizeUrl);
      const state = url.searchParams.get('state')!;

      // Wait for authorization
      const accessToken = await this.oauthServer!.waitForAuthorization(
        state, 
        timeout
      );

      this.userAccessToken = {
        token: accessToken,
        expires_at: Date.now() + 7200000 // 2 hours default
      };

      console.log('✅ Authorization successful!');
      return accessToken;

    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw error;
    } finally {
      // Stop OAuth server
      if (this.oauthServer) {
        await this.oauthServer.stopServer();
      }
    }
  }

  private openBrowser(url: string): void {
    const platform = process.platform;
    let command: string;

    switch (platform) {
      case 'darwin':
        command = 'open';
        break;
      case 'win32':
        command = 'start';
        break;
      default:
        command = 'xdg-open';
        break;
    }

    spawn(command, [url], { detached: true, stdio: 'ignore' }).unref();
  }

  // Legacy methods for backward compatibility
  async authorize(code: string): Promise<void> {
    await this.getUserAccessToken(code);
  }

  async getUserAccessToken(code?: string): Promise<string> {
    if (this.userAccessToken && this.userAccessToken.expires_at > Date.now()) {
      return this.userAccessToken.token;
    }

    if (!code) {
      // Try auto authentication first
      try {
        return await this.authenticate({ mode: 'auto' });
      } catch {
        // Fall back to manual authentication
        return await this.authenticate({ mode: 'manual' });
      }
    }

    try {
      interface UserAccessTokenResponse extends FeishuResponse {
        access_token: string;
        expires_in: number;
        refresh_token?: string;
      }

      const callbackUrl = this.config.redirectUri || 
        `http://${this.config.oauthHost}:${this.config.oauthPort}/callback`;

      const response = await this.httpClient.post<UserAccessTokenResponse>('/open-apis/authen/v2/oauth/token', {
        grant_type: 'authorization_code',
        client_id: this.config.appId,
        client_secret: this.config.appSecret,
        code,
        redirect_uri: callbackUrl
      });

      const expiresAt = Math.floor(Date.now() / 1000) + response.data.expires_in - 300;

      // Store token
      await this.tokenStore.storeToken({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt,
        scopes: this.config.scopes || [],
        appId: this.config.appId
      });

      this.userAccessToken = {
        token: response.data.access_token,
        expires_at: expiresAt * 1000
      };

      return this.userAccessToken.token;
    } catch (error) {
      console.error('Failed to get user access token:', error);
      throw error;
    }
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const accessToken = await this.authenticate();
    return {
      'Authorization': `Bearer ${accessToken}`
    };
  }

  // Token management methods
  async getTokenStatus(): Promise<{ isValid: boolean; expiresAt?: number; appId: string }> {
    const token = await this.tokenStore.getToken(this.config.appId);
    if (!token) {
      return { isValid: false, appId: this.config.appId };
    }

    const now = Date.now() / 1000;
    const isValid = token.expiresAt > now;

    return {
      isValid,
      expiresAt: token.expiresAt,
      appId: this.config.appId
    };
  }

  async logout(): Promise<void> {
    await this.tokenStore.removeToken(this.config.appId);
    this.userAccessToken = undefined;
    console.log('✅ Successfully logged out');
  }

  async refreshToken(): Promise<string | null> {
    if (!this.oauthServer) {
      this.initializeOAuthServer();
    }
    return await this.oauthServer!.refreshToken(this.config.appId);
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
      `/open-apis/docx/v1/documents/${documentToken}/batch_update`,
      data,
      { headers }
    );

    return { revision: response.data.data.document.revision_id };
  }

  // Cleanup method
  async destroy(): Promise<void> {
    if (this.oauthServer) {
      await this.oauthServer.stopServer();
    }
  }
}