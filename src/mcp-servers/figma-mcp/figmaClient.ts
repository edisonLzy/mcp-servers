import { ConfigStore } from './auth/configStore.js';
import type {
  FigmaConfig,
  FileResponse,
  FilesResponse,
  NodesResponse,
  User,
  Comment,
  CommentsResponse,
  TeamsResponse,
  ProjectsResponse,
  ImageResponse,
  ImageExportOptions
} from './types/figma.js';

export class FigmaClient {
  private personalAccessToken: string = '';
  private baseURL: string = 'https://api.figma.com/v1';
  private configStore: ConfigStore;

  constructor(config?: Partial<FigmaConfig>) {
    this.configStore = ConfigStore.create();
    
    this.baseURL = config?.baseURL || this.baseURL;
  }

  private async initializeFromStoredConfig(): Promise<void> {
    try {
      const storedConfig = await this.configStore.getConfig();
      if (storedConfig) {
        this.personalAccessToken = this.personalAccessToken || storedConfig.personalAccessToken;
        this.baseURL = this.baseURL || storedConfig.baseURL || 'https://api.figma.com/v1';
      }
    } catch (error) {
      console.error('Failed to initialize from stored config:', error);
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.personalAccessToken) {
      await this.initializeFromStoredConfig();
    }
    
    if (!this.personalAccessToken) {
      throw new Error('Figma personal access token not configured. Please run "figma-mcp login" to set up authentication.');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    await this.ensureInitialized();

    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'X-Figma-Token': this.personalAccessToken,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Figma API error (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Figma API request failed: ${error.message}`);
      }
      throw new Error('Unknown Figma API error');
    }
  }

  // File operations
  async getFile(fileKey: string): Promise<FileResponse> {
    return this.request<FileResponse>(`/files/${fileKey}`);
  }

  async getFileNodes(fileKey: string, nodeIds: string[]): Promise<NodesResponse> {
    const ids = nodeIds.join(',');
    return this.request<NodesResponse>(`/files/${fileKey}/nodes?ids=${ids}`);
  }

  async getFiles(): Promise<FilesResponse> {
    return this.request<FilesResponse>('/files');
  }

  async getTeamFiles(teamId: string): Promise<FilesResponse> {
    return this.request<FilesResponse>(`/teams/${teamId}/files`);
  }

  async getProjectFiles(projectId: string): Promise<FilesResponse> {
    return this.request<FilesResponse>(`/projects/${projectId}/files`);
  }

  // User operations
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/me');
  }

  // Team operations
  async getTeams(): Promise<TeamsResponse> {
    return this.request<TeamsResponse>('/teams');
  }

  async getTeamProjects(teamId: string): Promise<ProjectsResponse> {
    return this.request<ProjectsResponse>(`/teams/${teamId}/projects`);
  }

  // Comment operations
  async getFileComments(fileKey: string): Promise<CommentsResponse> {
    return this.request<CommentsResponse>(`/files/${fileKey}/comments`);
  }

  async postComment(fileKey: string, message: string, parentId?: string): Promise<Comment> {
    const body: any = { message };
    if (parentId) {
      body.parent_id = parentId;
    }
    
    return this.request<Comment>(`/files/${fileKey}/comments`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Image export
  async getImageUrls(fileKey: string, options: ImageExportOptions): Promise<ImageResponse> {
    const params = new URLSearchParams({
      format: options.format,
    });

    if (options.scale) {
      params.append('scale', options.scale.toString());
    }

    if (options.id) {
      params.append('ids', options.id);
    }

    return this.request<ImageResponse>(`/images/${fileKey}?${params.toString()}`);
  }

  // Configuration methods
  async setConfig(config: FigmaConfig): Promise<void> {
    this.personalAccessToken = config.personalAccessToken;
    this.baseURL = config.baseURL || 'https://api.figma.com/v1';
    
    await this.configStore.saveConfig({
      personalAccessToken: this.personalAccessToken,
      baseURL: this.baseURL,
    });
  }

  async getConfig(): Promise<FigmaConfig | null> {
    return this.configStore.getConfig();
  }

  async clearConfig(): Promise<void> {
    this.personalAccessToken = '';
    this.baseURL = 'https://api.figma.com/v1';
    await this.configStore.clearConfig();
  }

  isConfigured(): boolean {
    return !!this.personalAccessToken;
  }
}