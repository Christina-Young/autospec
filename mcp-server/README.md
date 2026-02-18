# AutoSpec MCP Server

MCP (Model Context Protocol) server for integrating AutoSpec with Cursor and other AI development tools.

## Features

The MCP server provides the following tools:

- `list_requirements_documents` - List all available requirements documents
- `read_requirements_document` - Read a document by name/ID
- `create_requirement` - Add a new requirement to a document
- `update_requirement` - Update an existing requirement
- `export_document` - Export a document to markdown format

## Installation

```bash
cd mcp-server
npm install
npm run build
```

## Usage with Cursor

1. Add the MCP server to your Cursor configuration:

```json
{
  "mcpServers": {
    "autospec": {
      "command": "node",
      "args": ["/path/to/autospec/mcp-server/dist/index.js"]
    }
  }
}
```

2. Restart Cursor

3. The MCP tools will be available in Cursor's AI context

## Usage with Other Tools

The MCP server uses stdio transport, so it can be used with any MCP-compatible client. See the [MCP documentation](https://modelcontextprotocol.io) for more details.

