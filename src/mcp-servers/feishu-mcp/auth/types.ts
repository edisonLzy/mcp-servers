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
  refresh_token: string;
  expires_in: number;
  scope?: string;
  token_type: 'Bearer';
  code: number;
  msg?: string;
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
  clientId: string;
}

export interface TokenStorage {
  [appId: string]: TokenInfo;
}

// Type alias for stored token data (single token for current implementation)
export type StoredTokenData = TokenInfo;