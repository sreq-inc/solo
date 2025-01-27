import { useState } from "react";
import { Code, Folder, FolderOpen, X } from "lucide-react";
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
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [folders, setFolders] = useState<{ [key: string]: string[] }>({});
  const [currentFolder, setCurrentFolder] = useState<string>("");
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>(
    {},
  );

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

      alert("Request saved successfully!");
    } catch (error: unknown) {
      setResponse(null);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      alert("Failed to make the request.");
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      alert("Response copied to clipboard!");
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
      alert("Folder created successfully!");
    } else {
      alert("Folder name is invalid or already exists.");
    }
  };

  const removeFolder = (folder: string) => {
    setFolders((prev) => {
      const newFolders = { ...prev };
      delete newFolders[folder];
      localStorage.removeItem(folder);
      return newFolders;
    });
    alert("Folder removed successfully!");
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
      alert("File removed successfully!");
    }
  };

  const handleFileClick = (fileName: string) => {
    if (currentFolder) {
      try {
        const files = JSON.parse(localStorage.getItem(currentFolder) || "[]");
        const file = files.find((f: any) => f.fileName === fileName);

        if (file) {
          setMethod(file.fileData.method);
          setUrl(file.fileData.url);
          setPayload(file.fileData.payload || "");
        } else {
          alert("File not found.");
        }
      } catch (error) {
        console.error("Error accessing localStorage or parsing data", error);
        alert("Failed to retrieve file data.");
      }
    }
  };

  const toggleFolder = (folder: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folder]: !prev[folder],
    }));
    setCurrentFolder(folder);
  };

  const createFile = () => {
    if (currentFolder) {
      const fileName = `${method}_${url}`;
      const fileData = { method, url, payload, response };
      const existingFiles = JSON.parse(
        localStorage.getItem(currentFolder) || "[]",
      );
      existingFiles.push({ fileName, fileData });
      localStorage.setItem(currentFolder, JSON.stringify(existingFiles));

      setFolders((prev) => ({
        ...prev,
        [currentFolder]: [...(prev[currentFolder] || []), fileName],
      }));
      alert("File created successfully!");
    }
  };

  return (
    <div className="flex items-center justify-center p-4 h-screen">
      <div className="w-full h-full rounded-xl shadow-lg">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Folders Section */}
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
                      onClick={() => removeFolder(folder)}
                      className="text-black text-sm cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {openFolders[folder] && (
                    <div className="mt-2 space-y-2 ml-4">
                      {JSON.parse(localStorage.getItem(folder) || "[]").map(
                        (file: any) => (
                          <div
                            key={file.fileName}
                            className="flex items-center p-1.5 justify-between bg-gray-200 rounded hover:bg-gray-300"
                          >
                            <button
                              onClick={() => handleFileClick(file.fileName)}
                              className="w-full text-left"
                            >
                              {file.fileData.method}
                            </button>
                            <button
                              onClick={() => removeFile(file.fileName)}
                              className="text-black-500"
                            >
                              <X className="w-4 h-4" />
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

          {/* HTTP Request Section */}
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
                      value as "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
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

          {/* Response Section */}
          <div className="p-4 space-y-4 col-span-5 h-full">
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
