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

// Document editing types
export interface TextElementStyle {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  inline_code?: boolean;
  background_color?: number;
  text_color?: number;
  link?: {
    url: string;
  };
}

export interface TextElement {
  text_run?: {
    content: string;
    text_element_style?: TextElementStyle;
  };
  mention_user?: {
    user_id: string;
    text_element_style?: TextElementStyle;
  };
  equation?: {
    content: string;
    text_element_style?: TextElementStyle;
  };
}

export interface BlockStyle {
  align?: number; // 1: left, 2: center, 3: right
  folded?: boolean;
  background_color?: number;
  indent_level?: number;
}

export interface CreateBlockRequest {
  block_type: number;
  text?: {
    elements: TextElement[];
    style?: BlockStyle;
  };
  heading1?: {
    elements: TextElement[];
    style?: BlockStyle;
  };
  heading2?: {
    elements: TextElement[];
    style?: BlockStyle;
  };
  heading3?: {
    elements: TextElement[];
    style?: BlockStyle;
  };
  heading4?: {
    elements: TextElement[];
    style?: BlockStyle;
  };
  heading5?: {
    elements: TextElement[];
    style?: BlockStyle;
  };
  heading6?: {
    elements: TextElement[];
    style?: BlockStyle;
  };
  heading7?: {
    elements: TextElement[];
    style?: BlockStyle;
  };
  heading8?: {
    elements: TextElement[];
    style?: BlockStyle;
  };
  heading9?: {
    elements: TextElement[];
    style?: BlockStyle;
  };
  bullet?: {
    elements: TextElement[];
    style?: BlockStyle;
  };
  ordered?: {
    elements: TextElement[];
    style?: BlockStyle;
  };
  code?: {
    elements: TextElement[];
    style?: BlockStyle;
    language?: number;
  };
  quote?: {
    elements: TextElement[];
    style?: BlockStyle;
  };
  todo?: {
    elements: TextElement[];
    style?: BlockStyle;
  };
  table?: {
    property: {
      row_size: number;
      column_size: number;
      column_width?: number[];
      merge_info?: Array<{
        row_span: number;
        col_span: number;
      }>;
    };
    children?: CreateBlockRequest[];
  };
  table_cell?: {
    elements: TextElement[];
    style?: BlockStyle;
  };
  image?: {
    token: string;
    width?: number;
    height?: number;
  };
  file?: {
    token: string;
    name?: string;
  };
  sheet?: {
    token: string;
    row_size?: number;
    column_size?: number;
  };
  divider?: Record<string, never>;
  equation?: {
    content: string;
  };
  callout?: {
    background_color?: number;
    border_color?: number;
    text_color?: number;
    emoji_id?: string;
    elements: TextElement[];
  };
  column?: {
    columns: Array<{
      width_ratio: number;
      children?: CreateBlockRequest[];
    }>;
  };
  column_set?: {
    flex_mode: number;
    background_style?: {
      color?: number;
    };
    children?: CreateBlockRequest[];
  };
}

export interface CreateBlocksRequest {
  index: number;
  children: CreateBlockRequest[];
}

export interface UpdateBlockRequest {
  update_text_elements?: {
    elements: TextElement[];
  };
  update_text_style?: {
    fields: number[];
    style: BlockStyle;
  };
}

export interface DeleteBlocksRequest {
  start_index: number;
  end_index: number;
}

export interface CreateBlocksResponse {
  children: DocumentBlock[];
  document_revision_id: number;
  client_token?: string;
}

export interface UpdateBlockResponse {
  document_revision_id: number;
  client_token?: string;
}

export interface DeleteBlocksResponse {
  document_revision_id: number;
  client_token?: string;
}

// Convert content to blocks types
export interface ConvertContentToBlocksRequest {
  content_type: 'markdown' | 'html';
  content: string;
}

export interface ConvertedBlock {
  block_id: string;
  revision_id: number;
  parent_id: string;
  children?: string[];
  block_type: number;
  text?: {
    style: {
      folded: boolean;
      align: number;
    };
    elements: Array<{
      text_run?: {
        content: string;
        text_element_style: {
          bold: boolean;
          italic: boolean;
          strikethrough: boolean;
          underline: boolean;
          inline_code: boolean;
        };
      };
    }>;
  };
  heading1?: {
    style: {
      folded: boolean;
      align: number;
    };
    elements: Array<{
      text_run?: {
        content: string;
        text_element_style: {
          bold: boolean;
          italic: boolean;
          strikethrough: boolean;
          underline: boolean;
          inline_code: boolean;
        };
      };
    }>;
  };
  heading2?: {
    style: {
      folded: boolean;
      align: number;
    };
    elements: Array<{
      text_run?: {
        content: string;
        text_element_style: {
          bold: boolean;
          italic: boolean;
          strikethrough: boolean;
          underline: boolean;
          inline_code: boolean;
        };
      };
    }>;
  };
  heading3?: {
    style: {
      folded: boolean;
      align: number;
    };
    elements: Array<{
      text_run?: {
        content: string;
        text_element_style: {
          bold: boolean;
          italic: boolean;
          strikethrough: boolean;
          underline: boolean;
          inline_code: boolean;
        };
      };
    }>;
  };
  bullet?: {
    style: {
      folded: boolean;
      align: number;
    };
    elements: Array<{
      text_run?: {
        content: string;
        text_element_style: {
          bold: boolean;
          italic: boolean;
          strikethrough: boolean;
          underline: boolean;
          inline_code: boolean;
        };
      };
    }>;
  };
  ordered?: {
    style: {
      folded: boolean;
      align: number;
    };
    elements: Array<{
      text_run?: {
        content: string;
        text_element_style: {
          bold: boolean;
          italic: boolean;
          strikethrough: boolean;
          underline: boolean;
          inline_code: boolean;
        };
      };
    }>;
  };
  code?: {
    style: {
      folded: boolean;
      align: number;
    };
    elements: Array<{
      text_run?: {
        content: string;
        text_element_style: {
          bold: boolean;
          italic: boolean;
          strikethrough: boolean;
          underline: boolean;
          inline_code: boolean;
        };
      };
    }>;
    language?: number;
    wrap?: boolean;
  };
  quote?: {
    style: {
      folded: boolean;
      align: number;
    };
    elements: Array<{
      text_run?: {
        content: string;
        text_element_style: {
          bold: boolean;
          italic: boolean;
          strikethrough: boolean;
          underline: boolean;
          inline_code: boolean;
        };
      };
    }>;
  };
  todo?: {
    style: {
      folded: boolean;
      align: number;
    };
    elements: Array<{
      text_run?: {
        content: string;
        text_element_style: {
          bold: boolean;
          italic: boolean;
          strikethrough: boolean;
          underline: boolean;
          inline_code: boolean;
        };
      };
    }>;
    done?: boolean;
  };
  table?: {
    cells: string[];
    property: {
      row_size: number;
      column_size: number;
      column_width: number[];
      merge_info: Array<{
        row_span: number;
        col_span: number;
      }>;
    };
  };
  table_cell?: Record<string, any>;
}

export interface ConvertContentToBlocksResponse {
  first_level_block_ids: string[];
  blocks: ConvertedBlock[];
}

// Search Wiki types
export interface SearchWikiRequest {
  query: string;
  space_id?: string;
  node_id?: string;
}

export interface SearchWikiItem {
  node_id: string;
  space_id: string;
  obj_type: number;
  obj_token: string;
  parent_id: string;
  sort_id: number;
  title: string;
  url: string;
  icon?: string;
}

export interface SearchWikiResponse {
  items: SearchWikiItem[];
  page_token?: string;
  has_more: boolean;
}