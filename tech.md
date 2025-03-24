 # 聊天记录查询优化 - 技术文档

## 概述

本文档提供了聊天记录查询优化功能的技术实现方案。根据需求，我们需要优化房源维护详情页和线索详情页的聊天记录查询逻辑，解决以下问题：
- 质检不通过产生的申诉单
- 云管家手动提供申诉凭证的工作量
- 已加微信的业主聊天记录无法正确显示的问题

## 系统架构变更

### 数据流程图

```
+-----------------+     +----------------+     +------------------+
| 房源/线索详情页 | --> | 加微关系接口   | --> | 聊天记录数据接口 |
+-----------------+     +----------------+     +------------------+
```

## API 接口规范

### 1. 加微关系查询接口

**接口地址**：`/api/wechat-relation/query`

**请求方式**：`POST`

**请求参数**：
```typescript
interface WechatRelationQueryRequest {
  // 业主unionId，房源有绑定业主时使用
  unionId?: string;
  // 手机号码，房源没有绑定业主时使用或线索详情页使用
  phoneNumber?: string;
}
```

**响应数据**：
```typescript
interface WechatRelationQueryResponse {
  // 接口调用结果编码
  code: number;
  // 结果消息
  message: string;
  // 加微关系数据
  data?: {
    // 企微服务人员账号
    staffAccount: string;
    // 业主微信昵称
    ownerNickname: string;
    // 关系ID，用于查询聊天记录
    relationId: string;
    // 加微时间
    addTime: string;
  }[];
}
```

### 2. 聊天记录查询接口

**接口地址**：`/api/chat-records/query`

**请求方式**：`POST`

**请求参数**：
```typescript
interface ChatRecordsQueryRequest {
  // 加微关系ID
  relationId: string;
  // 分页参数，默认获取最近的50条
  pagination: {
    // 每页数量，固定为50
    pageSize: number;
    // 页码，从1开始
    pageNumber: number;
  };
}
```

**响应数据**：
```typescript
interface ChatRecordsQueryResponse {
  // 接口调用结果编码
  code: number;
  // 结果消息
  message: string;
  // 聊天记录数据
  data?: {
    // 总记录数
    total: number;
    // 是否还有更多历史记录
    hasMore: boolean;
    // 聊天记录列表
    records: {
      // 消息ID
      messageId: string;
      // 发送者类型（staff:企微人员 / owner:业主）
      senderType: 'staff' | 'owner';
      // 消息内容
      content: string;
      // 消息类型（text:文本 / image:图片 / voice:语音 / file:文件 / etc.）
      contentType: string;
      // 发送时间
      sendTime: string;
    }[];
  };
}
```

## 前端技术实现方案

### 组件设计

#### 1. 聊天记录弹窗组件 (ChatRecordModal)

创建一个可复用的聊天记录弹窗组件，支持：
- 展示企微号与业主微信的对话记录
- 默认展示最近50条聊天记录
- 加载更多历史记录的功能
- 自定义弹窗标题
- 无数据时显示"暂无记录"的空状态

```typescript
// ChatRecordModal.tsx
interface ChatRecordModalProps {
  // 是否可见
  visible: boolean;
  // 关闭弹窗的回调
  onClose: () => void;
  // 标题
  title: string;
  // 查询参数
  queryParams: {
    unionId?: string;
    phoneNumber?: string;
  };
}

// 组件内部状态
interface ChatRecordModalState {
  loading: boolean;
  records: ChatRecord[];
  currentPage: number;
  hasMore: boolean;
  staffAccount: string;
  ownerNickname: string;
  relationId: string;
  error: string | null;
}
```

#### 2. 聊天记录查询服务 (ChatRecordService)

创建一个服务类处理聊天记录的查询逻辑：

```typescript
// services/ChatRecordService.ts
class ChatRecordService {
  // 查询加微关系
  static async queryWechatRelation(params: WechatRelationQueryRequest): Promise<WechatRelationQueryResponse> {
    // 实现接口调用
  }
  
  // 查询聊天记录
  static async queryChatRecords(params: ChatRecordsQueryRequest): Promise<ChatRecordsQueryResponse> {
    // 实现接口调用
  }
}
```

### 房源维护详情页实现

#### 逻辑流程

1. 判断房源是否有绑定业主
   - 如有绑定业主，使用业主unionId查询加微关系
   - 如无绑定业主，使用房源挂牌手机号码查询加微关系
2. 获取最近一次加微关系，用于查询聊天记录
3. 聊天记录弹窗展示最近50条记录
4. 实现查看更多历史记录的功能

```typescript
// 在房源维护详情页中实现的代码
import { ChatRecordModal } from '@/components/ChatRecordModal';

const PropertyMaintenanceDetail: React.FC = () => {
  // 状态定义
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  
  // 打开聊天记录弹窗
  const openChatRecordModal = () => {
    setChatModalVisible(true);
  };
  
  // 关闭聊天记录弹窗
  const closeChatRecordModal = () => {
    setChatModalVisible(false);
  };
  
  // 获取查询参数
  const getChatQueryParams = () => {
    // 判断房源是否有绑定业主
    if (property?.owner?.unionId) {
      return { unionId: property.owner.unionId };
    } else if (property?.listingPhoneNumber) {
      return { phoneNumber: property.listingPhoneNumber };
    }
    return {};
  };
  
  return (
    <div>
      {/* 其他房源详情内容 */}
      
      {/* 聊天记录按钮 */}
      <Button onClick={openChatRecordModal}>查看聊天记录</Button>
      
      {/* 聊天记录弹窗 */}
      <ChatRecordModal
        visible={chatModalVisible}
        onClose={closeChatRecordModal}
        title="聊天记录"
        queryParams={getChatQueryParams()}
      />
    </div>
  );
};
```

### 线索详情页实现

#### 逻辑流程

1. 从线索预录入表获取正确的手机号码
2. 使用手机号码查询加微关系
3. 获取最近一次加微关系，用于查询聊天记录
4. 聊天记录弹窗展示最近50条记录
5. 实现查看更多历史记录的功能

```typescript
// 在线索详情页中实现的代码
import { ChatRecordModal } from '@/components/ChatRecordModal';

const LeadDetailPage: React.FC = () => {
  // 状态定义
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [lead, setLead] = useState<LeadDetail | null>(null);
  
  // 打开聊天记录弹窗
  const openChatRecordModal = () => {
    setChatModalVisible(true);
  };
  
  // 关闭聊天记录弹窗
  const closeChatRecordModal = () => {
    setChatModalVisible(false);
  };
  
  // 获取查询参数 - 注意这里使用线索预录入表的手机号
  const getChatQueryParams = () => {
    if (lead?.preEntryPhoneNumber) {
      return { phoneNumber: lead.preEntryPhoneNumber };
    }
    return {};
  };
  
  return (
    <div>
      {/* 其他线索详情内容 */}
      
      {/* 聊天记录按钮 */}
      <Button onClick={openChatRecordModal}>查看聊天记录</Button>
      
      {/* 聊天记录弹窗 */}
      <ChatRecordModal
        visible={chatModalVisible}
        onClose={closeChatRecordModal}
        title="聊天记录"
        queryParams={getChatQueryParams()}
      />
    </div>
  );
};
```

## 私域服务记录判断逻辑更新

更新私域服务记录判断是否加微的逻辑，使用与聊天记录查询相同的判断方式：

```typescript
// 私域服务记录判断逻辑
const checkHasAddedWechat = async (property: PropertyDetail): Promise<boolean> => {
  try {
    // 构建查询参数
    const queryParams: WechatRelationQueryRequest = {};
    if (property?.owner?.unionId) {
      queryParams.unionId = property.owner.unionId;
    } else if (property?.listingPhoneNumber) {
      queryParams.phoneNumber = property.listingPhoneNumber;
    } else {
      return false;
    }
    
    // 调用加微关系查询接口
    const response = await ChatRecordService.queryWechatRelation(queryParams);
    
    // 判断是否有加微关系
    return response.data && response.data.length > 0;
  } catch (error) {
    console.error('检查加微关系失败:', error);
    return false;
  }
};
```

## 异常处理

1. 网络请求异常
   - 实现请求重试机制
   - 显示友好的错误提示
   - 记录详细的错误日志

2. 数据异常
   - 无数据时显示"暂无记录"
   - 数据格式错误时提供降级处理

## 性能优化

1. **聊天记录缓存**
   - 实现聊天记录数据的本地缓存
   - 滚动加载更多时只请求新数据

2. **UI渲染优化**
   - 使用虚拟列表渲染大量聊天记录
   - 图片和文件类型消息懒加载

## 测试计划

1. **单元测试**
   - 测试加微关系查询逻辑
   - 测试聊天记录加载逻辑
   - 测试私域服务记录判断逻辑

2. **集成测试**
   - 测试房源维护详情页聊天记录功能
   - 测试线索详情页聊天记录功能

3. **兼容性测试**
   - 不同浏览器兼容性测试
   - 移动端适配测试

## 部署与监控

1. **灰度发布**
   - 先对5%的用户开放新功能
   - 根据监控数据调整后全量发布

2. **监控指标**
   - 接口成功率
   - 接口响应时间
   - 前端错误率
   - 用户使用频率

## 后续优化方向

1. 聊天记录实时更新功能
2. 聊天记录搜索功能
3. 聊天记录图表分析功能
4. 聊天记录导出功能

## 时间计划

| 阶段 | 时间估计 | 交付物 |
|-----|---------|-------|
| 需求分析 | 1天 | 需求规格说明书 |
| 接口对接 | 2天 | API集成测试文档 |
| 组件开发 | 3天 | 聊天记录弹窗组件 |
| 功能集成 | 2天 | 房源和线索页面集成 |
| 测试 | 2天 | 测试报告 |
| 发布 | 1天 | 发布文档 |