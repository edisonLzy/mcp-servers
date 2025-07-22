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

  it('should throw error when missing credentials', () => {
    delete process.env._yapi_token;
    delete process.env._yapi_uid;
    
    expect(() => new WeaponsClient()).toThrow(
      'Missing required environment variables (_yapi_token, _yapi_uid). Please check your .env file.'
    );
  });

  it('should accept custom config', () => {
    const customClient = new WeaponsClient({
      token: 'custom_token',
      uid: 'custom_uid',
      baseURL: 'https://custom.weapons.com'
    });
    
    expect(customClient).toBeDefined();
  });
}); 