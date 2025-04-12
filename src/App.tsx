import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useRequestStorage } from "./hooks/useRequestStorage";
import { Sidebar } from "./components/Sidebar";
import { RequestForm } from "./components/RequestForm";
import { ResponseView } from "./components/ResponseView";
import { useTheme } from "./context/ThemeContext";
import "./App.css";
import clsx from "clsx";

function App() {
  const { theme } = useTheme();
  const {
    folders,
    currentFolder,
    setCurrentFolder,
    createFolder,
    removeFolder,
    saveRequest,
    removeRequest,
    loadRequest,
    loadAllFolders,
  } = useRequestStorage();

  const [method, setMethod] = useState<
    "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  >("GET");
  const [url, setUrl] = useState("");
  const [payload, setPayload] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [useBasicAuth, setUseBasicAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<"body" | "auth">("body");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  useEffect(() => {
    loadAllFolders();
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
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
        },
        currentRequestId,
      );
    }
  }, [method, useBasicAuth, username, password, activeTab]);

  const resetFields = () => {
    setMethod("GET");
    setUrl("");
    setPayload("");
    setUsername("");
    setPassword("");
    setUseBasicAuth(false);
    setActiveTab("body");
    setResponse(null);
    setError(null);
    setCurrentRequestId(null);
  };

  const handleRequest = async () => {
    setLoading(true);
    setError(null);

    try {
      const body = payload.trim() ? JSON.parse(payload) : null;
      const result = await invoke("make_request", {
        method,
        url,
        body,
        useBasicAuth,
        username: useBasicAuth ? username : "",
        password: useBasicAuth ? password : "",
      });
      setResponse(result);

      if (currentFolder && currentRequestId) {
        saveRequest(
          currentFolder,
          {
            method,
            url,
            payload,
            response: result,
            useBasicAuth,
            username,
            password,
            activeTab,
          },
          currentRequestId,
        );
      }
    } catch (error: unknown) {
      setResponse(null);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = () => {
    if (createFolder(newFolderName)) {
      setNewFolderName("");
      resetFields();
    } else {
      alert("Folder name is invalid or already exists.");
    }
  };

  const handleRemoveFile = (fileName: string) => {
    if (currentFolder) {
      removeRequest(currentFolder, fileName);
      if (fileName === currentRequestId) {
        resetFields();
      }
    }
  };

  const handleFileClick = (fileName: string) => {
    const request = loadRequest(null, fileName);
    if (request) {
      setMethod(request.method);
      setUrl(request.url);
      setPayload(request.payload || "");
      setUseBasicAuth(request.useBasicAuth || false);
      setUsername(request.username || "");
      setPassword(request.password || "");
      setActiveTab(request.activeTab || "body");
      setCurrentRequestId(fileName);
    } else {
      alert("File not found.");
    }
  };

  const toggleFolder = (folder: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folder]: !prev[folder],
    }));
    setCurrentFolder(folder);
    resetFields();
  };

  const toggleDropdown = (folder: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen((prev) => (prev === folder ? null : folder));
  };

  const handleClickOutside = () => {
    setDropdownOpen(null);
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
      },
      newRequestId,
    );
    setDropdownOpen(null);
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
  };

  return (
    <div
      className={clsx(
        "flex items-center justify-center p-4 h-screen transition-colors duration-200",
        theme === "dark" ? "bg-gray-900" : "bg-gray-50",
      )}
    >
      <div
        className={clsx(
          "w-full h-full rounded-xl shadow-lg",
          theme === "dark" ? "shadow-gray-900" : "shadow-gray-200",
        )}
      >
        <div className="grid grid-cols-12 gap-4 h-full">
          <Sidebar
            folders={folders}
            openFolders={openFolders}
            dropdownOpen={dropdownOpen}
            currentRequestId={currentRequestId}
            newFolderName={newFolderName}
            onNewFolderNameChange={setNewFolderName}
            onCreateFolder={handleCreateFolder}
            onToggleFolder={toggleFolder}
            onToggleDropdown={toggleDropdown}
            onCreateNewRequest={createNewRequest}
            onRemoveFolder={(folder) => {
              removeFolder(folder);
              if (folder === currentFolder) resetFields();
              setDropdownOpen(null);
            }}
            onFileClick={handleFileClick}
            onRemoveFile={handleRemoveFile}
          />

          <RequestForm
            method={method}
            url={url}
            payload={payload}
            loading={loading}
            username={username}
            password={password}
            useBasicAuth={useBasicAuth}
            activeTab={activeTab}
            onMethodChange={setMethod}
            onUrlChange={setUrl}
            onPayloadChange={setPayload}
            onUsernameChange={setUsername}
            onPasswordChange={setPassword}
            onUseBasicAuthChange={setUseBasicAuth}
            onTabChange={setActiveTab}
            onSendRequest={handleRequest}
          />

          <ResponseView
            response={response}
            error={error}
            loading={loading}
            onCopyResponse={handleCopyResponse}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
