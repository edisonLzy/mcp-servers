import crypto from 'crypto';
import express from 'express';
import { saveTokenInfoToStore, getTokenInfoFromStore } from './tokenStore.js';
import type { Express, Request, Response } from 'express';
import type { Server } from 'http';
import type { 
  OAuthServerOptions, 
  OAuthTokenResponse, 
  AuthorizationResult, 
  RefreshTokenRequest,
  AccessTokenRequest
} from './types.js';

export class OAuthServer {
  private app: Express;
  private server: Server | null = null;
  private options: OAuthServerOptions;
  private pendingAuthRequests = new Map<string, { 
    resolve: (value: string) => void; 
    reject: (reason?: any) => void; 
  }>();

  constructor(options: OAuthServerOptions) {
    this.options = {
      callbackPath: '/callback',
      ...options
    };
    
    this.app = express();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.app.get(this.options.callbackPath!, async (req: Request, res: Response) => {
      try {
        await this.handleCallback(req, res);
      } catch (error) {
        console.error('OAuth callback error:', error);
        res.status(500).send('OAuth callback failed');
      }
    });

    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  private async handleCallback(req: Request, res: Response): Promise<void> {
    const { code, state, error } = req.query;

    if (error) {
      res.status(400).send(`OAuth error: ${error}`);
      this.rejectPendingRequest(state as string, new Error(`OAuth error: ${error}`));
      return;
    }

    if (!code || !state) {
      res.status(400).send('Missing authorization code or state');
      this.rejectPendingRequest(state as string, new Error('Missing authorization code or state'));
      return;
    }

    const pendingRequest = this.pendingAuthRequests.get(state as string);
    if (!pendingRequest) {
      res.status(400).send('Invalid or expired authorization request');
      return;
    }

    try {
      const tokenResponse = await this.exchangeCodeForToken(code as string);
      const expiresAt = Math.floor(Date.now() / 1000) + tokenResponse.expires_in - 300; // 5 minutes buffer

      await saveTokenInfoToStore({
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token!,
        expiresAt,
        scopes: tokenResponse.scope ? tokenResponse.scope.split(' ') : this.options.scopes!,
        appId: this.options.appId,
        appSecret: this.options.appSecret,
        clientId: state as string
      });

      res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
            <h2>✅ Authorization Successful!</h2>
            <p>You have successfully authorized the application. You can now close this window.</p>
            <script>
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `);

      pendingRequest.resolve(tokenResponse.access_token);
      this.pendingAuthRequests.delete(state as string);
    } catch (error) {
      console.error('Token exchange failed:', error);
      res.status(500).send('Token exchange failed');
      pendingRequest.reject(error);
      this.pendingAuthRequests.delete(state as string);
    }
  }

  private async exchangeCodeForToken(code: string): Promise<OAuthTokenResponse> {
    const tokenUrl = `${this.options.domain}/open-apis/authen/v2/oauth/token`;
    const callbackUrl = `http://${this.options.host}:${this.options.port}${this.options.callbackPath}`;
    
    const payload: AccessTokenRequest = {
      grant_type: 'authorization_code',
      client_id: this.options.appId,
      client_secret: this.options.appSecret,
      code,
      redirect_uri: callbackUrl
    };

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    if (data.code !== 0) {
      throw new Error(`Feishu API error: ${data.code} ${data.msg}`);
    }

    return data as OAuthTokenResponse;
  }

  private rejectPendingRequest(state: string, error: Error): void {
    const pendingRequest = this.pendingAuthRequests.get(state);
    if (pendingRequest) {
      pendingRequest.reject(error);
      this.pendingAuthRequests.delete(state);
    }
  }

  async startServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.options.port, this.options.host, () => {
          console.log(`OAuth server listening on http://${this.options.host}:${this.options.port}`);
          resolve();
        });
        
        this.server?.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async stopServer(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.server = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  async authorize(): Promise<AuthorizationResult> {
    // Check if we already have a valid token
    const existingToken = await getTokenInfoFromStore();
    if (existingToken && existingToken.appId === this.options.appId) {
      return {
        accessToken: existingToken.accessToken,
        needsAuthorization: false
      };
    }

    // Generate state parameter
    const state = crypto.randomUUID();
    
    // Build authorization URL
    const callbackUrl = `http://${this.options.host}:${this.options.port}${this.options.callbackPath}`;
    const authUrl = new URL(`${this.options.domain}/open-apis/authen/v1/authorize`);
    
    authUrl.searchParams.set('client_id', this.options.appId);
    authUrl.searchParams.set('redirect_uri', callbackUrl);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', state);
    
    if (this.options.scopes && this.options.scopes.length > 0) {
      authUrl.searchParams.set('scope', this.options.scopes.join(' '));
    }

    // Return the authorization URL - the calling code can handle opening it
    return {
      authorizeUrl: authUrl.toString(),
      needsAuthorization: true
    };
  }

  async waitForAuthorization(state: string, timeout: number = 120000): Promise<string> {
    return new Promise((resolve, reject) => {
      this.pendingAuthRequests.set(state, { resolve, reject });
      
      // Set timeout
      setTimeout(() => {
        if (this.pendingAuthRequests.has(state)) {
          this.pendingAuthRequests.delete(state);
          reject(new Error('Authorization timeout'));
        }
      }, timeout);
    });
  }

  async refreshToken(appId: string): Promise<string | null> {
    const token = await getTokenInfoFromStore();
    if (!token || !token.refreshToken || token.appId !== appId) {
      return null;
    }

    // Use the static refresh method
    const refreshResponse = await OAuthServer.refreshUserAccessToken({
      clientId: this.options.appId,
      clientSecret: this.options.appSecret,
      refreshToken: token.refreshToken
    });

    if (!refreshResponse) {
      return null;
    }

    // Update token store with new tokens
    const expiresAt = Math.floor(Date.now() / 1000) + refreshResponse.expires_in - 300; // 5 minutes buffer
    await saveTokenInfoToStore({
      accessToken: refreshResponse.access_token,
      refreshToken: refreshResponse.refresh_token || token.refreshToken,
      expiresAt,
      scopes: token.scopes,
      appId: token.appId,
      appSecret: token.appSecret,
      clientId: token.clientId
    });
    
    return refreshResponse.access_token;
  }

  /**
   * Static method to refresh user_access_token using Feishu API
   * Based on Feishu documentation: https://go.feishu.cn/s/6sLyroXyo03
   * @param params Refresh token parameters
   * @returns Promise resolving to OAuthTokenResponse or null if refresh failed
   */
  static async refreshUserAccessToken(params: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    domain?: string;
    scope?: string;
  }): Promise<OAuthTokenResponse | null> {
    const { clientId, clientSecret, refreshToken, domain = 'https://open.feishu.cn', scope } = params;
    
    try {
      const tokenUrl = `${domain}/open-apis/authen/v2/oauth/token`;
      
      const payload: RefreshTokenRequest = {
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken
      };

      // Optional scope parameter for reducing permissions
      if (scope) {
        payload.scope = scope;
      }

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.warn(`Refresh token HTTP error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      
      if (data.code !== 0) {
        console.warn(`Feishu API error: code=${data.code}, error=${data.error}, description=${data.error_description}`);
        return null;
      }

      return data as OAuthTokenResponse;
    } catch (error) {
      console.warn('Refresh token request failed:', error);
      return null;
    }
  }
}