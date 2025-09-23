export const FEISHU_API_BASE_URL = 'https://open.feishu.cn';

export const FEISHU_SCOPES = [
  'wiki:wiki',
  //   'contact:user.employee_id:readonly',
  //   'contact:contact.base:readonly',
  //   'contact:contact:access_as_app',
  //   'contact:contact:readonly',
  //   'contact:contact:readonly_as_app',
  'wiki:wiki:readonly',
  'docx:document',
  'docx:document.block:convert',
  'bitable:app',
  'offline_access',
  'board:whiteboard:node:read',
  'board:whiteboard:node:create',
  'board:whiteboard:node:update',
  'board:whiteboard:node:delete',
];
