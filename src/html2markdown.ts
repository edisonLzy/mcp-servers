import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkStringify from 'remark-stringify';
import remarkGfm from 'remark-gfm';

/**
 * Converts HTML content to Markdown format using the unified/remark ecosystem
 * 
 * @param html - The HTML string to convert to Markdown
 * @returns The converted Markdown string
 */
export async function html2markdown(html: string): Promise<string> {
  try {
    // Create a unified processor pipeline
    const processor = unified()
      // Parse HTML to hast (HTML Abstract Syntax Tree)
      .use(rehypeParse, { fragment: true })
      // Transform hast to mdast (Markdown Abstract Syntax Tree)
      .use(rehypeRemark)
      // Add GFM (GitHub Flavored Markdown) support
      .use(remarkGfm)
      // Stringify mdast to markdown
      .use(remarkStringify)

    // Process the HTML and return the Markdown
    const result = await processor.process(html);
    return String(result);
  } catch (error) {
    console.error('Error converting HTML to Markdown:', error);
    return html; // Return original HTML if conversion fails
  }
}

/**
 * Synchronous version of html2markdown for backward compatibility
 * 
 * @param html - The HTML string to convert to Markdown
 * @returns The converted Markdown string
 */
export function html2markdownSync(html: string): string {
  try {
    // For synchronous use, we'll create a simplified processor
    const result = unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeRemark)
      .use(remarkStringify)
      .processSync(html);
    
    return String(result);
  } catch (error) {
    console.error('Error converting HTML to Markdown synchronously:', error);
    return html; // Return original HTML if conversion fails
  }
}