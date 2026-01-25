import clsx from "clsx";
import { Check, Copy, Edit, Globe, Plus, Trash, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useEnvironment } from "../hooks/useEnvironment";
import { EnvironmentVariablesTab } from "./EnvironmentVariablesTab";

interface EnvironmentManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnvironmentManager = ({ isOpen, onClose }: EnvironmentManagerProps) => {
  const { theme } = useTheme();
  const {
    environments,
    activeEnvironment,
    createEnvironment,
    deleteEnvironment,
    duplicateEnvironment,
    setActiveEnvironment,
    renameEnvironment,
  } = useEnvironment();

  const [newEnvironmentName, setNewEnvironmentName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(
    activeEnvironment?.id || null
  );
  const [showVariables, setShowVariables] = useState(false);

  if (!isOpen) return null;

  const handleCreateEnvironment = () => {
    if (newEnvironmentName.trim()) {
      createEnvironment(newEnvironmentName.trim(), "local");
      setNewEnvironmentName("");
    }
  };

  const handleRenameEnvironment = (id: string) => {
    if (editingName.trim()) {
      renameEnvironment(id, editingName.trim());
      setEditingId(null);
      setEditingName("");
    }
  };

  const handleDeleteEnvironment = (id: string) => {
    if (
      confirm("Are you sure you want to delete this environment? This action cannot be undone.")
    ) {
      deleteEnvironment(id);
      if (selectedEnvironmentId === id) {
        setSelectedEnvironmentId(null);
      }
    }
  };

  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleViewVariables = (id: string) => {
    setSelectedEnvironmentId(id);
    setShowVariables(true);
  };

  if (showVariables && selectedEnvironmentId) {
    return (
      <EnvironmentVariablesTab
        environmentId={selectedEnvironmentId}
        onClose={() => setShowVariables(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={clsx(
          "rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col",
          theme === "dark" ? "bg-gray-800" : "bg-white"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={clsx(
            "flex justify-between items-center p-6 border-b",
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          )}
        >
          <h2
            className={clsx(
              "text-xl font-semibold",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}
          >
            Manage Environments
          </h2>
          <button
            onClick={onClose}
            className={clsx(
              "cursor-pointer transition-colors",
              theme === "dark"
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create New Environment */}
        <div
          className={clsx("p-4 border-b", theme === "dark" ? "border-gray-700" : "border-gray-200")}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={newEnvironmentName}
              onChange={(e) => setNewEnvironmentName(e.target.value)}
              placeholder="New environment name"
              className={clsx(
                "flex-1 px-3 py-2 rounded-md border text-sm focus:outline-none",
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateEnvironment();
                }
              }}
            />
            <button
              onClick={handleCreateEnvironment}
              disabled={!newEnvironmentName.trim()}
              className={clsx(
                "px-4 py-2 rounded-md text-sm font-medium text-white flex items-center gap-2 cursor-pointer transition-colors",
                theme === "dark"
                  ? "bg-purple-700 hover:bg-purple-800"
                  : "bg-purple-600 hover:bg-purple-700",
                !newEnvironmentName.trim() && "opacity-50 cursor-not-allowed"
              )}
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          </div>
        </div>

        {/* Environment List */}
        <div className="flex-1 overflow-y-auto p-4">
          {environments.length === 0 ? (
            <div
              className={clsx(
                "text-center py-12",
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              )}
            >
              <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No environments yet</p>
              <p className="text-xs mt-1">Create your first environment above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {environments.map((env) => (
                <div
                  key={env.id}
                  className={clsx(
                    "p-4 rounded-lg border transition-colors",
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 hover:border-gray-500"
                      : "bg-gray-50 border-gray-200 hover:border-gray-300",
                    env.isActive && (theme === "dark" ? "border-purple-500" : "border-purple-400")
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {editingId === env.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className={clsx(
                            "flex-1 px-2 py-1 rounded border text-sm focus:outline-none",
                            theme === "dark"
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-800"
                          )}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleRenameEnvironment(env.id);
                            } else if (e.key === "Escape") {
                              cancelEditing();
                            }
                          }}
                        />
                      ) : (
                        <>
                          <Globe className="w-5 h-5 text-purple-500" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={clsx(
                                  "font-medium text-sm",
                                  theme === "dark" ? "text-white" : "text-gray-900"
                                )}
                              >
                                {env.name}
                              </span>
                              {env.isActive && (
                                <span className="flex items-center gap-1 text-xs text-purple-500">
                                  <Check className="w-3 h-3" />
                                  Active
                                </span>
                              )}
                            </div>
                            <div
                              className={clsx(
                                "text-xs mt-1",
                                theme === "dark" ? "text-gray-400" : "text-gray-500"
                              )}
                            >
                              {env.type === "local" ? "Local only" : "Git synced"} •{" "}
                              {env.variables.filter((v) => v.key).length} variables
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {editingId === env.id ? (
                        <>
                          <button
                            onClick={() => handleRenameEnvironment(env.id)}
                            className={clsx(
                              "p-2 rounded cursor-pointer transition-colors",
                              theme === "dark"
                                ? "hover:bg-gray-600 text-green-400"
                                : "hover:bg-gray-200 text-green-600"
                            )}
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className={clsx(
                              "p-2 rounded cursor-pointer transition-colors",
                              theme === "dark"
                                ? "hover:bg-gray-600 text-gray-400"
                                : "hover:bg-gray-200 text-gray-600"
                            )}
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          {!env.isActive && (
                            <button
                              onClick={() => setActiveEnvironment(env.id)}
                              className={clsx(
                                "px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors",
                                theme === "dark"
                                  ? "bg-purple-700 hover:bg-purple-800 text-white"
                                  : "bg-purple-600 hover:bg-purple-700 text-white"
                              )}
                              title="Set as active"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => handleViewVariables(env.id)}
                            className={clsx(
                              "px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors",
                              theme === "dark"
                                ? "bg-gray-600 hover:bg-gray-500 text-white"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                            )}
                            title="Manage variables"
                          >
                            Variables
                          </button>
                          <button
                            onClick={() => startEditing(env.id, env.name)}
                            className={clsx(
                              "p-2 rounded cursor-pointer transition-colors",
                              theme === "dark"
                                ? "hover:bg-gray-600 text-gray-400"
                                : "hover:bg-gray-200 text-gray-600"
                            )}
                            title="Rename"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => duplicateEnvironment(env.id)}
                            className={clsx(
                              "p-2 rounded cursor-pointer transition-colors",
                              theme === "dark"
                                ? "hover:bg-gray-600 text-gray-400"
                                : "hover:bg-gray-200 text-gray-600"
                            )}
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEnvironment(env.id)}
                            disabled={environments.length === 1}
                            className={clsx(
                              "p-2 rounded cursor-pointer transition-colors",
                              theme === "dark"
                                ? "hover:bg-gray-600 text-red-400"
                                : "hover:bg-gray-200 text-red-600",
                              environments.length === 1 && "opacity-50 cursor-not-allowed"
                            )}
                            title={
                              environments.length === 1
                                ? "Cannot delete the last environment"
                                : "Delete"
                            }
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={clsx(
            "flex justify-end p-4 border-t",
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          )}
        >
          <button
            onClick={onClose}
            className={clsx(
              "px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors",
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            )}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
