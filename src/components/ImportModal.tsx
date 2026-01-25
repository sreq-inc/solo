import clsx from "clsx";
import { AlertCircle, FileJson, Loader2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useImport } from "../context/ImportContext";
import { useTheme } from "../context/ThemeContext";
import { ImportConflictResolver } from "./ImportConflictResolver";
import { ImportPreview } from "./ImportPreview";

type ImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const ImportModal = ({ isOpen, onClose }: ImportModalProps) => {
  const { theme } = useTheme();
  const { importState, conflicts, importFile, finalizeImport, resetImport } = useImport();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const jsonFile = files.find((file) => file.name.endsWith(".json"));

      if (jsonFile) {
        await importFile(jsonFile);
      }
    },
    [importFile]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await importFile(file);
      }
    },
    [importFile]
  );

  const handleClose = useCallback(() => {
    resetImport();
    onClose();
  }, [resetImport, onClose]);

  const handleFinalizeImport = useCallback(async () => {
    await finalizeImport();
    onClose();
  }, [finalizeImport, onClose]);

  if (!isOpen) return null;

  const showPreview = importState.result && !importState.isImporting;
  const hasConflicts = conflicts.length > 0;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className={clsx(
          "rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto",
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
              Import Collections
            </h2>
            <button
              onClick={handleClose}
              className={clsx(
                "p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer",
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {importState.error && (
            <div
              className={clsx(
                "mb-4 p-4 rounded-lg flex items-start gap-3",
                theme === "dark"
                  ? "bg-red-900/20 border border-red-800"
                  : "bg-red-50 border border-red-200"
              )}
            >
              <AlertCircle
                className={clsx(
                  "w-5 h-5 flex-shrink-0 mt-0.5",
                  theme === "dark" ? "text-red-400" : "text-red-600"
                )}
              />
              <div>
                <h3
                  className={clsx(
                    "font-medium mb-1",
                    theme === "dark" ? "text-red-400" : "text-red-800"
                  )}
                >
                  Import Failed
                </h3>
                <p className={clsx("text-sm", theme === "dark" ? "text-red-300" : "text-red-700")}>
                  {importState.error}
                </p>
              </div>
            </div>
          )}

          {!showPreview && !importState.isImporting && (
            <>
              <div
                className={clsx(
                  "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
                  isDragging
                    ? theme === "dark"
                      ? "border-purple-500 bg-purple-900/20"
                      : "border-purple-500 bg-purple-50"
                    : theme === "dark"
                      ? "border-gray-600 hover:border-gray-500"
                      : "border-gray-300 hover:border-gray-400"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <FileJson
                  className={clsx(
                    "w-16 h-16 mx-auto mb-4",
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  )}
                />
                <h3
                  className={clsx(
                    "text-lg font-medium mb-2",
                    theme === "dark" ? "text-white" : "text-gray-900"
                  )}
                >
                  Drop your file here
                </h3>
                <p
                  className={clsx(
                    "text-sm mb-4",
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  or click to browse (max 10MB)
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={clsx(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer",
                    theme === "dark"
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-purple-500 hover:bg-purple-600 text-white"
                  )}
                >
                  <Upload className="w-4 h-4" />
                  Select File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              <div
                className={clsx(
                  "mt-6 p-4 rounded-lg",
                  theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                )}
              >
                <h4
                  className={clsx(
                    "font-medium mb-2",
                    theme === "dark" ? "text-white" : "text-gray-900"
                  )}
                >
                  Supported Formats
                </h4>
                <ul
                  className={clsx(
                    "text-sm space-y-1",
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  <li>• Solo JSON export files</li>
                  <li>• Postman collections (v2.1)</li>
                  <li>• Insomnia export files</li>
                </ul>
              </div>
            </>
          )}

          {importState.isImporting && (
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
                  Importing {importState.currentFile}...
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
                      style={{ width: `${importState.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {showPreview && (
            <>
              <ImportPreview result={importState.result!} />
              {hasConflicts && <ImportConflictResolver conflicts={conflicts} />}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleClose}
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
                  onClick={handleFinalizeImport}
                  className={clsx(
                    "flex-1 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer",
                    theme === "dark"
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-purple-500 hover:bg-purple-600 text-white"
                  )}
                >
                  Import {importState.result?.totalRequests} Request
                  {importState.result?.totalRequests !== 1 ? "s" : ""}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
