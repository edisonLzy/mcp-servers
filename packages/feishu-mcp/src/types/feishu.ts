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
  obj_type: 'doc' | 'docx' | 'sheet' | 'mindnote' | 'bitable' | 'file' | 'slides';
  title: string;
  has_child?: boolean;
  parent_node_token?: string;
  node_type?: 'origin' | 'shortcut';
  origin_node_token?: string;
  origin_space_id?: string;
  obj_create_time?: string;
  obj_edit_time?: string;
  node_create_time?: string;
  creator?: string;
  owner?: string;
  node_creator?: string;
}

// Document types
export interface Document {
  document_token: string;
  title: string;
  revision: number;
  content?: string;
  url?: string;
}

// Document Block types
export interface DocumentBlock {
  block_id: string;
  block_type: number;
  parent_id?: string;
  children?: string[];
  text?: {
    elements: Array<{
      text_run?: {
        content: string;
        text_element_style?: Record<string, any>;
      };
      mention_user?: {
        user_id: string;
        text_element_style?: Record<string, any>;
      };
      equation?: {
        content: string;
        text_element_style?: Record<string, any>;
      };
      [key: string]: any;
    }>;
    style?: Record<string, any>;
  };
  heading1?: {
    elements: Array<{
      text_run?: {
        content: string;
        text_element_style?: Record<string, any>;
      };
      [key: string]: any;
    }>;
    style?: Record<string, any>;
  };
  heading2?: {
    elements: Array<{
      text_run?: {
        content: string;
        text_element_style?: Record<string, any>;
      };
      [key: string]: any;
    }>;
    style?: Record<string, any>;
  };
  heading3?: {
    elements: Array<{
      text_run?: {
        content: string;
        text_element_style?: Record<string, any>;
      };
      [key: string]: any;
    }>;
    style?: Record<string, any>;
  };
  [key: string]: any;
}

export interface ListDocumentBlocksResponse {
  items: DocumentBlock[];
  has_more: boolean;
  page_token?: string;
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

// Document raw content response
export interface DocumentRawContentResponse {
  content: string;
}