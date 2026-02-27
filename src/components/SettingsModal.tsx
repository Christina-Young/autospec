import { X, Settings as SettingsIcon } from "lucide-react";
import {
  useStore,
  AIProvider,
  Theme,
  EditorFontSize,
  EditorLineSpacing,
} from "../store";

interface SettingsModalProps {
  onClose: () => void;
}

const PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic Claude",
  gemini: "Google Gemini",
  grok: "Grok (x.ai)",
  ollama: "Ollama (local)",
};

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const {
    aiProvider,
    setAIProvider,
    theme,
    setTheme,
    editorFontSize,
    setEditorFontSize,
    editorLineSpacing,
    setEditorLineSpacing,
    autosaveEnabled,
    setAutosaveEnabled,
    autosaveIntervalSeconds,
    setAutosaveIntervalSeconds,
    templates,
    defaultTemplateId,
    setDefaultTemplateId,
    exportIncludeMetadata,
    setExportIncludeMetadata,
    exportFileNamePattern,
    setExportFileNamePattern,
    enableMcpIntegration,
    setEnableMcpIntegration,
  } = useStore();

  const handleProviderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setAIProvider(event.target.value as AIProvider);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              AI Assistant Provider
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Choose which AI provider AutoSpec should use for the assistant.
              API keys are read from environment variables on your system.
            </p>
            <select
              value={aiProvider}
              onChange={handleProviderChange}
              className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(PROVIDER_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <div className="mt-3 text-xs text-gray-500 space-y-1">
              <p className="font-medium text-gray-700">API keys:</p>
              <p>
                <span className="font-mono text-gray-800">OPENAI_API_KEY</span>{" "}
                for OpenAI
              </p>
              <p>
                <span className="font-mono text-gray-800">
                  ANTHROPIC_API_KEY
                </span>{" "}
                for Anthropic
              </p>
              <p>
                <span className="font-mono text-gray-800">GEMINI_API_KEY</span>{" "}
                for Google Gemini
              </p>
              <p>
                <span className="font-mono text-gray-800">GROK_API_KEY</span>{" "}
                for Grok
              </p>
              <p>
                Ollama uses your local{" "}
                <span className="font-mono text-gray-800">
                  http://127.0.0.1:11434
                </span>{" "}
                (optional{" "}
                <span className="font-mono text-gray-800">
                  OLLAMA_BASE_URL
                </span>
                ).
              </p>
            </div>
          </section>

          <section className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Editor &amp; Theme
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as Theme)}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Editor font size
                  </label>
                  <select
                    value={editorFontSize}
                    onChange={(e) =>
                      setEditorFontSize(e.target.value as EditorFontSize)
                    }
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Line spacing
                  </label>
                  <select
                    value={editorLineSpacing}
                    onChange={(e) =>
                      setEditorLineSpacing(e.target.value as EditorLineSpacing)
                    }
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="relaxed">Relaxed</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Autosave
            </h3>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={autosaveEnabled}
                  onChange={(e) => setAutosaveEnabled(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Enable periodic autosave
              </label>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <span>Interval (seconds):</span>
              <input
                type="number"
                min={5}
                max={600}
                value={autosaveIntervalSeconds}
                onChange={(e) =>
                  setAutosaveIntervalSeconds(Number(e.target.value || 0))
                }
                className="w-20 px-2 py-1 border border-gray-300 rounded-md text-xs"
              />
            </div>
          </section>

          <section className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Default Template &amp; Export
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Default template for new documents
                </label>
                <select
                  value={defaultTemplateId || ""}
                  onChange={(e) =>
                    setDefaultTemplateId(e.target.value || null)
                  }
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Export file name pattern
                </label>
                <input
                  type="text"
                  value={exportFileNamePattern}
                  onChange={(e) => setExportFileNamePattern(e.target.value)}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  placeholder="{name}.md"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Use <span className="font-mono">{`{name}`}</span> as a
                  placeholder for the document name.
                </p>
              </div>

              <label className="flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={exportIncludeMetadata}
                  onChange={(e) => setExportIncludeMetadata(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Include version and last-updated metadata in exported markdown
              </label>
            </div>
          </section>

          <section className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Integrations
            </h3>
            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={enableMcpIntegration}
                onChange={(e) => setEnableMcpIntegration(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Enable MCP / tooling integration (for IDE integrations like Cursor)
            </label>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

