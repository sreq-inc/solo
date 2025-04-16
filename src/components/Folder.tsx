import { Folder, FolderOpen, ChevronDown, Plus } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
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
  const files = JSON.parse(localStorage.getItem(folder) || "[]");

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onToggleFolder(folder)}
          className={clsx(
            "w-full flex flex-row p-2 text-left cursor-pointer",
            theme === "dark" ? "text-white" : "text-gray-800",
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
            "text-sm cursor-pointer px-2",
            theme === "dark" ? "text-white" : "text-black",
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
              : "bg-white border-gray-200",
          )}
        >
          <div className="px-4 py-2 text-xs font-semibold text-gray-400">
            CREATE
          </div>
          <button
            onClick={() => onCreateNewRequest(folder)}
            className={clsx(
              "px-4 py-2 text-sm w-full text-left flex items-center",
              theme === "dark"
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-700 hover:bg-gray-100",
            )}
          >
            <Plus className="w-4 h-4 mr-2" />
            HTTP Request
          </button>
          <div
            className={clsx(
              "border-t my-2",
              theme === "dark" ? "border-gray-700" : "border-gray-200",
            )}
          ></div>
          <button
            onClick={() => onRemoveFolder(folder)}
            className={clsx(
              "px-4 py-2 text-sm w-full text-left flex items-center text-red-600",
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100",
            )}
          >
            <Plus className="w-4 h-4 mr-2 rotate-45" />
            Delete Folder
          </button>
        </div>
      )}
      {isOpen && (
        <div className="mt-2 space-y-2 ml-4">
          {files.map((file: any) => (
            <div
              key={file.fileName}
              className={clsx(
                "flex items-center p-1.5 justify-between rounded hover:bg-gray-300",
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300",
                file.fileName === currentRequestId &&
                  (theme === "dark"
                    ? "border-l-purple-800 border-l-8 transition-all"
                    : "border-l-purple-900 border-l-8 transition-all"),
              )}
            >
              <button
                onClick={() => onFileClick(file.fileName)}
                className="flex justify-start  w-full cursor-pointer"
              >
                <span
                  className={clsx(
                    "w-14 text-center text-xs px-1.5 text-black transition-all",
                    file.fileData.method === "GET" && "bg-green-300",
                    file.fileData.method === "POST" && "bg-blue-300",
                    file.fileData.method === "PUT" && "bg-yellow-300",
                    file.fileData.method === "DELETE" && "bg-red-300",
                    file.fileData.method === "PATCH" && "bg-purple-300",
                  )}
                >
                  {file.fileData.method}
                </span>
              </button>
              <button
                onClick={() => onRemoveFile(file.fileName)}
                className={clsx(
                  "px-2",
                  theme === "dark" ? "text-white" : "text-black-500",
                )}
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
