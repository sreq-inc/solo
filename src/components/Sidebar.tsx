import { useTheme } from "../context/ThemeContext";
import { useFile } from "../context/FileContext";
import { FolderComponent } from "./Folder";
import { ThemeToggle } from "./ThemeToggle";
import { useLayoutEffect, useState } from "react";
import { Search, Plus, X, Github, ListCollapse } from "lucide-react";
import { open } from "@tauri-apps/plugin-shell";
import { LatestRelease } from "./LatestRelease";
import clsx from "clsx";
import { UpdateChecker } from "./UpdateChecker";

export const Sidebar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme } = useTheme();
  const {
    folders,
    openFolders,
    dropdownOpen,
    currentRequestId,
    showModal,
    setShowModal,
    toggleFolder,
    toggleDropdown,
    createNewRequest,
    removeFolder,
    renameFolder,
    handleFileClick,
    handleRemoveFile,
    createFolder,
    renameFile,
  } = useFile();

  useLayoutEffect(() => {
    if (showModal) {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setShowModal(false);
        }
      };
      window.addEventListener("keydown", handleEscape);
      return () => {
        window.removeEventListener("keydown", handleEscape);
      };
    }
  }, [showModal, setShowModal]);

  useLayoutEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.querySelector(".modal");
      if (modal && !modal.contains(event.target as Node)) {
        setShowModal(false);
      }
    };
    if (showModal) {
      setTimeout(() => {
        window.addEventListener("click", handleClickOutside);
      }, 100);
    }
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [showModal, setShowModal]);

  useLayoutEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || isCollapsed) return;
      const newWidth = e.clientX;
      if (newWidth >= 240 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, isCollapsed]);

  const filteredFolders = Object.keys(folders).filter((folder) =>
    folder.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateFolder = () => {
    console.log("Attempting to create folder with name:", newFolderName.trim());
    if (newFolderName.trim()) {
      try {
        createFolder(newFolderName.trim());
        console.log("Folder created successfully");
        setNewFolderName("");
        setShowModal(false);
      } catch (error) {
        console.error("Error creating folder:", error);
        alert("Error creating folder. Please try again.");
      }
    } else {
      console.log("Folder name is empty");
      alert("Please enter a folder name.");
    }
  };

  const handleModalOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Opening modal");
    setShowModal(true);
  };

  const handleResizeStart = () => {
    if (!isCollapsed) {
      setIsResizing(true);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const displayWidth = isCollapsed ? 60 : sidebarWidth;

  return (
    <div className="flex">
      <div
        className={clsx(
          "p-4 flex flex-col h-full transition-all duration-300 relative overflow-hidden",
          theme === "dark" ? "bg-[#10121b]" : "bg-gray-100"
        )}
        style={{ width: `${displayWidth}px` }}
      >
        {!isCollapsed && (
          <>
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
                  placeholder="Search"
                  className={clsx(
                    "w-full pl-10 pr-4 py-2 h-10 border rounded text-xs focus:outline-none ring-0",
                    theme === "dark"
                      ? "bg-[#10121b] text-white border-2 border-purple-500 focus:border-purple-500 focus:ring-0"
                      : "bg-white text-gray-800 border-2 border-purple-500 focus:border-purple-500 focus:ring-0"
                  )}
                />
              </div>
              <button
                onClick={handleModalOpen}
                className={clsx(
                  "h-7 w-7 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0",
                  theme === "dark"
                    ? "bg-purple-700 hover:bg-purple-800 text-white"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                )}
                title="New Folder"
                aria-label="New Folder"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto relative z-10">
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
                    onRenameFolder={renameFolder}
                    onFileClick={handleFileClick}
                    onRemoveFile={handleRemoveFile}
                    onRenameFile={renameFile}
                    currentRequestId={currentRequestId}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-row items-center justify-between mt-4">
              <section className="flex flex-row items-center gap-2">
                <button
                  onClick={toggleSidebar}
                  className={clsx(
                    "flex cursor-pointer items-center justify-center transition-colors duration-200",
                    theme === "dark"
                      ? "text-gray-500 hover:text-gray-300"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                  title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  aria-label={
                    isCollapsed ? "Expand sidebar" : "Collapse sidebar"
                  }
                >
                  <ListCollapse className="h-4 w-4 cursor-pointer" />
                </button>
              </section>
              <section className="flex flex-row items-center gap-2">
                <button
                  title="GitHub Repository"
                  aria-label="GitHub Repository"
                  type="button"
                  className="flex cursor-pointer items-center justify-center text-gray-500 hover:text-gray-700"
                  onClick={async () =>
                    await open("https://github.com/sreq-inc/Solo")
                  }
                >
                  <Github className="h-4 w-4" />
                </button>
                <UpdateChecker />
                <LatestRelease
                  owner="sreq-inc"
                  repo="Solo"
                  className={clsx(
                    "text-xs font-medium",
                    theme === "dark" ? "text-gray-500" : "text-gray-900"
                  )}
                />
              </section>
            </div>
          </>
        )}

        {isCollapsed && (
          <div className="flex flex-col items-center gap-4 mt-12 h-full">
            <img src="/solo.png" className="w-12 h-8 -mt-12" title="Solo" />
            <button
              onClick={handleModalOpen}
              className={clsx(
                "h-8 w-8 rounded-full flex items-center justify-center cursor-pointer",
                theme === "dark"
                  ? "bg-purple-700 hover:bg-purple-800 text-white"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              )}
              title="New Folder"
              aria-label="New Folder"
            >
              <Plus className="w-4 h-4" />
            </button>

            <div className="mt-auto mb-4 flex flex-col items-center gap-2">
              <button
                onClick={toggleSidebar}
                className={clsx(
                  "flex cursor-pointer items-center justify-center transition-colors duration-200",
                  theme === "dark"
                    ? "text-gray-500 hover:text-gray-300"
                    : "text-gray-500 hover:text-gray-700"
                )}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <ListCollapse className="h-4 w-4" />
              </button>
              <button
                title="GitHub Repository"
                aria-label="GitHub Repository"
                type="button"
                className="flex cursor-pointer items-center justify-center text-gray-500 hover:text-gray-700"
                onClick={async () =>
                  await open("https://github.com/sreq-inc/Solo")
                }
              >
                <Github className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-[rgb(0,0,0)]/50 bg-opacity-50 flex items-center justify-center z-50">
            <div
              className={clsx(
                "p-6 rounded-lg shadow-lg max-w-md w-full modal",
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
                  "w-full p-2 border rounded mb-4 text-xs ring-0 focus:outline-none",
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                )}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateFolder();
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    setShowModal(false);
                  }
                }}
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

      {!isCollapsed && (
        <div
          className="w-1 cursor-col-resize relative"
          onMouseDown={handleResizeStart}
        >
          <div className="absolute inset-0 w-0.5 -ml-0.5" />
        </div>
      )}
    </div>
  );
};
