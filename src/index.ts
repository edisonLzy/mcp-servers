import { ConfluenceApi } from './confluenceApi';
import dotenv from 'dotenv';
import { html2markdown } from './html2markdown';

// Load environment variables
dotenv.config();

async function main() {
  try {
    const confluenceApi = new ConfluenceApi();
    const pageId = process.env.CONFLUENCE_PAGE_ID || '1484645889';
    
    console.log(`Fetching Confluence page with ID: ${pageId}`);
    
    const page = await confluenceApi.getPageContent(pageId);
    
    console.log('\n=== Page Information ===');
    console.log(`Title: ${page.title}`);
    console.log(`Version: ${page.version.number}`);
    
    // Get HTML content
    const htmlContent = page.body.storage.value;
    console.log('\n=== Page HTML Content');
    console.log(htmlContent);

    // Convert HTML to Markdown
    const markdownContent = await html2markdown(htmlContent);
    console.log('\n=== Page Markdown Content');
    console.log(markdownContent);
    
    // Get plain text content
    const plainTextContent = confluenceApi.extractTextFromHtml(htmlContent);
    console.log('\n=== Page Plain Text Content');
    console.log(plainTextContent);
    
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the main function
main().then(() => console.log('Done!'));