// Figma API Types

export interface FigmaConfig {
  personalAccessToken: string;
  baseURL?: string;
}

export interface FigmaError {
  status: number;
  message: string;
}

export interface FigmaResponse<T> {
  data: T;
  error?: FigmaError;
}

// User types
export interface User {
  id: string;
  email: string;
  handle: string;
  img_url: string;
}

// File types
export interface File {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
}

export interface FileResponse {
  document: Document;
  components: Record<string, Component>;
  schemaVersion: number;
  styles: Record<string, Style>;
}

export interface Document {
  id: string;
  name: string;
  type: 'DOCUMENT';
  children: Node[];
}

// Node types
export interface Node {
  id: string;
  name: string;
  type: NodeType;
  visible?: boolean;
  locked?: boolean;
  children?: Node[];
  absoluteBoundingBox?: BoundingBox;
  fills?: Paint[];
  strokes?: Paint[];
  strokeWeight?: number;
  cornerRadius?: number;
  opacity?: number;
}

export interface FrameNode extends Node {
  type: 'FRAME';
  children: Node[];
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
}

export interface GroupNode extends Node {
  type: 'GROUP';
  children: Node[];
}

export interface ComponentNode extends Node {
  type: 'COMPONENT';
  componentId: string;
}

export interface InstanceNode extends Node {
  type: 'INSTANCE';
  componentId: string;
}

export interface TextNode extends Node {
  type: 'TEXT';
  characters: string;
  fontSize?: number;
  fontWeight?: number;
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM';
  fontFamily?: string;
}

export interface RectangleNode extends Node {
  type: 'RECTANGLE';
  width: number;
  height: number;
}

export interface EllipseNode extends Node {
  type: 'ELLIPSE';
  width: number;
  height: number;
}

export interface VectorNode extends Node {
  type: 'VECTOR';
  width: number;
  height: number;
}

export type NodeType = 
  | 'DOCUMENT'
  | 'CANVAS'
  | 'FRAME'
  | 'GROUP'
  | 'COMPONENT'
  | 'INSTANCE'
  | 'TEXT'
  | 'RECTANGLE'
  | 'ELLIPSE'
  | 'VECTOR'
  | 'LINE'
  | 'STAR'
  | 'POLYGON'
  | 'BOOLEAN_OPERATION';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Paint {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'IMAGE';
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  opacity?: number;
}

// Component types
export interface Component {
  key: string;
  name: string;
  description: string;
  component_set_id?: string;
}

// Style types
export interface Style {
  key: string;
  name: string;
  style_type: 'FILL' | 'STROKE' | 'EFFECT' | 'TEXT';
  description: string;
}

// Team types
export interface Team {
  id: string;
  name: string;
  organization_id: string;
}

export interface Project {
  id: string;
  name: string;
  team_id: string;
}

// Comment types
export interface Comment {
  id: string;
  file_key: string;
  parent_id?: string;
  user: User;
  message: string;
  created_at: string;
  resolved_at?: string;
}

// API Response types
export interface FilesResponse {
  files: File[];
}

export interface NodesResponse {
  nodes: Record<string, Node>;
}

export interface TeamsResponse {
  teams: Team[];
}

export interface ProjectsResponse {
  projects: Project[];
}

export interface CommentsResponse {
  comments: Comment[];
}

export interface ImageResponse {
  images: Record<string, string>;
}

// Image export options
export interface ImageExportOptions {
  format: 'png' | 'jpg' | 'svg' | 'pdf';
  scale?: number;
  id?: string;
}