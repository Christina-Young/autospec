import { create } from "zustand";
import { generateId } from "./utils/id";
import { saveDocuments, loadDocuments } from "./utils/persistence";

export interface Requirement {
  id: string;
  number: string;
  text: string;
  category: "functional" | "non-functional" | "constraint" | "acceptance";
  priority: "high" | "medium" | "low";
  status: "draft" | "review" | "approved" | "implemented";
  dependencies?: string[];
  comments?: Comment[];
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
}

export interface Document {
  id: string;
  name: string;
  content: string;
  requirements: Requirement[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

interface AppState {
  documents: Document[];
  currentDocumentId: string | null;
  currentDocument: Document | null;
  templates: Document[];
  
  loadTemplates: () => Promise<void>;
  setCurrentDocument: (id: string) => void;
  createDocument: (name: string, templateId?: string) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  addRequirement: (requirement: Omit<Requirement, "id" | "number">) => void;
  updateRequirement: (id: string, updates: Partial<Requirement>) => void;
  deleteRequirement: (id: string) => void;
  exportToMarkdown: (id: string) => string;
}

// Load documents from persistence on initialization
const initialDocuments = typeof window !== "undefined" ? loadDocuments() : [];

export const useStore = create<AppState>((set, get) => ({
  documents: initialDocuments,
  currentDocumentId: initialDocuments.length > 0 ? initialDocuments[0].id : null,
  currentDocument: initialDocuments.length > 0 ? initialDocuments[0] : null,
  templates: [],

  loadTemplates: async () => {
    const { loadTemplates: loadTemplatesFromFile } = await import("./utils/templateLoader");
    const templates = await loadTemplatesFromFile();
    set({ templates });
  },

  setCurrentDocument: (id: string) => {
    const doc = get().documents.find((d) => d.id === id);
    set({ currentDocumentId: id, currentDocument: doc || null });
  },

  createDocument: (name: string, templateId?: string) => {
    const template = templateId
      ? get().templates.find((t) => t.id === templateId)
      : null;

    const newDoc: Document = {
      id: generateId(),
      name,
      content: template?.content || "",
      requirements: template?.requirements || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };

    set((state) => {
      const newDocuments = [...state.documents, newDoc];
      // Persist to localStorage
      if (typeof window !== "undefined") {
        saveDocuments(newDocuments);
      }
      return {
        documents: newDocuments,
        currentDocumentId: newDoc.id,
        currentDocument: newDoc,
      };
    });
  },

  updateDocument: (id: string, updates: Partial<Document>) => {
    set((state) => {
      const updatedDocuments = state.documents.map((doc) =>
        doc.id === id
          ? { ...doc, ...updates, updatedAt: new Date(), version: doc.version + 1 }
          : doc
      );
      
      // Persist to localStorage
      if (typeof window !== "undefined") {
        saveDocuments(updatedDocuments);
      }
      
      return {
        documents: updatedDocuments,
        currentDocument:
          state.currentDocumentId === id && state.currentDocument
            ? { ...state.currentDocument, ...updates, updatedAt: new Date() }
            : state.currentDocument,
      };
    });
  },

  addRequirement: (requirement: Omit<Requirement, "id" | "number">) => {
    const state = get();
    if (!state.currentDocument) return;

    const categoryCounts = state.currentDocument.requirements.filter(
      (r) => r.category === requirement.category
    ).length;

    const newRequirement: Requirement = {
      ...requirement,
      id: generateId(),
      number: `${requirement.category.charAt(0).toUpperCase()}-${categoryCounts + 1}`,
    };

    const updatedRequirements = [...state.currentDocument.requirements, newRequirement];
    
    state.updateDocument(state.currentDocument.id, {
      requirements: updatedRequirements,
    });
  },

  updateRequirement: (id: string, updates: Partial<Requirement>) => {
    const state = get();
    if (!state.currentDocument) return;

    const updatedRequirements = state.currentDocument.requirements.map((req) =>
      req.id === id ? { ...req, ...updates } : req
    );

    state.updateDocument(state.currentDocument.id, {
      requirements: updatedRequirements,
    });
  },

  deleteRequirement: (id: string) => {
    const state = get();
    if (!state.currentDocument) return;

    const updatedRequirements = state.currentDocument.requirements.filter(
      (req) => req.id !== id
    );

    state.updateDocument(state.currentDocument.id, {
      requirements: updatedRequirements,
    });
  },

  exportToMarkdown: (id: string) => {
    const doc = get().documents.find((d) => d.id === id);
    if (!doc) return "";

    let markdown = `# ${doc.name}\n\n`;
    markdown += `**Version:** ${doc.version}  \n`;
    markdown += `**Last Updated:** ${doc.updatedAt.toLocaleDateString()}\n\n`;
    markdown += `---\n\n`;

    // Group requirements by category
    const categories = ["functional", "non-functional", "constraint", "acceptance"];
    
    categories.forEach((category) => {
      const reqs = doc.requirements.filter((r) => r.category === category);
      if (reqs.length > 0) {
        markdown += `## ${category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")} Requirements\n\n`;
        reqs.forEach((req) => {
          markdown += `### ${req.number}: ${req.text}\n\n`;
          markdown += `- **Priority:** ${req.priority}\n`;
          markdown += `- **Status:** ${req.status}\n`;
          if (req.dependencies && req.dependencies.length > 0) {
            markdown += `- **Dependencies:** ${req.dependencies.join(", ")}\n`;
          }
          markdown += `\n`;
        });
      }
    });

    return markdown;
  },
}));

