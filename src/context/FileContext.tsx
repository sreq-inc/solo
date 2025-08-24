import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRequest, QueryParam, RequestType } from "./RequestContext";
import { useVariables } from "./VariablesContext";

type RequestData = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  payload?: string;
  response?: unknown;
  useBasicAuth?: boolean;
  username?: string;
  password?: string;
  bearerToken?: string;
  activeTab?:
    | "body"
    | "auth"
    | "params"
    | "graphql"
    | "grpc"
    | "proto"
    | "variables"
    | "description"
    | "schema";
  queryParams?: QueryParam[];
  requestType?: RequestType;
  graphqlQuery?: string;
  graphqlVariables?: string;
  grpcService?: string;
  grpcMethod?: string;
  grpcMessage?: string;
  grpcCallType?:
    | "unary"
    | "server_streaming"
    | "client_streaming"
    | "bidirectional";
  protoContent?: string;
  description?: string;
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
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  createFolder: (folderName: string) => void;
  toggleFolder: (folder: string) => void;
  toggleDropdown: (folder: string, e: React.MouseEvent) => void;
  createNewRequest: (folder: string, type?: RequestType) => void;
  removeFolder: (folder: string) => void;
  handleFileClick: (fileName: string) => void;
  handleRemoveFile: (fileName: string) => void;
  saveCurrentRequest: () => void;
  renameFile: (folder: string, fileName: string, newName: string) => void;
  renameFolder: (oldName: string, newName: string) => void;
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
    queryParams,
    requestType,
    graphqlQuery,
    graphqlVariables,
    grpcService,
    grpcMethod,
    grpcMessage,
    grpcCallType,
    protoContent,
    description,
    resetFields,
    setMethod,
    setUrl,
    setPayload,
    setUsername,
    setPassword,
    setUseBasicAuth,
    setActiveTab,
    setBearerToken,
    setQueryParams,
    setRequestType,
    setGraphqlQuery,
    setGraphqlVariables,
    setGrpcService,
    setGrpcMethod,
    setGrpcMessage,
    setGrpcCallType,
    setProtoContent,
    setDescription,
  } = useRequest();

  const { loadVariablesForFolder, clearVariables } = useVariables();

  const [folders, setFolders] = useState<FolderStructure>({});
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [showModal, setShowModal] = useState(false);
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
    queryParams,
    requestType,
    graphqlQuery,
    graphqlVariables,
    grpcService,
    grpcMethod,
    grpcMessage,
    grpcCallType,
    protoContent,
    description,
  ]);

  const handleClickOutside = () => {
    setDropdownOpen(null);
  };

  const loadAllFolders = () => {
    const loadedFolders: FolderStructure = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith("solo-variables-")) {
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
      localStorage.removeItem(`solo-variables-${folder}`);
      return newFolders;
    });
    if (folder === currentFolder) {
      resetFields();
      setCurrentRequestId(null);
      clearVariables();
    }
    setDropdownOpen(null);
  };

  // Fixed renameFolder function
  const renameFolder = (oldName: string, newName: string) => {
    if (!newName.trim() || newName.trim() === oldName) {
      return;
    }

    const trimmedNewName = newName.trim();

    try {
      // Check if new folder name already exists
      if (folders[trimmedNewName]) {
        alert("A folder with this name already exists.");
        return;
      }

      // Get old folder data
      const oldFolderData = localStorage.getItem(oldName);
      const oldVariablesData = localStorage.getItem(
        `solo-variables-${oldName}`
      );

      if (!oldFolderData) {
        console.error(`Folder '${oldName}' not found`);
        return;
      }

      // Create new folder with old data
      localStorage.setItem(trimmedNewName, oldFolderData);

      // Migrate variables if they exist
      if (oldVariablesData) {
        localStorage.setItem(
          `solo-variables-${trimmedNewName}`,
          oldVariablesData
        );
      }

      // Update folders state
      setFolders((prev) => {
        const newFolders = { ...prev };
        newFolders[trimmedNewName] = newFolders[oldName];
        delete newFolders[oldName];
        return newFolders;
      });

      // Update currentFolder if it matches the renamed folder
      if (currentFolder === oldName) {
        setCurrentFolder(trimmedNewName);
        loadVariablesForFolder(trimmedNewName);
      }

      // Update openFolders state
      setOpenFolders((prev) => {
        const newOpenFolders = { ...prev };
        if (newOpenFolders[oldName]) {
          newOpenFolders[trimmedNewName] = true;
          delete newOpenFolders[oldName];
        }
        return newOpenFolders;
      });

      // Clean up old data
      localStorage.removeItem(oldName);
      localStorage.removeItem(`solo-variables-${oldName}`);

      console.log(
        `Folder renamed from '${oldName}' to '${trimmedNewName}' successfully`
      );
    } catch (error) {
      console.error("Error renaming folder:", error);
      alert("Error renaming folder. Please try again.");
    }
  };

  const toggleFolder = (folder: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folder]: !prev[folder],
    }));
    if (folder !== currentFolder || !currentRequestId) {
      setCurrentFolder(folder);
      loadVariablesForFolder(folder);
      if (!currentRequestId) {
        resetFields();
      }
      setCurrentRequestId(null);
    }
  };

  const toggleDropdown = (folder: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen((prev) => (prev === folder ? null : folder));
  };

  const createNewRequest = (folder: string, type: RequestType = "http") => {
    const newRequestId = `request_${Date.now()}`;
    setCurrentFolder(folder);
    setOpenFolders((prev) => ({ ...prev, [folder]: true }));
    loadVariablesForFolder(folder);

    const defaultRequest: RequestData = {
      method: type === "graphql" ? "POST" : "GET",
      url: "",
      payload: "",
      response: null,
      useBasicAuth: false,
      username: "",
      password: "",
      activeTab:
        type === "graphql" ? "graphql" : type === "grpc" ? "grpc" : "body",
      bearerToken: "",
      queryParams: [{ key: "", value: "", enabled: true }],
      requestType: type,
      graphqlQuery: type === "graphql" ? "query {\n  \n}" : "",
      graphqlVariables: type === "graphql" ? "{}" : "",
      grpcService: type === "grpc" ? "" : "",
      grpcMethod: type === "grpc" ? "" : "",
      grpcMessage: type === "grpc" ? "{}" : "",
      grpcCallType: type === "grpc" ? "unary" : "unary",
      protoContent: type === "grpc" ? "" : "",
      description: "",
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
        displayName: type === "graphql" ? "New GraphQL request" : "New request",
      });
      localStorage.setItem(folder, JSON.stringify(files));

      setFolders((prev) => ({
        ...prev,
        [folder]: [...(prev[folder] || []), newRequestId],
      }));

      setRequestType(type);
      setMethod(defaultRequest.method);
      setUrl(defaultRequest.url);
      setPayload(defaultRequest.payload || "");
      setUseBasicAuth(defaultRequest.useBasicAuth || false);
      setUsername(defaultRequest.username || "");
      setPassword(defaultRequest.password || "");
      setActiveTab(defaultRequest.activeTab || "body");
      setBearerToken(defaultRequest.bearerToken || "");
      setQueryParams(
        defaultRequest.queryParams || [{ key: "", value: "", enabled: true }]
      );
      setDescription(defaultRequest.description || "");

      if (type === "graphql") {
        setGraphqlQuery(defaultRequest.graphqlQuery || "");
        setGraphqlVariables(defaultRequest.graphqlVariables || "{}");
      }
    } catch (error) {
      console.error("Error creating new request:", error);
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
        displayName:
          displayName ||
          `${request.requestType === "grpc" ? "gRPC" : request.method} Request`,
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
          queryParams,
          requestType,
          graphqlQuery,
          graphqlVariables,
          grpcService,
          grpcMethod,
          grpcMessage,
          grpcCallType,
          protoContent,
          description,
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
          `File '${fileName}' successfully removed from folder '${folderContainingFile}'`
        );
      } else {
        console.error(`Could not find folder containing file '${fileName}'`);
      }
    } catch (error) {
      console.error("Error removing file:", error);
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
      if (folderName && !folderName.startsWith("solo-variables-")) {
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
      loadVariablesForFolder(folder);

      setRequestType(data.requestType || "http");
      setMethod(data.method);
      setUrl(data.url || "");
      setPayload(data.payload || "");
      setUseBasicAuth(data.useBasicAuth || false);
      setUsername(data.username || "");
      setPassword(data.password || "");
      setActiveTab(
        data.activeTab ||
          (data.requestType === "graphql"
            ? "graphql"
            : data.requestType === "grpc"
            ? "grpc"
            : "body")
      );
      setBearerToken(data.bearerToken || "");
      setQueryParams(
        data.queryParams || [{ key: "", value: "", enabled: true }]
      );
      setDescription(data.description || "");

      if (data.requestType === "graphql") {
        setGraphqlQuery(data.graphqlQuery || "");
        setGraphqlVariables(data.graphqlVariables || "{}");
      }

      if (data.requestType === "grpc") {
        setGrpcService(data.grpcService || "");
        setGrpcMethod(data.grpcMethod || "");
        setGrpcMessage(data.grpcMessage || "{}");
        setGrpcCallType(data.grpcCallType || "unary");
        setProtoContent(data.protoContent || "");
      }

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
        showModal,
        createFolder,
        toggleFolder,
        toggleDropdown,
        createNewRequest,
        removeFolder,
        renameFolder,
        handleFileClick,
        handleRemoveFile,
        saveCurrentRequest,
        renameFile,
        setShowModal,
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
