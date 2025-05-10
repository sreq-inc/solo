import { useTheme } from "../context/ThemeContext";
import { useFile } from "../context/FileContext";
import { FolderComponent } from "./Folder";
import { ThemeToggle } from "./ThemeToggle";
import clsx from "clsx";

export const Sidebar = () => {
  const { theme } = useTheme();
  const {
    folders,
    openFolders,
    dropdownOpen,
    currentRequestId,
    newFolderName,
    setNewFolderName,
    createFolder,
    toggleFolder,
    toggleDropdown,
    createNewRequest,
    removeFolder,
    handleFileClick,
    handleRemoveFile,
  } = useFile();

  return (
    <div
      className={clsx(
        "p-4 space-y-4 col-span-2 h-full transition-colors duration-200",
        theme === "dark" ? "bg-[#10121b]" : "bg-gray-100"
      )}
    >
      <div className="flex justify-between items-center">
        <h2
          className={clsx(
            "text-xl font-bold flex flex-row items-center justify-start gap-2",
            theme === "dark" ? "text-white" : "text-gray-800"
          )}
        >
          <img src="/solo.png" className="w-8 h-8" /> <div>Solo</div>
        </h2>
        <ThemeToggle />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="Folder Name"
          className={clsx(
            "w-full p-2 border rounded",
            theme === "dark"
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-800"
          )}
        />
        <button
          onClick={createFolder}
          className={clsx(
            "p-2 text-white rounded",
            theme === "dark"
              ? "bg-purple-700 hover:bg-purple-800"
              : "bg-purple-600 hover:bg-purple-700"
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
            onToggleFolder={toggleFolder}
            onToggleDropdown={toggleDropdown}
            onCreateNewRequest={createNewRequest}
            onRemoveFolder={removeFolder}
            onFileClick={handleFileClick}
            onRemoveFile={handleRemoveFile}
            currentRequestId={currentRequestId}
          />
        ))}
      </div>
    </div>
  );
};
