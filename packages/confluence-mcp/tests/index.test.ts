import { beforeEach, describe, expect, it } from 'vitest';
import { ConfluenceClient } from '../src/confluenceClient.js';

describe('Confluence', () => {
  let confluenceClient: ConfluenceClient;
  beforeEach(() => {
    confluenceClient = new ConfluenceClient();
  });

  it('should be defined', async () => {
    expect(confluenceClient).toBeDefined();
  });
});
