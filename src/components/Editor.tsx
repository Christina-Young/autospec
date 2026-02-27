import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useStore } from "../store";
import { FileText, Save, Download, Target, Layers, FileCheck } from "lucide-react";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { notify } from "../utils/notifications";

export type DisciplineTab = "intent" | "context" | "specification";

const DISCIPLINE_TABS: { id: DisciplineTab; label: string; icon: typeof Target; description: string }[] = [
  {
    id: "intent",
    label: "Intent (Strategy)",
    icon: Target,
    description: "Purpose, goals, why we're building this, trade-off hierarchy, and decision boundaries for the agent(s).",
  },
  {
    id: "context",
    label: "Context",
    icon: Layers,
    description: "What information and tokens to supply to the agent(s); curation strategy and key sources.",
  },
  {
    id: "specification",
    label: "Specification",
    icon: FileCheck,
    description: "Complete, structured description of outputs, acceptance criteria, and how quality is measured. Use the Review panel for structured requirements.",
  },
];

export default function Editor() {
  const {
    currentDocument,
    updateDocument,
    exportToMarkdown,
    editorFontSize,
    editorLineSpacing,
    autosaveEnabled,
    autosaveIntervalSeconds,
    exportFileNamePattern,
  } = useStore();
  const [intent, setIntent] = useState("");
  const [context, setContext] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState<DisciplineTab>("intent");
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (currentDocument) {
      setIntent(currentDocument.intent ?? "");
      setContext(currentDocument.context ?? "");
      setContent(currentDocument.content);
    }
  }, [currentDocument]);

  useEffect(() => {
    if (!autosaveEnabled || !currentDocument) {
      return;
    }

    const interval = setInterval(() => {
      updateDocument(currentDocument.id, { intent, context, content });
    }, autosaveIntervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [autosaveEnabled, autosaveIntervalSeconds, currentDocument, intent, context, content, updateDocument]);

  const fontSizeClass =
    editorFontSize === "lg"
      ? "text-lg"
      : editorFontSize === "md"
      ? "text-base"
      : "text-sm";

  const lineHeightClass =
    editorLineSpacing === "relaxed" ? "leading-relaxed" : "leading-normal";

  const flushCurrentTab = () => {
    if (!currentDocument) return;
    if (activeTab === "intent") updateDocument(currentDocument.id, { intent });
    else if (activeTab === "context") updateDocument(currentDocument.id, { context });
    else updateDocument(currentDocument.id, { content });
  };

  const handleTabChange = (tab: DisciplineTab) => {
    flushCurrentTab();
    setActiveTab(tab);
  };

  const buildDefaultFileName = () => {
    if (!currentDocument) return "document.md";
    const safeName = currentDocument.name || "document";
    const pattern = exportFileNamePattern || "{name}.md";
    return pattern.replace("{name}", safeName);
  };

  const handleSave = async () => {
    if (!currentDocument) return;
    flushCurrentTab();
    updateDocument(currentDocument.id, { intent, context, content });
    
    try {
      const filePath = await save({
        filters: [
          { name: "Markdown", extensions: ["md"] },
          { name: "All Files", extensions: ["*"] },
        ],
        defaultPath: buildDefaultFileName(),
      });

      if (filePath) {
        const markdown = exportToMarkdown(currentDocument.id);
        await writeTextFile(filePath, markdown);
        notify.success("Document saved successfully!");
      }
    } catch (error) {
      console.error("Error saving file:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save file";
      notify.error(`Error saving file: ${errorMessage}`);
    }
  };

  const handleExport = async () => {
    if (!currentDocument) return;
    
    try {
      const filePath = await save({
        filters: [
          { name: "Markdown", extensions: ["md"] },
        ],
        defaultPath: buildDefaultFileName(),
      });

      if (filePath) {
        const markdown = exportToMarkdown(currentDocument.id);
        await writeTextFile(filePath, markdown);
        notify.success("Document exported successfully!");
      }
    } catch (error) {
      console.error("Error exporting file:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to export file";
      notify.error(`Error exporting file: ${errorMessage}`);
    }
  };

  if (!currentDocument) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No document open. Create a new one from the sidebar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            {isPreview ? "Edit" : "Preview"}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export MD
          </button>
        </div>
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gray-50/80">
          {DISCIPLINE_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleTabChange(id)}
              className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === id
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-auto flex flex-col">
          {!isPreview && (
            <p className="text-xs text-gray-500 px-4 py-2 bg-gray-50 border-b border-gray-100">
              {DISCIPLINE_TABS.find((t) => t.id === activeTab)?.description}
            </p>
          )}
          {isPreview ? (
            <div className="p-8 prose max-w-none flex-1">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {activeTab === "intent" ? intent : activeTab === "context" ? context : content}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={activeTab === "intent" ? intent : activeTab === "context" ? context : content}
              onChange={(e) => {
                if (activeTab === "intent") setIntent(e.target.value);
                else if (activeTab === "context") setContext(e.target.value);
                else setContent(e.target.value);
              }}
              onBlur={flushCurrentTab}
              className={`flex-1 w-full p-6 font-mono ${fontSizeClass} ${lineHeightClass} text-gray-900 bg-white border-0 focus:outline-none resize-none placeholder-gray-500`}
              placeholder={
                activeTab === "intent"
                  ? "What is the purpose? Why are we building this? What is the strategy, goals, and decision boundaries for the agent(s)?"
                  : activeTab === "context"
                  ? "What information should the agent(s) have? What sources, constraints, and curation strategy?"
                  : "Describe the desired outputs, acceptance criteria, and how quality is measured. Add structured requirements in the Review panel."
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

