import { useState, useEffect } from "react";
import { Code, Folder, FolderOpen, ChevronDown, Plus } from "lucide-react";
import { SelectMethod } from "./components/SelectMethod";
import { invoke } from "@tauri-apps/api/core";
import { useRequestStorage } from "./hooks/useRequestStorage";
import "./App.css";

function App() {
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
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>(
    {}
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
        },
        currentRequestId
      );
    }
  }, [method]);

  const resetFields = () => {
    setMethod("GET");
    setUrl("");
    setPayload("");
    setResponse(null);
    setError(null);
    setCurrentRequestId(null);
  };

  const handleRequest = async () => {
    setLoading(true);
    setError(null);

    try {
      const body = payload.trim() ? JSON.parse(payload) : null;
      const result = await invoke("make_request", { method, url, body });
      setResponse(result);

      if (currentFolder && currentRequestId) {
        saveRequest(
          currentFolder,
          {
            method,
            url,
            payload,
            response: result,
          },
          currentRequestId
        );
        alert("Request saved successfully!");
      }
    } catch (error: unknown) {
      setResponse(null);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      alert("Failed to make the request.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = () => {
    if (createFolder(newFolderName)) {
      setNewFolderName("");
      resetFields();
      alert("Folder created successfully!");
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
      alert("File removed successfully!");
    }
  };

  const handleFileClick = (fileName: string) => {
    if (currentFolder) {
      const request = loadRequest(currentFolder, fileName);
      if (request) {
        setMethod(request.method);
        setUrl(request.url);
        setPayload(request.payload || "");
        setCurrentRequestId(fileName);
      } else {
        alert("File not found.");
      }
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
      },
      newRequestId
    );
    setDropdownOpen(null);
  };

  const lines = response ? JSON.stringify(response, null, 2).split("\n") : [];

  return (
    <div className="flex items-center justify-center p-4 h-screen">
      <div className="w-full h-full rounded-xl shadow-lg">
        <div className="grid grid-cols-12 gap-4 h-full">
          <div className="p-4 space-y-4 bg-gray-50 rounded-md col-span-2 h-full">
            <h2 className="text-xl font-bold flex items-center">
              <Code className="mr-2 text-purple-600" /> Folders
            </h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder Name"
                className="w-full p-2 border rounded"
              />
              <button
                onClick={handleCreateFolder}
                className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Create
              </button>
            </div>
            <div className="space-y-2 mt-4">
              {Object.keys(folders).map((folder) => (
                <div key={folder} className="relative">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleFolder(folder)}
                      className="w-full flex flex-row p-2 text-left cursor-pointer"
                    >
                      {openFolders[folder] ? (
                        <FolderOpen className="mr-2" />
                      ) : (
                        <Folder className="mr-2" />
                      )}
                      {folder}
                    </button>
                    <button
                      onClick={(e) => toggleDropdown(folder, e)}
                      className="text-black text-sm cursor-pointer px-2"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  {dropdownOpen === folder && (
                    <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-10">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-400">
                        CREATE
                      </div>
                      <button
                        onClick={() => createNewRequest(folder)}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        HTTP Request
                      </button>
                      <div className="border-t border-gray-200 my-2"></div>
                      <button
                        onClick={() => {
                          removeFolder(folder);
                          if (folder === currentFolder) resetFields();
                          setDropdownOpen(null);
                        }}
                        className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-2 rotate-45" />
                        Delete Folder
                      </button>
                    </div>
                  )}
                  {openFolders[folder] && (
                    <div className="mt-2 space-y-2 ml-4">
                      {JSON.parse(localStorage.getItem(folder) || "[]").map(
                        (file: any) => (
                          <div
                            key={file.fileName}
                            className={`flex items-center p-1.5 justify-between bg-gray-200 rounded hover:bg-gray-300 ${
                              file.fileName === currentRequestId
                                ? "bg-purple-100"
                                : ""
                            }`}
                          >
                            <button
                              onClick={() => handleFileClick(file.fileName)}
                              className="w-full text-left"
                            >
                              {file.fileData.method}
                            </button>
                            <button
                              onClick={() => handleRemoveFile(file.fileName)}
                              className="text-black-500 px-2"
                            >
                              <Plus className="w-4 h-4 rotate-45" />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 space-y-4 col-span-5 h-full">
            <h2 className="text-xl font-bold flex items-center">
              <Code className="mr-2 text-purple-600" /> HTTP Request
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-20 mr-2">
                <SelectMethod
                  value={method}
                  options={["GET", "POST", "PUT", "DELETE", "PATCH"]}
                  onChange={(value) =>
                    setMethod(
                      value as "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
                    )
                  }
                />
              </div>
              <div className="flex-grow">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.example.com/endpoint"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={handleRequest}
                  disabled={loading}
                  className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  {loading ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2">
                JSON Payload (optional)
              </label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder='{"key": "value"}'
                className="w-full p-2 border rounded h-32"
              />
            </div>
          </div>

          <div className="p-4 space-y-4 col-span-5 h-full">
            <h2 className="text-xl font-bold flex items-center">
              <Code className="mr-2 text-purple-600" /> Response
            </h2>
            {error && (
              <div className="bg-red-100 text-red-800 p-2 rounded">{error}</div>
            )}
            <div className="relative bg-gray-100 rounded min-h-[600px] h-96 overflow-auto font-mono">
              <table className="w-full table-fixed">
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="text-right pr-4 select-none text-gray-500 w-12 border-r border-gray-300">
                        1
                      </td>
                      <td className="pl-4">Loading...</td>
                    </tr>
                  ) : !response ? (
                    <tr>
                      <td className="text-right pr-4 select-none text-gray-500 w-12 border-r border-gray-300">
                        1
                      </td>
                      <td className="pl-4">No response yet</td>
                    </tr>
                  ) : (
                    lines.map((line, i) => (
                      <tr key={i} className="hover:bg-gray-200">
                        <td className="text-right pr-4 select-none text-gray-500 w-12 border-r border-gray-300 sticky left-0 bg-gray-100">
                          {i + 1}
                        </td>
                        <td className="pl-4 whitespace-pre overflow-x-auto">
                          {line}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {response && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(response, null, 2)
                  );
                  alert("Response copied to clipboard!");
                }}
                className="w-full p-2 bg-purple-200 text-purple-800 rounded hover:bg-purple-300"
              >
                Copy Response
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
