import type { CallToolResult } from '@modelcontextprotocol/sdk/types';
import type { FeishuError } from '../types/feishu';

type CallToolFailureResult = CallToolResult & {
  isError: true;
};

export async function runWithExceptionHandler<T extends CallToolResult>(handler: () => Promise<T>): Promise<T | CallToolFailureResult> {
  try {
    return await handler();
  } catch (error) {
    const feishuError = error as FeishuError;
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(feishuError)
      }],
      isError: true,
    };
  }
}