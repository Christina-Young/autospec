import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useStore } from "../store";
import { FileText, Save, Download } from "lucide-react";
import { save, open } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";

export default function Editor() {
  const { currentDocument, updateDocument, exportToMarkdown } = useStore();
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (currentDocument) {
      setContent(currentDocument.content);
    }
  }, [currentDocument]);

  const handleSave = async () => {
    if (!currentDocument) return;
    
    updateDocument(currentDocument.id, { content });
    
    try {
      const filePath = await save({
        filters: [
          { name: "Markdown", extensions: ["md"] },
          { name: "All Files", extensions: ["*"] },
        ],
        defaultPath: `${currentDocument.name}.md`,
      });

      if (filePath) {
        const markdown = exportToMarkdown(currentDocument.id);
        await writeTextFile(filePath, markdown);
      }
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };

  const handleExport = async () => {
    if (!currentDocument) return;
    
    try {
      const filePath = await save({
        filters: [
          { name: "Markdown", extensions: ["md"] },
        ],
        defaultPath: `${currentDocument.name}.md`,
      });

      if (filePath) {
        const markdown = exportToMarkdown(currentDocument.id);
        await writeTextFile(filePath, markdown);
      }
    } catch (error) {
      console.error("Error exporting file:", error);
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
      <div className="flex-1 overflow-auto">
        {isPreview ? (
          <div className="p-8 prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={() => updateDocument(currentDocument.id, { content })}
            className="w-full h-full p-6 font-mono text-sm border-0 focus:outline-none resize-none"
            placeholder="Start writing your requirements document..."
          />
        )}
      </div>
    </div>
  );
}

