import { create } from "zustand";
import { generateId } from "./utils/id";
import { saveDocuments, loadDocuments } from "./utils/persistence";

export type AIProvider = "openai" | "anthropic" | "gemini" | "grok" | "ollama";
export type Theme = "system" | "light" | "dark";
export type EditorFontSize = "sm" | "md" | "lg";
export type EditorLineSpacing = "normal" | "relaxed";

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
  /** Intent Engineering: purpose, strategy, goals, trade-offs, decision boundaries (what we want agents to optimize for). */
  intent: string;
  /** Context Engineering: what information/tokens to supply to the agent(s); curation strategy and key sources. */
  context: string;
  /** Specification Engineering: complete, structured description of outputs and how quality is measured (content + requirements). */
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
  aiProvider: AIProvider;
  theme: Theme;
  editorFontSize: EditorFontSize;
  editorLineSpacing: EditorLineSpacing;
  autosaveEnabled: boolean;
  autosaveIntervalSeconds: number;
  defaultTemplateId: string | null;
  exportIncludeMetadata: boolean;
  exportFileNamePattern: string;
  enableMcpIntegration: boolean;
  
  loadTemplates: () => Promise<void>;
  setCurrentDocument: (id: string) => void;
  createDocument: (name: string, templateId?: string) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  addRequirement: (requirement: Omit<Requirement, "id" | "number">) => void;
  updateRequirement: (id: string, updates: Partial<Requirement>) => void;
  deleteRequirement: (id: string) => void;
  exportToMarkdown: (id: string) => string;
  setAIProvider: (provider: AIProvider) => void;
  setTheme: (theme: Theme) => void;
  setEditorFontSize: (size: EditorFontSize) => void;
  setEditorLineSpacing: (spacing: EditorLineSpacing) => void;
  setAutosaveEnabled: (enabled: boolean) => void;
  setAutosaveIntervalSeconds: (seconds: number) => void;
  setDefaultTemplateId: (id: string | null) => void;
  setExportIncludeMetadata: (include: boolean) => void;
  setExportFileNamePattern: (pattern: string) => void;
  setEnableMcpIntegration: (enabled: boolean) => void;
}

// Load documents and settings from persistence on initialization
const initialDocuments = typeof window !== "undefined" ? loadDocuments() : [];
const initialAIProvider: AIProvider =
  typeof window !== "undefined"
    ? ((window.localStorage.getItem("autospec_ai_provider") as AIProvider) || "openai")
    : "openai";
const initialTheme: Theme =
  typeof window !== "undefined"
    ? ((window.localStorage.getItem("autospec_theme") as Theme) || "system")
    : "system";
const initialEditorFontSize: EditorFontSize =
  typeof window !== "undefined"
    ? ((window.localStorage.getItem("autospec_editor_font_size") as EditorFontSize) || "sm")
    : "sm";
const initialEditorLineSpacing: EditorLineSpacing =
  typeof window !== "undefined"
    ? ((window.localStorage.getItem("autospec_editor_line_spacing") as EditorLineSpacing) ||
       "normal")
    : "normal";
const initialAutosaveEnabled: boolean =
  typeof window !== "undefined"
    ? window.localStorage.getItem("autospec_autosave_enabled") !== "false"
    : true;
const initialAutosaveIntervalSeconds: number =
  typeof window !== "undefined"
    ? Number(window.localStorage.getItem("autospec_autosave_interval_seconds") || "30")
    : 30;
const initialDefaultTemplateId: string | null =
  typeof window !== "undefined"
    ? window.localStorage.getItem("autospec_default_template_id")
    : null;
const initialExportIncludeMetadata: boolean =
  typeof window !== "undefined"
    ? window.localStorage.getItem("autospec_export_include_metadata") !== "false"
    : true;
const initialExportFileNamePattern: string =
  typeof window !== "undefined"
    ? window.localStorage.getItem("autospec_export_filename_pattern") || "{name}.md"
    : "{name}.md";
const initialEnableMcpIntegration: boolean =
  typeof window !== "undefined"
    ? window.localStorage.getItem("autospec_enable_mcp") === "true"
    : false;

export const useStore = create<AppState>((set, get) => ({
  documents: initialDocuments,
  currentDocumentId: initialDocuments.length > 0 ? initialDocuments[0].id : null,
  currentDocument: initialDocuments.length > 0 ? initialDocuments[0] : null,
  templates: [],
  aiProvider: initialAIProvider,
   theme: initialTheme,
   editorFontSize: initialEditorFontSize,
   editorLineSpacing: initialEditorLineSpacing,
   autosaveEnabled: initialAutosaveEnabled,
   autosaveIntervalSeconds: initialAutosaveIntervalSeconds,
   defaultTemplateId: initialDefaultTemplateId,
   exportIncludeMetadata: initialExportIncludeMetadata,
   exportFileNamePattern: initialExportFileNamePattern,
   enableMcpIntegration: initialEnableMcpIntegration,

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
      intent: template?.intent ?? "",
      context: template?.context ?? "",
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

    const includeMeta = get().exportIncludeMetadata;
    const intent = doc.intent ?? "";
    const context = doc.context ?? "";

    let markdown = `# ${doc.name}\n\n`;
    if (includeMeta) {
      markdown += `**Version:** ${doc.version}  \n`;
      markdown += `**Last Updated:** ${doc.updatedAt.toLocaleDateString()}\n\n`;
      markdown += `---\n\n`;
    }

    markdown += `## 1. Intent Engineering (Strategy)\n\n`;
    markdown += intent ? `${intent}\n\n` : "*Purpose, goals, trade-off hierarchy, and decision boundaries for the agent(s) to act against.*\n\n";
    markdown += `---\n\n`;

    markdown += `## 2. Context Engineering\n\n`;
    markdown += context ? `${context}\n\n` : "*What information and tokens to supply to the agent(s); curation strategy and key sources.*\n\n";
    markdown += `---\n\n`;

    markdown += `## 3. Specification Engineering\n\n`;
    if (doc.content.trim()) {
      markdown += `${doc.content}\n\n`;
    }
    // Group requirements by category
    const categories = ["functional", "non-functional", "constraint", "acceptance"];
    categories.forEach((category) => {
      const reqs = doc.requirements.filter((r) => r.category === category);
      if (reqs.length > 0) {
        markdown += `### ${category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")} Requirements\n\n`;
        reqs.forEach((req) => {
          markdown += `#### ${req.number}: ${req.text}\n\n`;
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
  
  setAIProvider: (provider: AIProvider) => {
    set({ aiProvider: provider });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("autospec_ai_provider", provider);
    }
  },
  
  setTheme: (theme: Theme) => {
    set({ theme });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("autospec_theme", theme);
    }
  },

  setEditorFontSize: (size: EditorFontSize) => {
    set({ editorFontSize: size });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("autospec_editor_font_size", size);
    }
  },

  setEditorLineSpacing: (spacing: EditorLineSpacing) => {
    set({ editorLineSpacing: spacing });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("autospec_editor_line_spacing", spacing);
    }
  },

  setAutosaveEnabled: (enabled: boolean) => {
    set({ autosaveEnabled: enabled });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("autospec_autosave_enabled", enabled ? "true" : "false");
    }
  },

  setAutosaveIntervalSeconds: (seconds: number) => {
    const clamped = Math.max(5, Math.min(seconds, 600));
    set({ autosaveIntervalSeconds: clamped });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("autospec_autosave_interval_seconds", String(clamped));
    }
  },

  setDefaultTemplateId: (id: string | null) => {
    set({ defaultTemplateId: id });
    if (typeof window !== "undefined") {
      if (id) {
        window.localStorage.setItem("autospec_default_template_id", id);
      } else {
        window.localStorage.removeItem("autospec_default_template_id");
      }
    }
  },

  setExportIncludeMetadata: (include: boolean) => {
    set({ exportIncludeMetadata: include });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("autospec_export_include_metadata", include ? "true" : "false");
    }
  },

  setExportFileNamePattern: (pattern: string) => {
    const trimmed = pattern.trim() || "{name}.md";
    set({ exportFileNamePattern: trimmed });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("autospec_export_filename_pattern", trimmed);
    }
  },

  setEnableMcpIntegration: (enabled: boolean) => {
    set({ enableMcpIntegration: enabled });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("autospec_enable_mcp", enabled ? "true" : "false");
    }
  },
}));

