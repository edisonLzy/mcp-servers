import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    name: 'weapons-mcp',
    include: ['./tests/**']
  }
}); 