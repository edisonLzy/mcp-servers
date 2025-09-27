import { registerSummaryDailyNotePrompt } from './summary-daily-note.js';
import { registerOrganizeLearningNotesPrompt } from './organize-learning-notes.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerPrompts(server: McpServer) {
  // Register all prompt workflows
  registerSummaryDailyNotePrompt(server);
  registerOrganizeLearningNotesPrompt(server);
}