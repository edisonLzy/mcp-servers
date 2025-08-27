// OAuth 相关类型定义
export interface OAuthServerOptions {
  appId: string;
  appSecret: string;
  domain: string;
  host: string;
  port: number;
  scopes: string[];
  callbackPath?: string;
}

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  refresh_token_expires_in?: number;
  scope?: string;
  token_type: 'Bearer';
  code: number;
  msg?: string;
  error?: string;
  error_description?: string;
}

// 刷新令牌请求参数类型
export interface RefreshTokenRequest {
  grant_type: 'refresh_token';
  client_id: string;
  client_secret: string;
  refresh_token: string;
  scope?: string;
}

// 获取访问令牌请求参数类型
export interface AccessTokenRequest {
  grant_type: 'authorization_code';
  client_id: string;
  client_secret: string;
  code: string;
  redirect_uri?: string;
  code_verifier?: string;
  scope?: string;
}

export interface AuthorizationResult {
  accessToken?: string;
  authorizeUrl?: string;
  needsAuthorization: boolean;
}

// Token 存储相关类型定义
export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scopes: string[];
  appId: string;
  appSecret: string;
  clientId: string;
}

export interface TokenStorage {
  [appId: string]: TokenInfo;
}

// Type alias for stored token data (single token for current implementation)
export type StoredTokenData = TokenInfo;