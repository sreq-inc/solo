import { FolderComponent } from "./Folder";

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
  return (
    <div className="p-4 space-y-4 bg-gray-50 rounded-md col-span-2 h-full">
      <h2 className="text-xl font-bold flex flex-row items-center justify-start gap-2">
        <img src="/public/solo.png" className="w-8 h-8" /> <div>Solo</div>
      </h2>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => onNewFolderNameChange(e.target.value)}
          placeholder="Folder Name"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={onCreateFolder}
          className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700"
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
