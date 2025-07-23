import { beforeEach, describe, expect, it } from 'vitest';
import { WeaponsClient } from '../src/weaponsClient.js';

describe('WeaponsClient', () => {
  let weaponsClient: WeaponsClient;

  beforeEach(() => {
    // Mock environment variables for testing
    process.env._yapi_token = 'test_token';
    process.env._yapi_uid = 'test_uid';
    
    weaponsClient = new WeaponsClient();
  });

  it('should be defined', () => {
    expect(weaponsClient).toBeDefined();
  });

  it('should handle missing credentials gracefully', async () => {
    // Clear both env vars and create new client
    const originalToken = process.env._yapi_token;
    const originalUid = process.env._yapi_uid;
    
    delete process.env._yapi_token;
    delete process.env._yapi_uid;
    
    const client = new WeaponsClient();
    
    try {
      // Should throw when trying to get endpoints
      await expect(client.getEndpoints('123')).rejects.toThrow(
        'Missing required credentials'
      );
    } finally {
      // Restore env vars
      if (originalToken) process.env._yapi_token = originalToken;
      if (originalUid) process.env._yapi_uid = originalUid;
    }
  });

  it('should accept custom config', () => {
    const customClient = new WeaponsClient({
      token: 'custom_token',
      uid: 'custom_uid',
      baseURL: 'https://custom.api.com'
    });
    
    expect(customClient).toBeDefined();
  });

  it('should handle missing credentials for getEndpointDetail', async () => {
    // Clear both env vars and create new client
    const originalToken = process.env._yapi_token;
    const originalUid = process.env._yapi_uid;
    
    delete process.env._yapi_token;
    delete process.env._yapi_uid;
    
    const client = new WeaponsClient();
    
    try {
      // Should throw when trying to get endpoint detail
      await expect(client.getEndpointDetail('123')).rejects.toThrow(
        'Missing required credentials'
      );
    } finally {
      // Restore env vars
      if (originalToken) process.env._yapi_token = originalToken;
      if (originalUid) process.env._yapi_uid = originalUid;
    }
  });
}); 