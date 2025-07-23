// Feishu API types and interfaces
export interface FeishuConfig {
  appId: string;
  appSecret: string;
  baseURL: string;
  tokenStoragePath?: string; // Custom token storage path
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

// Base response types
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

// Request types
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

// User types
export interface UserInfo {
  user_id: string;
  name: string;
  email?: string;
  mobile?: string;
  employee_id?: string;
  employee_type?: string;
  status?: {
    is_frozen: boolean;
    is_resigned: boolean;
    is_activated: boolean;
    is_exited: boolean;
    is_unjoin: boolean;
  };
  avatar?: {
    avatar_72?: string;
    avatar_240?: string;
    avatar_640?: string;
    avatar_origin?: string;
  };
  department_ids?: string[];
  open_id?: string;
  union_id?: string;
}

// Error types
export interface FeishuError {
  code: string;
  message: string;
  details?: Record<string, any>;
}