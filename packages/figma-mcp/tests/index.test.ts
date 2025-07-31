import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FigmaClient } from '../figmaClient.js';
import { ConfigStore } from '../auth/configStore.js';
import type { FigmaConfig } from '../auth/types.js';

// Mock the ConfigStore
vi.mock('../auth/configStore.js');
const MockConfigStore = ConfigStore as any;

// Mock fetch
global.fetch = vi.fn();

describe('FigmaClient', () => {
  let client: FigmaClient;
  let mockConfigStore: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfigStore = {
      getConfig: vi.fn(),
      saveConfig: vi.fn(),
      clearConfig: vi.fn(),
    };
    MockConfigStore.create.mockReturnValue(mockConfigStore);
    client = new FigmaClient();
  });

  describe('initialization', () => {
    it('should create client with default config', () => {
      expect(client).toBeInstanceOf(FigmaClient);
      expect(MockConfigStore.create).toHaveBeenCalled();
    });

    it('should create client with custom config', () => {
      const customConfig = { baseURL: 'https://custom.api.com' };
      const customClient = new FigmaClient(customConfig);
      expect(customClient).toBeInstanceOf(FigmaClient);
    });
  });

  describe('configuration', () => {
    it('should save configuration', async () => {
      const config: FigmaConfig = {
        personalAccessToken: 'figd_test_token',
        baseURL: 'https://custom.api.com'
      };

      await client.setConfig(config);

      expect(mockConfigStore.saveConfig).toHaveBeenCalledWith({
        personalAccessToken: 'figd_test_token',
        baseURL: 'https://custom.api.com'
      });
    });

    it('should get configuration', async () => {
      const expectedConfig = {
        personalAccessToken: 'figd_test_token',
        baseURL: 'https://api.figma.com/v1'
      };
      mockConfigStore.getConfig.mockResolvedValue(expectedConfig);

      const result = await client.getConfig();
      expect(result).toEqual(expectedConfig);
    });

    it('should clear configuration', async () => {
      await client.clearConfig();
      expect(mockConfigStore.clearConfig).toHaveBeenCalled();
    });

    it('should check if configured', () => {
      expect(client.isConfigured()).toBe(false);
      
      // Set token via private method for testing
      (client as any).personalAccessToken = 'figd_test_token';
      expect(client.isConfigured()).toBe(true);
    });
  });

  describe('API requests', () => {
    const mockToken = 'figd_test_token';
    const mockResponse = { data: 'test' };

    beforeEach(async () => {
      mockConfigStore.getConfig.mockResolvedValue({
        personalAccessToken: mockToken,
        baseURL: 'https://api.figma.com/v1'
      });
      await (client as any).initializeFromStoredConfig();
      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
    });

    it('should make authenticated requests', async () => {
      const result = await (client as any).request('/test');
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.figma.com/v1/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Figma-Token': mockToken,
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      });

      await expect((client as any).request('/test')).rejects.toThrow(
        'Figma API error (401): Unauthorized'
      );
    });

    it('should handle network errors', async () => {
      (fetch as any).mockRejectedValue(new Error('Network error'));

      await expect((client as any).request('/test')).rejects.toThrow(
        'Figma API request failed: Network error'
      );
    });

    it('should throw error when not configured', async () => {
      const unconfiguredClient = new FigmaClient();
      mockConfigStore.getConfig.mockResolvedValue(null);

      await expect(unconfiguredClient.getCurrentUser()).rejects.toThrow(
        'Figma personal access token not configured'
      );
    });
  });

  describe('specific API methods', () => {
    const mockToken = 'figd_test_token';
    const mockFileResponse = {
      document: {
        id: 'doc1',
        name: 'Test Document',
        type: 'DOCUMENT' as const,
        children: [],
      },
      components: {},
      schemaVersion: 1,
      styles: {},
    };

    beforeEach(async () => {
      mockConfigStore.getConfig.mockResolvedValue({
        personalAccessToken: mockToken,
        baseURL: 'https://api.figma.com/v1'
      });
      await (client as any).initializeFromStoredConfig();
      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockFileResponse),
      });
    });

    it('should get file', async () => {
      const result = await client.getFile('test-file-key');
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/test-file-key',
        expect.any(Object)
      );
      expect(result).toEqual(mockFileResponse);
    });

    it('should get current user', async () => {
      const mockUser = {
        id: 'user1',
        email: 'test@example.com',
        handle: 'testuser',
        img_url: 'https://example.com/avatar.png',
      };
      
      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });

      const result = await client.getCurrentUser();
      expect(result).toEqual(mockUser);
    });

    it('should get teams', async () => {
      const mockTeamsResponse = {
        teams: [
          {
            id: 'team1',
            name: 'Test Team',
            organization_id: 'org1',
          },
        ],
      };
      
      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTeamsResponse),
      });

      const result = await client.getTeams();
      expect(result).toEqual(mockTeamsResponse);
    });
  });
});