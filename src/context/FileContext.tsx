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
  displayName?: string;
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
  createFolder: (folderName: string) => void;
  toggleFolder: (folder: string) => void;
  toggleDropdown: (folder: string, e: React.MouseEvent) => void;
  createNewRequest: (folder: string) => void;
  removeFolder: (folder: string) => void;
  handleFileClick: (fileName: string) => void;
  handleRemoveFile: (fileName: string) => void;
  saveCurrentRequest: () => void;
  renameFile: (folder: string, fileName: string, newName: string) => void;
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

  const createFolder = (folderName: string) => {
    if (!folderName || folders[folderName]) {
      alert("Folder name is invalid or already exists.");
      return;
    }
    setFolders((prev) => ({ ...prev, [folderName]: [] }));
    localStorage.setItem(folderName, JSON.stringify([]));
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

    const defaultRequest = {
      method: "GET" as const,
      url: "",
      payload: "",
      response: null,
      useBasicAuth: false,
      username: "",
      password: "",
      activeTab: "body" as const,
      bearerToken: "",
    };

    resetFields();

    setCurrentRequestId(newRequestId);

    try {
      const files = JSON.parse(
        localStorage.getItem(folder) || "[]"
      ) as StoredFile[];
      files.push({
        fileName: newRequestId,
        fileData: defaultRequest,
        displayName: "Nova Requisição",
      });
      localStorage.setItem(folder, JSON.stringify(files));

      setFolders((prev) => ({
        ...prev,
        [folder]: [...(prev[folder] || []), newRequestId],
      }));

      setMethod(defaultRequest.method);
      setUrl(defaultRequest.url);
      setPayload(defaultRequest.payload);
      setUseBasicAuth(defaultRequest.useBasicAuth);
      setUsername(defaultRequest.username);
      setPassword(defaultRequest.password);
      setActiveTab(defaultRequest.activeTab);
      setBearerToken(defaultRequest.bearerToken);
    } catch (error) {
      console.error("Erro ao criar nova requisição:", error);
    }

    setDropdownOpen(null);
  };

  const saveRequest = (
    folder: string,
    request: RequestData,
    requestId: string,
    displayName?: string
  ) => {
    const files = JSON.parse(
      localStorage.getItem(folder) || "[]"
    ) as StoredFile[];
    const existingIndex = files.findIndex(
      (file) => file.fileName === requestId
    );

    if (existingIndex !== -1) {
      const existingDisplayName = files[existingIndex].displayName;
      files[existingIndex] = {
        fileName: requestId,
        fileData: request,
        displayName: displayName || existingDisplayName,
      };
    } else {
      files.push({
        fileName: requestId,
        fileData: request,
        displayName: displayName || `${request.method} Request`,
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
      const files = JSON.parse(
        localStorage.getItem(currentFolder) || "[]"
      ) as StoredFile[];

      const currentFile = files.find(
        (file) => file.fileName === currentRequestId
      );
      const currentDisplayName = currentFile?.displayName;

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
        currentRequestId,
        currentDisplayName
      );
    }
  };

  const handleRemoveFile = (fileName: string) => {
    try {
      let folderContainingFile = currentFolder;

      if (!folderContainingFile) {
        for (const folderName in folders) {
          const files = JSON.parse(
            localStorage.getItem(folderName) || "[]"
          ) as StoredFile[];
          if (files.some((file) => file.fileName === fileName)) {
            folderContainingFile = folderName;
            break;
          }
        }
      }

      if (folderContainingFile) {
        const files = JSON.parse(
          localStorage.getItem(folderContainingFile) || "[]"
        ) as StoredFile[];

        const updatedFiles = files.filter((file) => file.fileName !== fileName);

        localStorage.setItem(
          folderContainingFile,
          JSON.stringify(updatedFiles)
        );

        setFolders((prev) => ({
          ...prev,
          [folderContainingFile]: updatedFiles.map((file) => file.fileName),
        }));

        if (fileName === currentRequestId) {
          resetFields();
          setCurrentRequestId(null);
        }

        console.log(
          `Arquivo '${fileName}' removido com sucesso da pasta '${folderContainingFile}'`
        );
      } else {
        console.error(
          `Não foi possível encontrar a pasta que contém o arquivo '${fileName}'`
        );
      }
    } catch (error) {
      console.error("Erro ao remover arquivo:", error);
    }
  };

  const renameFile = (folder: string, fileName: string, newName: string) => {
    if (folder && fileName && newName.trim()) {
      const files = JSON.parse(
        localStorage.getItem(folder) || "[]"
      ) as StoredFile[];

      const updatedFiles = files.map((file) => {
        if (file.fileName === fileName) {
          return {
            ...file,
            displayName: newName.trim(),
          };
        }
        return file;
      });

      localStorage.setItem(folder, JSON.stringify(updatedFiles));
      setFolders((prev) => ({
        ...prev,
        [folder]: updatedFiles.map((file) => file.fileName),
      }));
    }
  };

  const findRequestInAllFolders = (
    fileName: string
  ): { folder: string; data: RequestData; displayName?: string } | null => {
    for (let i = 0; i < localStorage.length; i++) {
      const folderName = localStorage.key(i);
      if (folderName) {
        try {
          const files = JSON.parse(
            localStorage.getItem(folderName) || "[]"
          ) as StoredFile[];
          const file = files.find((f) => f.fileName === fileName);
          if (file) {
            return {
              folder: folderName,
              data: file.fileData,
              displayName: file.displayName,
            };
          }
        } catch {
          continue;
        }
      }
    }
    return null;
  };

  const handleFileClick = (fileName: string) => {
    const foundRequest = findRequestInAllFolders(fileName);
    if (foundRequest) {
      const { folder, data } = foundRequest;

      setCurrentFolder(folder);
      setOpenFolders((prev) => ({
        ...prev,
        [folder]: true,
      }));

      setMethod(data.method);
      setUrl(data.url || "");
      setPayload(data.payload || "");
      setUseBasicAuth(data.useBasicAuth || false);
      setUsername(data.username || "");
      setPassword(data.password || "");
      setActiveTab(data.activeTab || "body");
      setBearerToken(data.bearerToken || "");
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
        createFolder,
        toggleFolder,
        toggleDropdown,
        createNewRequest,
        removeFolder,
        handleFileClick,
        handleRemoveFile,
        saveCurrentRequest,
        renameFile,
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
