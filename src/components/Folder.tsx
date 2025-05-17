import {
  Folder,
  FolderOpen,
  ChevronDown,
  Plus,
  Edit,
  Trash,
  MoreHorizontal,
  Filter,
  X,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";
import clsx from "clsx";

type FolderProps = {
  folder: string;
  isOpen: boolean;
  isDropdownOpen: boolean;
  onToggleFolder: (folder: string) => void;
  onToggleDropdown: (folder: string, e: React.MouseEvent) => void;
  onCreateNewRequest: (folder: string) => void;
  onRemoveFolder: (folder: string) => void;
  onFileClick: (fileName: string) => void;
  onRemoveFile: (fileName: string) => void;
  currentRequestId: string | null;
};

export const FolderComponent = ({
  folder,
  isOpen,
  isDropdownOpen,
  onToggleFolder,
  onToggleDropdown,
  onCreateNewRequest,
  onRemoveFolder,
  onFileClick,
  onRemoveFile,
  currentRequestId,
}: FolderProps) => {
  const { theme } = useTheme();
  const [files, setFiles] = useState<any[]>([]);
  const [fileDropdownOpen, setFileDropdownOpen] = useState<string | null>(null);
  const [renameMode, setRenameMode] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [newMethodName, setNewMethodName] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<
    "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  >("GET");
  const [filterModal, setFilterModal] = useState(false);
  const [filterMethod, setFilterMethod] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");

  // Load files when folder changes or when files are updated
  useEffect(() => {
    loadFiles();
  }, [folder]);

  const loadFiles = () => {
    try {
      const data = JSON.parse(localStorage.getItem(folder) || "[]");
      setFiles(data);
    } catch (error) {
      console.error("Error loading files:", error);
      setFiles([]);
    }
  };

  const toggleFileDropdown = (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFileDropdownOpen((prev) => (prev === fileName ? null : fileName));
  };

  const startRename = (fileName: string) => {
    const file = files.find((f) => f.fileName === fileName);
    setRenameMode(fileName);
    setNewName(file?.displayName || file?.fileData?.method || "Request");
  };

  const handleRename = (fileName: string) => {
    if (!newName.trim()) return;
    const updated = files.map((file) =>
      file.fileName === fileName
        ? { ...file, displayName: newName.trim() }
        : file
    );
    localStorage.setItem(folder, JSON.stringify(updated));
    setFiles(updated);
    setRenameMode(null);
    setFileDropdownOpen(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, fileName: string) => {
    if (e.key === "Enter") handleRename(fileName);
    if (e.key === "Escape") setRenameMode(null);
  };

  const openCreateModal = () => {
    setNewMethodName("");
    setSelectedMethod("GET");
    setCreateModal(true);
  };

  const handleCreateMethod = () => {
    if (!newMethodName.trim()) return;
    onCreateNewRequest(folder);
    setTimeout(() => {
      const updated = JSON.parse(localStorage.getItem(folder) || "[]");
      const last = updated[updated.length - 1];
      if (last) {
        last.displayName = newMethodName.trim();
        last.fileData.method = selectedMethod;
        localStorage.setItem(folder, JSON.stringify(updated));
        loadFiles(); // Reload files after update
      }
    }, 100);
    setNewMethodName("");
    setSelectedMethod("GET");
    setCreateModal(false);
  };

  const handleRemoveFile = (fileName: string) => {
    try {
      // Call the parent component's remove file function
      onRemoveFile(fileName);

      // Also update our local state to keep UI in sync
      setTimeout(() => {
        loadFiles();
      }, 50);
    } catch (error) {
      console.error("Error removing file:", error);
    }
  };

  const clearFilter = () => {
    setFilterMethod(null);
    setFilterText("");
    setFilterModal(false);
  };

  const filtered = files.filter((file) => {
    if (filterMethod && file.fileData.method !== filterMethod) return false;
    if (
      filterText &&
      !(file.displayName || file.fileData.url || "")
        .toLowerCase()
        .includes(filterText.toLowerCase())
    )
      return false;
    return true;
  });

  const hasFilter = filterMethod || filterText;

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onToggleFolder(folder)}
          className={clsx(
            "w-full flex p-2 text-left",
            theme === "dark" ? "text-white" : "text-gray-800"
          )}
        >
          {isOpen ? (
            <FolderOpen className="mr-2" />
          ) : (
            <Folder className="mr-2" />
          )}
          {folder}
        </button>
        <button
          onClick={(e) => onToggleDropdown(folder, e)}
          className={clsx(
            "px-2",
            theme === "dark" ? "text-white" : "text-black"
          )}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {isDropdownOpen && (
        <div
          className={clsx(
            "absolute right-0 mt-2 py-2 w-48 rounded-md shadow-xl z-10 border",
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          )}
        >
          <div className="px-4 py-2 text-xs font-semibold text-gray-400">
            ACTIONS
          </div>
          <button
            onClick={openCreateModal} // Changed to directly open modal
            className={clsx(
              "px-4 py-2 text-sm w-full flex items-center",
              theme === "dark"
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <Plus className="w-4 h-4 mr-2" />
            HTTP Request
          </button>
          <button
            onClick={() => setFilterModal(true)}
            className={clsx(
              "px-4 py-2 text-sm w-full flex items-center",
              theme === "dark"
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <div
            className={clsx(
              "border-t my-2",
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            )}
          />
          <button
            onClick={() => onRemoveFolder(folder)}
            className={clsx(
              "px-4 py-2 text-sm w-full flex items-center text-red-600",
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
            )}
          >
            <Trash className="w-4 h-4 mr-2" />
            Delete Folder
          </button>
        </div>
      )}

      {isOpen && (
        <div className="mt-2 space-y-2 ml-4">
          {hasFilter && filtered.length !== files.length && (
            <div
              className={clsx(
                "text-xs text-center py-1",
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              )}
            >
              Showing {filtered.length} of {files.length}
            </div>
          )}

          {filtered.map((file) => (
            <div
              key={file.fileName}
              className={clsx(
                "flex items-center rounded",
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300",
                file.fileName === currentRequestId &&
                  (theme === "dark"
                    ? "border-l-purple-800 border-l-8"
                    : "border-l-purple-900 border-l-8")
              )}
            >
              {/* Content Container with fixed width for the method name */}
              <div className="flex-grow overflow-hidden max-w-[calc(100%-32px)]">
                <button
                  onClick={() => onFileClick(file.fileName)}
                  className="flex items-center w-full"
                >
                  <span
                    className={clsx(
                      "w-14 text-center text-xs px-1.5 text-black shrink-0",
                      {
                        "bg-green-300": file.fileData.method === "GET",
                        "bg-blue-300": file.fileData.method === "POST",
                        "bg-yellow-300": file.fileData.method === "PUT",
                        "bg-red-300": file.fileData.method === "DELETE",
                        "bg-purple-300": file.fileData.method === "PATCH",
                      }
                    )}
                  >
                    {file.fileData.method}
                  </span>
                  {renameMode === file.fileName ? (
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onBlur={() => handleRename(file.fileName)}
                      onKeyDown={(e) => handleKeyDown(e, file.fileName)}
                      className={clsx(
                        "ml-2 px-2 py-1 rounded text-sm flex-grow",
                        theme === "dark"
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-800"
                      )}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      className={clsx(
                        "ml-2 truncate w-full block text-xs text-left",
                        theme === "dark" ? "text-white" : "text-gray-800"
                      )}
                    >
                      {file.displayName ||
                        file.fileData.url ||
                        "Untitled Request"}
                    </span>
                  )}
                </button>
              </div>

              {/* Action button, fixed position */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={(e) => toggleFileDropdown(file.fileName, e)}
                  className={clsx(
                    "p-1 rounded",
                    theme === "dark"
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-600 hover:bg-gray-400"
                  )}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {fileDropdownOpen === file.fileName && (
                  <div
                    className={clsx(
                      "absolute right-0 mt-1 py-2 w-32 rounded-md shadow-lg z-20 border",
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    )}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(file.fileName);
                        setFileDropdownOpen(null);
                      }}
                      className={clsx(
                        "px-4 py-2 text-sm w-full text-left flex items-center",
                        theme === "dark"
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Rename
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(file.fileName);
                      }}
                      className={clsx(
                        "px-4 py-2 text-sm w-full text-left flex items-center text-red-600",
                        theme === "dark"
                          ? "hover:bg-gray-700"
                          : "hover:bg-gray-100"
                      )}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {createModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setCreateModal(false)}
        >
          <div
            className={clsx(
              "p-6 rounded-lg shadow-lg max-w-md w-full",
              theme === "dark" ? "bg-gray-800" : "bg-white"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3
                className={clsx(
                  "text-lg font-medium",
                  theme === "dark" ? "text-white" : "text-gray-900"
                )}
              >
                New HTTP Method
              </h3>
              <button
                onClick={() => setCreateModal(false)}
                className={theme === "dark" ? "text-gray-300" : "text-gray-500"}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <label
                className={clsx(
                  "block text-sm font-medium mb-2",
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                )}
              >
                Method Name
              </label>
              <input
                type="text"
                value={newMethodName}
                onChange={(e) => setNewMethodName(e.target.value)}
                placeholder="Ex: Get users"
                className={clsx(
                  "w-full border mb-4 text-xs focus:none ring-0 focus:outline-none",
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                )}
                autoFocus
              />

              <label
                className={clsx(
                  "block text-sm font-medium mb-2",
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                )}
              >
                Method Type
              </label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value as any)}
                className={clsx(
                  "w-full p-2 border rounded text-sm",
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-800"
                )}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCreateModal(false)}
                className={clsx(
                  "px-4 py-2 rounded text-sm",
                  theme === "dark"
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-800"
                )}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMethod}
                className={clsx(
                  "px-4 py-2 rounded text-white text-sm",
                  theme === "dark"
                    ? "bg-purple-700 hover:bg-purple-800"
                    : "bg-purple-600 hover:bg-purple-700",
                  !newMethodName.trim() && "opacity-50 cursor-not-allowed"
                )}
                disabled={!newMethodName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {filterModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setFilterModal(false)}
        >
          <div
            className={clsx(
              "p-6 rounded-lg shadow-lg max-w-md w-full",
              theme === "dark" ? "bg-gray-800" : "bg-white"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3
                className={clsx(
                  "text-lg font-medium",
                  theme === "dark" ? "text-white" : "text-gray-900"
                )}
              >
                Filter Methods
              </h3>
              <button
                onClick={() => setFilterModal(false)}
                className={theme === "dark" ? "text-gray-300" : "text-gray-500"}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <label
                className={clsx(
                  "block text-sm font-medium mb-2",
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                )}
              >
                Filter by Method
              </label>
              <select
                value={filterMethod || ""}
                onChange={(e) => setFilterMethod(e.target.value || null)}
                className={clsx(
                  "w-full p-2 border rounded mb-4 text-sm",
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-800"
                )}
              >
                <option value="">All methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>

              <label
                className={clsx(
                  "block text-sm font-medium mb-2",
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                )}
              >
                Search by Name
              </label>
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Filter by text..."
                className={clsx(
                  "w-full p-2 border rounded text-sm",
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={clearFilter}
                className={clsx(
                  "px-4 py-2 rounded text-sm",
                  theme === "dark"
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-800"
                )}
              >
                Clear Filters
              </button>
              <button
                onClick={() => setFilterModal(false)}
                className={clsx(
                  "px-4 py-2 rounded text-white text-sm",
                  theme === "dark"
                    ? "bg-purple-700 hover:bg-purple-800"
                    : "bg-purple-600 hover:bg-purple-700"
                )}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
