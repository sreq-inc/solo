import clsx from "clsx";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useEnvironment } from "../hooks/useEnvironment";

interface EnvironmentVariablesTabProps {
  environmentId: string;
  onClose: () => void;
}

export const EnvironmentVariablesTab = ({
  environmentId,
  onClose,
}: EnvironmentVariablesTabProps) => {
  const { theme } = useTheme();
  const { environments, addVariable, removeVariable, updateVariable, getEnvironmentVariables } =
    useEnvironment();

  const environment = environments.find((env) => env.id === environmentId);
  const variables = getEnvironmentVariables(environmentId);

  if (!environment) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={clsx(
          "rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col",
          theme === "dark" ? "bg-gray-800" : "bg-white"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={clsx(
            "flex items-center gap-3 p-6 border-b",
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          )}
        >
          <button
            onClick={onClose}
            className={clsx(
              "cursor-pointer transition-colors",
              theme === "dark"
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2
              className={clsx(
                "text-xl font-semibold",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}
            >
              Environment Variables
            </h2>
            <p
              className={clsx("text-sm mt-1", theme === "dark" ? "text-gray-400" : "text-gray-600")}
            >
              {environment.name} ({environment.type})
            </p>
          </div>
        </div>

        {/* Variables Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-2 mb-2">
              <div
                className={clsx(
                  "col-span-1 text-xs font-semibold uppercase tracking-wide",
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                )}
              >
                Enabled
              </div>
              <div
                className={clsx(
                  "col-span-5 text-xs font-semibold uppercase tracking-wide",
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                )}
              >
                Key
              </div>
              <div
                className={clsx(
                  "col-span-5 text-xs font-semibold uppercase tracking-wide",
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                )}
              >
                Value
              </div>
              <div className="col-span-1"></div>
            </div>

            {/* Variable Rows */}
            {variables.map((variable, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-1 flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={variable.enabled}
                    onChange={(e) =>
                      updateVariable(environmentId, index, "enabled", e.target.checked)
                    }
                    className="w-4 h-4 rounded cursor-pointer text-purple-600"
                  />
                </div>
                <div className="col-span-5">
                  <input
                    type="text"
                    value={variable.key}
                    onChange={(e) => updateVariable(environmentId, index, "key", e.target.value)}
                    placeholder="Variable name"
                    className={clsx(
                      "w-full px-3 py-2 rounded-md border text-sm focus:outline-none",
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                    )}
                  />
                </div>
                <div className="col-span-5">
                  <input
                    type="text"
                    value={variable.value}
                    onChange={(e) => updateVariable(environmentId, index, "value", e.target.value)}
                    placeholder="Variable value"
                    className={clsx(
                      "w-full px-3 py-2 rounded-md border text-sm focus:outline-none",
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                    )}
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => removeVariable(environmentId, index)}
                    className={clsx(
                      "p-2 rounded cursor-pointer transition-colors",
                      theme === "dark"
                        ? "hover:bg-gray-700 text-red-400"
                        : "hover:bg-gray-200 text-red-600"
                    )}
                    title="Remove variable"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Variable Button */}
          <button
            onClick={() => addVariable(environmentId)}
            className={clsx(
              "mt-4 flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors",
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            )}
          >
            <Plus className="w-4 h-4" />
            Add Variable
          </button>

          {/* Info Box */}
          <div
            className={clsx(
              "mt-6 p-4 rounded-lg border",
              theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-blue-50 border-blue-200"
            )}
          >
            <p className={clsx("text-sm", theme === "dark" ? "text-gray-300" : "text-gray-700")}>
              <strong>How to use:</strong> Reference variables in your requests using the syntax{" "}
              <code className={clsx(
                "px-1 py-0.5 rounded",
                theme === "dark" ? "bg-gray-800 text-purple-400" : "bg-purple-100 text-purple-700"
              )}>
                {"{{variableName}}"}
              </code>
              . Environment variables take priority over folder variables.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className={clsx(
            "flex justify-between items-center p-6 border-t",
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          )}
        >
          <div className={clsx("text-sm", theme === "dark" ? "text-gray-400" : "text-gray-600")}>
            {variables.filter((v) => v.key).length} variable(s) defined
          </div>
          <button
            onClick={onClose}
            className={clsx(
              "px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors",
              theme === "dark"
                ? "bg-purple-700 hover:bg-purple-800 text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            )}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
