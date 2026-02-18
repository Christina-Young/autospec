import { useState, useEffect } from "react";
import Editor from "./components/Editor";
import Sidebar from "./components/Sidebar";
import AIChat from "./components/AIChat";
import ReviewPanel from "./components/ReviewPanel";
import { useStore } from "./store";

function App() {
  const [showAIChat, setShowAIChat] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const { currentDocument, loadTemplates } = useStore();

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">
            {currentDocument?.name || "New Requirements Document"}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowReview(!showReview)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Review
            </button>
            <button
              onClick={() => setShowAIChat(!showAIChat)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              AI Assistant
            </button>
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden">
          <Editor />
          {showAIChat && (
            <div className="w-96 border-l border-gray-200">
              <AIChat onClose={() => setShowAIChat(false)} />
            </div>
          )}
          {showReview && (
            <div className="w-96 border-l border-gray-200">
              <ReviewPanel onClose={() => setShowReview(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

