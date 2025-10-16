import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useRequest } from "../context/RequestContext";
import clsx from "clsx";
import { ShortcutsDisplay } from "./ShortcutsDisplay";
import { useCurlGenerator } from "../hooks/useCurlGenerator";
import { CopyIcon } from "./CopyIcon";
import { JsonViewer } from "./JsonViewer";
import { Maximize2, Minimize2 } from "lucide-react";

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

export const ResponseView = ({ isRequestCollapsed, onToggleCollapse }: ResponseViewProps) => {
  const { theme } = useTheme();
  const {
    response,
    error,
    loading,
    isCopied,
    handleCopyResponse,
    url,
    responseTime,
    statusCode,
  } = useRequest();

  const { generateCurl } = useCurlGenerator();
  const [activeTab, setActiveTab] = useState<TabType>("response");

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
            {url && (
              <div className="flex items-center">
                <CopyIcon content={generateCurl()} size={16} />
              </div>
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

      {/* Copy Button - Fixed at Bottom */}
      {response && activeTab === "response" && (
        <div className="flex-shrink-0 pt-2">
          <button
            onClick={handleCopyResponse}
            disabled={isCopied}
            className={clsx(
              "w-full py-2.5 px-4 rounded-lg cursor-pointer font-medium text-sm transition-all duration-200",
              theme === "dark"
                ? "bg-purple-700 text-white hover:bg-purple-600 active:bg-purple-800"
                : "bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800",
              isCopied && "opacity-70 cursor-not-allowed"
            )}
          >
            {isCopied ? "✓ Copied!" : "Copy Response"}
          </button>
        </div>
      )}
    </div>
  );
};
