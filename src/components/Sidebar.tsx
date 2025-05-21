import { useTheme } from "../context/ThemeContext";
import { useFile } from "../context/FileContext";
import { FolderComponent } from "./Folder";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";
import { Search, Plus, X } from "lucide-react";
import clsx from "clsx";

export const Sidebar = () => {
  const { theme } = useTheme();
  const {
    folders,
    openFolders,
    dropdownOpen,
    currentRequestId,
    toggleFolder,
    toggleDropdown,
    createNewRequest,
    removeFolder,
    handleFileClick,
    handleRemoveFile,
    createFolder,
    renameFile,
  } = useFile();

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const filteredFolders = Object.keys(folders).filter((folder) =>
    folder.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName);
      setNewFolderName("");
      setShowModal(false);
    }
  };

  return (
    <div
      className={clsx(
        "p-4 flex flex-col h-full col-span-2 transition-colors duration-200",
        theme === "dark" ? "bg-[#10121b]" : "bg-gray-100"
      )}
    >
      <div className="flex justify-between items-center mb-4">
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

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search
              className={clsx(
                "w-4 h-4",
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              )}
            />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search folders..."
            className={clsx(
              "w-full pl-10 pr-4 py-2 h-8 border rounded text-xs focus:outline-none ring-0",
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
            )}
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className={clsx(
            "h-8 w-10 rounded flex items-center justify-center cursor-pointer",
            theme === "dark"
              ? "bg-purple-700 hover:bg-purple-800 text-white"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          )}
          title="New Folder"
          aria-label="New Folder"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable folder container */}
      <div className="flex-grow overflow-y-auto">
        <div className="space-y-2">
          {filteredFolders.map((folder) => (
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
              onRenameFile={renameFile}
              currentRequestId={currentRequestId}
            />
          ))}
        </div>
      </div>

      {/* Modal to create new folder */}
      {showModal && (
        <div className="fixed inset-0 bg-[rgb(0,0,0)]/50 bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={clsx(
              "p-6 rounded-lg shadow-lg max-w-md w-full",
              theme === "dark" ? "bg-gray-800" : "bg-white"
            )}
          >
            <div className="flex justify-between items-center mb-4">
              <h3
                className={clsx(
                  "text-lg font-medium",
                  theme === "dark" ? "text-white" : "text-gray-900"
                )}
              >
                Create New Folder
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className={clsx(
                  "cursor-pointer",
                  theme === "dark" ? "text-gray-300" : "text-gray-500"
                )}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className={clsx(
                "w-full p-2 border rounded mb-4 text-xs",
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
              )}
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className={clsx(
                  "px-4 py-2 rounded text-xs cursor-pointer",
                  theme === "dark"
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-800"
                )}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className={clsx(
                  "px-4 py-2 rounded text-white text-xs cursor-pointer",
                  theme === "dark"
                    ? "bg-purple-700 hover:bg-purple-800"
                    : "bg-purple-600 hover:bg-purple-700",
                  !newFolderName.trim() && "opacity-50 cursor-not-allowed"
                )}
                disabled={!newFolderName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
