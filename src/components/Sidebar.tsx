import { useState } from "react";
import { useStore } from "../store";
import { FilePlus, FolderOpen, X } from "lucide-react";

export default function Sidebar() {
  const { documents, templates, currentDocumentId, setCurrentDocument, createDocument } = useStore();
  const [showNewDocDialog, setShowNewDocDialog] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const handleCreateDocument = () => {
    if (newDocName.trim()) {
      createDocument(newDocName, selectedTemplate || undefined);
      setNewDocName("");
      setSelectedTemplate("");
      setShowNewDocDialog(false);
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">AutoSpec</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <button
          onClick={() => setShowNewDocDialog(true)}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg mb-4 flex items-center gap-2"
        >
          <FilePlus className="w-4 h-4" />
          New Document
        </button>

        <div className="mb-4">
          <h3 className="text-xs uppercase text-gray-400 px-2 mb-2">Documents</h3>
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setCurrentDocument(doc.id)}
              className={`w-full text-left px-3 py-2 rounded mb-1 hover:bg-gray-800 ${
                currentDocumentId === doc.id ? "bg-gray-800 border-l-2 border-blue-500" : ""
              }`}
            >
              <div className="font-medium text-sm">{doc.name}</div>
              <div className="text-xs text-gray-400">
                {doc.requirements.length} requirements
              </div>
            </button>
          ))}
        </div>

        {templates.length > 0 && (
          <div>
            <h3 className="text-xs uppercase text-gray-400 px-2 mb-2">Templates</h3>
            {templates.map((template) => (
              <div
                key={template.id}
                className="px-3 py-2 rounded mb-1 text-sm text-gray-300"
              >
                {template.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {showNewDocDialog && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Create New Document</h3>
            <button
              onClick={() => setShowNewDocDialog(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Name
            </label>
            <input
              type="text"
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., E-commerce Platform Requirements"
              autoFocus
            />
          </div>

          {templates.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Use Template (optional)
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowNewDocDialog(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateDocument}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    )}
  );
}

