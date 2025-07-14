export interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scopes: string[];
  appId: string;
  clientId?: string;
}

export interface StoredTokenData {
  tokens: { [tokenKey: string]: TokenInfo };
  appTokens: { [appId: string]: string }; // Maps appId to access token
}

export interface OAuthServerOptions {
  appId: string;
  appSecret: string;
  domain: string;
  host: string;
  port: number;
  callbackPath?: string;
  scopes?: string[];
}

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  token_type: string;
}

export interface AuthorizationResult {
  accessToken?: string;
  authorizeUrl?: string;
  needsAuthorization: boolean;
}