import clsx from "clsx";
import { Check, Download, FolderOpen, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useFile } from "../context/FileContext";
import { useTheme } from "../context/ThemeContext";
import { useImportExport } from "../hooks/useImportExport";
import type { ExportOptions } from "../types/export";

type ExportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  preselectedFolder?: string;
};

export const ExportModal = ({ isOpen, onClose, preselectedFolder }: ExportModalProps) => {
  const { theme } = useTheme();
  const { folders } = useFile();
  const { exportData, exportState } = useImportExport();

  const [options, setOptions] = useState<ExportOptions>({
    format: "solo",
    includeVariables: true,
    includeDescriptions: true,
    selectedFolders: preselectedFolder ? [preselectedFolder] : [],
    exportAll: !preselectedFolder,
  });

  // Update options when preselectedFolder changes
  useEffect(() => {
    if (preselectedFolder) {
      setOptions((prev) => ({
        ...prev,
        selectedFolders: [preselectedFolder],
        exportAll: false,
      }));
    }
  }, [preselectedFolder]);

  const handleExport = useCallback(async () => {
    await exportData(options);
    if (!exportState.error) {
      onClose();
    }
  }, [exportData, options, exportState.error, onClose]);

  const toggleFolder = useCallback((folderName: string) => {
    setOptions((prev) => {
      const isSelected = prev.selectedFolders?.includes(folderName);
      const newSelectedFolders = isSelected
        ? prev.selectedFolders?.filter((f) => f !== folderName) || []
        : [...(prev.selectedFolders || []), folderName];

      return {
        ...prev,
        selectedFolders: newSelectedFolders,
        exportAll: false,
      };
    });
  }, []);

  const handleExportAll = useCallback(() => {
    setOptions((prev) => ({
      ...prev,
      exportAll: true,
      selectedFolders: [],
    }));
  }, []);

  if (!isOpen) return null;

  const folderList = Object.keys(folders);
  const selectedCount = options.exportAll
    ? folderList.length
    : options.selectedFolders?.length || 0;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={clsx(
          "rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto",
          theme === "dark" ? "bg-gray-800" : "bg-white"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2
              className={clsx(
                "text-xl font-semibold",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}
            >
              Export Collections
            </h2>
            <button
              onClick={onClose}
              className={clsx(
                "p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer",
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {exportState.isExporting ? (
            <div className="py-8">
              <div className="flex flex-col items-center gap-4">
                <Loader2
                  className={clsx(
                    "w-12 h-12 animate-spin",
                    theme === "dark" ? "text-purple-400" : "text-purple-600"
                  )}
                />
                <p
                  className={clsx("text-sm", theme === "dark" ? "text-gray-300" : "text-gray-700")}
                >
                  Exporting collections...
                </p>
                <div className="w-full max-w-md">
                  <div
                    className={clsx(
                      "h-2 rounded-full overflow-hidden",
                      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                    )}
                  >
                    <div
                      className="h-full bg-purple-600 transition-all duration-300"
                      style={{ width: `${exportState.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3
                  className={clsx(
                    "text-sm font-medium mb-3",
                    theme === "dark" ? "text-white" : "text-gray-900"
                  )}
                >
                  Select Collections
                </h3>

                <button
                  onClick={handleExportAll}
                  className={clsx(
                    "w-full p-3 rounded-lg mb-3 text-left flex items-center justify-between transition-colors cursor-pointer",
                    options.exportAll
                      ? theme === "dark"
                        ? "bg-purple-600 text-white"
                        : "bg-purple-500 text-white"
                      : theme === "dark"
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  <span className="font-medium">Export All Collections</span>
                  {options.exportAll && <Check className="w-5 h-5" />}
                </button>

                <div
                  className={clsx(
                    "rounded-lg p-3 max-h-60 overflow-y-auto space-y-2",
                    theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                  )}
                >
                  {folderList.length === 0 ? (
                    <p
                      className={clsx(
                        "text-sm text-center py-4",
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      No collections to export
                    </p>
                  ) : (
                    folderList.map((folderName) => {
                      const isSelected =
                        options.exportAll || options.selectedFolders?.includes(folderName);
                      const requestCount = folders[folderName]?.length || 0;

                      return (
                        <button
                          key={folderName}
                          onClick={() => toggleFolder(folderName)}
                          disabled={options.exportAll}
                          className={clsx(
                            "w-full p-3 rounded-lg text-left flex items-center justify-between transition-colors",
                            !options.exportAll && "cursor-pointer",
                            options.exportAll
                              ? theme === "dark"
                                ? "bg-gray-600 opacity-50 cursor-not-allowed"
                                : "bg-gray-200 opacity-50 cursor-not-allowed"
                              : isSelected
                                ? theme === "dark"
                                  ? "bg-purple-600 text-white"
                                  : "bg-purple-500 text-white"
                                : theme === "dark"
                                  ? "bg-gray-800 text-white hover:bg-gray-600"
                                  : "bg-white text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <FolderOpen className="w-4 h-4 flex-shrink-0 text-current" />
                            <span className="text-sm font-medium truncate text-current">{folderName}</span>
                            <span
                              className={clsx(
                                "text-xs px-2 py-0.5 rounded-full flex-shrink-0",
                                isSelected
                                  ? theme === "dark"
                                    ? "bg-purple-700 text-purple-200"
                                    : "bg-purple-600 text-white"
                                  : theme === "dark"
                                    ? "bg-gray-700 text-white"
                                    : "bg-gray-200 text-gray-700"
                              )}
                            >
                              {requestCount}
                            </span>
                          </div>
                          {isSelected && !options.exportAll && (
                            <Check className="w-5 h-5 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3
                  className={clsx(
                    "text-sm font-medium mb-3",
                    theme === "dark" ? "text-white" : "text-gray-900"
                  )}
                >
                  Export Options
                </h3>

                <div className="space-y-2">
                  <label
                    className={clsx(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                      theme === "dark"
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-100 hover:bg-gray-200"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={options.includeVariables}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          includeVariables: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded border-gray-300 text-purple-600"
                    />
                    <div>
                      <div
                        className={clsx(
                          "text-sm font-medium",
                          theme === "dark" ? "text-white" : "text-gray-900"
                        )}
                      >
                        Include Variables
                      </div>
                      <div
                        className={clsx(
                          "text-xs",
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        )}
                      >
                        Export environment variables with collections
                      </div>
                    </div>
                  </label>

                  <label
                    className={clsx(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                      theme === "dark"
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-100 hover:bg-gray-200"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={options.includeDescriptions}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          includeDescriptions: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded border-gray-300 text-purple-600"
                    />
                    <div>
                      <div
                        className={clsx(
                          "text-sm font-medium",
                          theme === "dark" ? "text-white" : "text-gray-900"
                        )}
                      >
                        Include Descriptions
                      </div>
                      <div
                        className={clsx(
                          "text-xs",
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        )}
                      >
                        Export request descriptions and documentation
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div
                className={clsx(
                  "p-4 rounded-lg mb-6",
                  theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                )}
              >
                <div
                  className={clsx("text-sm", theme === "dark" ? "text-gray-300" : "text-gray-700")}
                >
                  <strong>{selectedCount}</strong> collection
                  {selectedCount !== 1 ? "s" : ""} will be exported
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className={clsx(
                    "flex-1 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer",
                    theme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  )}
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={selectedCount === 0}
                  className={clsx(
                    "flex-1 px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2",
                    selectedCount === 0
                      ? "opacity-50 cursor-not-allowed bg-gray-400 text-gray-200"
                      : theme === "dark"
                        ? "bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                        : "bg-purple-500 hover:bg-purple-600 text-white cursor-pointer"
                  )}
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
