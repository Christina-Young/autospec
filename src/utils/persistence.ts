/**
 * Persistence layer for documents
 * Uses localStorage for now, can be extended to use Tauri file system
 */

import { Document } from "../store";

const STORAGE_KEY = "autospec_documents";
const STORAGE_VERSION = 1;

interface StoredData {
  version: number;
  documents: Document[];
  timestamp: number;
}

/**
 * Save documents to localStorage
 */
export function saveDocuments(documents: Document[]): void {
  try {
    const data: StoredData = {
      version: STORAGE_VERSION,
      documents: documents.map((doc) => ({
        ...doc,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save documents:", error);
    throw error;
  }
}

/**
 * Load documents from localStorage
 */
export function loadDocuments(): Document[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const data: StoredData = JSON.parse(stored);

    // Validate version
    if (data.version !== STORAGE_VERSION) {
      console.warn("Storage version mismatch, clearing old data");
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    // Convert date strings back to Date objects and ensure discipline fields exist (for docs saved before Intent/Context were added)
    return data.documents.map((doc) => {
      const d = doc as Document & { intent?: string; context?: string };
      return {
        ...d,
        intent: d.intent ?? "",
        context: d.context ?? "",
        createdAt: new Date(d.createdAt),
        updatedAt: new Date(d.updatedAt),
      } as Document;
    });
  } catch (error) {
    console.error("Failed to load documents:", error);
    return [];
  }
}

/**
 * Clear all stored documents
 */
export function clearDocuments(): void {
  localStorage.removeItem(STORAGE_KEY);
}

