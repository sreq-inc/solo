import { useState } from "react";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type RequestData = {
  method: HttpMethod;
  url: string;
  payload?: string;
  response?: unknown;
};

type StoredFile = {
  fileName: string;
  fileData: RequestData;
};

type FolderStructure = {
  [key: string]: string[];
};

export const useRequestStorage = () => {
  const [folders, setFolders] = useState<FolderStructure>({});
  const [currentFolder, setCurrentFolder] = useState<string>("");

  const createFolder = (folderName: string) => {
    if (!folderName || folders[folderName]) return false;

    setFolders((prev) => ({ ...prev, [folderName]: [] }));
    localStorage.setItem(folderName, JSON.stringify([]));
    return true;
  };

  const removeFolder = (folder: string) => {
    setFolders((prev) => {
      const newFolders = { ...prev };
      delete newFolders[folder];
      localStorage.removeItem(folder);
      return newFolders;
    });
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

  const removeRequest = (folder: string, fileName: string) => {
    const files = JSON.parse(
      localStorage.getItem(folder) || "[]"
    ) as StoredFile[];
    const updatedFiles = files.filter((file) => file.fileName !== fileName);

    localStorage.setItem(folder, JSON.stringify(updatedFiles));
    setFolders((prev) => ({
      ...prev,
      [folder]: updatedFiles.map((file) => file.fileName),
    }));
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

  const loadRequest = (
    folder: string | null,
    fileName: string
  ): RequestData | null => {
    if (folder) {
      const files = JSON.parse(
        localStorage.getItem(folder) || "[]"
      ) as StoredFile[];
      const file = files.find((f) => f.fileName === fileName);
      return file?.fileData || null;
    } else {
      return findRequestInAllFolders(fileName);
    }
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

  const getFolderRequests = (folder: string): StoredFile[] => {
    try {
      return JSON.parse(localStorage.getItem(folder) || "[]");
    } catch {
      return [];
    }
  };

  return {
    folders,
    currentFolder,
    setCurrentFolder,
    createFolder,
    removeFolder,
    saveRequest,
    removeRequest,
    loadRequest,
    loadAllFolders,
    getFolderRequests,
  };
};
