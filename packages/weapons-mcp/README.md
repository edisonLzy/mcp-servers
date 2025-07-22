# Weapons MCP Server

A Model Context Protocol (MCP) server for integrating with Weapons API documentation platform.

## Features

- **API Documentation Access**: Get API endpoints and documentation from Weapons platform
- **Category-based Retrieval**: Fetch all endpoints in a specific category
- **Individual Endpoint Details**: Get detailed information for specific API endpoints
- **Structured Data**: Clean, structured API information with request/response schemas
- **Environment Configuration**: Secure credential management
- **CLI Management**: Interactive configuration and installation

## Available Tools

### `get-endpoints`
Get all API endpoints from a Weapons category.

**Parameters:**
- `catid` (required): The category ID extracted from the Weapons URL

**Example:**
```
input URL: https://weapons.xx.com/project/21048/interface/api/cat_316848
catid: 316848
```

**Response:**
Returns an array of endpoint objects with detailed information including:
- `title`: Endpoint name/description
- `method`: HTTP method (GET, POST, etc.)
- `path`: API endpoint path
- `request`: Request schema/parameters
- `response`: Response data structure

### `get-endpoint-detail`
Get detailed information for a specific API endpoint by ID.

**Parameters:**
- `id` (required): The interface ID to fetch details for

**Example:**
```
id: 12345
```

**Response:**
Returns detailed endpoint information including:
- `title`: Endpoint name/description
- `method`: HTTP method
- `path`: API endpoint path
- `request`: Detailed request schema and parameters
- `response`: Detailed response data structure and examples

## Installation

### Prerequisites
- Node.js 18+ and pnpm
- Access to Weapons platform with valid credentials

### Install Dependencies
```bash
pnpm install
```

### Configure Credentials
```bash
# Interactive configuration and MCP client installation
weapons-mcp install

# Specify target client and installation scope
weapons-mcp install --client cursor --global
weapons-mcp install --client gemini-cli
```

The install command will:
1. Check for existing credentials
2. Prompt for token and uid if needed
3. Install the MCP server configuration for your client

## Configuration

### Manual Configuration
Set the following environment variables or use the CLI installer:

```bash
# Environment variables (alternative to CLI configuration)
export _yapi_token="your_token_here"
export _yapi_uid="your_uid_here"
```

### Getting Credentials
1. Login to your Weapons platform at https://weapons.xx.com
2. Open browser developer tools (F12)
3. Check the cookies for `_yapi_token` and `_yapi_uid` values
4. Use these values in the CLI installer or environment variables

## Development

### Build
```bash
pnpm build
```

### Test
```bash
pnpm test
```

### Debug with Inspector
```bash
pnpm inspector
```

## Usage Examples

Once installed in your MCP client:

1. **Get all endpoints in a category:**
   - Tool: `get-endpoints`
   - Input: `catid: "316848"`

2. **Get specific endpoint details:**
   - Tool: `get-endpoint-detail`
   - Input: `id: "12345"`

## Supported MCP Clients

- **Cursor**: Project-level and global installation
- **Gemini CLI**: Project-level and global installation

## Troubleshooting

### Configuration Issues
- Ensure you have valid `_yapi_token` and `_yapi_uid` from Weapons platform
- Run `weapons-mcp install` to reconfigure credentials
- Check configuration file at `~/.weapons-mcp/weapons-config.json`

### Network Issues
- Verify access to https://weapons.xx.com
- Check firewall and proxy settings
- Ensure credentials haven't expired

### MCP Client Issues
- Restart your MCP client after installation
- Verify the configuration file was created correctly
- Check MCP client logs for connection errors

## License

MIT 