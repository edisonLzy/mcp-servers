// Weapons API 类型定义

// 通用接口响应结构
export interface ApiResponse<T> {
  errno: string;
  errmsg: string;
  data: T;
}

// 基本接口信息
export interface EndpointBasic {
  _id: number;
  method: string;
  path: string;
  title: string;
}

// 接口列表响应中的单个接口
export interface EndpointFromResponse {
  status: string;
  record_type: number;
  interface_type: string;
  api_opened: boolean;
  index: number;
  tag: string[];
  _id: number;
  catid: number;
  method: string;
  path: string;
  project_id: number;
  title: string;
  uid: number;
  add_time: number;
  up_time: number;
}

// 接口列表响应
export type EndpointListResponse = ApiResponse<{
  count: number;
  total: number;
  list: EndpointFromResponse[];
}>;

// 接口详情响应
export interface EndpointDetail {
  _id: number;
  catid: number;
  method: string;
  path: string;
  title: string;
  req_body_other: string;
  res_body: string;
  project_id: number;
  [key: string]: any;
}

export type EndpointDetailResponse = ApiResponse<EndpointDetail>;

// 最终清洗后的接口信息
export interface Endpoint {
  title: string;
  method: string;
  path: string;
  request: string;
  response: string;
}

// Weapons 客户端配置
export interface WeaponsConfig {
  token: string;
  uid: string;
  baseURL?: string;
}

// 错误类型
export interface WeaponsError {
  code: string;
  message: string;
  details?: Record<string, any>;
} 