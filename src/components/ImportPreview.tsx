import clsx from "clsx";
import { CheckCircle, FileJson, FolderOpen, Variable } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import type { ImportResult } from "../types/import";

type ImportPreviewProps = {
  result: ImportResult;
};

export const ImportPreview = ({ result }: ImportPreviewProps) => {
  const { theme } = useTheme();

  return (
    <div className={clsx("rounded-lg p-4 mb-4", theme === "dark" ? "bg-gray-700" : "bg-gray-100")}>
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle
          className={clsx("w-5 h-5", theme === "dark" ? "text-green-400" : "text-green-600")}
        />
        <h3 className={clsx("font-medium", theme === "dark" ? "text-white" : "text-gray-900")}>
          Import Preview
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div
          className={clsx(
            "p-3 rounded-lg text-center",
            theme === "dark" ? "bg-gray-800" : "bg-white"
          )}
        >
          <FolderOpen
            className={clsx(
              "w-6 h-6 mx-auto mb-2",
              theme === "dark" ? "text-purple-400" : "text-purple-600"
            )}
          />
          <div
            className={clsx(
              "text-2xl font-bold mb-1",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}
          >
            {result.collections.length}
          </div>
          <div className={clsx("text-xs", theme === "dark" ? "text-gray-400" : "text-gray-600")}>
            Collection{result.collections.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div
          className={clsx(
            "p-3 rounded-lg text-center",
            theme === "dark" ? "bg-gray-800" : "bg-white"
          )}
        >
          <FileJson
            className={clsx(
              "w-6 h-6 mx-auto mb-2",
              theme === "dark" ? "text-blue-400" : "text-blue-600"
            )}
          />
          <div
            className={clsx(
              "text-2xl font-bold mb-1",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}
          >
            {result.totalRequests}
          </div>
          <div className={clsx("text-xs", theme === "dark" ? "text-gray-400" : "text-gray-600")}>
            Request{result.totalRequests !== 1 ? "s" : ""}
          </div>
        </div>

        <div
          className={clsx(
            "p-3 rounded-lg text-center",
            theme === "dark" ? "bg-gray-800" : "bg-white"
          )}
        >
          <Variable
            className={clsx(
              "w-6 h-6 mx-auto mb-2",
              theme === "dark" ? "text-green-400" : "text-green-600"
            )}
          />
          <div
            className={clsx(
              "text-2xl font-bold mb-1",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}
          >
            {result.totalVariables}
          </div>
          <div className={clsx("text-xs", theme === "dark" ? "text-gray-400" : "text-gray-600")}>
            Variable{result.totalVariables !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {result.collections.map((collection) => (
          <div
            key={collection.name}
            className={clsx(
              "p-3 rounded-lg flex items-center justify-between",
              theme === "dark" ? "bg-gray-800" : "bg-white"
            )}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FolderOpen
                className={clsx(
                  "w-4 h-4 flex-shrink-0",
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                )}
              />
              <span
                className={clsx(
                  "text-sm font-medium truncate",
                  theme === "dark" ? "text-white" : "text-gray-900"
                )}
              >
                {collection.name}
              </span>
              {collection.hasConflict && (
                <span
                  className={clsx(
                    "text-xs px-2 py-0.5 rounded-full flex-shrink-0",
                    theme === "dark"
                      ? "bg-yellow-900/30 text-yellow-400"
                      : "bg-yellow-100 text-yellow-700"
                  )}
                >
                  Conflict
                </span>
              )}
            </div>
            <div
              className={clsx(
                "text-xs flex gap-3 flex-shrink-0",
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              )}
            >
              <span>{collection.requestCount} req</span>
              {collection.variableCount > 0 && <span>{collection.variableCount} var</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
