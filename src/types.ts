export interface MCPServerOptions {
  name: string;
  description?: string;
  run: () => Promise<void>;
  auth?: () => Promise<void>;
  requiresAuth?: boolean;
}

export interface ServerConfig {
  [key: string]: any;
}