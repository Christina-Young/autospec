import { useState } from "react";
import { X, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useStore, Requirement } from "../store";

export default function ReviewPanel({ onClose }: { onClose: () => void }) {
  const { currentDocument, updateRequirement } = useStore();
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(null);

  if (!currentDocument) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">No document open</p>
      </div>
    );
  }

  const requirementsByStatus = {
    draft: currentDocument.requirements.filter((r) => r.status === "draft"),
    review: currentDocument.requirements.filter((r) => r.status === "review"),
    approved: currentDocument.requirements.filter((r) => r.status === "approved"),
    implemented: currentDocument.requirements.filter((r) => r.status === "implemented"),
  };

  const handleStatusChange = (reqId: string, newStatus: Requirement["status"]) => {
    updateRequirement(reqId, { status: newStatus });
  };

  const getStatusIcon = (status: Requirement["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "implemented":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case "review":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Review Requirements</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {Object.entries(requirementsByStatus).map(([status, reqs]) => {
            if (reqs.length === 0) return null;
            return (
              <div key={status}>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 capitalize">
                  {status} ({reqs.length})
                </h4>
                <div className="space-y-2">
                  {reqs.map((req) => (
                    <div
                      key={req.id}
                      className={`p-3 border rounded-lg cursor-pointer transition ${
                        selectedRequirement === req.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedRequirement(req.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(req.status)}
                          <span className="text-xs font-mono text-gray-600">
                            {req.number}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          req.priority === "high" ? "bg-red-100 text-red-700" :
                          req.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {req.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800">{req.text}</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(req.id, "draft");
                          }}
                          className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Draft
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(req.id, "review");
                          }}
                          className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Review
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(req.id, "approved");
                          }}
                          className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

