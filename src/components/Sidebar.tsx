import { useTheme } from "../context/ThemeContext";
import { FolderComponent } from "./Folder";
import { ThemeToggle } from "./ThemeToggle";
import clsx from "clsx";

type SidebarProps = {
  folders: Record<string, any>;
  openFolders: { [key: string]: boolean };
  dropdownOpen: string | null;
  currentRequestId: string | null;
  newFolderName: string;
  onNewFolderNameChange: (name: string) => void;
  onCreateFolder: () => void;
  onToggleFolder: (folder: string) => void;
  onToggleDropdown: (folder: string, e: React.MouseEvent) => void;
  onCreateNewRequest: (folder: string) => void;
  onRemoveFolder: (folder: string) => void;
  onFileClick: (fileName: string) => void;
  onRemoveFile: (fileName: string) => void;
};

export const Sidebar = ({
  folders,
  openFolders,
  dropdownOpen,
  currentRequestId,
  newFolderName,
  onNewFolderNameChange,
  onCreateFolder,
  onToggleFolder,
  onToggleDropdown,
  onCreateNewRequest,
  onRemoveFolder,
  onFileClick,
  onRemoveFile,
}: SidebarProps) => {
  const { theme } = useTheme();

  return (
    <div
      className={clsx(
        "p-4 space-y-4 rounded-md col-span-2 h-full transition-colors duration-200",
        theme === "dark" ? "bg-gray-800" : "bg-white",
      )}
    >
      <div className="flex justify-between items-center">
        <h2
          className={clsx(
            "text-xl font-bold flex flex-row items-center justify-start gap-2",
            theme === "dark" ? "text-white" : "text-gray-800",
          )}
        >
          <img src="/public/solo.png" className="w-8 h-8" /> <div>Solo</div>
        </h2>
        <ThemeToggle />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => onNewFolderNameChange(e.target.value)}
          placeholder="Folder Name"
          className={clsx(
            "w-full p-2 border rounded",
            theme === "dark"
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-800",
          )}
        />
        <button
          onClick={onCreateFolder}
          className={clsx(
            "p-2 text-white rounded",
            theme === "dark"
              ? "bg-purple-700 hover:bg-purple-800"
              : "bg-purple-600 hover:bg-purple-700",
          )}
        >
          Create
        </button>
      </div>
      <div className="space-y-2 mt-4">
        {Object.keys(folders).map((folder) => (
          <FolderComponent
            key={folder}
            folder={folder}
            isOpen={!!openFolders[folder]}
            isDropdownOpen={dropdownOpen === folder}
            onToggleFolder={onToggleFolder}
            onToggleDropdown={onToggleDropdown}
            onCreateNewRequest={onCreateNewRequest}
            onRemoveFolder={onRemoveFolder}
            onFileClick={onFileClick}
            onRemoveFile={onRemoveFile}
            currentRequestId={currentRequestId}
          />
        ))}
      </div>
    </div>
  );
};
