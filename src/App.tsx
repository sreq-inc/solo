import { useState } from "react";
import { Code } from "lucide-react";
import { SelectMethod } from "./components/SelectMethod.tsx";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [method, setMethod] = useState<
    "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  >("GET");
  const [url, setUrl] = useState<string>("");
  const [payload, setPayload] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(false);
  const [folders, setFolders] = useState<{ [key: string]: Array<string> }>({});
  const [currentFolder, setCurrentFolder] = useState<string>("");
  const [newFolderName, setNewFolderName] = useState<string>("");

  const handleRequest = async () => {
    setLoading(true);
    setError(null);

    try {
      const body = payload.trim() ? JSON.parse(payload) : null;

      const result = await invoke("make_request", {
        method,
        url,
        body,
      });

      setResponse(result);

      if (currentFolder) {
        const fileName = `${method}_${url}`;
        const fileData = { method, url, payload, response: result };
        const existingFiles = JSON.parse(
          localStorage.getItem(currentFolder) || "[]",
        );
        existingFiles.push({ fileName, fileData });
        localStorage.setItem(currentFolder, JSON.stringify(existingFiles));

        setFolders((prev) => ({
          ...prev,
          [currentFolder]: [...(prev[currentFolder] || []), fileName],
        }));
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

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    }
  };

  const handleFolderChange = (folder: string) => {
    setCurrentFolder(folder);
  };

  const createFolder = () => {
    if (newFolderName && !folders[newFolderName]) {
      setFolders((prev) => ({
        ...prev,
        [newFolderName]: [],
      }));
      localStorage.setItem(newFolderName, JSON.stringify([]));
      setNewFolderName("");
    }
  };

  const removeFolder = (folder: string) => {
    setFolders((prev) => {
      const newFolders = { ...prev };
      delete newFolders[folder];
      localStorage.removeItem(folder);
      return newFolders;
    });
  };

  const removeFile = (fileName: string) => {
    if (currentFolder) {
      const files = JSON.parse(localStorage.getItem(currentFolder) || "[]");
      const updatedFiles = files.filter(
        (file: any) => file.fileName !== fileName,
      );
      localStorage.setItem(currentFolder, JSON.stringify(updatedFiles));
      setFolders((prev) => ({
        ...prev,
        [currentFolder]: updatedFiles.map((file: any) => file.fileName),
      }));
    }
  };

  const handleFileClick = (fileName: string) => {
    if (currentFolder) {
      const files = JSON.parse(localStorage.getItem(currentFolder) || "[]");
      const file = files.find((f: any) => f.fileName === fileName);
      if (file) {
        setMethod(file.fileData.method);
        setUrl(file.fileData.url);
        setPayload(file.fileData.payload);
      }
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full h-full rounded-xl shadow-lg">
        <div className="grid grid-cols-12 gap-4">
          <div className="p-4 space-y-4 bg-gray-50 rounded-md col-span-2">
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
                onClick={createFolder}
                className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Create
              </button>
            </div>
            <div className="space-y-2 mt-4">
              {Object.keys(folders).map((folder) => (
                <div key={folder}>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleFolderChange(folder)}
                      className={`w-full p-2 text-left ${
                        folder === currentFolder
                          ? "bg-purple-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      } rounded hover:bg-purple-500`}
                    >
                      {folder}
                    </button>
                    <button
                      onClick={() => removeFolder(folder)}
                      className="text-red-500"
                    >
                      ❌
                    </button>
                  </div>
                  {folder === currentFolder && (
                    <div className="mt-2 space-y-2">
                      {JSON.parse(localStorage.getItem(folder) || "[]").map(
                        (file: any) => (
                          <div
                            key={file.fileName}
                            className="flex items-center justify-between"
                          >
                            <button
                              onClick={() => handleFileClick(file.fileName)}
                              className="w-full text-left p-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              {file.fileName}
                            </button>
                            <button
                              onClick={() => removeFile(file.fileName)}
                              className="text-red-500"
                            >
                              ❌
                            </button>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 space-y-4 col-span-5">
            <h2 className="text-xl font-bold flex items-center">
              <Code className="mr-2 text-purple-600" /> HTTP Request
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-20 mr-2">
                <SelectMethod
                  value={method}
                  options={["GET", "POST", "PUT", "DELETE", "PATCH"]}
                  onChange={setMethod}
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

          <div className="p-4 space-y-4 col-span-5">
            <h2 className="text-xl font-bold flex items-center">
              <Code className="mr-2 text-purple-600" /> Response
            </h2>
            {error && (
              <div className="bg-red-100 text-red-800 p-2 rounded">{error}</div>
            )}
            <pre className="bg-gray-100 p-2 rounded h-96 overflow-auto">
              {loading
                ? "Loading..."
                : response
                  ? JSON.stringify(response, null, 2)
                  : "No response yet"}
            </pre>
            {response && (
              <button
                onClick={copyResponse}
                className="w-full p-2 bg-purple-200 text-purple-800 rounded"
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
