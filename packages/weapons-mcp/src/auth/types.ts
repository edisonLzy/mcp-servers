export interface WeaponsConfigInfo {
  token: string;
  uid: string;
  baseURL: string; // 改为必需字段
  createdAt: number;
}

export type StoredConfigData = WeaponsConfigInfo; 