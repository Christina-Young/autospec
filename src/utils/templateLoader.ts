import { Document } from "../store";

export async function loadTemplates(): Promise<Document[]> {
  // In a real app, you'd load these from the filesystem or API
  // For now, we'll return the templates as static data
  // In Tauri, we can use the fs plugin to read from the templates directory
  
  const templates: Document[] = [
    {
      id: "web-app-template",
      name: "Web Application Template",
      intent: "",
      context: "",
      content: `# Web Application Requirements

## Overview

This document outlines the requirements for building a modern web application using AI agents.

## Project Goals

- Build a responsive web application
- Implement user authentication
- Create a modern UI/UX
- Ensure scalability and performance

## Technical Stack

- Frontend: React/Next.js
- Backend: Node.js/Express or Python/FastAPI
- Database: PostgreSQL or MongoDB
- Deployment: Vercel/Netlify or AWS
`,
      requirements: [
        {
          id: "req-1",
          number: "F-1",
          text: "The application shall have user authentication with email/password and OAuth support",
          category: "functional",
          priority: "high",
          status: "draft",
          dependencies: [],
        },
        {
          id: "req-2",
          number: "F-2",
          text: "The application shall be responsive and work on mobile, tablet, and desktop devices",
          category: "functional",
          priority: "high",
          status: "draft",
          dependencies: [],
        },
        {
          id: "req-3",
          number: "NF-1",
          text: "The application shall load initial content within 2 seconds on a 3G connection",
          category: "non-functional",
          priority: "high",
          status: "draft",
          dependencies: [],
        },
        {
          id: "req-4",
          number: "C-1",
          text: "The application shall comply with GDPR and CCPA privacy regulations",
          category: "constraint",
          priority: "high",
          status: "draft",
          dependencies: [],
        },
      ],
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      version: 1,
    },
    {
      id: "api-template",
      name: "REST API Template",
      intent: "",
      context: "",
      content: `# REST API Requirements

## Overview

This document outlines the requirements for building a RESTful API using AI agents.

## API Design Principles

- RESTful conventions
- Versioning strategy
- Authentication and authorization
- Rate limiting
- Comprehensive error handling

## Technical Requirements

- OpenAPI/Swagger documentation
- Request/response validation
- Logging and monitoring
- Security best practices
`,
      requirements: [
        {
          id: "req-1",
          number: "F-1",
          text: "The API shall implement RESTful conventions (GET, POST, PUT, DELETE, PATCH)",
          category: "functional",
          priority: "high",
          status: "draft",
          dependencies: [],
        },
        {
          id: "req-2",
          number: "F-2",
          text: "The API shall provide OpenAPI/Swagger documentation",
          category: "functional",
          priority: "high",
          status: "draft",
          dependencies: [],
        },
        {
          id: "req-3",
          number: "F-3",
          text: "The API shall implement authentication using JWT tokens",
          category: "functional",
          priority: "high",
          status: "draft",
          dependencies: [],
        },
        {
          id: "req-4",
          number: "NF-1",
          text: "The API shall handle at least 1000 requests per second",
          category: "non-functional",
          priority: "medium",
          status: "draft",
          dependencies: [],
        },
        {
          id: "req-5",
          number: "NF-2",
          text: "The API shall have 99.9% uptime",
          category: "non-functional",
          priority: "high",
          status: "draft",
          dependencies: [],
        },
        {
          id: "req-6",
          number: "C-1",
          text: "The API shall implement rate limiting (100 requests per minute per user)",
          category: "constraint",
          priority: "medium",
          status: "draft",
          dependencies: [],
        },
      ],
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      version: 1,
    },
  ];

  return templates;
}

