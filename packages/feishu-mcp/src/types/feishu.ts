// Feishu API types and interfaces
export interface FeishuConfig {
  appId: string;
  appSecret: string;
  baseURL: string;
  redirectUri?: string; // OAuth redirect URI (optional, auto-generated if not provided)
  oauthDomain?: string; // OAuth domain (defaults to https://open.feishu.cn)
  oauthPort?: number; // OAuth callback server port (defaults to 3000)
  oauthHost?: string; // OAuth callback server host (defaults to localhost)
  scopes?: string[]; // OAuth scopes
  tokenStoragePath?: string; // Custom token storage path
  autoStartOAuthServer?: boolean; // Whether to auto-start OAuth server (defaults to true)
}

export interface AccessToken {
  token: string;
  expires_at: number;
}

// Wiki types
export interface WikiSpace {
  space_id: string;
  name: string;
  description?: string;
}

export interface WikiNode {
  node_token: string;
  obj_token: string;
  obj_type: 'doc' | 'sheet' | 'bitable' | 'folder' | 'file';
  title: string;
  has_child?: boolean;
  parent_node_token?: string;
}

// Document types
export interface Document {
  document_token: string;
  title: string;
  revision: number;
  content?: string;
  url?: string;
}

// API Response types - Standard Feishu API response structure
export interface FeishuResponse {
  code: number;
  msg: string;
}

export interface ListSpacesResponse {
  items: WikiSpace[];
  has_more: boolean;
  page_token?: string;
}

export interface ListNodesResponse {
  items: WikiNode[];
  has_more: boolean;
  page_token?: string;
}

export interface CreateDocumentRequest {
  title: string;
  content?: string;
  folder_token?: string;
}

export interface UpdateDocumentRequest {
  requests: Array<{
    type: string;
    [key: string]: any;
  }>;
  revision?: number;
}

// Error types
export interface FeishuError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// OAuth types
export interface OAuthAuthorizationOptions {
  scope?: string;
  state?: string;
  codeChallenge?: string;
  codeChallengeMethod?: 'S256' | 'plain';
}

export interface OAuthCallbackParams {
  code?: string;
  error?: string;
  state?: string;
}

// Authentication mode types
export type AuthenticationMode = 'manual' | 'auto';

export interface AuthenticationOptions {
  mode?: AuthenticationMode; // 'manual' requires user to handle OAuth flow, 'auto' handles it automatically
  timeout?: number; // OAuth authorization timeout in milliseconds (default: 120000)
  openBrowser?: boolean; // Whether to automatically open browser for OAuth (default: true in 'auto' mode)
}