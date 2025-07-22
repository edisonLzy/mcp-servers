import { WEAPONS_API_BASE_URL } from './constant.js';
import { ConfigStore } from './auth/configStore.js';
import type {
  WeaponsConfig,
  WeaponsError,
  EndpointBasic,
  EndpointListResponse,
  EndpointDetailResponse,
  Endpoint
} from './types/weapons.js';

export class WeaponsClient {
  private token: string = '';
  private uid: string = '';
  private baseURL: string;
  private configStore: ConfigStore;

  constructor(config?: Partial<WeaponsConfig>) {
    this.configStore = ConfigStore.create();
    
    this.baseURL = config?.baseURL || WEAPONS_API_BASE_URL;
  }

  private async initializeFromStoredConfig(): Promise<void> {
    try {
      const storedConfig = await this.configStore.getConfig();
      if (storedConfig) {
        this.token = this.token || storedConfig.token;
        this.uid = this.uid || storedConfig.uid;
        this.baseURL = this.baseURL || storedConfig.baseURL || WEAPONS_API_BASE_URL;
      }
    } catch (error) {
      console.warn('Failed to load stored config:', error);
    }
  }

  async ensureInitialized(): Promise<void> {
    // Always try to load from stored config if we don't have credentials
    if (!this.token || !this.uid) {
      await this.initializeFromStoredConfig();
    }
    
    if (!this.token || !this.uid) {
      throw new Error(
        'Missing required credentials (token, uid). Please run "weapons-mcp install" to configure your credentials.'
      );
    }
  }

  private get cookie(): string {
    return `_yapi_token=${this.token};_yapi_uid=${this.uid}`;
  }

  private parseRequest(request: string): any {
    try {
      const { properties } = JSON.parse(request);
      return properties;
    } catch {
      return null;
    }
  }

  private parseResponse(response: string): any {
    try {
      const { properties: { data } } = JSON.parse(response);
      return data;
    } catch {
      return null;
    }
  }

  private handleError(error: any): WeaponsError {
    if (error.response?.data) {
      const data = error.response.data;
      return {
        code: data.errno || 'UNKNOWN_ERROR',
        message: data.errmsg || 'Unknown error occurred',
        details: data
      };
    }

    return {
      code: 'NETWORK_ERROR',
      message: error.message || 'Network error occurred',
      details: { originalError: error }
    };
  }

  /**
   * 获取指定分类下的接口列表
   * @param catid 分类ID
   * @returns 接口基本信息列表
   */
  async getEndpointList(catid: string): Promise<EndpointBasic[]> {
    await this.ensureInitialized();
    
    const url = `${this.baseURL}/api/interface/list_cat?page=1&limit=15&catid=${catid}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          Cookie: this.cookie
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch endpoint list: ${response.statusText}`);
      }
      
      const responseData = await response.json() as EndpointListResponse;
      
      if (responseData.errcode !== 0) {
        throw new Error(`API Error: ${responseData.errmsg}`);
      }
      
      return responseData.data.list.map((item) => ({
        _id: item._id,
        method: item.method,
        path: item.path,
        title: item.title,
      }));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 获取接口详情
   * @param id 接口ID
   * @returns 接口详细信息
   */
  async getEndpointDetail(id: string): Promise<Endpoint> {
    await this.ensureInitialized();
    const url = `${this.baseURL}/api/interface/get?id=${id}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          Cookie: this.cookie
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch endpoint detail: ${response.statusText}`);
      }
      
      const responseData = await response.json() as EndpointDetailResponse;
      
      if (responseData.errcode !== 0) {
        throw new Error(`API Error: ${responseData.errmsg}`);
      }
      
      const data = responseData.data;
      return {
        method: data.method,
        path: data.path,
        title: data.title,
        request: this.parseRequest(data.req_body_other) || '',
        response: this.parseResponse(data.res_body) || '',
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 获取指定分类下的所有接口详情
   * @param catid 分类ID
   * @returns 完整的接口信息列表
   */
  async getEndpoints(catid: string): Promise<Endpoint[]> {
    try {
      const endpoints = await this.getEndpointList(catid);
      const detailedEndpoints: Endpoint[] = [];
      
      for (const endpoint of endpoints) {
        const detail = await this.getEndpointDetail(endpoint._id.toString());
        detailedEndpoints.push({
          title: detail.title,
          method: detail.method,
          path: detail.path,
          response: detail.response,
          request: detail.request
        });
      }
      
      return detailedEndpoints;
    } catch (error) {
      console.error('Error fetching endpoints:', error);
      throw error;
    }
  }
} 