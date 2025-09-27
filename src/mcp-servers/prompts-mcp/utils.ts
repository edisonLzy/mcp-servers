import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Get current file directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Read workflow file content
 * @param filename Workflow file name
 * @returns File content
 */
export async function readWorkflowFile(filename: string): Promise<string> {
  try {
    // Try reading from multiple possible locations
    const possiblePaths = [
      join(__dirname, 'workflows', filename),
      join(__dirname, '..', 'workflows', filename),
      join(__dirname, '..', '..', 'workflows', filename),
      join(__dirname, filename),
    ];

    for (const filePath of possiblePaths) {
      try {
        const content = await readFile(filePath, 'utf-8');
        return content;
      } catch {
        // Continue trying next path
        continue;
      }
    }

    // If all paths fail, return default content
    return `Workflow file ${filename} not found. Please ensure the file exists in the correct location.`;
  } catch (error) {
    console.error(`Error reading workflow file ${filename}:`, error);
    return `Error reading workflow file ${filename}: ${error}`;
  }
}