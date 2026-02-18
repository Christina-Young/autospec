#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs/promises";
import * as path from "path";
import { randomUUID } from "crypto";

const SERVER_NAME = "autospec";
const SERVER_VERSION = "0.1.0";

interface Requirement {
  id: string;
  number: string;
  text: string;
  category: "functional" | "non-functional" | "constraint" | "acceptance";
  priority: "high" | "medium" | "low";
  status: "draft" | "review" | "approved" | "implemented";
}

interface Document {
  id: string;
  name: string;
  content: string;
  requirements: Requirement[];
}

class RequirementsBuilderServer {
  private server: Server;
  private documentsPath: string;

  constructor() {
    this.server = new Server(
      {
        name: SERVER_NAME,
        version: SERVER_VERSION,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Default documents path (can be configured)
    this.documentsPath = path.join(
      process.env.HOME || process.env.USERPROFILE || ".",
      ".autospec",
      "documents"
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "list_requirements_documents",
            description:
              "List all available requirements documents",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "read_requirements_document",
            description:
              "Read a requirements document by name or ID. Returns the full document content and requirements.",
            inputSchema: {
              type: "object",
              properties: {
                document_name: {
                  type: "string",
                  description: "Name or ID of the document to read",
                },
              },
              required: ["document_name"],
            },
          },
          {
            name: "create_requirement",
            description:
              "Create a new requirement in a document",
            inputSchema: {
              type: "object",
              properties: {
                document_name: {
                  type: "string",
                  description: "Name or ID of the document",
                },
                text: {
                  type: "string",
                  description: "Requirement text",
                },
                category: {
                  type: "string",
                  enum: ["functional", "non-functional", "constraint", "acceptance"],
                  description: "Requirement category",
                },
                priority: {
                  type: "string",
                  enum: ["high", "medium", "low"],
                  description: "Requirement priority",
                },
              },
              required: ["document_name", "text", "category", "priority"],
            },
          },
          {
            name: "update_requirement",
            description:
              "Update an existing requirement",
            inputSchema: {
              type: "object",
              properties: {
                document_name: {
                  type: "string",
                  description: "Name or ID of the document",
                },
                requirement_id: {
                  type: "string",
                  description: "ID of the requirement to update",
                },
                text: {
                  type: "string",
                  description: "New requirement text (optional)",
                },
                status: {
                  type: "string",
                  enum: ["draft", "review", "approved", "implemented"],
                  description: "New status (optional)",
                },
                priority: {
                  type: "string",
                  enum: ["high", "medium", "low"],
                  description: "New priority (optional)",
                },
              },
              required: ["document_name", "requirement_id"],
            },
          },
          {
            name: "export_document",
            description:
              "Export a requirements document to markdown format",
            inputSchema: {
              type: "object",
              properties: {
                document_name: {
                  type: "string",
                  description: "Name or ID of the document to export",
                },
                output_path: {
                  type: "string",
                  description: "Path where to save the exported markdown file",
                },
              },
              required: ["document_name"],
            },
          },
        ] as Tool[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "list_requirements_documents":
            return await this.listDocuments();

          case "read_requirements_document":
            return await this.readDocument(args.document_name as string);

          case "create_requirement":
            return await this.createRequirement(
              args.document_name as string,
              args.text as string,
              args.category as Requirement["category"],
              args.priority as Requirement["priority"]
            );

          case "update_requirement":
            return await this.updateRequirement(
              args.document_name as string,
              args.requirement_id as string,
              args as any
            );

          case "export_document":
            return await this.exportDocument(
              args.document_name as string,
              args.output_path as string | undefined
            );

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async ensureDocumentsDir() {
    try {
      await fs.mkdir(this.documentsPath, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  private async listDocuments() {
    await this.ensureDocumentsDir();
    const files = await fs.readdir(this.documentsPath);
    const documents = files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              documents: documents,
              count: documents.length,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async readDocument(documentName: string) {
    await this.ensureDocumentsDir();
    const filePath = path.join(
      this.documentsPath,
      `${documentName}.json`
    );

    try {
      const content = await fs.readFile(filePath, "utf-8");
      const document: Document = JSON.parse(content);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(document, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Document not found: ${documentName}`);
    }
  }

  private async createRequirement(
    documentName: string,
    text: string,
    category: Requirement["category"],
    priority: Requirement["priority"]
  ) {
    await this.ensureDocumentsDir();
    const filePath = path.join(
      this.documentsPath,
      `${documentName}.json`
    );

    let document: Document;
    try {
      const content = await fs.readFile(filePath, "utf-8");
      document = JSON.parse(content);
    } catch {
      // Create new document if it doesn't exist
      document = {
        id: randomUUID(),
        name: documentName,
        content: "",
        requirements: [],
      };
    }

    const categoryCounts = document.requirements.filter(
      (r) => r.category === category
    ).length;

    const newRequirement: Requirement = {
      id: randomUUID(),
      number: `${category.charAt(0).toUpperCase()}-${categoryCounts + 1}`,
      text,
      category,
      priority,
      status: "draft",
    };

    document.requirements.push(newRequirement);

    await fs.writeFile(filePath, JSON.stringify(document, null, 2));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              requirement: newRequirement,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async updateRequirement(
    documentName: string,
    requirementId: string,
    updates: Partial<Requirement>
  ) {
    await this.ensureDocumentsDir();
    const filePath = path.join(
      this.documentsPath,
      `${documentName}.json`
    );

    const content = await fs.readFile(filePath, "utf-8");
    const document: Document = JSON.parse(content);

    const requirement = document.requirements.find(
      (r) => r.id === requirementId
    );
    if (!requirement) {
      throw new Error(`Requirement not found: ${requirementId}`);
    }

    Object.assign(requirement, updates);
    await fs.writeFile(filePath, JSON.stringify(document, null, 2));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              requirement,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async exportDocument(
    documentName: string,
    outputPath?: string
  ) {
    await this.ensureDocumentsDir();
    const filePath = path.join(
      this.documentsPath,
      `${documentName}.json`
    );

    const content = await fs.readFile(filePath, "utf-8");
    const document: Document = JSON.parse(content);

    let markdown = `# ${document.name}\n\n`;
    markdown += `---\n\n`;

    const categories = ["functional", "non-functional", "constraint", "acceptance"];

    categories.forEach((category) => {
      const reqs = document.requirements.filter((r) => r.category === category);
      if (reqs.length > 0) {
        markdown += `## ${category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")} Requirements\n\n`;
        reqs.forEach((req) => {
          markdown += `### ${req.number}: ${req.text}\n\n`;
          markdown += `- **Priority:** ${req.priority}\n`;
          markdown += `- **Status:** ${req.status}\n`;
          markdown += `\n`;
        });
      }
    });

    const exportPath =
      outputPath ||
      path.join(process.cwd(), `${documentName}.md`);

    await fs.writeFile(exportPath, markdown);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              path: exportPath,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("AutoSpec MCP server running on stdio");
  }
}

const server = new RequirementsBuilderServer();
server.run().catch(console.error);

