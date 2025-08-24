import { useTheme } from "../context/ThemeContext";
import { useVariables } from "../context/VariablesContext";
import { Trash2Icon, Folder } from "lucide-react";
import { Checkbox } from "./Checkbox";
import { useEffect } from "react";
import clsx from "clsx";

export const VariablesTab = () => {
  const { theme } = useTheme();
  const {
    variables,
    addVariable,
    removeVariable,
    updateVariable,
    currentFolder,
    detectAndLoadCurrentFolder,
  } = useVariables();

  // Auto-detect current folder when Variables tab is opened
  useEffect(() => {
    if (!currentFolder) {
      detectAndLoadCurrentFolder();
    }
  }, [currentFolder, detectAndLoadCurrentFolder]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <label
          className={clsx(
            "block text-sm",
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          )}
        >
          Environment Variables
        </label>
        {currentFolder && (
          <div
            className={clsx(
              "flex items-center gap-1 px-2 py-1 rounded text-xs",
              theme === "dark"
                ? "bg-purple-900 text-purple-200"
                : "bg-purple-100 text-purple-800"
            )}
          >
            <Folder className="w-3 h-3" />
            <span>{currentFolder}</span>
          </div>
        )}
      </div>

      {!currentFolder ? (
        <div
          className={clsx(
            "mt-4 p-4 border rounded-xl text-center",
            theme === "dark"
              ? "bg-[#10121b] border-gray-700 text-gray-400"
              : "bg-white border-gray-300 text-gray-600"
          )}
        >
          <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No collection selected</p>
          <p className="text-xs mt-1 opacity-75">
            Create a collection and add a request to start using variables
          </p>
        </div>
      ) : (
        <>
          <div
            className={clsx(
              "mt-4 p-4 border rounded-xl space-y-2",
              theme === "dark"
                ? "bg-[#10121b] border-gray-700"
                : "bg-white border-gray-300"
            )}
          >
            {variables.map((variable, index) => (
              <div key={index} className="flex gap-2 items-center min-w-0">
                <input
                  type="text"
                  value={variable.key}
                  onChange={(e) => updateVariable(index, "key", e.target.value)}
                  placeholder="Variable Name (e.g., baseUrl)"
                  className={clsx(
                    "flex-1 min-w-0 px-2 py-1 border rounded text-xs ring-0 focus:outline-0",
                    theme === "dark"
                      ? "bg-[#10121b] text-white border-2 border-purple-500 focus:border-purple-500"
                      : "bg-white text-gray-800 border-2 border-purple-500 focus:border-purple-500"
                  )}
                />
                <input
                  type="text"
                  value={variable.value}
                  onChange={(e) =>
                    updateVariable(index, "value", e.target.value)
                  }
                  placeholder="Value (e.g., https://api.example.com)"
                  className={clsx(
                    "flex-1 min-w-0 px-2 py-1 border rounded text-xs ring-0 focus:outline-0",
                    theme === "dark"
                      ? "bg-[#10121b] text-white border-2 border-purple-500 focus:border-purple-500"
                      : "bg-white text-gray-800 border-2 border-purple-500 focus:border-purple-500"
                  )}
                />
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Checkbox
                    checked={variable.enabled}
                    onChange={(checked) =>
                      updateVariable(index, "enabled", checked)
                    }
                    theme={theme}
                  />
                  <button
                    onClick={() => removeVariable(index)}
                    className={clsx(
                      "h-5 w-5 flex items-center justify-center rounded cursor-pointer",
                      theme === "dark"
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-600 hover:text-gray-800"
                    )}
                    type="button"
                    aria-label="Remove Variable"
                    title="Remove Variable"
                  >
                    <Trash2Icon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addVariable}
              className={clsx(
                "mt-2 px-3 py-1 text-xs rounded border-2 cursor-pointer",
                theme === "dark"
                  ? "border-gray-600 text-gray-400 hover:border-gray-500"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
              )}
            >
              + Add Variable
            </button>
          </div>

          <div className="mt-6">
            <label
              className={clsx(
                "block text-sm mb-2",
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              )}
            >
              Usage Example
            </label>
            <div
              className={clsx(
                "mt-2 p-4 border rounded-xl",
                theme === "dark"
                  ? "bg-[#10121b] border-gray-700"
                  : "bg-white border-gray-300"
              )}
            >
              <div className="space-y-2 text-xs">
                <div>
                  <span
                    className={
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }
                  >
                    Define variable:
                  </span>
                  <code
                    className={clsx(
                      "ml-2 px-2 py-1 rounded",
                      theme === "dark"
                        ? "bg-gray-800 text-green-400"
                        : "bg-gray-100 text-green-600"
                    )}
                  >
                    baseUrl = https://api.example.com
                  </code>
                </div>
                <div>
                  <span
                    className={
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }
                  >
                    Use in URL:
                  </span>
                  <code
                    className={clsx(
                      "ml-2 px-2 py-1 rounded",
                      theme === "dark"
                        ? "bg-gray-800 text-blue-400"
                        : "bg-gray-100 text-blue-600"
                    )}
                  >
                    {"{{baseUrl}}/users"}
                  </code>
                </div>
                <div>
                  <span
                    className={
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }
                  >
                    Result:
                  </span>
                  <code
                    className={clsx(
                      "ml-2 px-2 py-1 rounded",
                      theme === "dark"
                        ? "bg-gray-800 text-purple-400"
                        : "bg-gray-100 text-purple-600"
                    )}
                  >
                    https://api.example.com/users
                  </code>
                </div>
              </div>

              <div
                className={clsx(
                  "mt-3 pt-3 border-t text-xs",
                  theme === "dark"
                    ? "border-gray-700 text-gray-500"
                    : "border-gray-300 text-gray-600"
                )}
              >
                <div className="flex items-center gap-1">
                  <Folder className="w-3 h-3" />
                  <span>
                    Variables are saved per collection: {currentFolder}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
