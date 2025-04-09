import { Folder, FolderOpen, ChevronDown, Plus } from "lucide-react";

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
  const files = JSON.parse(localStorage.getItem(folder) || "[]");

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onToggleFolder(folder)}
          className="w-full flex flex-row p-2 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
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
          className="text-black dark:text-white text-sm cursor-pointer px-2"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 py-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-xl z-10 transition-colors">
          <div className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-300">
            CREATE
          </div>
          <button
            onClick={() => onCreateNewRequest(folder)}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            HTTP Request
          </button>
          <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
          <button
            onClick={() => onRemoveFolder(folder)}
            className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left flex items-center"
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
              className={`flex items-center p-1.5 justify-between rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors ${
                file.fileName === currentRequestId
                  ? "bg-purple-100 dark:bg-purple-900"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <button
                onClick={() => onFileClick(file.fileName)}
                className="w-full text-left"
              >
                {file.fileData.method}
              </button>
              <button
                onClick={() => onRemoveFile(file.fileName)}
                className="text-black-500 dark:text-white px-2"
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
