# Confluence MCP

A utility for interacting with Confluence pages.

## Setup

1. Install dependencies:
   ```
   pnpm install
   ```

2. Configure your `.env` file with your Confluence credentials:
   ```
   CONFLUENCE_BASE_URL=https://wiki.lianjia.com
   CONFLUENCE_USERNAME=your_username
   CONFLUENCE_PASSWORD=your_password
   ```

## Usage

### Fetch a Specific Confluence Page

To fetch the content from a specific Confluence page:

```bash
pnpm run get-page
```

This will retrieve the content from the Confluence page with ID 1490637603 and save it as both HTML and Markdown in the `output` directory.

### Custom Page IDs

To fetch a different page, edit the `pageId` variable in `src/getPageContent.ts`.

## Features

- Retrieves Confluence page content using the REST API
- Converts HTML content to Markdown for better readability
- Saves both HTML and Markdown versions of the content