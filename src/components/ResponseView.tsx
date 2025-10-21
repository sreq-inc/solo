import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useRequest } from "../context/RequestContext";
import clsx from "clsx";
import { ShortcutsDisplay } from "./ShortcutsDisplay";
import { useCurlGenerator } from "../hooks/useCurlGenerator";
import { JsonViewer } from "./JsonViewer";
import { Maximize2, Minimize2, Copy, ChevronDown, Check } from "lucide-react";

type TabType = "response" | "headers" | "timeline";

interface ResponseViewProps {
  isRequestCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface TabItemProps {
  label: string;
  value: TabType;
  active: boolean;
  onClick: (tab: TabType) => void;
}

const TabItem = ({ label, value, active, onClick }: TabItemProps) => {
  const { theme } = useTheme();

  const getTabClasses = (isActive: boolean) => {
    return clsx(
      "py-2 px-4 text-sm font-medium cursor-pointer transition-all duration-200 whitespace-nowrap",
      isActive
        ? theme === "dark"
          ? "bg-purple-700 text-white shadow-md"
          : "bg-purple-600 text-white shadow-md"
        : theme === "dark"
        ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
    );
  };

  return (
    <button onClick={() => onClick(value)} className={getTabClasses(active)}>
      {label}
    </button>
  );
};

type ViewMode = "pretty" | "raw";

export const ResponseView = ({ isRequestCollapsed, onToggleCollapse }: ResponseViewProps) => {
  const { theme } = useTheme();
  const {
    response,
    error,
    loading,
    url,
    responseTime,
    statusCode,
  } = useRequest();

  const { generateCurl } = useCurlGenerator();
  const [activeTab, setActiveTab] = useState<TabType>("response");
  const [viewMode, setViewMode] = useState<ViewMode>("pretty");
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const viewDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(event.target as Node)) {
        setIsViewDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isCopied]);

  const handleCopy = async () => {
    let textToCopy = "";

    if (activeTab === "response" && response) {
      textToCopy = viewMode === "pretty"
        ? JSON.stringify(response, null, 2)
        : JSON.stringify(response);
    } else if (url) {
      textToCopy = generateCurl();
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setIsViewDropdownOpen(false);
  };

  // Helper function to get status code color
  const getStatusCodeColor = (code: number | null) => {
    if (!code) return theme === "dark" ? "text-gray-400" : "text-gray-600";
    if (code >= 200 && code < 300) return "text-green-500";
    if (code >= 300 && code < 400) return "text-yellow-500";
    if (code >= 400) return "text-red-500";
    return theme === "dark" ? "text-gray-400" : "text-gray-600";
  };

  const headers = response
    ? [
        { key: "Content-Type", value: "application/json" },
        { key: "Server", value: "Tauri/1.0" },
        { key: "Date", value: new Date().toUTCString() },
        {
          key: "Content-Length",
          value: JSON.stringify(response).length.toString(),
        },
      ]
    : [];

  const timeline = response
    ? [
        {
          name: "Request Started",
          timestamp: new Date(Date.now() - 500).toISOString(),
        },
        {
          name: "Request Sent",
          timestamp: new Date(Date.now() - 400).toISOString(),
        },
        {
          name: "Response Received",
          timestamp: new Date(Date.now() - 100).toISOString(),
          duration: 300,
        },
        { name: "Response Parsed", timestamp: new Date().toISOString() },
      ]
    : [];

  const renderContent = () => {
    switch (activeTab) {
      case "response":
        if (loading) {
          return (
            <div
              className={clsx(
                "p-4",
                theme === "dark" ? "text-gray-300" : "text-gray-800"
              )}
            >
              Loading...
            </div>
          );
        }

        if (!response) {
          return <ShortcutsDisplay />;
        }

        if (viewMode === "raw") {
          return (
            <div
              className={clsx(
                "p-4 whitespace-pre-wrap break-all font-mono text-xs",
                theme === "dark" ? "text-gray-300" : "text-gray-800"
              )}
            >
              {JSON.stringify(response)}
            </div>
          );
        }

        return <JsonViewer data={response} />;

      case "headers":
        return (
          <div
            className={clsx(
              "p-4",
              theme === "dark" ? "text-gray-300" : "text-gray-800"
            )}
          >
            {headers.length > 0 ? (
              <div className="space-y-2">
                {headers.map((header, index) => (
                  <div key={index} className="flex">
                    <span
                      className={clsx(
                        "font-medium mr-2",
                        theme === "dark" ? "text-purple-300" : "text-purple-700"
                      )}
                    >
                      {header.key}:
                    </span>
                    <span className="break-all">{header.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
              >
                No headers available
              </div>
            )}
          </div>
        );

      case "timeline":
        return (
          <div
            className={clsx(
              "p-4",
              theme === "dark" ? "text-gray-300" : "text-gray-800"
            )}
          >
            {timeline.length > 0 ? (
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div
                    key={index}
                    className="border-l-2 pl-4 pb-4 relative border-gray-400 last:pb-0"
                  >
                    <div className="absolute w-3 h-3 rounded-full -left-[7px] bg-purple-500"></div>
                    <div className="flex flex-col">
                      <span
                        className={clsx(
                          "font-medium",
                          theme === "dark"
                            ? "text-purple-300"
                            : "text-purple-700"
                        )}
                      >
                        {event.name}
                      </span>
                      <span
                        className={
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                      {event.duration && (
                        <span
                          className={
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }
                        >
                          Duration: {event.duration}ms
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
              >
                No timeline data available
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="p-4 space-y-3 col-span-5 h-full w-full flex flex-col">
      {/* Header Section with Tabs and Metadata */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-wrap gap-1">
            <TabItem
              label="Response"
              value="response"
              active={activeTab === "response"}
              onClick={setActiveTab}
            />
            <TabItem
              label="Headers"
              value="headers"
              active={activeTab === "headers"}
              onClick={setActiveTab}
            />
            <TabItem
              label="Timeline"
              value="timeline"
              active={activeTab === "timeline"}
              onClick={setActiveTab}
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {responseTime !== null && (
              <div
                className={clsx(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
                  theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"
                )}
                title="Response time"
              >
                <span className="text-gray-500">Time:</span>
                <span className="font-semibold">{responseTime}ms</span>
              </div>
            )}
            {statusCode !== null && (
              <div
                className={clsx(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold",
                  theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                )}
                title={`HTTP Status Code: ${statusCode}`}
              >
                <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Status:</span>
                <span className={getStatusCodeColor(statusCode)}>{statusCode}</span>
              </div>
            )}
            {/* View Mode Dropdown (Pretty/Raw) - Only for response tab */}
            {response && activeTab === "response" && (
              <div className="relative" ref={viewDropdownRef}>
                <button
                  onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                  className={clsx(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all duration-200 border",
                    theme === "dark"
                      ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:border-purple-600"
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-purple-500"
                  )}
                  title="View mode"
                >
                  <span className="capitalize">{viewMode}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {isViewDropdownOpen && (
                  <div
                    className={clsx(
                      "absolute right-0 mt-1 w-32 rounded-lg shadow-lg border z-50",
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    )}
                  >
                    <div className="py-1">
                      <button
                        onClick={() => handleViewModeChange("pretty")}
                        className={clsx(
                          "w-full px-4 py-2 text-left text-sm flex items-center justify-between transition-colors",
                          theme === "dark"
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-100",
                          viewMode === "pretty" && "font-semibold"
                        )}
                      >
                        <span>Pretty</span>
                        {viewMode === "pretty" && <Check className="w-3.5 h-3.5 text-green-500" />}
                      </button>
                      <button
                        onClick={() => handleViewModeChange("raw")}
                        className={clsx(
                          "w-full px-4 py-2 text-left text-sm flex items-center justify-between transition-colors",
                          theme === "dark"
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-100",
                          viewMode === "raw" && "font-semibold"
                        )}
                      >
                        <span>Raw</span>
                        {viewMode === "raw" && <Check className="w-3.5 h-3.5 text-green-500" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Copy Button */}
            {url && (
              <button
                onClick={handleCopy}
                disabled={isCopied}
                className={clsx(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all duration-200 border",
                  theme === "dark"
                    ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:border-purple-600"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-purple-500",
                  isCopied && "border-green-500"
                )}
                title={activeTab === "response" && response ? `Copy ${viewMode} response` : "Copy cURL"}
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
            <div
              onClick={onToggleCollapse}
              className={clsx(
                "flex items-center p-1.5 rounded-md cursor-pointer transition-all duration-200",
                theme === "dark"
                  ? "text-gray-400 hover:text-purple-400 hover:bg-gray-800/50"
                  : "text-gray-500 hover:text-purple-600 hover:bg-gray-200/50"
              )}
              title={isRequestCollapsed ? "Restore split view" : "Maximize response view"}
            >
              {isRequestCollapsed ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            className={clsx(
              "p-3 rounded-lg mb-3 text-sm font-medium",
              theme === "dark"
                ? "bg-red-900/30 text-red-300 border border-red-800"
                : "bg-red-50 text-red-800 border border-red-200"
            )}
          >
            {error}
          </div>
        )}
      </div>

      {/* Content Area - Flexible Height */}
      <div
        className={clsx(
          "relative flex-1 overflow-auto font-mono border rounded-xl",
          theme === "dark"
            ? response
              ? "bg-[#10121b] border-gray-600"
              : "bg-transparent border-transparent"
            : response
            ? "bg-gray-100 border-gray-300"
            : "bg-transparent border-transparent"
        )}
      >
        {renderContent()}
      </div>
    </div>
  );
};
