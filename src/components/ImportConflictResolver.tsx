import clsx from "clsx";
import { AlertCircle } from "lucide-react";
import { useImport } from "../context/ImportContext";
import { useTheme } from "../context/ThemeContext";
import type { ImportConflict } from "../types/import";

type ImportConflictResolverProps = {
  conflicts: ImportConflict[];
};

export const ImportConflictResolver = ({ conflicts }: ImportConflictResolverProps) => {
  const { theme } = useTheme();
  const { resolveConflict } = useImport();

  if (conflicts.length === 0) return null;

  return (
    <div
      className={clsx(
        "rounded-lg p-4 mb-4 border",
        theme === "dark" ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"
      )}
    >
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle
          className={clsx(
            "w-5 h-5 flex-shrink-0 mt-0.5",
            theme === "dark" ? "text-yellow-400" : "text-yellow-600"
          )}
        />
        <div className="flex-1">
          <h3
            className={clsx(
              "font-medium mb-1",
              theme === "dark" ? "text-yellow-400" : "text-yellow-800"
            )}
          >
            Naming Conflicts Detected
          </h3>
          <p className={clsx("text-sm", theme === "dark" ? "text-yellow-300" : "text-yellow-700")}>
            The following collections already exist. Choose how to handle them:
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {conflicts.map((conflict) => (
          <div
            key={conflict.folderName}
            className={clsx("p-3 rounded-lg", theme === "dark" ? "bg-gray-800" : "bg-white")}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div
                  className={clsx(
                    "font-medium text-sm",
                    theme === "dark" ? "text-white" : "text-gray-900"
                  )}
                >
                  {conflict.folderName}
                </div>
                <div
                  className={clsx(
                    "text-xs mt-1",
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  Existing: {conflict.existingRequestCount} requests • New:{" "}
                  {conflict.newRequestCount} requests
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => resolveConflict(conflict.folderName, "replace")}
                className={clsx(
                  "flex-1 px-3 py-2 rounded text-xs font-medium transition-colors border cursor-pointer",
                  conflict.resolution === "replace"
                    ? theme === "dark"
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-purple-500 text-white border-purple-500"
                    : theme === "dark"
                      ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                )}
              >
                Replace
              </button>
              <button
                onClick={() => resolveConflict(conflict.folderName, "keep_both")}
                className={clsx(
                  "flex-1 px-3 py-2 rounded text-xs font-medium transition-colors border",
                  conflict.resolution === "keep_both"
                    ? theme === "dark"
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-purple-500 text-white border-purple-500"
                    : theme === "dark"
                      ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                )}
              >
                Keep Both
              </button>
              <button
                onClick={() => resolveConflict(conflict.folderName, "skip")}
                className={clsx(
                  "flex-1 px-3 py-2 rounded text-xs font-medium transition-colors border",
                  conflict.resolution === "skip"
                    ? theme === "dark"
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-purple-500 text-white border-purple-500"
                    : theme === "dark"
                      ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                )}
              >
                Skip
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
