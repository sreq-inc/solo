// src/context/FileContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRequest } from "./RequestContext";

type RequestData = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  payload?: string;
  response?: unknown;
  useBasicAuth?: boolean;
  username?: string;
  password?: string;
  bearerToken?: string;
  activeTab?: "body" | "auth";
};

type StoredFile = {
  fileName: string;
  fileData: RequestData;
};

type FolderStructure = {
  [key: string]: string[];
};

type FileContextType = {
  folders: FolderStructure;
  openFolders: { [key: string]: boolean };
  dropdownOpen: string | null;
  currentFolder: string;
  currentRequestId: string | null;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  createFolder: () => void;
  toggleFolder: (folder: string) => void;
  toggleDropdown: (folder: string, e: React.MouseEvent) => void;
  createNewRequest: (folder: string) => void;
  removeFolder: (folder: string) => void;
  handleFileClick: (fileName: string) => void;
  handleRemoveFile: (fileName: string) => void;
  saveCurrentRequest: () => void;
};

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const {
    method,
    url,
    payload,
    username,
    password,
    useBasicAuth,
    activeTab,
    response,
    bearerToken,
    resetFields,
    setMethod,
    setUrl,
    setPayload,
    setUsername,
    setPassword,
    setUseBasicAuth,
    setActiveTab,
    setBearerToken,
  } = useRequest();

  const [folders, setFolders] = useState<FolderStructure>({});
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string>("");
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    loadAllFolders();
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (currentRequestId && currentFolder) {
      saveCurrentRequest();
    }
  }, [
    method,
    url,
    payload,
    useBasicAuth,
    username,
    password,
    activeTab,
    bearerToken,
  ]);

  const handleClickOutside = () => {
    setDropdownOpen(null);
  };

  const loadAllFolders = () => {
    const loadedFolders: FolderStructure = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const files = JSON.parse(
            localStorage.getItem(key) || "[]"
          ) as StoredFile[];
          loadedFolders[key] = files.map((file) => file.fileName);
        } catch {
          continue;
        }
      }
    }

    setFolders(loadedFolders);
  };

  const createFolder = () => {
    if (!newFolderName || folders[newFolderName]) {
      alert("Folder name is invalid or already exists.");
      return;
    }

    setFolders((prev) => ({ ...prev, [newFolderName]: [] }));
    localStorage.setItem(newFolderName, JSON.stringify([]));
    setNewFolderName("");
    resetFields();
  };

  const removeFolder = (folder: string) => {
    setFolders((prev) => {
      const newFolders = { ...prev };
      delete newFolders[folder];
      localStorage.removeItem(folder);
      return newFolders;
    });

    if (folder === currentFolder) {
      resetFields();
      setCurrentRequestId(null);
    }

    setDropdownOpen(null);
  };

  const toggleFolder = (folder: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folder]: !prev[folder],
    }));

    setCurrentFolder(folder);
    resetFields();
    setCurrentRequestId(null);
  };

  const toggleDropdown = (folder: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen((prev) => (prev === folder ? null : folder));
  };

  const createNewRequest = (folder: string) => {
    const newRequestId = `request_${Date.now()}`;

    setCurrentFolder(folder);
    setOpenFolders((prev) => ({ ...prev, [folder]: true }));

    resetFields();
    setCurrentRequestId(newRequestId);

    saveRequest(
      folder,
      {
        method: "GET",
        url: "",
        payload: "",
        response: null,
        useBasicAuth: false,
        username: "",
        password: "",
        activeTab: "body",
        bearerToken: "",
      },
      newRequestId
    );

    setDropdownOpen(null);
  };

  const saveRequest = (
    folder: string,
    request: RequestData,
    requestId: string
  ) => {
    const files = JSON.parse(
      localStorage.getItem(folder) || "[]"
    ) as StoredFile[];

    const existingIndex = files.findIndex(
      (file) => file.fileName === requestId
    );

    if (existingIndex !== -1) {
      files[existingIndex] = {
        fileName: requestId,
        fileData: request,
      };
    } else {
      files.push({
        fileName: requestId,
        fileData: request,
      });
    }

    localStorage.setItem(folder, JSON.stringify(files));

    setFolders((prev) => ({
      ...prev,
      [folder]: files.map((file) => file.fileName),
    }));
  };

  const saveCurrentRequest = () => {
    if (currentRequestId && currentFolder) {
      saveRequest(
        currentFolder,
        {
          method,
          url,
          payload,
          response,
          useBasicAuth,
          username,
          password,
          activeTab,
          bearerToken,
        },
        currentRequestId
      );
    }
  };

  const handleRemoveFile = (fileName: string) => {
    if (currentFolder) {
      const files = JSON.parse(
        localStorage.getItem(currentFolder) || "[]"
      ) as StoredFile[];
      const updatedFiles = files.filter((file) => file.fileName !== fileName);

      localStorage.setItem(currentFolder, JSON.stringify(updatedFiles));

      setFolders((prev) => ({
        ...prev,
        [currentFolder]: updatedFiles.map((file) => file.fileName),
      }));

      if (fileName === currentRequestId) {
        resetFields();
        setCurrentRequestId(null);
      }
    }
  };

  const findRequestInAllFolders = (fileName: string): RequestData | null => {
    for (let i = 0; i < localStorage.length; i++) {
      const folderName = localStorage.key(i);
      if (folderName) {
        try {
          const files = JSON.parse(
            localStorage.getItem(folderName) || "[]"
          ) as StoredFile[];
          const file = files.find((f) => f.fileName === fileName);
          if (file) {
            return file.fileData;
          }
        } catch {
          continue;
        }
      }
    }
    return null;
  };

  const handleFileClick = (fileName: string) => {
    const request = findRequestInAllFolders(fileName);

    if (request) {
      setMethod(request.method);
      setUrl(request.url || "");
      setPayload(request.payload || "");
      setUseBasicAuth(request.useBasicAuth || false);
      setUsername(request.username || "");
      setPassword(request.password || "");
      setActiveTab(request.activeTab || "body");
      setBearerToken(request.bearerToken || "");
      setCurrentRequestId(fileName);
    } else {
      alert("File not found.");
    }
  };

  return (
    <FileContext.Provider
      value={{
        folders,
        openFolders,
        dropdownOpen,
        currentFolder,
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
        saveCurrentRequest,
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

export const useFile = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error("useFile must be used within a FileProvider");
  }
  return context;
};
