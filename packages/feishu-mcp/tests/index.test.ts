import { describe, it, expect, beforeEach } from 'vitest';
import { FeishuClient } from '../src/feishuClient.js';

describe('FeishuClient', () => {
  let client: FeishuClient;

  beforeEach(() => {
    client = new FeishuClient({
      appId: process.env.FEISHU_APP_ID || '',
      appSecret: process.env.FEISHU_APP_SECRET || '',
      baseURL: process.env.FEISHU_API_BASE_URL || 'https://open.feishu.cn/open-apis'
    });
  });

  describe('constructor', () => {
    it('should create client with config', () => {
      expect(client).toBeDefined();
    });
  });

  describe('wiki methods', () => {
    it('should have listWikiSpaces method', () => {
      expect(typeof client.listWikiSpaces).toBe('function');
    });

    it('should have getSpaceNodes method', () => {
      expect(typeof client.getSpaceNodes).toBe('function');
    });

    it('should have createWikiNode method', () => {
      expect(typeof client.createWikiNode).toBe('function');
    });
  });

  describe('document methods', () => {
    it('should have createDocument method', () => {
      expect(typeof client.createDocument).toBe('function');
    });

    it('should have getDocumentContent method', () => {
      expect(typeof client.getDocumentContent).toBe('function');
    });

    it('should have updateDocument method', () => {
      expect(typeof client.updateDocument).toBe('function');
    });
  });
});