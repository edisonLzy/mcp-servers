import { Buffer } from 'node:buffer';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface ConfluencePage {
  id: string;
  type: string;
  status: string;
  title: string;
  body: {
    storage: {
      value: string;
      representation: string;
    };
    view: {
      value: string;
      representation: string;
    };
  };
  version: {
    number: number;
  };
}

export class ConfluenceClient {
  private baseUrl: string;
  private username: string;
  private password: string;
  private authToken: string;

  constructor() {
    this.baseUrl = process.env.CONFLUENCE_BASE_URL || '';
    this.username = process.env.CONFLUENCE_USERNAME || '';
    this.password = process.env.CONFLUENCE_PASSWORD || '';
    this.authToken = Buffer.from(`${this.username}:${this.password}`).toString(
      'base64',
    );

    if (!this.baseUrl || !this.username || !this.password) {
      throw new Error(
        'Missing required environment variables. Please check your .env file.',
      );
    }
  }

  /**
   * Get Confluence page content by page ID
   * @param pageId - The Confluence page ID
   * @returns The page content
   */
  async getPageContent(pageId: string): Promise<ConfluencePage> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/api/content/${pageId}?expand=body.storage,body.view,version,metadata`,
        {
          headers: {
            Authorization: `Basic ${this.authToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios Error:', error.message);
        if (error.response) {
          console.error('Status:', error.response.status);
          console.error('Data:', error.response.data);
        }
      } else {
        console.error('Unexpected Error:', error);
      }
      throw error;
    }
  }
}
