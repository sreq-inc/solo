import {
  Folder,
  FolderOpen,
  ChevronDown,
  Plus,
  Edit,
  Trash,
  MoreHorizontal,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import clsx from "clsx";
import { useState, useEffect } from "react";

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
  onRenameFile: (folder: string, fileName: string, newName: string) => void;
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
  onRenameFile,
  currentRequestId,
}: FolderProps) => {
  const { theme } = useTheme();
  const files = JSON.parse(localStorage.getItem(folder) || "[]");
  const [fileDropdownOpen, setFileDropdownOpen] = useState<string | null>(null);
  const [editingFileName, setEditingFileName] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");

  const handleFileDropdownToggle = (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFileDropdownOpen((prev) => (prev === fileName ? null : fileName));
  };

  const handleRenameClick = (
    fileName: string,
    currentName: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setEditingFileName(fileName);
    setNewFileName(currentName);
    setFileDropdownOpen(null);
  };

  const handleRenameSubmit = (fileName: string) => {
    onRenameFile(folder, fileName, newFileName);
    setEditingFileName(null);
  };

  const handleInputKeyDown = (fileName: string, e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRenameSubmit(fileName);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditingFileName(null);
    }
  };

  const closeView = () => {
    setFileDropdownOpen(null);
    setEditingFileName(null);
  };

  const handleEscKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      closeView();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onToggleFolder(folder)}
          className={clsx(
            "w-full flex items-center p-2 text-left h-8 text-xs cursor-pointer",
            theme === "dark" ? "text-white" : "text-gray-800"
          )}
        >
          {isOpen ? (
            <FolderOpen className="mr-2" />
          ) : (
            <Folder className="mr-2" />
          )}
          <span>{folder}</span>
        </button>
        <button
          onClick={(e) => onToggleDropdown(folder, e)}
          className={clsx(
            "px-2 h-8 cursor-pointer",
            theme === "dark" ? "text-white" : "text-black"
          )}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      {isDropdownOpen && (
        <div
          className={clsx(
            "absolute right-0 mt-2 py-2 w-40 rounded-md shadow-xl z-10 border",
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          )}
        >
          <div className="px-4 py-2 text-xs font-semibold text-gray-400">
            CREATE
          </div>
          <button
            onClick={() => onCreateNewRequest(folder)}
            className={clsx(
              "px-4 py-2 text-sm w-full text-left flex items-center cursor-pointer",
              theme === "dark"
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <Plus className="w-4 h-4 mr-2" />
            HTTP Request
          </button>
          <div
            className={clsx(
              "border-t my-2",
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            )}
          ></div>
          <button
            onClick={() => onRemoveFolder(folder)}
            className={clsx(
              "px-4 py-2 text-sm w-full text-left flex items-center text-red-600 cursor-pointer",
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
            )}
          >
            <Trash className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      )}
      {isOpen && (
        <div className="mt-2 space-y-2 ml-4">
          {files.map((file: any) => (
            <div
              key={file.fileName}
              className={clsx(
                "flex items-center p-1.5 rounded hover:bg-gray-300 relative",
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300",
                file.fileName === currentRequestId &&
                  (theme === "dark"
                    ? "border-l-purple-800 border-l-8 transition-all"
                    : "border-l-purple-900 border-l-8 transition-all")
              )}
            >
              {editingFileName === file.fileName ? (
                <div
                  className="flex-1 flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyDown={(e) => handleInputKeyDown(file.fileName, e)}
                    autoFocus
                    className={clsx(
                      "flex-1 text-xs p-1 rounded outline-none w-10",
                      theme === "dark"
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-800"
                    )}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onFileClick(file.fileName)}
                    className="flex items-center w-full cursor-pointer pr-8"
                  >
                    <span
                      className={clsx(
                        "w-14 text-center text-xs px-1.5 text-black transition-all",
                        file.fileData.method === "GET" && "bg-green-300",
                        file.fileData.method === "POST" && "bg-blue-300",
                        file.fileData.method === "PUT" && "bg-yellow-300",
                        file.fileData.method === "DELETE" && "bg-red-300",
                        file.fileData.method === "PATCH" && "bg-purple-300"
                      )}
                    >
                      {file.fileData.method}
                    </span>
                    <span
                      className={clsx(
                        "ml-2 text-xs truncate",
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      )}
                    >
                      {file.displayName || "Request"}
                    </span>
                  </button>
                  <button
                    onClick={(e) => handleFileDropdownToggle(file.fileName, e)}
                    className={clsx(
                      "p-0.5 cursor-pointer rounded text-sm absolute right-1 top-1/2 transform -translate-y-1/2",
                      theme === "dark"
                        ? "text-white bg-gray-800"
                        : "text-black-500 bg-white"
                    )}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {fileDropdownOpen === file.fileName && (
                    <div
                      className={clsx(
                        "absolute right-0 top-8 mt-2 py-2 w-36 rounded-md shadow-xl z-10 border",
                        theme === "dark"
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                      )}
                    >
                      <button
                        onClick={(e) =>
                          handleRenameClick(
                            file.fileName,
                            file.displayName || "Request",
                            e
                          )
                        }
                        className={clsx(
                          "px-4 py-2 text-sm w-full text-left flex items-center cursor-pointer",
                          theme === "dark"
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Rename
                      </button>
                      <button
                        onClick={() => {
                          onRemoveFile(file.fileName);
                          setFileDropdownOpen(null);
                        }}
                        className={clsx(
                          "px-4 py-2 text-sm w-full text-left flex items-center cursor-pointer",
                          theme === "dark"
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                      <hr
                        className={clsx(
                          "border-t my-2",
                          theme === "dark"
                            ? "border-gray-700"
                            : "border-gray-200"
                        )}
                      />
                      <button
                        onClick={closeView}
                        className={clsx(
                          "px-4 py-2 text-sm w-full text-left flex items-center cursor-pointer",
                          theme === "dark"
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        (ESC) Cancel
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
