import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    name: 'confluence-mcp',
    include: ['./tests/**']
  }
});
